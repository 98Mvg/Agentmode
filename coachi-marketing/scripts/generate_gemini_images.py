#!/usr/bin/env python3
"""
Generate Coachi marketing images with Gemini 2.5 Flash Image.

Single image:
  python3 scripts/generate_gemini_images.py generate \
    --prompt-file inputs/notes/watch-check-prompt.txt \
    --output content/ads/generated/watch-check-v1.png

Batch from JSONL:
  python3 scripts/generate_gemini_images.py generate-batch \
    --input inputs/notes/2026-03-30-gpt-image-1-carousel-batch.jsonl \
    --out-dir content/ads/generated/carousel-openers
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path


DEFAULT_MODEL = "gemini-2.5-flash-image"


def load_api_key() -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if api_key:
        return api_key

    search_roots = [
        Path.cwd(),
        Path(__file__).resolve().parents[4],
        Path(__file__).resolve().parents[1],
    ]
    seen: set[Path] = set()
    for root in search_roots:
        env_path = root / ".env"
        if env_path in seen or not env_path.exists():
            continue
        seen.add(env_path)
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if line.startswith("GEMINI_API_KEY="):
                return line.split("=", 1)[1].strip()

    raise RuntimeError("GEMINI_API_KEY not set. Export it or add it to a reachable .env file.")


def get_client(api_key: str):
    try:
        from google import genai  # type: ignore
    except ImportError as exc:  # pragma: no cover - runtime dependency check
        raise RuntimeError("google-genai not installed. Run: pip3 install google-genai") from exc

    return genai.Client(api_key=api_key), genai


def extract_first_image(response) -> bytes:
    text_parts: list[str] = []
    part_groups = []
    response_parts = getattr(response, "parts", None)
    if response_parts:
        part_groups.append(response_parts)

    candidates = getattr(response, "candidates", None) or []
    for candidate in candidates:
        content = getattr(candidate, "content", None)
        parts = getattr(content, "parts", None)
        if parts:
            part_groups.append(parts)

    if not part_groups:
        raise RuntimeError("No response parts returned from Gemini.")

    for parts in part_groups:
        for part in parts:
            inline_data = getattr(part, "inline_data", None)
            if inline_data and getattr(inline_data, "mime_type", "").startswith("image/"):
                return inline_data.data
            text = getattr(part, "text", None)
            if text:
                text_parts.append(text.strip())

    if text_parts:
        raise RuntimeError(f"No image returned. Model text: {' '.join(text_parts)[:300]}")
    raise RuntimeError("No image returned from Gemini response.")


def generate_image(client, genai, prompt: str, model: str) -> bytes:
    attempts = [
        {
            "model": model,
            "contents": [prompt],
        },
        {
            "model": model,
            "contents": [prompt],
            "config": genai.types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            ),
        },
    ]

    last_error: RuntimeError | None = None
    for kwargs in attempts:
        response = client.models.generate_content(**kwargs)
        try:
            return extract_first_image(response)
        except RuntimeError as exc:
            last_error = exc

    raise last_error or RuntimeError("Gemini image generation failed.")


def read_prompt(prompt: str | None, prompt_file: str | None) -> str:
    if prompt:
        return prompt.strip()
    if prompt_file:
        return Path(prompt_file).read_text(encoding="utf-8").strip()
    raise RuntimeError("Provide either --prompt or --prompt-file.")


def run_generate(args: argparse.Namespace) -> int:
    prompt = read_prompt(args.prompt, args.prompt_file)
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    api_key = load_api_key()
    client, genai = get_client(api_key)
    image_bytes = generate_image(client, genai, prompt, args.model)
    output_path.write_bytes(image_bytes)
    print(f"OK -> {output_path}")
    return 0


def run_generate_batch(args: argparse.Namespace) -> int:
    input_path = Path(args.input)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    api_key = load_api_key()
    client, genai = get_client(api_key)

    raw_lines = [line.strip() for line in input_path.read_text(encoding="utf-8").splitlines() if line.strip()]
    failures = 0
    for index, raw in enumerate(raw_lines, start=1):
        job = json.loads(raw)
        prompt = str(job["prompt"]).strip()
        filename = str(job.get("out") or f"image-{index}.png")
        model = str(job.get("model") or args.model)
        output_path = out_dir / filename

        try:
            image_bytes = generate_image(client, genai, prompt, model)
            output_path.write_bytes(image_bytes)
            print(f"[{index}/{len(raw_lines)}] OK -> {output_path}")
        except Exception as exc:  # pragma: no cover - runtime/network/API behavior
            failures += 1
            print(f"[{index}/{len(raw_lines)}] FAIL -> {filename}: {exc}", file=sys.stderr)

        if index < len(raw_lines) and args.sleep_seconds > 0:
            time.sleep(args.sleep_seconds)

    return 1 if failures else 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate Coachi marketing images with Gemini 2.5 Flash Image.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    generate = subparsers.add_parser("generate", help="Generate one image from a prompt.")
    generate.add_argument("--prompt", help="Inline prompt text.")
    generate.add_argument("--prompt-file", help="Path to a UTF-8 text file containing the prompt.")
    generate.add_argument("--output", required=True, help="Output image path.")
    generate.add_argument("--model", default=DEFAULT_MODEL, help=f"Gemini image model (default: {DEFAULT_MODEL}).")
    generate.set_defaults(func=run_generate)

    batch = subparsers.add_parser("generate-batch", help="Generate many images from a JSONL batch.")
    batch.add_argument("--input", required=True, help="Path to JSONL file with prompt/out entries.")
    batch.add_argument("--out-dir", required=True, help="Output directory for generated images.")
    batch.add_argument("--model", default=DEFAULT_MODEL, help=f"Default Gemini image model (default: {DEFAULT_MODEL}).")
    batch.add_argument("--sleep-seconds", type=float, default=0.0, help="Optional delay between batch requests.")
    batch.set_defaults(func=run_generate_batch)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return args.func(args)
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""
Unified Gemini CLI for Coachi marketing assets and copy.

Examples:
  scripts/gemini-cli image generate \
    --prompt-file inputs/notes/watch-check-prompt.txt \
    --output content/ads/generated/watch-check-v1.png

  scripts/gemini-cli text optimize \
    --spec inputs/notes/social-video-template.json \
    --output outputs/daily/optimized-spec.json

  scripts/gemini-cli text hook \
    --spec inputs/notes/social-video-template.json

  scripts/gemini-cli text caption \
    --spec inputs/notes/social-video-template.json
"""

from __future__ import annotations

import argparse
import importlib.util
import json
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
IMAGE_MODULE_PATH = SCRIPT_DIR / "generate_gemini_images.py"


def load_image_module():
    spec = importlib.util.spec_from_file_location("coachi_gemini_images", IMAGE_MODULE_PATH)
    if not spec or not spec.loader:
        raise RuntimeError(f"Unable to load Gemini image module from {IMAGE_MODULE_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_IMAGE = load_image_module()
DEFAULT_IMAGE_MODEL = _IMAGE.DEFAULT_MODEL
DEFAULT_TEXT_MODEL = _IMAGE.DEFAULT_TEXT_MODEL
load_api_key = _IMAGE.load_api_key
get_client = _IMAGE.get_client
generate_text = _IMAGE.generate_text
optimize_video_text_spec = _IMAGE.optimize_video_text_spec


def read_json_spec(path: str) -> dict[str, object]:
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise RuntimeError("Expected a JSON object spec.")
    return payload


def write_output(payload: str, output: str | None) -> int:
    if output:
        output_path = Path(output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(payload, encoding="utf-8")
        print(f"OK -> {output_path}")
    else:
        print(payload, end="" if payload.endswith("\n") else "\n")
    return 0


def build_hook_prompt(spec: dict[str, object]) -> str:
    return f"""
You are writing a single short-form hook for Coachi running content.

Rules:
- Audience: serious beginners to intermediate runners
- Style: corrective, sharp, curiosity-first
- Max 8 words
- ALL CAPS
- No fluff
- No generic motivation
- Return strict JSON only

Allowed keys:
- hook_text
- accent_type

accent_type must be one of: "none", "wrong", "correct"

Current context:
{json.dumps({
    "hook_text": str(spec.get("hook_text") or "").strip(),
    "body_text": str(spec.get("body_text") or spec.get("subtitle_text") or "").strip(),
    "cta_text": str(spec.get("cta_text") or "").strip(),
}, ensure_ascii=False)}
""".strip()


def build_caption_prompt(spec: dict[str, object]) -> str:
    return f"""
Write one Instagram/TikTok caption for Coachi short-form content.

Rules:
- Audience: serious beginners to intermediate runners
- Tone: helpful, direct, performance-focused
- 3 to 6 short lines
- No hashtags
- Do not oversell Coachi
- Keep the focus on the runner problem first
- End with a light CTA if useful
- Return plain text only

Context:
{json.dumps({
    "hook_text": str(spec.get("hook_text") or "").strip(),
    "body_text": str(spec.get("body_text") or spec.get("subtitle_text") or "").strip(),
    "cta_text": str(spec.get("cta_text") or "").strip(),
    "voiceover_text": str(spec.get("voiceover_text") or "").strip(),
}, ensure_ascii=False)}
""".strip()


def _extract_json_object(raw_text: str) -> dict[str, object]:
    text = raw_text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        if len(lines) >= 3:
            text = "\n".join(lines[1:-1]).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end <= start:
        raise RuntimeError(f"Expected JSON object from Gemini text command, got: {raw_text[:300]}")
    payload = json.loads(text[start : end + 1])
    if not isinstance(payload, dict):
        raise RuntimeError("Gemini text command must return a JSON object.")
    return payload


def run_image_generate(args: argparse.Namespace) -> int:
    return _IMAGE.run_generate(args)


def run_image_batch(args: argparse.Namespace) -> int:
    return _IMAGE.run_generate_batch(args)


def run_text_optimize(args: argparse.Namespace) -> int:
    spec = read_json_spec(args.spec)
    api_key = load_api_key()
    client, _genai = get_client(api_key)
    optimized = optimize_video_text_spec(client=client, spec=spec, model=args.model)
    return write_output(json.dumps(optimized, ensure_ascii=False, indent=2) + "\n", args.output)


def run_text_hook(args: argparse.Namespace) -> int:
    spec = read_json_spec(args.spec)
    api_key = load_api_key()
    client, _genai = get_client(api_key)
    raw = generate_text(client, build_hook_prompt(spec), args.model)
    payload = _extract_json_object(raw)
    if payload.get("hook_text"):
        payload["hook_text"] = str(payload["hook_text"]).strip().upper()
    return write_output(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", args.output)


def run_text_caption(args: argparse.Namespace) -> int:
    spec = read_json_spec(args.spec)
    api_key = load_api_key()
    client, _genai = get_client(api_key)
    caption = generate_text(client, build_caption_prompt(spec), args.model).strip()
    return write_output(caption + "\n", args.output)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Unified Gemini CLI for Coachi marketing image and text workflows."
    )
    top = parser.add_subparsers(dest="domain", required=True)

    image = top.add_parser("image", help="Gemini image generation commands.")
    image_sub = image.add_subparsers(dest="image_command", required=True)

    image_generate = image_sub.add_parser("generate", help="Generate one image from a prompt.")
    image_generate.add_argument("--prompt", help="Inline prompt text.")
    image_generate.add_argument("--prompt-file", help="Path to a UTF-8 text file containing the prompt.")
    image_generate.add_argument("--output", required=True, help="Output image path.")
    image_generate.add_argument("--model", default=DEFAULT_IMAGE_MODEL, help=f"Gemini image model (default: {DEFAULT_IMAGE_MODEL}).")
    image_generate.set_defaults(func=run_image_generate)

    image_batch = image_sub.add_parser("generate-batch", help="Generate many images from a JSONL batch.")
    image_batch.add_argument("--input", required=True, help="Path to JSONL file with prompt/out entries.")
    image_batch.add_argument("--out-dir", required=True, help="Output directory for generated images.")
    image_batch.add_argument("--model", default=DEFAULT_IMAGE_MODEL, help=f"Default Gemini image model (default: {DEFAULT_IMAGE_MODEL}).")
    image_batch.add_argument("--sleep-seconds", type=float, default=0.0, help="Optional delay between batch requests.")
    image_batch.set_defaults(func=run_image_batch)

    text = top.add_parser("text", help="Gemini text generation commands.")
    text_sub = text.add_subparsers(dest="text_command", required=True)

    text_optimize = text_sub.add_parser("optimize", help="Optimize hook/body/cta text for a video spec.")
    text_optimize.add_argument("--spec", required=True, help="Path to a JSON video spec.")
    text_optimize.add_argument("--output", help="Optional output path for the optimized JSON spec.")
    text_optimize.add_argument("--model", default=DEFAULT_TEXT_MODEL, help=f"Gemini text model (default: {DEFAULT_TEXT_MODEL}).")
    text_optimize.set_defaults(func=run_text_optimize)

    text_hook = text_sub.add_parser("hook", help="Generate a tighter short-form hook from a video spec.")
    text_hook.add_argument("--spec", required=True, help="Path to a JSON video spec.")
    text_hook.add_argument("--output", help="Optional output path for the hook JSON.")
    text_hook.add_argument("--model", default=DEFAULT_TEXT_MODEL, help=f"Gemini text model (default: {DEFAULT_TEXT_MODEL}).")
    text_hook.set_defaults(func=run_text_hook)

    text_caption = text_sub.add_parser("caption", help="Generate a caption from a video spec.")
    text_caption.add_argument("--spec", required=True, help="Path to a JSON video spec.")
    text_caption.add_argument("--output", help="Optional output path for the caption text.")
    text_caption.add_argument("--model", default=DEFAULT_TEXT_MODEL, help=f"Gemini text model (default: {DEFAULT_TEXT_MODEL}).")
    text_caption.set_defaults(func=run_text_caption)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return args.func(args)
    except Exception as exc:
        print(f"ERROR: {exc}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

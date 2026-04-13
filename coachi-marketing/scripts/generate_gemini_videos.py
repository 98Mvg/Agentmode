#!/usr/bin/env python3
"""
Low-level Gemini Veo backend for Coachi marketing source videos.

Examples:
  python3 scripts/generate_gemini_videos.py generate \
    --spec inputs/notes/2026-04-13-veo-watch-confusion-variant-a.json

  python3 scripts/generate_gemini_videos.py generate \
    --prompt-file inputs/notes/watch-check-prompt.txt \
    --output content/video/generated/sources/demo.mp4
"""

from __future__ import annotations

import argparse
import json
import os
import time
from pathlib import Path

from google.genai import types

from generate_gemini_images import get_client, load_api_key


DEFAULT_VIDEO_MODEL = "veo-3.1-generate-preview"
DEFAULT_ASPECT_RATIO = "9:16"
DEFAULT_RESOLUTION = "1080p"
DEFAULT_DURATION_SECONDS = 8
DEFAULT_POLL_SECONDS = 10.0
DEFAULT_NEGATIVE_PROMPT = (
    "cartoon, animation, drawing, illustration, low quality, deformed hands, "
    "extra fingers, broken limbs, duplicated people, text, subtitles, watermarks, logos"
)


def read_json_spec(path: Path) -> dict[str, object]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise RuntimeError("Expected a JSON object spec.")
    return payload


def load_prompt(prompt: str | None, prompt_file: str | None, spec: dict[str, object] | None) -> str:
    if prompt:
        return prompt.strip()
    if prompt_file:
        return Path(prompt_file).read_text(encoding="utf-8").strip()
    if spec:
        value = str(spec.get("source_video_prompt") or "").strip()
        if value:
            return value
    raise RuntimeError("Provide --prompt, --prompt-file, or a spec with source_video_prompt.")


def load_output_path(output: str | None, spec: dict[str, object] | None) -> Path:
    if output:
        return Path(output).expanduser()
    if spec:
        value = str(spec.get("source_video_asset") or "").strip()
        if value:
            return Path(value).expanduser()
    raise RuntimeError("Provide --output or a spec with source_video_asset.")


def run_generate(args: argparse.Namespace) -> int:
    spec: dict[str, object] | None = None
    if args.spec:
        spec = read_json_spec(Path(args.spec))

    prompt = load_prompt(args.prompt, args.prompt_file, spec)
    output_path = load_output_path(args.output, spec)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    api_key = load_api_key()
    client, _genai = get_client(api_key)

    aspect_ratio = args.aspect_ratio
    resolution = args.resolution
    duration_seconds = args.duration_seconds
    negative_prompt = args.negative_prompt

    print(f"Starting Veo generation -> {output_path}")
    operation = client.models.generate_videos(
        model=args.model,
        prompt=prompt,
        config=types.GenerateVideosConfig(
            aspect_ratio=aspect_ratio,
            resolution=resolution,
            duration_seconds=duration_seconds,
            negative_prompt=negative_prompt,
            enhance_prompt=args.enhance_prompt,
            generate_audio=args.generate_audio,
        ),
    )

    while not operation.done:
        print("Waiting for video generation to complete...")
        time.sleep(args.poll_seconds)
        operation = client.operations.get(operation)

    if operation.error:
        raise RuntimeError(f"Veo generation failed: {operation.error}")

    generated_video = operation.response.generated_videos[0]
    client.files.download(file=generated_video.video)
    generated_video.video.save(output_path)
    print(f"OK -> {output_path}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Generate Coachi source videos with Gemini Veo."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    generate = subparsers.add_parser("generate", help="Generate one video from a prompt or shared spec.")
    generate.add_argument("--spec", help="Path to a shared JSON video spec containing source_video_* fields.")
    generate.add_argument("--prompt", help="Inline prompt text.")
    generate.add_argument("--prompt-file", help="Path to a UTF-8 prompt file.")
    generate.add_argument("--output", help="Output .mp4 path. Defaults to source_video_asset from --spec.")
    generate.add_argument("--model", default=DEFAULT_VIDEO_MODEL, help=f"Gemini video model (default: {DEFAULT_VIDEO_MODEL}).")
    generate.add_argument("--aspect-ratio", default=DEFAULT_ASPECT_RATIO, help=f"Aspect ratio (default: {DEFAULT_ASPECT_RATIO}).")
    generate.add_argument("--resolution", default=DEFAULT_RESOLUTION, help=f"Resolution (default: {DEFAULT_RESOLUTION}).")
    generate.add_argument("--duration-seconds", type=int, default=DEFAULT_DURATION_SECONDS, help=f"Duration seconds (default: {DEFAULT_DURATION_SECONDS}).")
    generate.add_argument("--negative-prompt", default=DEFAULT_NEGATIVE_PROMPT, help="Negative prompt to avoid low-quality artifacts.")
    generate.add_argument("--poll-seconds", type=float, default=DEFAULT_POLL_SECONDS, help=f"Polling interval in seconds (default: {DEFAULT_POLL_SECONDS}).")
    generate.add_argument("--enhance-prompt", action="store_true", help="Allow Veo to enhance the prompt.")
    generate.add_argument("--generate-audio", action="store_true", help="Generate native video audio.")
    generate.set_defaults(func=run_generate)
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

#!/usr/bin/env python3
"""
Generate Coachi vertical social videos for TikTok and Instagram from one shared spec.

Example:
  python3 scripts/generate_social_videos.py generate \
    --spec inputs/notes/social-video-template.json \
    --out-dir content/video/generated/demo
"""

from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw
from PIL import ImageFont


TARGET_W = 1080
TARGET_H = 1920
TARGET_SIZE = (TARGET_W, TARGET_H)
SUPPORTED_PLATFORMS = ("tiktok", "instagram")
IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp"}
VIDEO_SUFFIXES = {".mp4", ".mov", ".m4v", ".webm"}
DEFAULT_MARKETING_VOICE_ID = "9MPvdQh2pLsLhn7SuiIS"
DEFAULT_MARKETING_VOICE_SETTINGS_MODE = "eleven_defaults"

SCRIPT_PATH = Path(__file__)
RESOLVED_SCRIPT_PATH = SCRIPT_PATH.resolve()
MARKETING_ROOT = RESOLVED_SCRIPT_PATH.parents[1]
FONT_CANDIDATES = {
    "heavy": [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
    ],
    "medium": [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Helvetica.ttc",
    ],
}


def discover_repo_root() -> Path:
    env_override = os.environ.get("TRENINGSCOACH_REPO_ROOT")
    if env_override:
        candidate = Path(env_override).expanduser().resolve()
        if (candidate / "locale_config.py").exists():
            return candidate

    candidates: list[Path] = []
    for base in (
        Path.cwd(),
        SCRIPT_PATH.parent,
        *SCRIPT_PATH.parents,
        RESOLVED_SCRIPT_PATH.parent,
        *RESOLVED_SCRIPT_PATH.parents,
        Path("/Users/mariusgaarder/Documents/treningscoach"),
    ):
        if base not in candidates:
            candidates.append(base)

    for candidate in candidates:
        if (
            (candidate / "locale_config.py").exists()
            and (candidate / "elevenlabs_tts.py").exists()
            and (candidate / "tools" / "app_store_screenshots" / "render.py").exists()
        ):
            return candidate

    raise RuntimeError("Unable to discover treningscoach repo root for shared video helpers.")


REPO_ROOT = discover_repo_root()

if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))


def hex_to_rgb(value: str) -> tuple[int, int, int]:
    stripped = value.strip().lstrip("#")
    if len(stripped) != 6:
        raise RuntimeError(f"Invalid color value: {value}")
    return tuple(int(stripped[index : index + 2], 16) for index in (0, 2, 4))


def _resolve_font_path(weight: str) -> str | None:
    for candidate in FONT_CANDIDATES.get(weight, []):
        if Path(candidate).exists():
            return candidate
    for candidates in FONT_CANDIDATES.values():
        for candidate in candidates:
            if Path(candidate).exists():
                return candidate
    return None


def fit_font(weight: str, size: int, text: str, max_width: int):
    font_path = _resolve_font_path(weight)
    draw = ImageDraw.Draw(Image.new("RGBA", (TARGET_W, TARGET_H), (0, 0, 0, 0)))
    for candidate_size in range(int(size), 15, -2):
        if font_path:
            font = ImageFont.truetype(font_path, size=candidate_size)
        else:
            font = ImageFont.load_default()
        bbox = draw.textbbox((0, 0), text or "A", font=font)
        if (bbox[2] - bbox[0]) <= max_width or candidate_size <= 18:
            return font
    return ImageFont.load_default()


ACCENT_COLORS: dict[str, tuple[int, int, int] | None] = {
    "none": None,
    "wrong": hex_to_rgb("#FF5A5F"),
    "correct": hex_to_rgb("#22C55E"),
}


def _load_root_module(module_name: str, relative_path: str):
    module_path = REPO_ROOT / relative_path
    spec = importlib.util.spec_from_file_location(module_name, module_path)
    if not spec or not spec.loader:
        raise RuntimeError(f"Unable to load module '{module_name}' from {module_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_LOCALE_CONFIG = _load_root_module("coachi_locale_config", "locale_config.py")
_ELEVENLABS_TTS = _load_root_module("coachi_elevenlabs_tts", "elevenlabs_tts.py")
get_voice_id = _LOCALE_CONFIG.get_voice_id
ElevenLabsTTS = _ELEVENLABS_TTS.ElevenLabsTTS


PLATFORM_PRESETS: dict[str, dict[str, Any]] = {
    "tiktok": {
        "duration_offset": -1.0,
        "default_duration": 8.0,
        "hook_max_width": 900,
        "body_max_width": 860,
        "cta_max_width": 760,
        "safe_left": 78,
        "safe_right": 78,
        "safe_top": 170,
        "safe_bottom": 150,
        "hook_font_size": 124,
        "body_font_size": 60,
        "cta_font_size": 42,
        "hook_line_gap": 10,
        "body_line_gap": 10,
        "cta_line_gap": 8,
        "hook_y": 180,
        "body_y": 860,
        "cta_y": 1560,
        "hook_uppercase": True,
        "overlay_top_alpha": 108,
        "overlay_bottom_alpha": 46,
        "logo_width": 172,
        "panel_alpha": 78,
        "cta_alpha": 70,
        "cta_border_alpha": 155,
        "layer_fade_seconds": 0.35,
        "hook_start_seconds": 0.0,
        "body_start_seconds": 0.35,
        "cta_start_seconds": 0.8,
        "hook_slide_offset": -28,
        "body_slide_offset": 22,
        "cta_slide_offset": 22,
        "music_volume": 0.14,
        "eq": {"contrast": 1.05, "saturation": 1.06, "brightness": 0.01},
    },
    "instagram": {
        "duration_offset": 0.0,
        "default_duration": 9.5,
        "hook_max_width": 820,
        "body_max_width": 780,
        "cta_max_width": 680,
        "safe_left": 108,
        "safe_right": 108,
        "safe_top": 238,
        "safe_bottom": 248,
        "hook_font_size": 114,
        "body_font_size": 56,
        "cta_font_size": 40,
        "hook_line_gap": 18,
        "body_line_gap": 12,
        "cta_line_gap": 8,
        "hook_y": 252,
        "body_y": 920,
        "cta_y": 1548,
        "hook_uppercase": True,
        "overlay_top_alpha": 168,
        "overlay_bottom_alpha": 74,
        "logo_width": 186,
        "panel_alpha": 118,
        "cta_alpha": 88,
        "cta_border_alpha": 188,
        "layer_fade_seconds": 0.40,
        "hook_start_seconds": 0.0,
        "body_start_seconds": 0.45,
        "cta_start_seconds": 1.0,
        "hook_slide_offset": -24,
        "body_slide_offset": 18,
        "cta_slide_offset": 18,
        "music_volume": 0.10,
        "eq": {"contrast": 1.02, "saturation": 1.01, "brightness": 0.0},
    },
}


def slugify(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower())
    return value.strip("-") or "social-video"


def clamp_duration(value: float) -> float:
    return max(6.0, min(15.0, round(value, 2)))


def is_image_path(path: Path) -> bool:
    return path.suffix.lower() in IMAGE_SUFFIXES


def is_video_path(path: Path) -> bool:
    return path.suffix.lower() in VIDEO_SUFFIXES


def resolve_media_path(raw_value: str | None, spec_path: Path) -> Path | None:
    if not raw_value:
        return None

    candidate = Path(raw_value).expanduser()
    search_paths = []
    if candidate.is_absolute():
        search_paths.append(candidate)
    else:
        search_paths.extend(
            [
                (spec_path.parent / candidate).resolve(),
                (Path.cwd() / candidate).resolve(),
                (MARKETING_ROOT / candidate).resolve(),
                (REPO_ROOT / candidate).resolve(),
            ]
        )

    for path in search_paths:
        if path.exists():
            return path

    raise RuntimeError(f"Asset not found: {raw_value}")


def load_secret(key: str, required: bool = True) -> str | None:
    value = os.environ.get(key)
    if value:
        return value.strip()

    search_roots = [
        Path.cwd(),
        REPO_ROOT,
        MARKETING_ROOT,
    ]
    seen: set[Path] = set()
    for root in search_roots:
        env_path = root / ".env"
        if env_path in seen or not env_path.exists():
            continue
        seen.add(env_path)
        for line in env_path.read_text(encoding="utf-8").splitlines():
            if line.startswith(f"{key}="):
                return line.split("=", 1)[1].strip()

    if required:
        raise RuntimeError(f"{key} not set. Export it or add it to a reachable .env file.")
    return None


def load_spec(path: Path) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise RuntimeError("Video spec must be a JSON object.")
    if not str(data.get("hook_text", "")).strip():
        raise RuntimeError("Spec is missing required field: hook_text")
    if not str(data.get("background", "")).strip() and not str(data.get("source_video_asset", "")).strip():
        raise RuntimeError("Spec is missing required media input: background or source_video_asset")
    return data


def resolve_optional_media_path(raw_value: str | None, spec_path: Path) -> Path | None:
    if not raw_value:
        return None
    try:
        return resolve_media_path(raw_value, spec_path)
    except RuntimeError:
        return None


def parse_bool_flag(value: Any, default: bool = True) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    text = str(value).strip().lower()
    if text in {"1", "true", "yes", "on"}:
        return True
    if text in {"0", "false", "no", "off"}:
        return False
    return default


def derive_default_voiceover_text(hook_text: str, body_text: str, cta_text: str) -> str | None:
    parts: list[str] = []
    for raw in (hook_text, body_text, cta_text):
        cleaned = str(raw or "").strip()
        if not cleaned:
            continue
        cleaned = re.sub(r"\s*\n+\s*", ". ", cleaned)
        cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()
        if cleaned and cleaned[-1] not in ".!?":
            cleaned = f"{cleaned}."
        parts.append(cleaned)
    combined = " ".join(parts).strip()
    return combined or None


def normalize_spec(spec: dict[str, Any], spec_path: Path) -> dict[str, Any]:
    slug_source = str(spec.get("slug") or spec["hook_text"])
    base_duration = float(spec.get("duration_seconds") or 9.0)
    body_text = str(spec.get("body_text") or spec.get("subtitle_text") or "").strip()
    cta_text = str(spec.get("cta_text") or "").strip()
    accent_type = str(spec.get("accent_type") or "none").strip().lower() or "none"
    if accent_type not in ACCENT_COLORS:
        raise RuntimeError(f"Unsupported accent_type: {accent_type}")
    background_fallback = resolve_optional_media_path(str(spec.get("background") or "").strip() or None, spec_path)
    source_video_asset_value = str(spec.get("source_video_asset") or "").strip() or None
    source_video_asset = resolve_optional_media_path(source_video_asset_value, spec_path)
    platform_hook_text = spec.get("platform_hook_text") or {}
    if platform_hook_text and not isinstance(platform_hook_text, dict):
        raise RuntimeError("platform_hook_text must be a JSON object keyed by platform.")
    layout_overrides = spec.get("layout_overrides") or {}
    if layout_overrides and not isinstance(layout_overrides, dict):
        raise RuntimeError("layout_overrides must be a JSON object.")
    normalized_platform_hooks = {
        str(platform).strip().lower(): str(text).strip()
        for platform, text in platform_hook_text.items()
        if str(text).strip()
    }
    voiceover_enabled = parse_bool_flag(spec.get("voiceover_enabled"), default=True)
    voiceover_text = str(spec.get("voiceover_text") or "").strip() or None
    if voiceover_enabled and not voiceover_text:
        voiceover_text = derive_default_voiceover_text(str(spec["hook_text"]).strip(), body_text, cta_text)

    normalized = {
        "slug": slugify(slug_source),
        "hook_text": str(spec["hook_text"]).strip(),
        "body_text": body_text,
        "cta_text": cta_text,
        "accent_type": accent_type,
        "background": source_video_asset or background_fallback,
        "background_fallback": background_fallback,
        "audio": resolve_media_path(spec.get("audio"), spec_path),
        "logo": resolve_media_path(spec.get("logo"), spec_path),
        "duration_seconds": clamp_duration(base_duration),
        "voiceover_enabled": voiceover_enabled,
        "voiceover_text": voiceover_text,
        "voice_language": str(spec.get("voice_language") or "en").strip().lower() or "en",
        "voice_persona": str(spec.get("voice_persona") or "personal_trainer").strip() or "personal_trainer",
        "voice_id_override": str(spec.get("voice_id_override") or "").strip() or None,
        "voice_settings_mode": str(spec.get("voice_settings_mode") or DEFAULT_MARKETING_VOICE_SETTINGS_MODE).strip() or DEFAULT_MARKETING_VOICE_SETTINGS_MODE,
        "source_video_mode": str(spec.get("source_video_mode") or "").strip().lower() or None,
        "source_video_prompt": str(spec.get("source_video_prompt") or "").strip() or None,
        "source_video_asset": source_video_asset,
        "source_video_asset_hint": source_video_asset_value,
        "variant_goal": str(spec.get("variant_goal") or "").strip() or None,
        "comment_bait_text": str(spec.get("comment_bait_text") or "").strip() or None,
        "platform_hook_text": normalized_platform_hooks,
        "layout_overrides": layout_overrides,
    }
    if normalized["background"] is None:
        raise RuntimeError("Background asset is required.")
    bg_path = normalized["background"]
    if not (is_image_path(bg_path) or is_video_path(bg_path)):
        raise RuntimeError(f"Unsupported background type: {bg_path.suffix}")
    return normalized


def build_platform_spec(spec: dict[str, Any], platform: str) -> dict[str, Any]:
    preset = {**PLATFORM_PRESETS[platform], **dict(spec.get("layout_overrides") or {})}
    if spec.get("duration_seconds"):
        duration = clamp_duration(float(spec["duration_seconds"]) + float(preset["duration_offset"]))
    else:
        duration = clamp_duration(float(preset["default_duration"]))
    hook_text = str(spec.get("platform_hook_text", {}).get(platform) or spec["hook_text"]).strip()

    return {
        **spec,
        "platform": platform,
        "preset": preset,
        "duration_seconds": duration,
        "hook_render_text": hook_text.upper() if preset["hook_uppercase"] else hook_text,
        "body_render_text": spec.get("body_text") or "",
        "cta_render_text": spec.get("cta_text") or "",
        "accent_color": ACCENT_COLORS[str(spec.get("accent_type") or "none")],
        "output_name": f"{spec['slug']}-{platform}.mp4",
    }


def resolve_default_voice_id(language: str, persona: str, voice_id_override: str | None) -> str:
    if voice_id_override:
        return voice_id_override
    if language == "en" and persona == "personal_trainer":
        return DEFAULT_MARKETING_VOICE_ID
    return get_voice_id(language, persona)


def generate_voiceover(spec: dict[str, Any], temp_dir: Path) -> Path | None:
    voiceover_text = spec.get("voiceover_text")
    if not voiceover_text:
        return None

    api_key = load_secret("ELEVENLABS_API_KEY", required=True)
    language = str(spec.get("voice_language") or "en")
    persona = str(spec.get("voice_persona") or "personal_trainer")
    voice_id_override = spec.get("voice_id_override")
    voice_settings_mode = str(spec.get("voice_settings_mode") or DEFAULT_MARKETING_VOICE_SETTINGS_MODE).strip()
    default_voice_id = resolve_default_voice_id(language, persona, voice_id_override)

    tts = ElevenLabsTTS(api_key=api_key, voice_id=default_voice_id)
    audio_bytes = tts.generate_audio_bytes(
        text=voiceover_text,
        language=language,
        persona=persona,
        voice_id_override=default_voice_id,
        use_default_voice_settings=voice_settings_mode == DEFAULT_MARKETING_VOICE_SETTINGS_MODE,
    )
    output_path = temp_dir / f"{spec['platform']}-voiceover.mp3"
    output_path.write_bytes(audio_bytes)
    return output_path


def wrap_lines(draw: ImageDraw.ImageDraw, text: str, font, max_width: int) -> list[str]:
    words = text.split()
    if not words:
        return []

    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        candidate = f"{current} {word}"
        bbox = draw.textbbox((0, 0), candidate, font=font)
        if bbox[2] - bbox[0] <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def effective_line_gap(requested_gap: int, font_size: int, line_count: int) -> int:
    if line_count <= 1:
        return max(0, requested_gap)
    minimum_gap = max(14, int(font_size * 0.18))
    return max(requested_gap, minimum_gap)


def resolve_stroke_fill(preset: dict[str, Any]) -> tuple[int, int, int, int]:
    raw = preset.get("text_stroke_fill")
    if isinstance(raw, str) and raw.strip():
        color = hex_to_rgb(raw.strip())
        return (*color, 255)
    return (0, 0, 0, 255)


def draw_text_block(
    draw: ImageDraw.ImageDraw,
    lines: list[str],
    *,
    x: int,
    y: int,
    font,
    fill: tuple[int, int, int, int],
    shadow_fill: tuple[int, int, int, int],
    line_gap: int,
    stroke_width: int = 0,
    stroke_fill: tuple[int, int, int, int] | None = None,
) -> int:
    cursor = y
    for line in lines:
        if stroke_width > 0:
            draw.text(
                (x, cursor),
                line,
                font=font,
                fill=fill,
                stroke_width=stroke_width,
                stroke_fill=stroke_fill or (0, 0, 0, 255),
            )
        else:
            draw.text((x + 4, cursor + 4), line, font=font, fill=shadow_fill)
            draw.text((x, cursor), line, font=font, fill=fill)
        bbox = draw.textbbox((x, cursor), line, font=font)
        cursor += (bbox[3] - bbox[1]) + line_gap
    return cursor


def build_background_tint(output_path: Path, preset: dict[str, Any]) -> None:
    image = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    top_alpha = int(preset["overlay_top_alpha"])
    bottom_alpha = int(preset["overlay_bottom_alpha"])
    for y in range(TARGET_H):
        if y < TARGET_H * 0.55:
            ratio = 1 - (y / (TARGET_H * 0.55))
            alpha = int(top_alpha * ratio)
        else:
            ratio = (y - TARGET_H * 0.55) / (TARGET_H * 0.45)
            alpha = int(bottom_alpha * ratio)
        draw.line((0, y, TARGET_W, y), fill=(8, 12, 24, alpha))
    image.save(output_path)


def centered_lines(
    draw: ImageDraw.ImageDraw,
    lines: list[str],
    *,
    y: int,
    font,
    fill: tuple[int, int, int, int],
    shadow_fill: tuple[int, int, int, int],
    line_gap: int,
    stroke_width: int = 0,
    stroke_fill: tuple[int, int, int, int] | None = None,
) -> tuple[int, int]:
    heights: list[int] = []
    widths: list[int] = []
    for line in lines:
        bbox = draw.textbbox((0, 0), line, font=font)
        widths.append(bbox[2] - bbox[0])
        heights.append(bbox[3] - bbox[1])

    total_height = sum(heights) + max(0, len(lines) - 1) * line_gap
    cursor = y
    max_width = max(widths) if widths else 0
    for line, width, height in zip(lines, widths, heights):
        x = (TARGET_W - width) // 2
        if stroke_width > 0:
            draw.text(
                (x, cursor),
                line,
                font=font,
                fill=fill,
                stroke_width=stroke_width,
                stroke_fill=stroke_fill or (0, 0, 0, 255),
            )
        else:
            draw.text((x + 4, cursor + 4), line, font=font, fill=shadow_fill)
            draw.text((x, cursor), line, font=font, fill=fill)
        cursor += height + line_gap
    return max_width, total_height


def draw_centered_panel(
    draw: ImageDraw.ImageDraw,
    *,
    y: int,
    width: int,
    height: int,
    fill: tuple[int, int, int, int],
    outline: tuple[int, int, int, int] | None = None,
    outline_width: int = 0,
) -> tuple[int, int, int, int]:
    left = (TARGET_W - width) // 2
    top = y
    right = left + width
    bottom = top + height
    draw.rounded_rectangle(
        (left, top, right, bottom),
        radius=34,
        fill=fill,
        outline=outline,
        width=outline_width,
    )
    return left, top, right, bottom


def render_hook_layer(spec: dict[str, Any], output_path: Path) -> None:
    preset = spec["preset"]
    image = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    hook_font = fit_font("heavy", preset["hook_font_size"], spec["hook_render_text"], preset["hook_max_width"])
    hook_lines = wrap_lines(draw, spec["hook_render_text"], hook_font, preset["hook_max_width"])

    widths: list[int] = []
    heights: list[int] = []
    for line in hook_lines:
        bbox = draw.textbbox((0, 0), line, font=hook_font)
        widths.append(bbox[2] - bbox[0])
        heights.append(bbox[3] - bbox[1])
    hook_line_gap = effective_line_gap(
        int(preset["hook_line_gap"]),
        int(preset["hook_font_size"]),
        len(hook_lines),
    )
    text_height = sum(heights) + max(0, len(heights) - 1) * hook_line_gap
    panel_width = min(TARGET_W - preset["safe_left"] - preset["safe_right"], max(widths, default=0) + 92)
    panel_height = text_height + 46
    accent_color = spec.get("accent_color")
    outline = None
    outline_width = 0
    if accent_color is not None:
        outline = (*accent_color, 215)
        outline_width = 3
    hook_panel_alpha = int(preset.get("hook_panel_alpha", preset["panel_alpha"]))
    if hook_panel_alpha > 0:
        panel_box = draw_centered_panel(
            draw,
            y=int(preset["hook_y"]) - 22,
            width=panel_width,
            height=panel_height,
            fill=(10, 14, 28, hook_panel_alpha),
            outline=outline,
            outline_width=outline_width,
        )
    else:
        panel_box = (
            (TARGET_W - panel_width) // 2,
            int(preset["hook_y"]) - 22,
            (TARGET_W + panel_width) // 2,
            int(preset["hook_y"]) - 22 + panel_height,
        )
    centered_lines(
        draw,
        hook_lines,
        y=panel_box[1] + 22,
        font=hook_font,
        fill=(255, 255, 255, 255),
        shadow_fill=(0, 0, 0, 150),
        line_gap=hook_line_gap,
        stroke_width=int(preset.get("hook_stroke_width", 0)),
        stroke_fill=resolve_stroke_fill(preset),
    )
    image.save(output_path)


def render_body_layer(spec: dict[str, Any], output_path: Path) -> None:
    body_text = str(spec.get("body_render_text") or "").strip()
    if not body_text:
        Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0)).save(output_path)
        return

    preset = spec["preset"]
    image = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    body_font = fit_font("medium", preset["body_font_size"], body_text, preset["body_max_width"])
    body_lines = wrap_lines(draw, body_text, body_font, preset["body_max_width"])

    widths: list[int] = []
    heights: list[int] = []
    for line in body_lines:
        bbox = draw.textbbox((0, 0), line, font=body_font)
        widths.append(bbox[2] - bbox[0])
        heights.append(bbox[3] - bbox[1])
    body_line_gap = effective_line_gap(
        int(preset["body_line_gap"]),
        int(preset["body_font_size"]),
        len(body_lines),
    )
    text_height = sum(heights) + max(0, len(heights) - 1) * body_line_gap
    panel_width = min(TARGET_W - preset["safe_left"] - preset["safe_right"], max(widths, default=0) + 104)
    panel_height = text_height + 54
    body_panel_alpha = int(preset.get("body_panel_alpha", preset["panel_alpha"]))
    if body_panel_alpha > 0:
        panel_box = draw_centered_panel(
            draw,
            y=int(preset["body_y"]) - 24,
            width=panel_width,
            height=panel_height,
            fill=(10, 14, 28, body_panel_alpha),
        )
    else:
        panel_box = (
            (TARGET_W - panel_width) // 2,
            int(preset["body_y"]) - 24,
            (TARGET_W + panel_width) // 2,
            int(preset["body_y"]) - 24 + panel_height,
        )
    centered_lines(
        draw,
        body_lines,
        y=panel_box[1] + 26,
        font=body_font,
        fill=(245, 247, 250, 255),
        shadow_fill=(0, 0, 0, 138),
        line_gap=body_line_gap,
        stroke_width=int(preset.get("body_stroke_width", 0)),
        stroke_fill=resolve_stroke_fill(preset),
    )
    image.save(output_path)


def render_cta_layer(spec: dict[str, Any], output_path: Path) -> None:
    cta_text = str(spec.get("cta_render_text") or "").strip()
    if not cta_text:
        Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0)).save(output_path)
        return

    preset = spec["preset"]
    image = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    cta_font = fit_font("medium", preset["cta_font_size"], cta_text, preset["cta_max_width"])
    cta_lines = wrap_lines(draw, cta_text, cta_font, preset["cta_max_width"])

    widths: list[int] = []
    heights: list[int] = []
    for line in cta_lines:
        bbox = draw.textbbox((0, 0), line, font=cta_font)
        widths.append(bbox[2] - bbox[0])
        heights.append(bbox[3] - bbox[1])
    cta_line_gap = effective_line_gap(
        int(preset["cta_line_gap"]),
        int(preset["cta_font_size"]),
        len(cta_lines),
    )
    text_height = sum(heights) + max(0, len(heights) - 1) * cta_line_gap
    panel_width = min(TARGET_W - preset["safe_left"] - preset["safe_right"], max(widths, default=0) + 92)
    panel_height = text_height + 34
    cta_panel_alpha = int(preset.get("cta_panel_alpha", preset["cta_alpha"]))
    cta_border_alpha = int(preset.get("cta_border_alpha", preset["cta_border_alpha"]))
    if cta_panel_alpha > 0 or cta_border_alpha > 0:
        panel_box = draw_centered_panel(
            draw,
            y=int(preset["cta_y"]) - 18,
            width=panel_width,
            height=panel_height,
            fill=(10, 14, 28, cta_panel_alpha),
            outline=(255, 255, 255, cta_border_alpha) if cta_border_alpha > 0 else None,
            outline_width=2 if cta_border_alpha > 0 else 0,
        )
    else:
        panel_box = (
            (TARGET_W - panel_width) // 2,
            int(preset["cta_y"]) - 18,
            (TARGET_W + panel_width) // 2,
            int(preset["cta_y"]) - 18 + panel_height,
        )
    centered_lines(
        draw,
        cta_lines,
        y=panel_box[1] + 16,
        font=cta_font,
        fill=(255, 255, 255, 245),
        shadow_fill=(0, 0, 0, 128),
        line_gap=cta_line_gap,
        stroke_width=int(preset.get("cta_stroke_width", 0)),
        stroke_fill=resolve_stroke_fill(preset),
    )
    image.save(output_path)


def render_logo_layer(spec: dict[str, Any], output_path: Path) -> None:
    image = Image.new("RGBA", TARGET_SIZE, (0, 0, 0, 0))
    logo_path = spec.get("logo")
    if isinstance(logo_path, Path) and logo_path.exists():
        preset = spec["preset"]
        logo = Image.open(logo_path).convert("RGBA")
        logo_width = int(preset["logo_width"])
        scale = logo_width / max(1, logo.width)
        logo = logo.resize((logo_width, max(1, int(logo.height * scale))), Image.Resampling.LANCZOS)
        logo_x = TARGET_W - preset["safe_right"] - logo.width
        logo_y = TARGET_H - preset["safe_bottom"] - logo.height
        image.alpha_composite(logo, (logo_x, logo_y))
    image.save(output_path)


def render_overlay_layers(spec: dict[str, Any], temp_dir: Path) -> list[dict[str, Any]]:
    preset = spec["preset"]
    layers: list[dict[str, Any]] = []
    background_tint = temp_dir / f"{spec['platform']}-bg-tint.png"
    build_background_tint(background_tint, preset)
    layers.append({"path": background_tint, "start": 0.0, "slide_offset": 0, "end": None})

    hook_path = temp_dir / f"{spec['platform']}-hook.png"
    render_hook_layer(spec, hook_path)
    layers.append({
        "path": hook_path,
        "start": float(preset["hook_start_seconds"]),
        "slide_offset": int(preset["hook_slide_offset"]),
        "end": float(preset["hook_end_seconds"]) if preset.get("hook_end_seconds") is not None else None,
    })

    body_path = temp_dir / f"{spec['platform']}-body.png"
    render_body_layer(spec, body_path)
    layers.append({
        "path": body_path,
        "start": float(preset["body_start_seconds"]),
        "slide_offset": int(preset["body_slide_offset"]),
        "end": float(preset["body_end_seconds"]) if preset.get("body_end_seconds") is not None else None,
    })

    cta_path = temp_dir / f"{spec['platform']}-cta.png"
    render_cta_layer(spec, cta_path)
    layers.append({
        "path": cta_path,
        "start": float(preset["cta_start_seconds"]),
        "slide_offset": int(preset["cta_slide_offset"]),
        "end": float(preset["cta_end_seconds"]) if preset.get("cta_end_seconds") is not None else None,
    })

    logo_path = temp_dir / f"{spec['platform']}-logo.png"
    render_logo_layer(spec, logo_path)
    layers.append({"path": logo_path, "start": float(preset["cta_start_seconds"]), "slide_offset": 0, "end": None})
    return layers


def build_ffmpeg_command(
    spec: dict[str, Any],
    overlay_paths: list[dict[str, Any]],
    output_path: Path,
    *,
    voiceover_path: Path | None = None,
) -> list[str]:
    background = spec["background"]
    if not isinstance(background, Path):
        raise RuntimeError("Background path missing.")

    cmd = ["ffmpeg", "-y"]
    if is_image_path(background):
        cmd += ["-loop", "1", "-framerate", "30", "-i", str(background)]
    else:
        cmd += ["-stream_loop", "-1", "-i", str(background)]
    for layer in overlay_paths:
        cmd += ["-loop", "1", "-framerate", "30", "-i", str(layer["path"])]

    music = spec.get("audio")
    music_index = None
    if isinstance(music, Path):
        music_index = 1 + len(overlay_paths)
        cmd += ["-stream_loop", "-1", "-i", str(music)]
    voice_index = None
    if isinstance(voiceover_path, Path):
        voice_index = music_index + 1 if music_index is not None else 1 + len(overlay_paths)
        cmd += ["-i", str(voiceover_path)]

    eq = spec["preset"]["eq"]
    if is_image_path(background):
        frame_count = max(180, int(round(float(spec["duration_seconds"]) * 30)))
        bg_filter = (
            f"[0:v]scale={TARGET_W}:{TARGET_H}:force_original_aspect_ratio=increase,"
            f"zoompan=z='min(zoom+0.0007,1.08)':"
            "x='iw/2-(iw/zoom/2)':"
            "y='ih/2-(ih/zoom/2)':"
            f"d={frame_count}:s={TARGET_W}x{TARGET_H}:fps=30,"
            "setsar=1,"
            f"eq=contrast={eq['contrast']}:saturation={eq['saturation']}:brightness={eq['brightness']}[bg]"
        )
    else:
        bg_filter = (
            f"[0:v]scale={TARGET_W}:{TARGET_H}:force_original_aspect_ratio=increase,"
            f"crop={TARGET_W}:{TARGET_H},"
            "setsar=1,"
            "fps=30,"
            f"eq=contrast={eq['contrast']}:saturation={eq['saturation']}:brightness={eq['brightness']}[bg]"
        )

    filter_parts = [bg_filter]
    current_label = "bg"
    fade_seconds = float(spec["preset"]["layer_fade_seconds"])
    for overlay_idx, layer in enumerate(overlay_paths, start=1):
        prepared_label = f"ol{overlay_idx}"
        start = float(layer["start"])
        slide_offset = int(layer["slide_offset"])
        end = start + fade_seconds
        end_value = layer.get("end")
        if end_value is not None:
            end = max(start + fade_seconds, min(float(end_value), float(spec["duration_seconds"])))
        if end_value is not None:
            fade_out_start = max(start + fade_seconds, end - fade_seconds)
            filter_parts.append(
                f"[{overlay_idx}:v]format=rgba,fade=t=in:st={start:.2f}:d={fade_seconds:.2f}:alpha=1,fade=t=out:st={fade_out_start:.2f}:d={fade_seconds:.2f}:alpha=1[{prepared_label}]"
            )
        else:
            filter_parts.append(
                f"[{overlay_idx}:v]format=rgba,fade=t=in:st={start:.2f}:d={fade_seconds:.2f}:alpha=1[{prepared_label}]"
            )
        next_label = "v" if overlay_idx == len(overlay_paths) else f"bg{overlay_idx}"
        if slide_offset == 0:
            y_expr = "0"
        else:
            y_expr = (
                f"if(lt(t,{start:.2f}),{slide_offset},"
                f"if(lt(t,{start + fade_seconds:.2f}),{slide_offset}*(({start + fade_seconds:.2f}-t)/{fade_seconds:.2f}),0))"
            )
        filter_parts.append(
            f"[{current_label}][{prepared_label}]overlay=0:'{y_expr}':format=auto[{next_label}]"
        )
        current_label = next_label
    filter_parts.append(f"[{current_label}]format=yuv420p[v]")
    filter_complex = ";".join(filter_parts)

    cmd += [
        "-t",
        f"{spec['duration_seconds']:.2f}",
    ]

    audio_output_args: list[str]
    if music_index is not None and voice_index is not None:
        fade_start = max(0.0, float(spec["duration_seconds"]) - 0.35)
        filter_complex += (
            f";[{music_index}:a]atrim=0:{spec['duration_seconds']:.2f},"
            f"volume={spec['preset']['music_volume']},"
            f"afade=t=out:st={fade_start:.2f}:d=0.35[music]"
            f";[{voice_index}:a]atrim=0:{spec['duration_seconds']:.2f},"
            f"afade=t=out:st={fade_start:.2f}:d=0.25[voice]"
            ";[music][voice]amix=inputs=2:duration=longest:dropout_transition=0[a]"
        )
        audio_output_args = [
            "-map",
            "[a]",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
        ]
    elif voice_index is not None:
        fade_start = max(0.0, float(spec["duration_seconds"]) - 0.25)
        filter_complex += (
            f";[{voice_index}:a]atrim=0:{spec['duration_seconds']:.2f},"
            f"afade=t=out:st={fade_start:.2f}:d=0.25[a]"
        )
        audio_output_args = [
            "-map",
            "[a]",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
        ]
    elif music_index is not None:
        fade_start = max(0.0, float(spec["duration_seconds"]) - 0.35)
        audio_output_args = [
            "-map",
            f"{music_index}:a:0",
            "-af",
            f"atrim=0:{spec['duration_seconds']:.2f},afade=t=out:st={fade_start:.2f}:d=0.35",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
        ]
    else:
        audio_output_args = ["-an"]

    cmd += [
        "-filter_complex",
        filter_complex,
        "-map",
        "[v]",
    ]
    cmd += audio_output_args

    cmd += [
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        str(output_path),
    ]
    return cmd


def render_platform_video(spec: dict[str, Any], out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    output_path = out_dir / spec["output_name"]

    with tempfile.TemporaryDirectory(prefix=f"{spec['slug']}-{spec['platform']}-") as temp_dir_raw:
        temp_dir = Path(temp_dir_raw)
        overlay_paths = render_overlay_layers(spec, temp_dir)
        voiceover_path = generate_voiceover(spec, temp_dir)
        cmd = build_ffmpeg_command(spec, overlay_paths, output_path, voiceover_path=voiceover_path)
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    return output_path


def run_generate(args: argparse.Namespace) -> int:
    spec_path = Path(args.spec).resolve()
    spec = normalize_spec(load_spec(spec_path), spec_path)
    out_dir = Path(args.out_dir).resolve()

    selected_platforms = SUPPORTED_PLATFORMS if args.platform == "both" else (args.platform,)
    for platform in selected_platforms:
        platform_spec = build_platform_spec(spec, platform)
        output_path = render_platform_video(platform_spec, out_dir)
        print(f"OK -> {output_path}")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Generate TikTok and Instagram variants from one Coachi social-video spec."
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    generate = subparsers.add_parser("generate", help="Render one shared social-video spec.")
    generate.add_argument("--spec", required=True, help="Path to a JSON video spec.")
    generate.add_argument("--out-dir", required=True, help="Output directory for rendered videos.")
    generate.add_argument(
        "--platform",
        choices=("both", "tiktok", "instagram"),
        default="both",
        help="Which platform variants to render. Default: both.",
    )
    generate.set_defaults(func=run_generate)
    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return args.func(args)
    except subprocess.CalledProcessError as exc:
        stderr = exc.stderr.decode("utf-8", errors="ignore") if exc.stderr else str(exc)
        print(f"ERROR: ffmpeg failed: {stderr}", flush=True)
        return 1
    except Exception as exc:
        print(f"ERROR: {exc}", flush=True)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""Upload slideshow campaign assets to an isolated marketing Supabase project."""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import mimetypes
import os
from pathlib import Path
from typing import Any
from urllib import error, parse, request


PUBLIC_DIRS = {"slides", "public", "exports", "final"}
PUBLIC_FILENAMES = {
    "final-tiktok.mp4",
    "final-instagram.mp4",
    "tiktok.mp4",
    "instagram.mp4",
    "cover.png",
    "cover.jpg",
    "cover.jpeg",
    "cover.webp",
}
PRIVATE_DIRS = {"source", "copy", "private", "drafts"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Upload slideshow campaign assets to marketing-only Supabase storage."
    )
    parser.add_argument("--root", required=True, help="Local slideshow campaign folder.")
    parser.add_argument("--campaign-date", required=True, help="Campaign date: YYYY-MM-DD.")
    parser.add_argument("--slug", required=True, help="Campaign slug, e.g. easy-pace.")
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Upload files. Without this flag, the command only prints a dry-run manifest.",
    )
    parser.add_argument(
        "--manifest-out",
        help="Write upload manifest JSON to this path.",
    )
    parser.add_argument(
        "--public-bucket",
        default=os.getenv("MARKETING_SUPABASE_PUBLIC_BUCKET", "slideshow-public"),
    )
    parser.add_argument(
        "--private-bucket",
        default=os.getenv("MARKETING_SUPABASE_PRIVATE_BUCKET", "slideshow-private"),
    )
    return parser.parse_args()


def validate_date(value: str) -> None:
    try:
        dt.date.fromisoformat(value)
    except ValueError as exc:
        raise SystemExit(f"Invalid --campaign-date `{value}`. Use YYYY-MM-DD.") from exc


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def content_type(path: Path) -> str:
    if path.suffix == ".md":
        return "text/markdown"
    guessed, _ = mimetypes.guess_type(path.name)
    return guessed or "application/octet-stream"


def classify_bucket(relative_path: Path, public_bucket: str, private_bucket: str) -> str:
    parts = set(relative_path.parts[:-1])
    name = relative_path.name.lower()
    if parts & PRIVATE_DIRS:
        return private_bucket
    if parts & PUBLIC_DIRS:
        return public_bucket
    if name in PUBLIC_FILENAMES:
        return public_bucket
    return private_bucket


def remote_path(campaign_date: str, slug: str, bucket_id: str, private_bucket: str, relative_path: Path) -> str:
    visibility = "private" if bucket_id == private_bucket else "public"
    return "/".join(
        [
            "slideshows",
            campaign_date,
            slug,
            visibility,
            relative_path.as_posix(),
        ]
    )


def asset_role(path: Path) -> str:
    stem = path.stem.lower()
    if stem.startswith("01") or "hook" in stem:
        return "hook_slide"
    if "tiktok" in stem:
        return "tiktok_asset"
    if "instagram" in stem:
        return "instagram_asset"
    if "caption" in stem:
        return "caption"
    if "prompt" in stem:
        return "source_prompt"
    if stem == "qa":
        return "qa_note"
    if "manifest" in stem:
        return "manifest"
    return "asset"


def platform(path: Path) -> str | None:
    lowered = path.as_posix().lower()
    if "tiktok" in lowered:
        return "tiktok"
    if "instagram" in lowered:
        return "instagram"
    if "slides" in path.parts or "public" in path.parts:
        return "shared"
    return None


def public_url(supabase_url: str | None, bucket_id: str, public_bucket: str, object_path: str) -> str | None:
    if bucket_id != public_bucket or not supabase_url:
        return None
    quoted = parse.quote(object_path, safe="/")
    return f"{supabase_url.rstrip('/')}/storage/v1/object/public/{bucket_id}/{quoted}"


def upload_file(supabase_url: str, api_key: str, bucket_id: str, object_path: str, path: Path, mime: str) -> None:
    quoted_path = parse.quote(object_path, safe="/")
    url = f"{supabase_url.rstrip('/')}/storage/v1/object/{bucket_id}/{quoted_path}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "apikey": api_key,
        "Content-Type": mime,
        "x-upsert": "true",
    }
    req = request.Request(url, data=path.read_bytes(), headers=headers, method="POST")
    try:
        with request.urlopen(req, timeout=60) as response:
            if response.status not in {200, 201}:
                raise RuntimeError(f"Unexpected upload status {response.status} for {path}")
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Upload failed for {path}: {exc.code} {detail}") from exc


def build_manifest(args: argparse.Namespace, supabase_url: str | None) -> dict[str, Any]:
    root = Path(args.root).expanduser().resolve()
    if not root.exists():
        raise SystemExit(f"Folder not found: {root}")
    if not root.is_dir():
        raise SystemExit(f"--root must be a folder: {root}")

    objects: list[dict[str, Any]] = []
    for path in sorted(item for item in root.rglob("*") if item.is_file()):
        relative = path.relative_to(root)
        bucket_id = classify_bucket(relative, args.public_bucket, args.private_bucket)
        object_path = remote_path(args.campaign_date, args.slug, bucket_id, args.private_bucket, relative)
        mime = content_type(path)
        objects.append(
            {
                "local_path": str(path),
                "bucket_id": bucket_id,
                "object_path": object_path,
                "asset_role": asset_role(path),
                "platform": platform(relative),
                "content_type": mime,
                "byte_size": path.stat().st_size,
                "sha256": file_sha256(path),
                "public_url": public_url(supabase_url, bucket_id, args.public_bucket, object_path),
            }
        )

    return {
        "campaign_date": args.campaign_date,
        "slug": args.slug,
        "dry_run": not args.execute,
        "public_bucket": args.public_bucket,
        "private_bucket": args.private_bucket,
        "objects": objects,
        "safety": {
            "uses_app_supabase_project": False,
            "contains_user_data": False,
            "contains_app_secrets": False,
            "final_publish_automated": False,
        },
    }


def main() -> None:
    args = parse_args()
    validate_date(args.campaign_date)

    supabase_url = os.getenv("MARKETING_SUPABASE_URL")
    api_key = os.getenv("MARKETING_SUPABASE_SECRET_KEY") or os.getenv("MARKETING_SUPABASE_SERVICE_ROLE_KEY")

    if args.execute and (not supabase_url or not api_key):
        raise SystemExit(
            "Set MARKETING_SUPABASE_URL and MARKETING_SUPABASE_SECRET_KEY before using --execute."
        )

    manifest = build_manifest(args, supabase_url)

    if args.execute:
        assert supabase_url is not None
        assert api_key is not None
        for item in manifest["objects"]:
            upload_file(
                supabase_url=supabase_url,
                api_key=api_key,
                bucket_id=item["bucket_id"],
                object_path=item["object_path"],
                path=Path(item["local_path"]),
                mime=item["content_type"],
            )

    output = json.dumps(manifest, indent=2, sort_keys=True)
    if args.manifest_out:
        manifest_path = Path(args.manifest_out).expanduser()
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(output + "\n", encoding="utf-8")
    else:
        print(output)


if __name__ == "__main__":
    main()

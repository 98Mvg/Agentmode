#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


ALLOWED_TYPES = {"AI lesson", "shipping lesson", "runner truth"}
EXPECTED_TYPE_ORDER = ["AI lesson", "shipping lesson", "runner truth"]
CTA_PATTERNS = (
    "coachi.no",
    "app store",
    "download",
    "try coachi",
    "sign up",
    "install",
)
BUILD_TERMS = (
    "coachi",
    "building",
    "build",
    "product",
    "model",
    "system",
    "shipping",
    "app",
)
RUNNER_TERMS = (
    "runner",
    "runners",
    "run",
    "body",
    "watch",
    "pace",
    "heart",
    "breathing",
    "effort",
    "zone",
)
BRAND_PATTERNS = (
    r"\bcoachi\b",
    r"coachi\.no",
)


def parse_posts(markdown: str) -> list[dict[str, object]]:
    pattern = re.compile(
        r"## Post \d+\nType: `(?P<type>[^`]+)`\n\n(?P<body>.*?)(?=\n## Post \d+\nType: `|\n## Suggested Reply Prompts|\Z)",
        re.S,
    )
    posts = []
    for match in pattern.finditer(markdown):
      body = match.group("body").strip()
      paragraphs = [segment.strip() for segment in re.split(r"\n\s*\n", body) if segment.strip()]
      lines = [line.strip() for line in body.splitlines() if line.strip()]
      posts.append(
          {
              "type": match.group("type").strip(),
              "body": body,
              "paragraphs": paragraphs,
              "hook": lines[0] if lines else "",
              "word_count": len(re.findall(r"\b[\w'-]+\b", body)),
          }
      )
    return posts


def validate_posts(posts: list[dict[str, object]]) -> list[str]:
    errors: list[str] = []
    if len(posts) != 3:
        errors.append(f"Expected 3 posts, found {len(posts)}.")
        return errors

    types = [str(post["type"]) for post in posts]
    if sorted(types) != sorted(EXPECTED_TYPE_ORDER):
        errors.append(
            "Pack must contain exactly one of each type: `AI lesson`, `shipping lesson`, `runner truth`."
        )

    cta_count = 0
    coachi_post_count = 0
    for index, post in enumerate(posts, start=1):
        post_type = str(post["type"])
        body = str(post["body"])
        paragraphs = list(post["paragraphs"])
        hook = str(post["hook"])
        word_count = int(post["word_count"])
        normalized = body.lower()

        if post_type not in ALLOWED_TYPES:
            errors.append(f"Post {index} has unsupported type `{post_type}`.")

        if word_count < 40 or word_count > 120:
            errors.append(f"Post {index} should be 40-120 words for a daily founder pack, found {word_count}.")

        if len(paragraphs) < 4:
            errors.append(f"Post {index} should follow hook -> insight -> observation -> conclusion with at least 4 paragraphs.")

        if len(re.findall(r"\b[\w'-]+\b", hook)) > 12:
            errors.append(f"Post {index} hook is too long to stand alone cleanly on X.")

        if post_type in {"AI lesson", "shipping lesson"}:
            if not any(term in normalized for term in BUILD_TERMS):
                errors.append(f"Post {index} ({post_type}) is missing a clear founder/product-building signal.")
            if not any(term in normalized for term in RUNNER_TERMS):
                errors.append(f"Post {index} ({post_type}) does not connect back to a runner problem.")
        elif not any(term in normalized for term in RUNNER_TERMS):
            errors.append(f"Post {index} ({post_type}) is missing a clear runner observation.")

        if any(pattern in normalized for pattern in CTA_PATTERNS):
            cta_count += 1

        if any(re.search(pattern, normalized) for pattern in BRAND_PATTERNS):
            coachi_post_count += 1

    if cta_count > 1:
        errors.append("The 3-post set can contain at most 1 direct CTA or link.")

    if coachi_post_count > 1:
        errors.append("The 3-post set can mention `Coachi` directly in at most 1 post.")

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a Coachi daily X pack against the live preflight rules.")
    parser.add_argument("pack", help="Absolute path to the X daily pack markdown file.")
    args = parser.parse_args()

    pack_path = Path(args.pack)
    markdown = pack_path.read_text(encoding="utf-8")
    posts = parse_posts(markdown)
    errors = validate_posts(posts)

    if errors:
        print(f"FAIL {pack_path}")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"OK {pack_path}")
    for index, post in enumerate(posts, start=1):
        print(f"- Post {index}: {post['type']} ({post['word_count']} words)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

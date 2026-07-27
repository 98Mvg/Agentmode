import assert from "node:assert/strict";
import test from "node:test";

import {
  fitShortHookTypography,
  wrapTextByCharacters
} from "../slideshow_text_layout.mjs";

test("wide short hooks fit two lines by shrinking within a readable bound", () => {
  const fitted = fitShortHookTypography({
    text: "Set Apple Watch heart-rate alerts before running",
    fontSize: 92,
    maxCharsPerLine: 16
  });
  const lines = wrapTextByCharacters(
    "Set Apple Watch heart-rate alerts before running",
    fitted.maxCharsPerLine
  );

  assert.equal(lines.length, 2);
  assert.ok(fitted.fontSize >= 56);
  assert.ok(fitted.fontSize < 92);
});

test("compact short hooks keep their requested typography", () => {
  const fitted = fitShortHookTypography({
    text: "Stop racing easy runs",
    fontSize: 92,
    maxCharsPerLine: 16
  });

  assert.deepEqual(fitted, {
    fontSize: 92,
    maxCharsPerLine: 16
  });
});

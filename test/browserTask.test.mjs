import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { execFile as execFileCallback } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const projectRoot = resolve(new URL("..", import.meta.url).pathname);
const cloudTaskPath = resolve(projectRoot, "dist/tasks/cloudTask.js");
const browsersPath = resolve(projectRoot, "data/pw-browsers");

test("scripted browser task can fill, extract, screenshot, and publish locally", async () => {
  const tempDir = await mkdtemp(join(tmpdir(), "agentmode-script-test-"));
  const htmlPath = join(tempDir, "fixture.html");
  const scriptPath = join(tempDir, "script.json");
  const dataRoot = join(tempDir, "data");

  const html = `<!doctype html>
  <html>
    <body>
      <label for="post-text">Post text</label>
      <textarea id="post-text"></textarea>
      <button id="preview" onclick="document.getElementById('preview-copy').textContent = document.getElementById('post-text').value">Preview</button>
      <button id="publish" onclick="document.getElementById('status').textContent = 'Published!'">Publish</button>
      <div id="preview-copy"></div>
      <div id="status">Draft</div>
    </body>
  </html>`;

  await writeFile(htmlPath, html, "utf8");
  await writeFile(
    scriptPath,
    JSON.stringify(
      {
        name: "local-publish-test",
        steps: [
          { type: "goto", url: pathToFileURL(htmlPath).href },
          { type: "fill", target: { label: "Post text" }, value: "Hello from Agentmode" },
          { type: "click", target: { role: "button", name: "Preview" } },
          { type: "waitForText", text: "Hello from Agentmode" },
          { type: "screenshot", path: "preview.png" },
          { type: "publish", target: { role: "button", name: "Publish" } },
          { type: "waitForText", text: "Published!" },
          { type: "extract", path: "page.txt" }
        ]
      },
      null,
      2
    ),
    "utf8"
  );

  const { stdout } = await execFile(
    process.execPath,
    [cloudTaskPath, "--script-file", scriptPath, "--run-label", "local-publish", "--allow-live-publish"],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        PLAYWRIGHT_BROWSERS_PATH: browsersPath,
        BROWSER_MCP_DATA_ROOT: dataRoot,
        BROWSER_MCP_HEADLESS: "true"
      }
    }
  );

  const result = JSON.parse(stdout);
  assert.equal(result.scriptName, "local-publish-test");
  assert.equal(result.published, true);
  assert.match(result.screenshotPath, /preview\.png$/);
  assert.match(result.extractPath, /page\.txt$/);
  assert.ok(result.stepResults.some((step) => step.detail === "Found text Published!"));

  const extract = await readFile(result.extractPath, "utf8");
  assert.match(extract, /Hello from Agentmode/);
  assert.match(extract, /Published!/);
});

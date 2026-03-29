import { runBrowserTask } from "../browserTask.js";

const result = await runBrowserTask({
  url: "data:text/html,<html><body><h1>Browser Smoke OK</h1><p>Codex cloud browser task runner</p></body></html>",
  waitForText: "Browser Smoke OK",
  screenshot: "smoke.png",
  extract: "smoke.txt",
  headless: true,
  runLabel: "smoke"
});

console.log(JSON.stringify(result, null, 2));

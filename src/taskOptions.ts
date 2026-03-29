import { BrowserTaskOptions } from "./browserTask.js";

export function parseTaskArgs(argv: string[]): BrowserTaskOptions {
  const options: BrowserTaskOptions = {
    url: "",
    headless: true,
    timeoutMs: 30000
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    switch (arg) {
      case "--url":
        options.url = next || "";
        i += 1;
        break;
      case "--wait-for-text":
        options.waitForText = next;
        i += 1;
        break;
      case "--screenshot":
        options.screenshot = next;
        i += 1;
        break;
      case "--extract":
        options.extract = next;
        i += 1;
        break;
      case "--run-label":
        options.runLabel = next;
        i += 1;
        break;
      case "--timeout-ms":
        options.timeoutMs = Number(next || 30000);
        i += 1;
        break;
      case "--headed":
        options.headless = false;
        break;
      case "--headless":
        options.headless = true;
        break;
      default:
        break;
    }
  }

  if (!options.url) {
    throw new Error("Missing required --url");
  }

  return options;
}

import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
export const projectRoot = resolve(here, "..");
export const dataRoot = process.env.BROWSER_MCP_DATA_ROOT || join(projectRoot, "data");
export const browsersRoot = process.env.PLAYWRIGHT_BROWSERS_PATH || join(dataRoot, "pw-browsers");
export const defaultHeadless = process.env.BROWSER_MCP_HEADLESS === "true";

if (!process.env.PLAYWRIGHT_BROWSERS_PATH) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = browsersRoot;
}
if (!process.env.BROWSER_MCP_DATA_ROOT) {
  process.env.BROWSER_MCP_DATA_ROOT = dataRoot;
}

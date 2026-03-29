import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { dataRoot, defaultHeadless } from "./paths.js";
import { closeSession, createSession, getSession } from "./sessionStore.js";
import { findByElementId, snapshotPage } from "./snapshot.js";

const server = new McpServer({
  name: "playwright-browser",
  version: "0.1.0"
});

server.tool(
  "browser_new_session",
  {
    headless: z.boolean().default(defaultHeadless)
  },
  async ({ headless }) => {
    const sessionId = `sess_${randomUUID().slice(0, 8)}`;
    const session = await createSession(sessionId, headless);
    const state = await snapshotPage(sessionId, session.page);
    return {
      content: [{ type: "text", text: JSON.stringify(state, null, 2) }]
    };
  }
);

server.tool(
  "browser_open",
  {
    session_id: z.string(),
    url: z.string().url()
  },
  async ({ session_id, url }) => {
    const { page } = getSession(session_id);
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const state = await snapshotPage(session_id, page);
    return {
      content: [{ type: "text", text: JSON.stringify(state, null, 2) }]
    };
  }
);

server.tool(
  "browser_click",
  {
    session_id: z.string(),
    element_id: z.string()
  },
  async ({ session_id, element_id }) => {
    const { page } = getSession(session_id);
    const locator = findByElementId(page, element_id);
    await locator.click();
    const state = await snapshotPage(session_id, page);
    return {
      content: [{ type: "text", text: JSON.stringify(state, null, 2) }]
    };
  }
);

server.tool(
  "browser_type",
  {
    session_id: z.string(),
    element_id: z.string(),
    text: z.string(),
    clear_first: z.boolean().default(true)
  },
  async ({ session_id, element_id, text, clear_first }) => {
    const { page } = getSession(session_id);
    const locator = findByElementId(page, element_id);
    if (clear_first) {
      await locator.clear();
    }
    await locator.fill(text);
    const state = await snapshotPage(session_id, page);
    return {
      content: [{ type: "text", text: JSON.stringify(state, null, 2) }]
    };
  }
);

server.tool(
  "browser_press",
  {
    session_id: z.string(),
    key: z.string()
  },
  async ({ session_id, key }) => {
    const { page } = getSession(session_id);
    await page.keyboard.press(key);
    const state = await snapshotPage(session_id, page);
    return {
      content: [{ type: "text", text: JSON.stringify(state, null, 2) }]
    };
  }
);

server.tool(
  "browser_wait_for_text",
  {
    session_id: z.string(),
    text: z.string(),
    timeout_ms: z.number().int().positive().default(10000)
  },
  async ({ session_id, text, timeout_ms }) => {
    const { page } = getSession(session_id);
    await page.getByText(text, { exact: false }).waitFor({ timeout: timeout_ms });
    const state = await snapshotPage(session_id, page);
    return {
      content: [{ type: "text", text: JSON.stringify(state, null, 2) }]
    };
  }
);

server.tool(
  "browser_extract_text",
  {
    session_id: z.string()
  },
  async ({ session_id }) => {
    const { page } = getSession(session_id);
    const bodyText = await page.locator("body").innerText();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ session_id, url: page.url(), text: bodyText }, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "browser_screenshot",
  {
    session_id: z.string(),
    full_page: z.boolean().default(false)
  },
  async ({ session_id, full_page }) => {
    const { page } = getSession(session_id);
    const screenshotsDir = join(dataRoot, "screenshots");
    await mkdir(screenshotsDir, { recursive: true });
    const path = join(screenshotsDir, `${session_id}-${Date.now()}.png`);
    await page.screenshot({ path, fullPage: full_page });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ session_id, path, url: page.url() }, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "browser_close",
  {
    session_id: z.string()
  },
  async ({ session_id }) => {
    await closeSession(session_id);
    return {
      content: [{ type: "text", text: JSON.stringify({ ok: true, session_id }, null, 2) }]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);

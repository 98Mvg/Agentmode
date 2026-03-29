import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { BrowserContext, Page, chromium } from "playwright";
import { dataRoot, defaultHeadless } from "./paths.js";

export type Session = {
  id: string;
  context: BrowserContext;
  page: Page;
};

const sessions = new Map<string, Session>();

export async function createSession(id: string, headless = defaultHeadless) {
  const profileDir = join(dataRoot, "profiles", id);
  const downloadsDir = join(dataRoot, "downloads", id);
  await mkdir(profileDir, { recursive: true });
  await mkdir(downloadsDir, { recursive: true });

  const context = await chromium.launchPersistentContext(profileDir, {
    headless,
    viewport: { width: 1440, height: 900 },
    acceptDownloads: true,
    downloadsPath: downloadsDir
  });

  const page = context.pages()[0] ?? (await context.newPage());
  const session: Session = { id, context, page };
  sessions.set(id, session);
  return session;
}

export function getSession(id: string) {
  const session = sessions.get(id);
  if (!session) {
    throw new Error(`Unknown session: ${id}`);
  }
  return session;
}

export async function closeSession(id: string) {
  const session = getSession(id);
  await session.context.close();
  sessions.delete(id);
}

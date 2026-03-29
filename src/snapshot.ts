import type { Page } from "playwright";

export type ElementSnapshot = {
  element_id: string;
  role: string | null;
  name: string | null;
  text: string | null;
  visible: boolean;
  enabled: boolean;
};

export type BrowserState = {
  session_id: string;
  url: string;
  title: string;
  loading: boolean;
  visible_text: string;
  elements: ElementSnapshot[];
  error: string | null;
};

export async function snapshotPage(
  sessionId: string,
  page: Page,
  error: string | null = null
): Promise<BrowserState> {
  const title = await page.title();
  const url = page.url();

  const elements = await page.evaluate(() => {
    const nodes = Array.from(
      document.querySelectorAll("a,button,input,select,textarea,[role]")
    ).slice(0, 80);

    return nodes.map((node, index) => {
      const el = node as HTMLElement;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      const visible =
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== "hidden" &&
        style.display !== "none";
      const enabled = !(el as HTMLInputElement).disabled;
      const role = el.getAttribute("role") || el.tagName.toLowerCase();
      const name =
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        el.getAttribute("placeholder") ||
        el.textContent?.trim() ||
        null;

      if (!el.dataset.mcpId) {
        el.dataset.mcpId = `el_${index + 1}`;
      }

      return {
        element_id: el.dataset.mcpId,
        role,
        name,
        text: el.textContent?.trim()?.slice(0, 200) || null,
        visible,
        enabled
      };
    });
  });

  const visibleText = await page.locator("body").innerText().catch(() => "");

  return {
    session_id: sessionId,
    url,
    title,
    loading: false,
    visible_text: visibleText.slice(0, 8000),
    elements,
    error
  };
}

export function findByElementId(page: Page, elementId: string) {
  return page.locator(`[data-mcp-id="${elementId}"]`).first();
}

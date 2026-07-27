import fs from "node:fs/promises";
import path from "node:path";

export const BANK_ROOT = "inputs/research";
export const CTA_BANK_PATH = `${BANK_ROOT}/cta-bank.json`;
export const CAPTION_BANK_PATH = `${BANK_ROOT}/caption-bank.json`;
export const HASHTAG_SETS_PATH = `${BANK_ROOT}/hashtag-sets.json`;

export async function readJson(filePath) {
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

export async function readOptionalJson(filePath, fallback = null) {
  try {
    return await readJson(filePath);
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
}

export async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/["'“”]/g, "")
    .replace(/[^a-z0-9#]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function textSimilarity(left, right) {
  const leftTokens = new Set(normalizeText(left).split(" ").filter(Boolean));
  const rightTokens = new Set(normalizeText(right).split(" ").filter(Boolean));
  if (leftTokens.size === 0 && rightTokens.size === 0) return 1;
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union ? intersection / union : 0;
}

export function renderTemplate(template, values = {}) {
  return String(template || "").replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, key) => {
    return values[key] == null ? "" : String(values[key]);
  });
}

function sortByUse(entries) {
  return [...entries].sort((left, right) => {
    const leftUses = Number(left.usage_count || 0);
    const rightUses = Number(right.usage_count || 0);
    if (leftUses !== rightUses) return leftUses - rightUses;
    return String(left.last_used_at || "").localeCompare(String(right.last_used_at || ""));
  });
}

export function selectLeastUsed(entries, { excludeIds = new Set(), predicate = null } = {}) {
  const filtered = sortByUse(entries || [])
    .filter((entry) => !excludeIds.has(entry.id))
    .filter((entry) => !predicate || predicate(entry));
  return filtered[0] || sortByUse(entries || []).find((entry) => !predicate || predicate(entry)) || null;
}

export async function recordBankUsage(filePath, id, collectionHint = null, usedAt = new Date().toISOString()) {
  if (!id) return null;
  const bank = await readOptionalJson(filePath, null);
  if (!bank) return null;

  const collections = [];
  if (!collectionHint || collectionHint === "entries") collections.push(bank.entries);
  if (!collectionHint || collectionHint === "sets") collections.push(bank.sets);
  if (!collectionHint || collectionHint === "templates") {
    collections.push(bank.default_templates);
    for (const templates of Object.values(bank.problem_type_templates || {})) collections.push(templates);
  }

  for (const collection of collections) {
    if (!Array.isArray(collection)) continue;
    const entry = collection.find((item) => item.id === id);
    if (!entry) continue;
    entry.usage_count = Number(entry.usage_count || 0) + 1;
    entry.last_used_at = usedAt;
    bank.updated = usedAt.slice(0, 10);
    await writeJson(filePath, bank);
    return entry;
  }
  return null;
}

export async function selectHashtagSet({ bankPath = HASHTAG_SETS_PATH, excludeIds = new Set() } = {}) {
  const bank = await readOptionalJson(bankPath, { sets: [] });
  return selectLeastUsed(bank.sets || [], { excludeIds });
}

export async function selectCta({ bankPath = CTA_BANK_PATH, classes = [], excludeIds = new Set(), excludeTexts = [] } = {}) {
  const bank = await readOptionalJson(bankPath, { entries: [] });
  const classSet = new Set(classes.map((value) => String(value).toLowerCase()));
  const normalizedTextExcludes = new Set(excludeTexts.map(normalizeText));
  return selectLeastUsed(bank.entries || [], {
    excludeIds,
    predicate: (entry) => {
      const classOk = classSet.size === 0 || classSet.has(String(entry.class || "").toLowerCase());
      const textOk = !normalizedTextExcludes.has(normalizeText(entry.text));
      return classOk && textOk;
    }
  });
}

export async function selectCaptionTemplate({ bankPath = CAPTION_BANK_PATH, problemType, excludeIds = new Set() } = {}) {
  const bank = await readOptionalJson(bankPath, { default_templates: [], problem_type_templates: {} });
  const templates = [
    ...(bank.problem_type_templates?.[problemType] || []),
    ...(bank.default_templates || [])
  ];
  return selectLeastUsed(templates, { excludeIds });
}

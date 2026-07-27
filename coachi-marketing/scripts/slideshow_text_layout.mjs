export function wrapTextByCharacters(text, maxCharsPerLine) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine) {
      current = next;
      continue;
    }
    if (current) lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines.length ? lines : [String(text)];
}

function balancedTwoLineWidth(text) {
  const words = String(text).trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) return String(text).length;

  let bestWidth = String(text).length;
  let bestDifference = Number.POSITIVE_INFINITY;
  for (let split = 1; split < words.length; split += 1) {
    const first = words.slice(0, split).join(" ");
    const second = words.slice(split).join(" ");
    const width = Math.max(first.length, second.length);
    const difference = Math.abs(first.length - second.length);
    if (width < bestWidth || (width === bestWidth && difference < bestDifference)) {
      bestWidth = width;
      bestDifference = difference;
    }
  }
  return bestWidth;
}

export function fitShortHookTypography({
  text,
  fontSize,
  maxCharsPerLine,
  minimumFontSize = 56
}) {
  const balancedWidth = balancedTwoLineWidth(text);
  if (balancedWidth <= maxCharsPerLine) {
    return { fontSize, maxCharsPerLine };
  }

  const fittedFontSize = Math.max(
    minimumFontSize,
    Math.floor(fontSize * (maxCharsPerLine / balancedWidth))
  );
  return {
    fontSize: fittedFontSize,
    maxCharsPerLine: balancedWidth
  };
}

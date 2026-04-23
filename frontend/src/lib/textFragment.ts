// Builds a URL with a browser text-fragment (#:~:text=…) that scrolls the
// destination page to the cited passage. Falls back to the base URL when the
// target is a PDF / binary, the snippet is empty, or the URL is malformed.

const MAX_SNIPPET_CHARS = 120;

const BINARY_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".zip",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".svg",
  ".mp4",
  ".mov",
  ".mp3",
  ".wav",
]);

const pathExt = (pathname: string): string => {
  const lower = pathname.toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot < 0) return "";
  const slash = lower.lastIndexOf("/");
  if (dot < slash) return "";
  return lower.slice(dot);
};

const normalizeSnippet = (raw: string): string =>
  raw
    .replace(/[\u200B-\u200D\uFEFF]/g, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(?:…|\.\.\.)+\s*/u, "")
    .replace(/\s*(?:…|\.\.\.)+$/u, "")
    .trim();

const truncateAtWordBoundary = (s: string, max: number): string => {
  if (s.length <= max) return s;
  const slice = s.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > 0) return slice.slice(0, lastSpace);
  return slice;
};

// `-` is a fragment-directive delimiter and encodeURIComponent leaves it
// alone, so escape it explicitly to avoid collisions with `text=a,-b`.
const encodeFragmentValue = (s: string): string =>
  encodeURIComponent(s).replace(/-/g, "%2D");

export const buildPassageHref = (
  url: string | null,
  snippet: string,
): string | null => {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return url;
  }

  parsed.hash = "";
  const baseUrl = parsed.toString();

  const cleaned = normalizeSnippet(snippet);
  if (cleaned.length === 0) return baseUrl;

  const ext = pathExt(parsed.pathname);
  if (BINARY_EXTENSIONS.has(ext)) return baseUrl;

  const truncated = truncateAtWordBoundary(cleaned, MAX_SNIPPET_CHARS);
  if (truncated.length === 0) return baseUrl;

  return `${baseUrl}#:~:text=${encodeFragmentValue(truncated)}`;
};

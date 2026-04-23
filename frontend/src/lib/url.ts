/**
 * Backend-supplied URLs flow from the RAG corpus into an <a href>. Block
 * any scheme except http(s) so a poisoned corpus or compromised backend
 * cannot return `javascript:…` and land XSS on click. Callers should use
 * the returned string directly in `href`, or fall through to a safe
 * placeholder when the result is null.
 */
export const safeHttpUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : null;
  } catch {
    return null;
  }
};

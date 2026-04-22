export const CORPUS_SIZE = 27;
export const CORPUS_LAST_VERIFIED = "2026-04-22";

export const formatVerifiedDate = (iso: string = CORPUS_LAST_VERIFIED): string => {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

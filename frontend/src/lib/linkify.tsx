import { type ReactNode } from "react";
import { Acronym } from "@/components/Acronym";
import { ACRONYM_RE, lookupAcronym } from "@/lib/glossary";

const LINKIFY_RE =
  /([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})|(\(\d{3}\)\s?\d{3}[-.\s]?\d{4}|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b)|(\b(?:211|988|911)\b)/g;

const LINK_CLASS =
  "underline decoration-current/40 underline-offset-2 hover:decoration-current";

const acronymize = (text: string, keyPrefix: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let lastIdx = 0;
  const re = new RegExp(ACRONYM_RE.source, ACRONYM_RE.flags);
  for (const m of text.matchAll(re)) {
    const start = m.index ?? 0;
    const raw = m[1];
    if (!lookupAcronym(raw)) continue;
    if (start > lastIdx) nodes.push(text.slice(lastIdx, start));
    nodes.push(<Acronym key={`${keyPrefix}-ac-${start}-${raw}`} term={raw} />);
    lastIdx = start + raw.length;
  }
  if (nodes.length === 0) return [text];
  if (lastIdx < text.length) nodes.push(text.slice(lastIdx));
  return nodes;
};

export const glossify = (text: string, keyPrefix = "g"): ReactNode[] =>
  acronymize(text, keyPrefix);

export const linkify = (text: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let lastIdx = 0;
  for (const m of text.matchAll(LINKIFY_RE)) {
    const start = m.index ?? 0;
    if (start > lastIdx) {
      const chunk = text.slice(lastIdx, start);
      nodes.push(...acronymize(chunk, `l${lastIdx}`));
    }
    const [full, email, phone, shortCode] = m;
    const key = `${start}-${full}`;
    if (email) {
      nodes.push(
        <a key={key} href={`mailto:${email}`} className={LINK_CLASS}>
          {email}
        </a>,
      );
    } else if (phone) {
      nodes.push(
        <a key={key} href={`tel:${phone.replace(/\D/g, "")}`} className={LINK_CLASS}>
          {phone}
        </a>,
      );
    } else if (shortCode) {
      nodes.push(
        <a key={key} href={`tel:${shortCode}`} className={LINK_CLASS}>
          {shortCode}
        </a>,
      );
    }
    lastIdx = start + full.length;
  }
  if (lastIdx < text.length) {
    const chunk = text.slice(lastIdx);
    nodes.push(...acronymize(chunk, `l${lastIdx}`));
  }
  return nodes;
};

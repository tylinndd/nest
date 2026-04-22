const NEST_PREFIX = "nest.";

export type NestDataSnapshot = {
  exportedAt: string;
  schema: 1;
  keys: Record<string, unknown>;
};

const parseValue = (raw: string | null): unknown => {
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
};

export const collectNestData = (
  storage: Pick<Storage, "length" | "key" | "getItem"> = typeof localStorage !==
  "undefined"
    ? localStorage
    : ({
        length: 0,
        key: () => null,
        getItem: () => null,
      } as Pick<Storage, "length" | "key" | "getItem">),
  now: Date = new Date(),
): NestDataSnapshot => {
  const keys: Record<string, unknown> = {};
  for (let i = 0; i < storage.length; i += 1) {
    const k = storage.key(i);
    if (k === null || !k.startsWith(NEST_PREFIX)) continue;
    keys[k] = parseValue(storage.getItem(k));
  }
  return {
    exportedAt: now.toISOString(),
    schema: 1,
    keys,
  };
};

export const downloadJson = (data: unknown, filename: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportUserData = (now: Date = new Date()): NestDataSnapshot => {
  const snapshot = collectNestData(localStorage, now);
  const iso = now.toISOString().slice(0, 10);
  downloadJson(snapshot, `nest-data-${iso}.json`);
  return snapshot;
};

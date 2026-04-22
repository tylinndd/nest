import { describe, it, expect } from "vitest";
import { collectNestData } from "./dataExport";

type StorageLike = Pick<Storage, "length" | "key" | "getItem">;

const makeStorage = (pairs: Array<[string, string]>): StorageLike => ({
  get length() {
    return pairs.length;
  },
  key: (i: number) => pairs[i]?.[0] ?? null,
  getItem: (k: string) => pairs.find(([key]) => key === k)?.[1] ?? null,
});

const FIXED_NOW = new Date("2026-04-21T12:00:00.000Z");

describe("collectNestData", () => {
  it("returns an empty keys object when storage is empty", () => {
    const snap = collectNestData(makeStorage([]), FIXED_NOW);
    expect(snap.keys).toEqual({});
    expect(snap.schema).toBe(1);
    expect(snap.exportedAt).toBe("2026-04-21T12:00:00.000Z");
  });

  it("only includes keys with the nest. prefix", () => {
    const storage = makeStorage([
      ["nest.profile", JSON.stringify({ name: "Sam" })],
      ["other.key", "ignored"],
      ["nest.theme", JSON.stringify({ theme: "dark" })],
    ]);
    const snap = collectNestData(storage, FIXED_NOW);
    expect(Object.keys(snap.keys).sort()).toEqual([
      "nest.profile",
      "nest.theme",
    ]);
  });

  it("parses JSON values into objects", () => {
    const storage = makeStorage([
      ["nest.profile", JSON.stringify({ name: "Sam", age: 18 })],
    ]);
    const snap = collectNestData(storage, FIXED_NOW);
    expect(snap.keys["nest.profile"]).toEqual({ name: "Sam", age: 18 });
  });

  it("falls back to the raw string when a value is not valid JSON", () => {
    const storage = makeStorage([["nest.first-task-fired", "true-ish"]]);
    const snap = collectNestData(storage, FIXED_NOW);
    expect(snap.keys["nest.first-task-fired"]).toBe("true-ish");
  });

  it("preserves the top-level shape: exportedAt, schema, keys", () => {
    const snap = collectNestData(makeStorage([]), FIXED_NOW);
    expect(Object.keys(snap).sort()).toEqual(["exportedAt", "keys", "schema"]);
  });
});

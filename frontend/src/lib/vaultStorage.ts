import { createStore, get, set, del, keys } from "idb-keyval";

const store = createStore("nest-vault", "files");

export type StoredDoc = {
  id: string;
  name: string;
  mime: string;
  size: number;
  uploadedAt: string;
  blob: Blob;
};

export const saveDocument = async (
  id: string,
  file: File,
): Promise<StoredDoc> => {
  const record: StoredDoc = {
    id,
    name: file.name,
    mime: file.type || "application/octet-stream",
    size: file.size,
    uploadedAt: new Date().toISOString(),
    blob: file,
  };
  await set(id, record, store);
  return record;
};

export const getDocument = async (id: string): Promise<StoredDoc | null> => {
  const record = await get<StoredDoc>(id, store);
  return record ?? null;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await del(id, store);
};

export const listDocumentIds = async (): Promise<string[]> => {
  const all = await keys(store);
  return all.filter((k): k is string => typeof k === "string");
};

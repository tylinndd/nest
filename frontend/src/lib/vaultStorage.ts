import { createStore, get, set, del, type UseStore } from "idb-keyval";

let cachedStore: UseStore | null = null;

const getStore = (): UseStore => {
  if (!cachedStore) cachedStore = createStore("nest-vault", "files");
  return cachedStore;
};

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
  await set(id, record, getStore());
  return record;
};

export const getDocument = async (id: string): Promise<StoredDoc | null> => {
  const record = await get<StoredDoc>(id, getStore());
  return record ?? null;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await del(id, getStore());
};

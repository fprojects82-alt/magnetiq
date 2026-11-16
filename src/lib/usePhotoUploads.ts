"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UploadError, uploadPhoto } from "./uploadClient";

export interface PhotoEntry {
  id: string;
  preview: string;
  url: string | null;
  status: "uploading" | "done" | "error";
  error?: string;
}

const CONCURRENCY = 3;
let counter = 0;

/** Upload many photos at once with a small concurrency limit, retry and removal. */
export function usePhotoUploads(maxPhotos = 60) {
  const [entries, setEntries] = useState<PhotoEntry[]>([]);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const files = useRef(new Map<string, File>());
  const queue = useRef<string[]>([]);
  const active = useRef(0);
  const removed = useRef(new Set<string>());

  const patch = useCallback((id: string, update: Partial<PhotoEntry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...update } : e)));
  }, []);

  const pump = useCallback(() => {
    while (active.current < CONCURRENCY && queue.current.length > 0) {
      const id = queue.current.shift()!;
      const file = files.current.get(id);
      if (!file || removed.current.has(id)) continue;
      active.current++;
      uploadPhoto(file)
        .then((url) => {
          if (!removed.current.has(id)) patch(id, { url, status: "done", error: undefined });
        })
        .catch((err) => {
          const message = err instanceof UploadError ? err.message : "Upload failed";
          if (!removed.current.has(id)) patch(id, { status: "error", error: message });
        })
        .finally(() => {
          active.current--;
          pump();
        });
    }
  }, [patch]);

  const addFiles = useCallback(
    (list: FileList | File[]) => {
      const incoming = Array.from(list);
      if (incoming.length === 0) return 0;
      const room = Math.max(0, maxPhotos - entriesRef.current.length);
      const accepted = incoming.slice(0, room);
      const next: PhotoEntry[] = accepted.map((file) => {
        const id = `p${Date.now()}-${counter++}`;
        files.current.set(id, file);
        queue.current.push(id);
        return { id, preview: URL.createObjectURL(file), url: null, status: "uploading" };
      });
      entriesRef.current = [...entriesRef.current, ...next];
      setEntries((prev) => [...prev, ...next]);
      pump();
      return accepted.length;
    },
    [maxPhotos, pump]
  );

  const remove = useCallback((id: string) => {
    removed.current.add(id);
    files.current.delete(id);
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter((e) => e.id !== id);
    });
  }, []);

  const retry = useCallback(
    (id: string) => {
      if (!files.current.has(id)) return;
      patch(id, { status: "uploading", error: undefined });
      queue.current.push(id);
      pump();
    },
    [patch, pump]
  );

  const clear = useCallback(() => {
    setEntries((prev) => {
      prev.forEach((e) => {
        removed.current.add(e.id);
        URL.revokeObjectURL(e.preview);
      });
      return [];
    });
    files.current.clear();
    queue.current = [];
  }, []);

  // Free object URLs when the page unmounts.
  useEffect(() => () => entriesRef.current.forEach((e) => URL.revokeObjectURL(e.preview)), []);

  const uploadedUrls = useMemo(
    () => entries.filter((e) => e.status === "done" && e.url).map((e) => e.url as string),
    [entries]
  );
  const uploadingCount = entries.filter((e) => e.status === "uploading").length;
  const errorCount = entries.filter((e) => e.status === "error").length;

  return { entries, addFiles, remove, retry, clear, uploadedUrls, uploadingCount, errorCount };
}

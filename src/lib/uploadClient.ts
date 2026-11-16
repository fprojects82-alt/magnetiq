"use client";

const MAX_EDGE = 2400; // plenty for a 7 x 10 cm print at 300+ dpi
const PASSTHROUGH_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PASSTHROUGH_MAX_BYTES = 1.5 * 1024 * 1024;
const MAX_INPUT_BYTES = 30 * 1024 * 1024;

import { getDict } from "./i18n";

export class UploadError extends Error {}

/** Upload messages follow the page language (set on <html lang>). */
function msg() {
  const lang = typeof document !== "undefined" && document.documentElement.lang === "ar" ? "ar" : "en";
  return getDict(lang).upload;
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      // fall through to <img>, which can decode some formats createImageBitmap can't (e.g. HEIC on Safari)
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Phone photos are often 5–15 MB, or HEIC from iPhones, which the server
 * rejects. Re-encode anything large or unusual to a JPEG of at most 2400px so
 * uploads are quick on mobile data and always in a format we accept.
 */
export async function prepareImage(file: File): Promise<Blob> {
  if (file.size > MAX_INPUT_BYTES) {
    throw new UploadError(msg().tooLarge);
  }
  const looksLikeImage = file.type.startsWith("image/") || /\.(heic|heif|jpe?g|png|webp)$/i.test(file.name);
  if (!looksLikeImage) {
    throw new UploadError(msg().notPhoto);
  }
  if (PASSTHROUGH_TYPES.includes(file.type) && file.size <= PASSTHROUGH_MAX_BYTES) {
    return file;
  }

  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await decode(file);
  } catch {
    if (PASSTHROUGH_TYPES.includes(file.type) && file.size <= 10 * 1024 * 1024) return file;
    throw new UploadError(msg().cantOpen);
  }

  const w = "naturalWidth" in source ? source.naturalWidth : source.width;
  const h = "naturalHeight" in source ? source.naturalHeight : source.height;
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if ("close" in source) source.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new UploadError(msg().cantProcess);
  return blob;
}

export async function uploadPhoto(file: File): Promise<string> {
  const blob = await prepareImage(file);
  const formData = new FormData();
  const name = blob === file ? file.name : file.name.replace(/\.[^.]+$/, "") + ".jpg";
  formData.append("file", blob, name);

  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body: formData });
  } catch {
    throw new UploadError(msg().offline);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || typeof data.url !== "string") {
    throw new UploadError(document.documentElement.lang === "ar" ? msg().failed : data.error || msg().failed);
  }
  return data.url;
}

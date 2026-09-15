import { put, del } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { ALLOWED_IMAGE_TYPES, ALLOWED_RESUME_TYPES } from "@/lib/constants";

export async function saveUpload(
  file: File,
  folder: string,
  allowed: string[],
  maxBytes: number,
) {
  if (!allowed.includes(file.type)) {
    throw new Error("This file type is not allowed.");
  }
  if (file.size > maxBytes) {
    throw new Error("This file is too large.");
  }

  const ext = path.extname(file.name).toLowerCase() || "";
  const safeName = `${folder}/${randomUUID()}${ext}`;

  const blob = await put(safeName, file, {
    access: "public",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return {
    fileName: file.name.replace(/[^\w.\- ]+/g, "_"),
    relativePath: blob.url, // cloud URL
    fullPath: blob.url,
  };
}

export async function removeUpload(urlOrPath: string) {
  try {
    // Only delete if it's a blob URL
    if (urlOrPath.includes("blob.vercel-storage.com")) {
      await del(urlOrPath, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    }
  } catch {
    // ignore missing files
  }
}

export function resolveUpload(relativePath: string) {
  // For cloud URLs, just return the URL
  return relativePath;
}

export const resumeUploadOptions = {
  allowed: ALLOWED_RESUME_TYPES,
  maxBytes: Number(process.env.MAX_RESUME_MB || 5) * 1024 * 1024,
};

export const logoUploadOptions = {
  allowed: ALLOWED_IMAGE_TYPES,
  maxBytes: 2 * 1024 * 1024,
};

export const certUploadOptions = {
  allowed: [
    "image/png",
    "image/jpeg",
    "image/webp",
    "application/pdf",
  ],
  maxBytes: 5 * 1024 * 1024,
};
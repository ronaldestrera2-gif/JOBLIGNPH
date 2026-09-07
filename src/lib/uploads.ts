import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { ALLOWED_IMAGE_TYPES, ALLOWED_RESUME_TYPES } from "@/lib/constants";

const uploadRoot = path.resolve(process.cwd(), "public", "uploads");

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
  const dir = path.join(uploadRoot, folder);
  await mkdir(dir, { recursive: true });
  const storedName = `${randomUUID()}${ext}`;
  const fullPath = path.join(dir, storedName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);
  return {
    fileName: file.name.replace(/[^\w.\- ]+/g, "_"),
    relativePath: path.join(folder, storedName).replaceAll("\\", "/"),
    fullPath,
  };
}

export function resolveUpload(relativePath: string) {
  const full = path.resolve(uploadRoot, relativePath);
  if (!full.startsWith(uploadRoot)) {
    throw new Error("Invalid file path.");
  }
  return full;
}

export async function removeUpload(relativePath: string) {
  try {
    await unlink(resolveUpload(relativePath));
  } catch {
    // ignore missing files
  }
}

export const resumeUploadOptions = {
  allowed: ALLOWED_RESUME_TYPES,
  maxBytes: Number(process.env.MAX_RESUME_MB || 5) * 1024 * 1024,
};

export const logoUploadOptions = {
  allowed: ALLOWED_IMAGE_TYPES,
  maxBytes: 2 * 1024 * 1024,
};

import * as fs from "node:fs";
import * as path from "node:path";
import { ai } from "../gemini-client.js";
import type { Part } from "@google/genai";
import { createPartFromUri } from "@google/genai";

const INLINE_SIZE_LIMIT = 20 * 1024 * 1024; // 20 MB
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

export interface FileResult {
  part: Part;
  fileSize: number;
  uploadMethod: "inline" | "file_api";
}

export async function prepareFilePart(
  filePath: string,
  mimeType: string
): Promise<FileResult> {
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;

  if (fileSize <= INLINE_SIZE_LIMIT) {
    const data = fs.readFileSync(filePath).toString("base64");
    return {
      part: { inlineData: { mimeType, data } },
      fileSize,
      uploadMethod: "inline",
    };
  }

  // Large file — use File API
  const uploaded = await ai.files.upload({
    file: filePath,
    config: { mimeType },
  });

  if (!uploaded.name) {
    throw new Error("File upload returned no file name");
  }

  // Poll until ACTIVE
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const file = await ai.files.get({ name: uploaded.name });
    if (file.state === "ACTIVE") {
      if (!file.uri || !file.mimeType) {
        throw new Error("Uploaded file missing uri or mimeType");
      }
      return {
        part: createPartFromUri(file.uri, file.mimeType),
        fileSize,
        uploadMethod: "file_api",
      };
    }
    if (file.state === "FAILED") {
      throw new Error("File upload processing failed on Gemini side");
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(
    `File did not become ACTIVE within ${POLL_TIMEOUT_MS / 1000}s`
  );
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function getExtension(filePath: string): string {
  return path.extname(filePath).toLowerCase();
}

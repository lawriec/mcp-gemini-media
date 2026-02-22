import * as fs from "node:fs";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { ai, MODEL } from "../gemini-client.js";
import {
  prepareFilePart,
  formatFileSize,
  getExtension,
} from "../utils/file-helpers.js";
import {
  resolveVideoMimeType,
  SUPPORTED_VIDEO_EXTENSIONS,
} from "../utils/mime-types.js";

export async function handleAskVideo(args: {
  file_path: string;
  question: string;
}): Promise<CallToolResult> {
  const { file_path, question } = args;

  if (!fs.existsSync(file_path)) {
    return {
      content: [{ type: "text", text: `File not found: ${file_path}` }],
      isError: true,
    };
  }

  const ext = getExtension(file_path);
  const mimeType = resolveVideoMimeType(ext);

  if (!mimeType) {
    return {
      content: [
        {
          type: "text",
          text: `Unsupported video format "${ext}". Supported: ${SUPPORTED_VIDEO_EXTENSIONS.join(", ")}`,
        },
      ],
      isError: true,
    };
  }

  try {
    const { part, fileSize, uploadMethod } = await prepareFilePart(
      file_path,
      mimeType
    );

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [part, { text: question }],
        },
      ],
    });

    const finishReason = response.candidates?.[0]?.finishReason;
    if (
      finishReason === "SAFETY" ||
      finishReason === "BLOCKLIST" ||
      finishReason === "IMAGE_SAFETY"
    ) {
      return {
        content: [
          {
            type: "text",
            text: "Response was blocked by Gemini safety filters. Try rephrasing your question.",
          },
        ],
        isError: true,
      };
    }

    const answer = response.text ?? "(no response text)";
    const usage = response.usageMetadata;

    const meta = [
      "",
      "---",
      `Model: ${MODEL}`,
      `File: ${formatFileSize(fileSize)} (${uploadMethod})`,
      `Tokens: ${usage?.promptTokenCount ?? "?"} prompt + ${usage?.candidatesTokenCount ?? "?"} response = ${usage?.totalTokenCount ?? "?"} total`,
    ].join("\n");

    return {
      content: [{ type: "text", text: answer + meta }],
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: "text", text: `Gemini API error: ${msg}` }],
      isError: true,
    };
  }
}

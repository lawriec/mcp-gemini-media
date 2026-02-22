#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { handleAskVideo, handleAskAudio } from "./tools/index.js";

const server = new Server(
  { name: "gemini-media", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "ask_question_about_video",
      description:
        "Send a video file to Google Gemini and ask a question about it. " +
        "Supports: mp4, mov, avi, mpeg, flv, webm, wmv, 3gpp.",
      inputSchema: {
        type: "object" as const,
        properties: {
          file_path: {
            type: "string",
            description: "Absolute path to the video file",
          },
          question: {
            type: "string",
            description: "Question to ask about the video",
          },
        },
        required: ["file_path", "question"],
      },
    },
    {
      name: "ask_question_about_audio",
      description:
        "Send an audio file to Google Gemini and ask a question about it. " +
        "Supports: wav, mp3, aiff, aac, ogg, flac.",
      inputSchema: {
        type: "object" as const,
        properties: {
          file_path: {
            type: "string",
            description: "Absolute path to the audio file",
          },
          question: {
            type: "string",
            description: "Question to ask about the audio",
          },
        },
        required: ["file_path", "question"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "ask_question_about_video":
      return handleAskVideo(args as { file_path: string; question: string });
    case "ask_question_about_audio":
      return handleAskAudio(args as { file_path: string; question: string });
    default:
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("gemini-media MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

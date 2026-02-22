import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    "Fatal: GEMINI_API_KEY environment variable is not set.\n" +
      "Set it in your Claude Desktop config under env.GEMINI_API_KEY"
  );
  process.exit(1);
}

export const ai = new GoogleGenAI({ apiKey });
export const MODEL = "gemini-2.5-flash";

# mcp-gemini-media

An MCP server that gives Claude Desktop the ability to analyze audio and video files by routing them through Google Gemini.

Claude Desktop cannot natively process media files. This server bridges that gap — point it at a local audio or video file, ask a question, and get Gemini's analysis back inside Claude.

## Features

- **Two tools**: `ask_question_about_video` and `ask_question_about_audio`
- **Smart upload**: Files under 20 MB are sent inline as base64; larger files use Gemini's File API with automatic upload polling
- **Token usage reporting**: Every response includes prompt/response token counts, model name, file size, and upload method
- **Broad format support**: See [Supported Formats](#supported-formats) below

## Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/apikey)

## Installation

### Option 1: Direct install (no clone needed)

No need to clone the repo. Just point your MCP config at the GitHub URL and `npx` handles the rest.

### Option 2: Clone and build locally

```bash
git clone https://github.com/lawriec/mcp-gemini-media.git
cd mcp-gemini-media
npm install
npm run build
```

## Configuration

Add this to your Claude Desktop config file:

**Windows (Store)**: `%LOCALAPPDATA%\Packages\Claude_*\LocalCache\Roaming\Claude\claude_desktop_config.json`
**Windows (standalone)**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Using npx (recommended)

```json
{
  "mcpServers": {
    "gemini-media": {
      "command": "npx",
      "args": ["-y", "github:lawriec/mcp-gemini-media"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

### Using a local clone

```json
{
  "mcpServers": {
    "gemini-media": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-gemini-media/build/index.js"],
      "env": {
        "GEMINI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

Then restart Claude Desktop. The two tools should appear in the tools menu.

## Tools

### `ask_question_about_video`

Send a video file to Gemini and ask a question about it.

| Parameter | Type | Description |
|-----------|------|-------------|
| `file_path` | string | Absolute path to the video file |
| `question` | string | Question to ask about the video |

**Example questions:**
- "What is happening in this video?"
- "Transcribe any speech in this video"
- "Describe the visual style and cinematography"
- "Are there any text overlays or logos visible?"

### `ask_question_about_audio`

Send an audio file to Gemini and ask a question about it.

| Parameter | Type | Description |
|-----------|------|-------------|
| `file_path` | string | Absolute path to the audio file |
| `question` | string | Question to ask about the audio |

**Example questions:**
- "Transcribe this audio"
- "What instruments are playing?"
- "What language is being spoken?"
- "Describe the mood and genre of this music"

## Supported Formats

### Video
| Extension | MIME Type |
|-----------|-----------|
| `.mp4` | video/mp4 |
| `.mov` | video/quicktime |
| `.avi` | video/x-msvideo |
| `.mpeg`, `.mpg` | video/mpeg |
| `.flv` | video/x-flv |
| `.webm` | video/webm |
| `.wmv` | video/x-ms-wmv |
| `.3gpp`, `.3gp` | video/3gpp |

### Audio
| Extension | MIME Type |
|-----------|-----------|
| `.wav` | audio/wav |
| `.mp3` | audio/mpeg |
| `.aiff`, `.aif` | audio/aiff |
| `.aac` | audio/aac |
| `.ogg` | audio/ogg |
| `.flac` | audio/flac |

## How It Works

1. Claude Desktop sends a tool call with a file path and question
2. The server reads the file and checks its extension against the supported MIME type map
3. **Small files** (<=20 MB): Base64-encoded and sent inline to Gemini
4. **Large files** (>20 MB): Uploaded via Gemini's File API, then polled every 2 seconds until processing completes (up to 5 minutes)
5. The question and file are sent to `gemini-2.5-flash`
6. The response is returned to Claude along with usage metadata

## Troubleshooting

**"Fatal: GEMINI_API_KEY environment variable is not set"**
Make sure your Claude Desktop config includes the `env` block with your API key.

**"File not found"**
The path must be an absolute path on your local filesystem. Relative paths won't work.

**"Unsupported video/audio format"**
Check the [Supported Formats](#supported-formats) tables. The server checks the file extension, not the file contents.

**"Response was blocked by Gemini safety filters"**
Gemini's content filters flagged the response. Try rephrasing your question.

**Tool doesn't appear in Claude Desktop**
Restart Claude Desktop after editing the config. Check the MCP server logs — in Claude Desktop, go to Settings > Developer > gemini-media to see server output.

## License

MIT

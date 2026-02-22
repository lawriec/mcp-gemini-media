const VIDEO_MIME_TYPES: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".mpeg": "video/mpeg",
  ".mpg": "video/mpeg",
  ".flv": "video/x-flv",
  ".webm": "video/webm",
  ".wmv": "video/x-ms-wmv",
  ".3gpp": "video/3gpp",
  ".3gp": "video/3gpp",
};

const AUDIO_MIME_TYPES: Record<string, string> = {
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".aiff": "audio/aiff",
  ".aif": "audio/aiff",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".flac": "audio/flac",
};

export function resolveVideoMimeType(ext: string): string | undefined {
  return VIDEO_MIME_TYPES[ext.toLowerCase()];
}

export function resolveAudioMimeType(ext: string): string | undefined {
  return AUDIO_MIME_TYPES[ext.toLowerCase()];
}

export const SUPPORTED_VIDEO_EXTENSIONS = Object.keys(VIDEO_MIME_TYPES);
export const SUPPORTED_AUDIO_EXTENSIONS = Object.keys(AUDIO_MIME_TYPES);

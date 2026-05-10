import type { ToolEntry, ToolSeed } from "../types";

export type ToolPreviewKind = "image" | "pdf" | "audio" | "video" | "text" | "none";

export type ToolControlKind = "textarea" | "input" | "select";

export type ToolControlOption = {
  label: string;
  value: string;
};

export type ToolControlConfig = {
  key: string;
  label: string;
  kind: ToolControlKind;
  placeholder?: string;
  type?: "text" | "number" | "date" | "password" | "url";
  rows?: number;
  helperText?: string;
  options?: ToolControlOption[];
  required?: boolean;
};

export type ToolUiConfig = {
  preview: ToolPreviewKind;
  requiresFile: boolean;
  requiresText: boolean;
  multipleFiles: boolean;
  accepts: string | undefined;
  controls: ToolControlConfig[];
  submitLabel: string;
  hint: string;
};

function baseTextConfig(tool: ToolSeed | ToolEntry): ToolUiConfig {
  return {
    preview: "text",
    requiresFile: false,
    requiresText: true,
    multipleFiles: false,
    accepts: undefined,
    controls: [
      {
        key: "input",
        label: "Primary input",
        kind: "textarea",
        placeholder: `Paste ${tool.title.toLowerCase()} input here`,
        rows: 8,
        required: true,
      },
      {
        key: "secondary",
        label: "Secondary input",
        kind: "textarea",
        placeholder: "Optional second value, comparison text, or notes",
        rows: 6,
      },
    ],
    submitLabel: `Run ${tool.title}`,
    hint: "Paste text or values, then run the processor.",
  };
}

function baseFileConfig(tool: ToolSeed | ToolEntry, preview: ToolPreviewKind = "image"): ToolUiConfig {
  return {
    preview,
    requiresFile: true,
    requiresText: false,
    multipleFiles: false,
    accepts: undefined,
    controls: [],
    submitLabel: `Run ${tool.title}`,
    hint: "Upload a file, adjust any options, then process the result.",
  };
}

function makeSelect(key: string, label: string, options: string[], helperText?: string): ToolControlConfig {
  return {
    key,
    label,
    kind: "select",
    options: options.map((value) => ({ label: value, value })),
    helperText,
  };
}

function makeInput(
  key: string,
  label: string,
  type: ToolControlConfig["type"] = "text",
  placeholder?: string,
  helperText?: string,
): ToolControlConfig {
  return { key, label, kind: "input", type, placeholder, helperText };
}

function makeTextarea(
  key: string,
  label: string,
  placeholder?: string,
  helperText?: string,
  rows = 6,
): ToolControlConfig {
  return { key, label, kind: "textarea", placeholder, helperText, rows };
}

export function getToolUiConfig(tool: ToolSeed | ToolEntry): ToolUiConfig {
  const key = tool.processorKey;

  if (tool.category === "image") {
    const config = baseFileConfig(tool, "image");
    config.controls = [
      ...((key === "memeGenerator" || key === "thumbnailMaker" || key === "stickerMaker")
        ? [makeTextarea("input", "Headline / caption", "Type any caption or overlay text", "Optional for design tools.", 4)]
        : []),
      ...(key === "imageResize"
        ? [makeInput("width", "Width", "number", "1200"), makeInput("height", "Height", "number", "Auto")]
        : []),
      ...(key === "imageCompress" ? [makeInput("quality", "Quality", "number", "0.7", "Use a value between 0 and 1.")] : []),
      ...(key === "imageConvert" ? [makeSelect("format", "Format", ["image/png", "image/jpeg", "image/webp", "image/avif"])] : []),
      ...(key === "imageRotate" ? [makeSelect("degrees", "Rotation", ["90", "180", "270"])] : []),
      ...(key === "imageCrop"
        ? [makeInput("x", "X", "number", "0"), makeInput("y", "Y", "number", "0"), makeInput("width", "Crop width", "number", "500"), makeInput("height", "Crop height", "number", "500")]
        : []),
      ...(key === "imageBlur" ? [makeInput("amount", "Blur amount", "number", "5")] : []),
      ...(key === "imageSharpen" ? [makeInput("amount", "Sharpen amount", "number", "3")] : []),
      ...(key === "imageUpscale" ? [makeSelect("scale", "Upscale factor", ["2", "3", "4"])] : []),
      ...(key === "aspectRatio" ? [makeSelect("ratio", "Aspect ratio", ["1:1", "4:5", "9:16", "16:9", "3:2", "21:9"])] : []),
      ...(key === "passportPhoto" ? [makeSelect("size", "Passport size", ["2x2", "35x45 mm", "50x50 mm"])] : []),
      ...(key === "profileResize" ? [makeSelect("size", "Profile size", ["1080x1080", "1024x1024", "512x512"])] : []),
      ...(key === "colorPicker" ? [makeInput("x", "Sample X", "number", "0"), makeInput("y", "Sample Y", "number", "0")] : []),
      ...(key === "screenshotToText" ? [makeSelect("mode", "OCR mode", ["fast", "balanced", "accurate"])] : []),
      ...(key === "faceBlur" || key === "objectRemoval" || key === "photoEditor"
        ? [makeSelect("strength", "Edit strength", ["light", "medium", "strong"])]
        : []),
      ...(key === "transparentPng" ? [makeSelect("background", "Background handling", ["auto", "white", "transparent"])] : []),
      ...(key === "imageToPdf" ? [makeSelect("fit", "Page fit", ["contain", "cover", "actual-size"])] : []),
      ...(key === "pdfToImage" ? [makeSelect("format", "Output format", ["image/png", "image/jpeg"])] : []),
    ];
    config.accepts = "image/*,application/pdf";
    config.multipleFiles = key === "thumbnailMaker" || key === "memeGenerator";
    config.requiresText = key === "memeGenerator" || key === "thumbnailMaker" || key === "stickerMaker";
    config.submitLabel = `Process ${tool.title}`;
    config.hint = "Upload an image and tune the controls for the selected transform.";
    return config;
  }

  if (tool.category === "pdf") {
    const config = baseFileConfig(tool, "pdf");
    config.accepts = ".pdf,application/pdf,image/*";
    config.multipleFiles = key === "pdfMerge" || key === "splitFiles" || key === "combineFiles";
    config.controls = [
      ...(key === "pdfRotate" ? [makeSelect("degrees", "Rotation", ["90", "180", "270"])] : []),
      ...(key === "pdfRemovePages" ? [makeInput("pages", "Pages to remove", "text", "1,3,5")] : []),
      ...(key === "pdfReorder" ? [makeInput("order", "New order", "text", "2,1,3")] : []),
      ...(key === "pdfWatermark" ? [makeTextarea("watermark", "Watermark text", "Enter a watermark label") ] : []),
      ...(key === "pdfSigner" ? [makeInput("signerName", "Signer name", "text", "Your name")] : []),
      ...(key === "pdfAnnotator" ? [makeTextarea("note", "Annotation note", "Add a note to stamp on the document")] : []),
      ...(key === "pdfCompress" ? [makeSelect("quality", "Quality", ["high", "balanced", "small"])] : []),
      ...(key === "pdfProtect" ? [makeInput("password", "Password", "password", "Set a password")] : []),
      ...(key === "pdfUnlock" ? [makeInput("password", "Password", "password", "Enter the current password")] : []),
      ...(key === "pdfToDoc" ? [makeSelect("format", "Export format", ["docx", "txt"])] : []),
      ...(key === "pdfToImage" || key === "pdfToJpg" || key === "pdfToPng" ? [makeSelect("format", "Image format", ["image/png", "image/jpeg"])] : []),
      ...(key === "docToPdf" || key === "sheetToPdf" ? [makeSelect("fit", "Page fit", ["fit-to-page", "center", "print-layout"])] : []),
      ...(key === "imageToPdf" ? [makeSelect("fit", "Page fit", ["contain", "cover", "actual-size"])] : []),
    ];
    config.requiresText = key === "pdfWatermark" || key === "pdfAnnotator" || key === "pdfSigner" || key === "pdfProtect" || key === "pdfUnlock";
    config.submitLabel = `Process ${tool.title}`;
    config.hint = "PDF utilities stay local to the browser where possible.";
    return config;
  }

  if (tool.category === "video-audio") {
    const config = baseFileConfig(tool, "video");
    config.accepts = "video/*,audio/*";
    config.controls = [
      ...(key === "videoTrim" ? [makeInput("start", "Start time", "text", "00:00:00"), makeInput("end", "End time", "text", "00:00:10")] : []),
      ...(key === "playbackSpeed" ? [makeInput("speed", "Speed", "number", "1.0")] : []),
      ...(key === "videoCompress" ? [makeInput("bitrate", "Bitrate kbps", "number", "192")] : []),
      ...(key === "videoConvert" ? [makeSelect("format", "Output format", ["video/mp4", "video/webm", "video/quicktime"])] : []),
      ...(key === "audioConvert" ? [makeSelect("format", "Output format", ["audio/mpeg", "audio/wav", "audio/ogg"])] : []),
      ...(key === "audioCompress" ? [makeInput("bitrate", "Bitrate kbps", "number", "128")] : []),
      ...(key === "audioCut" ? [makeInput("start", "Start time", "text", "00:00:00"), makeInput("end", "End time", "text", "00:00:10")] : []),
      ...(key === "audioMerge" || key === "videoMerge" ? [makeInput("separator", "Merge label", "text", "Combined output")] : []),
      ...(key === "frameGrabber" ? [makeInput("time", "Frame time", "text", "00:00:03")] : []),
      ...(key === "subtitleAdder" ? [makeTextarea("subtitles", "Subtitle text", "Paste subtitle lines") ] : []),
      ...(key === "subtitleExtractor" ? [makeSelect("mode", "Extraction mode", ["auto", "timestamps", "plain-text"])] : []),
      ...(key === "muteVideo" || key === "reverseVideo" || key === "videoToGif" || key === "videoToMp3" ? [] : []),
      ...(key === "videoToGif" ? [makeSelect("fps", "Frames per second", ["12", "15", "24"])] : []),
      ...(key === "audioNormalize" ? [makeSelect("target", "Target level", ["-16 LUFS", "-14 LUFS", "-12 LUFS"])] : []),
    ];
    config.requiresText = false;
    config.submitLabel = `Process ${tool.title}`;
    config.hint = "Media tools run in the browser with progressive enhancement.";
    return config;
  }

  if (tool.category === "unit-money") {
    const config = {
      ...baseTextConfig(tool),
      preview: "text" as const,
      requiresText: false,
      requiresFile: false,
      controls: [
        makeInput("value", "Value", "number", "1"),
        makeInput("secondary", "Secondary value", "number", "1"),
        makeSelect("unit", "Unit", ["USD", "EUR", "GBP", "INR", "km", "mi", "kg", "lb", "celsius", "fahrenheit", "percent"]),
      ],
      submitLabel: `Calculate ${tool.title}`,
      hint: "Enter a numeric value and choose the unit or mode.",
    };
    return config;
  }

  if (tool.category === "social") {
    const config = baseTextConfig(tool);
    config.controls = [
      makeTextarea("input", "Seed input", "Describe the post or campaign", "Used to generate social copy.", 8),
      makeSelect("platform", "Platform", ["Instagram", "X / Twitter", "LinkedIn", "TikTok", "YouTube"]),
      makeSelect("tone", "Tone", ["professional", "friendly", "playful", "bold", "minimal"]),
    ];
    config.requiresText = true;
    config.submitLabel = `Generate ${tool.title}`;
    config.hint = "Generate creator-ready text, sizes, or captions quickly.";
    return config;
  }

  if (tool.category === "dev") {
    const config = baseTextConfig(tool);
    config.controls = [
      ...(key === "uuidGenerator" ? [makeInput("count", "Count", "number", "1")] : []),
      ...(key === "hashGenerator" ? [makeSelect("algorithm", "Algorithm", ["SHA-256", "SHA-1", "MD5"])] : []),
      ...(key === "timestampConverter" ? [makeInput("timestamp", "Timestamp", "text", "2026-01-01T00:00:00Z")] : []),
      ...(key === "cronGenerator" ? [makeInput("cron", "Cron expression", "text", "0 */6 * * *")] : []),
      ...(key === "regexTester" ? [makeInput("pattern", "Pattern", "text", "[a-z]+"), makeInput("flags", "Flags", "text", "gi")] : []),
      ...(key === "apiRequestBuilder" ? [makeInput("url", "Endpoint URL", "url", "https://api.example.com"), makeSelect("method", "Method", ["GET", "POST", "PUT", "PATCH", "DELETE"])] : []),
      ...(key === "colorConverter" ? [makeInput("color", "Color", "text", "#7c3aed")] : []),
      ...(key === "markdownPreview" ? [makeTextarea("input", "Markdown", "Write markdown here", undefined, 10)] : []),
      ...(key === "sqlFormat" ? [makeTextarea("input", "SQL", "Paste SQL here", undefined, 10)] : []),
      ...(key === "jsonFormat" || key === "jsonMinify" || key === "yamlFormat" || key === "xmlFormat" || key === "htmlMinify" || key === "cssMinify" || key === "jsMinify"
        ? [makeTextarea("input", `${tool.title} input`, `Paste ${tool.title.toLowerCase()} source`, undefined, 10)]
        : []),
    ];
    config.requiresText = key !== "uuidGenerator";
    config.submitLabel = key === "uuidGenerator" ? `Generate ${tool.title}` : `Run ${tool.title}`;
    config.hint = "Developer utilities format, transform, inspect, or generate text.";
    return config;
  }

  if (tool.category === "file") {
    const config = baseFileConfig(tool, "text");
    config.accepts = "*";
    config.multipleFiles = key === "splitFiles" || key === "combineFiles" || key === "archiveHelper" || key === "duplicateFinder";
    config.controls = [
      ...(key === "fileRenamer" ? [makeInput("name", "New filename", "text", "renamed-file") ] : []),
      ...(key === "filenameSlugifier" ? [makeInput("fileName", "Filename", "text", "My File.pdf")] : []),
      ...(key === "folderOrganizer" ? [makeInput("pattern", "Organizer pattern", "text", "type/date/project")] : []),
      ...(key === "checksumTool" ? [makeSelect("algorithm", "Algorithm", ["SHA-256", "SHA-1", "MD5"])] : []),
      ...(key === "archiveHelper" ? [makeSelect("archiveType", "Archive type", ["zip", "tar"])] : []),
      ...(key === "duplicateFinder" ? [makeSelect("mode", "Match mode", ["name", "content", "size"])] : []),
      ...(key === "documentPageCounter" ? [makeSelect("mode", "Count mode", ["all pages", "selected file", "merged batch"])] : []),
      ...(key === "fileConverter" ? [makeSelect("format", "Convert to", ["pdf", "docx", "txt", "csv", "json"])] : []),
      ...(key === "splitFiles" ? [makeInput("separator", "Split rule", "text", "by pages / by size / by lines")] : []),
      ...(key === "combineFiles" ? [makeInput("name", "Combined name", "text", "combined-output") ] : []),
    ];
    config.requiresText = key === "filenameSlugifier" || key === "fileRenamer" || key === "folderOrganizer";
    config.submitLabel = `Process ${tool.title}`;
    config.hint = "File utilities organize, inspect, rename, or repackage uploaded files.";
    return config;
  }

  return baseTextConfig(tool);
}

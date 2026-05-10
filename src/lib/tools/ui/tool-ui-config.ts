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

function makeSelect(key: string, label: string, options: string[], helperText?: string): ToolControlConfig {
  return {
    key,
    label,
    kind: "select",
    options: options.map((value) => ({ label: value, value })),
    helperText,
  };
}

function makeInput(key: string, label: string, type: ToolControlConfig["type"] = "text", placeholder?: string, helperText?: string): ToolControlConfig {
  return { key, label, kind: "input", type, placeholder, helperText };
}

function makeTextarea(key: string, label: string, placeholder?: string, helperText?: string, rows = 6): ToolControlConfig {
  return { key, label, kind: "textarea", placeholder, helperText, rows };
}

function baseTextConfig(tool: ToolSeed | ToolEntry): ToolUiConfig {
  return {
    preview: "text",
    requiresFile: false,
    requiresText: true,
    multipleFiles: false,
    accepts: undefined,
    controls: [
      makeTextarea("input", "Input", `Paste ${tool.title.toLowerCase()} input here`, "Primary input for this tool.", 8),
      makeTextarea("secondary", "Optional secondary input", "Use this for comparison text, notes, or the second value.", "Optional.", 5),
    ],
    submitLabel: `Run ${tool.title}`,
    hint: "Paste text, add optional details, and run the tool.",
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
    hint: "Upload a file, choose any options, and run the tool.",
  };
}

function baseNumberConfig(tool: ToolSeed | ToolEntry): ToolUiConfig {
  return {
    preview: "text",
    requiresFile: false,
    requiresText: false,
    multipleFiles: false,
    accepts: undefined,
    controls: [],
    submitLabel: `Run ${tool.title}`,
    hint: "Fill the values and run the calculator.",
  };
}

function imageConfig(tool: ToolSeed | ToolEntry): ToolUiConfig {
  const key = tool.processorKey;
  const config = baseFileConfig(tool, "image");
  config.controls = [
    ...(key === "imageResize" ? [makeInput("width", "Width", "number", "1200"), makeInput("height", "Height", "number", "Auto")] : []),
    ...(key === "imageCompress" ? [makeSelect("format", "Format", ["image/jpeg", "image/webp", "image/png"]), makeInput("quality", "Quality", "number", "0.72", "Use a value between 0 and 1.")] : []),
    ...(key === "imageConvert" ? [makeSelect("format", "Format", ["image/png", "image/jpeg", "image/webp", "image/avif"])] : []),
    ...(key === "imageRotate" ? [makeSelect("degrees", "Rotation", ["90", "180", "270"])] : []),
    ...(key === "imageCrop" ? [makeInput("x", "X", "number", "0"), makeInput("y", "Y", "number", "0"), makeInput("width", "Crop width", "number", "500"), makeInput("height", "Crop height", "number", "500")] : []),
    ...(key === "imageBlur" ? [makeInput("amount", "Blur amount", "number", "6")] : []),
    ...(key === "imageSharpen" ? [makeInput("amount", "Sharpen amount", "number", "3")] : []),
    ...(key === "imageUpscale" ? [makeSelect("scale", "Scale", ["2", "3", "4"])] : []),
    ...(key === "colorPicker" ? [makeInput("x", "Sample X", "number", "0"), makeInput("y", "Sample Y", "number", "0")] : []),
    ...(key === "memeGenerator" ? [makeTextarea("input", "Top caption", "Enter the meme headline", "Optional.", 3), makeTextarea("secondary", "Bottom caption", "Enter the bottom line", "Optional.", 3)] : []),
    ...(key === "thumbnailMaker" ? [makeTextarea("input", "Headline", "Enter the title", "Shown on the thumbnail.", 3), makeTextarea("secondary", "Subhead", "Enter a smaller supporting line", "Optional.", 3)] : []),
    ...(key === "stickerMaker" ? [makeTextarea("input", "Sticker text", "Enter a short label", "Optional.", 3)] : []),
    ...(key === "avatarMaker" ? [makeTextarea("input", "Name / label", "Optional caption", "Optional.", 3)] : []),
    ...(key === "passportPhoto" ? [makeSelect("size", "Size", ["2x2", "35x45 mm", "50x50 mm"])] : []),
    ...(key === "aspectRatio" ? [makeSelect("ratio", "Aspect ratio", ["1:1", "4:5", "9:16", "16:9", "3:2", "21:9"])] : []),
    ...(key === "imageEditor" ? [makeSelect("mode", "Style", ["natural", "bright", "dramatic", "soft"]), makeInput("amount", "Strength", "number", "20")] : []),
    ...(key === "transparentPng" || key === "imageBgRemover" ? [makeInput("sensitivity", "Sensitivity", "number", "55", "Higher values remove more of the background.")] : []),
    ...(key === "imageMetadata" ? [] : []),
    ...(key === "imageToPdf" ? [] : []),
  ];

  if (key === "imageToPdf") {
    config.multipleFiles = true;
    config.accepts = "image/*";
    config.hint = "Upload one or more images and export them as a PDF.";
  } else {
    config.accepts = "image/*";
  }

  if (key === "imageMetadata") {
    config.hint = "Inspect the file details and dimensions.";
  }
  return config;
}

function pdfConfig(tool: ToolSeed | ToolEntry): ToolUiConfig {
  const key = tool.processorKey;
  const config = baseFileConfig(tool, "pdf");
  config.accepts = "application/pdf";
  config.controls = [
    ...(key === "pdfMerge" ? [] : []),
    ...(key === "pdfCompress" ? [makeSelect("quality", "Compression", ["fast", "balanced", "strong"])] : []),
    ...(key === "pdfRotate" ? [makeSelect("degrees", "Rotation", ["90", "180", "270"])] : []),
    ...(key === "pdfReorder" ? [makeInput("order", "Page order", "text", "1,3,2", "Comma-separated page numbers.")] : []),
    ...(key === "pdfRemovePages" ? [makeInput("pagesToRemove", "Pages to remove", "text", "2,4,6", "Comma-separated page numbers.")] : []),
    ...(key === "pdfPageNumbers" ? [makeSelect("position", "Position", ["bottom-right", "bottom-left", "top-right", "top-left"])] : []),
    ...(key === "pdfWatermark" ? [makeTextarea("input", "Watermark text", "Enter watermark text", "Optional.", 3), makeInput("opacity", "Opacity", "number", "0.2")] : []),
    ...(key === "imagesToPdf" ? [] : []),
  ];

  if (key === "pdfMerge") {
    config.multipleFiles = true;
    config.accepts = "application/pdf";
    config.hint = "Select two or more PDFs to merge into one file.";
  } else if (key === "imagesToPdf") {
    config.multipleFiles = true;
    config.accepts = "image/*";
    config.preview = "pdf";
    config.hint = "Upload one or more images and export a single PDF.";
  } else {
    config.hint = "Upload a PDF, tune the options, and export the result.";
  }

  return config;
}

function mediaConfig(tool: ToolSeed | ToolEntry): ToolUiConfig {
  const key = tool.processorKey;
  const config = baseFileConfig(tool, key.includes("audio") ? "audio" : key.includes("gif") || key.includes("frameGrabber") ? "image" : "video");
  config.accepts = key.includes("audio") ? "audio/*" : "video/*";
  config.controls = [
    ...(key === "videoTrim" || key === "audioCut" ? [makeInput("start", "Start (sec)", "number", "0"), makeInput("end", "End (sec)", "number", "10")] : []),
    ...(key === "playbackSpeed" ? [makeSelect("speed", "Speed", ["0.5", "0.75", "1", "1.25", "1.5", "2"])] : []),
    ...(key === "videoCompress" ? [makeInput("quality", "Quality / CRF", "number", "28", "Lower is higher quality.")] : []),
    ...(key === "playbackSpeed" ? [makeSelect("speed", "Speed", ["0.5", "0.75", "1", "1.25", "1.5", "2"])] : []),
    ...(key === "videoToMp3" || key === "audioCompress" ? [makeInput("bitrate", "Bitrate (kbps)", "number", "192")] : []),
    ...(key === "videoConvert" ? [makeSelect("format", "Format", ["video/mp4", "video/webm", "video/quicktime"])] : []),
    ...(key === "audioConvert" ? [makeSelect("format", "Format", ["audio/mpeg", "audio/wav", "audio/ogg"])] : []),
    ...(key === "frameGrabber" ? [makeInput("time", "Time (sec)", "number", "1")] : []),
    ...(key === "subtitleAdder" ? [makeTextarea("input", "Subtitle text or SRT", "Paste subtitle text or SRT here", "Text becomes a simple subtitle file.", 6)] : []),
    ...(key === "gifMaker" || key === "videoToGif" ? [makeInput("fps", "FPS", "number", "12")] : []),
    ...(key === "muteVideo" || key === "reverseVideo" || key === "subtitleExtractor" || key === "audioNormalize" ? [] : []),
  ];

  if (key === "videoMerge" || key === "audioMerge") {
    config.multipleFiles = true;
    config.hint = "Select two or more files to merge.";
  }

  if (key === "subtitleExtractor") {
    config.preview = "text";
    config.hint = "Extract the first subtitle track into a text file.";
  }

  if (key === "frameGrabber") {
    config.preview = "image";
  }

  if (key === "audioNormalize") {
    config.preview = "audio";
  }

  return config;
}

function devConfig(tool: ToolSeed | ToolEntry): ToolUiConfig {
  const key = tool.processorKey;
  const config = baseTextConfig(tool);
  config.hint = "Paste code or structured text, then format it.";
  config.controls = [
    makeTextarea("input", "Input", `Paste ${tool.title.toLowerCase()} input here`, "Primary input for this tool.", 8),
    makeTextarea("secondary", "Secondary input", "Optional second value or notes.", "Optional.", 5),
  ];

  if (key === "base64Codec" || key === "urlCodec" || key === "escapeUnescape") {
    config.controls.unshift(makeSelect("mode", "Mode", ["encode", "decode"]));
  }

  if (key === "regexTester") {
    config.controls = [
      makeTextarea("input", "Text", "Paste text to test", "Required.", 8),
      makeInput("pattern", "Pattern", "text", "[A-Z]+"),
      makeInput("flags", "Flags", "text", "g"),
    ];
  }

  if (key === "uuidGenerator") {
    config.controls = [makeInput("count", "Count", "number", "1")];
    config.requiresText = false;
    config.hint = "Generate one or more UUIDs.";
  }

  if (key === "hashGenerator") {
    config.hint = "Hash any text with a fast browser-side hash.";
  }

  if (key === "timestampConverter") {
    config.controls = [makeInput("input", "Timestamp or date", "text", "1700000000")];
    config.requiresText = true;
  }

  if (key === "cronGenerator") {
    config.controls = [makeSelect("schedule", "Schedule", ["hourly", "daily", "weekly", "monthly"])];
    config.requiresText = false;
  }

  if (key === "colorConverter") {
    config.controls = [
      makeInput("input", "Color value", "text", "#7c3aed"),
      makeInput("secondary", "Secondary value", "text", "Optional RGB value"),
    ];
  }

  if (key === "markdownPreview") {
    config.controls = [makeTextarea("input", "Markdown", "Paste markdown here", "Preview renders in an HTML file.", 10)];
    config.preview = "text";
  }

  if (key === "apiRequestBuilder") {
    config.controls = [
      makeInput("url", "Request URL", "url", "https://api.example.com/items"),
      makeSelect("method", "Method", ["GET", "POST", "PUT", "PATCH", "DELETE"]),
      makeTextarea("headers", "Headers", '{ "Content-Type": "application/json" }', "Optional JSON headers.", 4),
      makeTextarea("input", "Body", '{ "name": "OmniTool" }', "Optional request body.", 6),
    ];
    config.requiresText = false;
  }

  if (key === "codeSnippetFormatter") {
    config.controls = [
      makeSelect("language", "Language", ["txt", "js", "ts", "json", "html", "css", "py"]),
      makeTextarea("input", "Code", "Paste your snippet here", "Required.", 10),
    ];
  }

  if (key === "jsonFormat" || key === "jsonMinify" || key === "sqlFormat" || key === "htmlMinify" || key === "cssMinify" || key === "jsMinify" || key === "yamlFormat" || key === "xmlFormat") {
    config.controls = [makeTextarea("input", "Input", `Paste ${tool.title.toLowerCase()} input here`, "Required.", 10)];
  }

  if (key === "jwtDecode") {
    config.controls = [makeTextarea("input", "JWT", "Paste a token here", "Required.", 6)];
  }

  return config;
}

function textConfig(tool: ToolSeed | ToolEntry): ToolUiConfig {
  const key = tool.processorKey;
  const config = baseTextConfig(tool);
  config.controls = [
    makeTextarea("input", "Input", `Paste ${tool.title.toLowerCase()} input here`, "Primary input for this tool.", 8),
    makeTextarea("secondary", "Optional secondary input", "Secondary text, notes, or compare target.", "Optional.", 5),
  ];

  if (key === "textStats") {
    config.controls = [makeTextarea("input", "Text", "Paste text to analyze", "Required.", 8)];
  } else if (key === "caseConverter") {
    config.controls = [
      makeSelect("mode", "Case", ["title", "upper", "lower", "sentence", "camel", "pascal", "snake", "kebab"]),
      makeTextarea("input", "Text", "Paste text to convert", "Required.", 8),
    ];
  } else if (key === "loremGenerator") {
    config.controls = [makeInput("paragraphs", "Paragraphs", "number", "2")];
    config.requiresText = false;
  } else if (key === "lineSorter" || key === "duplicateLines" || key === "sentenceSplitter" || key === "paragraphRewriter" || key === "readingTime" || key === "textCleaner" || key === "slugGenerator" || key === "titleCase" || key === "textCompare" || key === "randomText" || key === "summarizerAssist" || key === "keywordExtractor") {
    config.controls = [
      makeTextarea("input", "Text", `Paste ${tool.title.toLowerCase()} input here`, "Required.", 8),
      ...(key === "textCompare" ? [makeTextarea("secondary", "Compare text", "Paste the second text block", "Required.", 8)] : []),
      ...(key === "randomText" ? [makeInput("words", "Word count", "number", "24")] : []),
    ];
  }

  if (key === "readingTime") {
    config.requiresText = true;
  }

  return config;
}

function unitConfig(tool: ToolSeed | ToolEntry): ToolUiConfig {
  const key = tool.processorKey;
  const slug = tool.slug;
  const config = baseNumberConfig(tool);

  if (key === "currencyConverter") {
    config.controls = [
      makeInput("amount", "Amount", "number", "100"),
      makeInput("rate", "Exchange rate", "number", "0.92"),
      makeInput("from", "From", "text", "USD"),
      makeInput("to", "To", "text", "EUR"),
    ];
  } else if (key === "unitConverter") {
    const kind = slug.includes("temperature")
      ? ["°C", "°F", "K"]
      : slug.includes("speed")
        ? ["m/s", "km/h", "mph", "knot"]
        : slug.includes("area")
          ? ["mm²", "cm²", "m²", "km²", "acre", "ha"]
          : slug.includes("weight")
            ? ["g", "kg", "lb", "oz"]
            : ["mm", "cm", "m", "km", "in", "ft", "yd", "mi"];
    config.controls = [
      makeInput("value", "Value", "number", "1"),
      makeSelect("from", "From", kind),
      makeSelect("to", "To", kind),
    ];
  } else if (key === "percentageCalculator") {
    config.controls = [makeInput("base", "Base value", "number", "100"), makeInput("percent", "Percent", "number", "15")];
  } else if (key === "bmiCalculator") {
    config.controls = [makeInput("weight", "Weight (kg)", "number", "70"), makeInput("height", "Height (cm or m)", "number", "175")];
  } else if (key === "tipCalculator") {
    config.controls = [makeInput("bill", "Bill", "number", "100"), makeInput("tip", "Tip %", "number", "15"), makeInput("people", "People", "number", "1")];
  } else if (key === "loanCalculator") {
    config.controls = [makeInput("principal", "Principal", "number", "10000"), makeInput("rate", "APR %", "number", "8"), makeInput("years", "Years", "number", "5")];
  } else if (key === "taxCalculator") {
    config.controls = [makeInput("amount", "Amount", "number", "100"), makeInput("rate", "Tax %", "number", "18")];
  } else if (key === "discountCalculator") {
    config.controls = [makeInput("amount", "Original price", "number", "100"), makeInput("discount", "Discount %", "number", "20")];
  } else if (key === "basicMathCalculator") {
    config.controls = [makeTextarea("input", "Expression", "2 + 2 * 3", "Basic arithmetic only.", 4)];
    config.requiresText = true;
  } else if (key === "dateCalculator") {
    config.controls = [makeInput("date", "Date", "date", ""), makeInput("days", "Days to add", "number", "7")];
  } else if (key === "ageCalculator") {
    config.controls = [makeInput("date", "Birth date", "date", "")];
  }

  return config;
}

function fileConfig(tool: ToolSeed | ToolEntry): ToolUiConfig {
  const key = tool.processorKey;
  const config = baseFileConfig(tool, "none");
  config.hint = "Upload a file and run the file utility.";
  if (key === "fileRenamer") {
    config.controls = [makeInput("prefix", "Prefix", "text", "new-"), makeInput("suffix", "Suffix", "text", "-final")];
  } else if (key === "filenameSlugifier") {
    config.controls = [makeInput("fileName", "Filename", "text", "My File Name.pdf")];
    config.requiresFile = false;
    config.requiresText = false;
    config.hint = "Convert a filename into a safe slug.";
  } else if (key === "duplicateFinder") {
    config.multipleFiles = true;
    config.hint = "Add two or more files and compare them.";
  } else if (key === "folderOrganizer") {
    config.multipleFiles = true;
    config.hint = "Add files and generate a simple folder plan.";
  } else if (key === "fileInfo" || key === "checksumTool" || key === "pageCounter") {
    config.hint = "Inspect the file and generate a quick report.";
  }
  return config;
}

export function getToolUiConfig(tool: ToolSeed | ToolEntry): ToolUiConfig {
  switch (tool.category) {
    case "image":
      return imageConfig(tool);
    case "pdf":
      return pdfConfig(tool);
    case "video-audio":
      return mediaConfig(tool);
    case "social":
      return (() => {
        const config = baseTextConfig(tool);
        config.controls = [
          makeTextarea("input", "Input", `Paste ${tool.title.toLowerCase()} input here`, "Primary input for this tool.", 8),
          makeTextarea("secondary", "Optional secondary input", "Notes or supporting text.", "Optional.", 5),
        ];
        if (tool.processorKey === "socialCaption" || tool.processorKey === "contentIdeas" || tool.processorKey === "hookGenerator" || tool.processorKey === "titleGenerator") {
          config.controls.push(makeInput("count", "Count", "number", "5"));
        }
        if (tool.processorKey === "socialFormat") {
          config.controls.unshift(makeInput("platform", "Platform", "text", "Instagram"));
        }
        if (tool.processorKey === "socialBio" || tool.processorKey === "scriptHelper" || tool.processorKey === "postPlanner") {
          config.controls.push(makeInput("tone", "Tone", "text", "clear"));
        }
        if (tool.processorKey === "socialHashtags") {
          config.controls.push(makeInput("count", "Max tags", "number", "12"));
        }
        return config;
      })();
    case "dev":
      return devConfig(tool);
    case "text":
      return textConfig(tool);
    case "unit-money":
      return unitConfig(tool);
    case "file":
      return fileConfig(tool);
    default:
      return baseTextConfig(tool);
  }
}

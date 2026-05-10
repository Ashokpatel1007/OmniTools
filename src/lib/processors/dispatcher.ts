import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import type { ProcessorArgs, ProcessorResult, ProcessorFileResult } from "./types";
import { backgroundRemoveImage } from "./anchor/background-remover";
import { convertVideoToMp3 } from "./video-to-mp3";
import { fileToImageBitmap, imageBitmapToCanvas, canvasToBlob } from "./image-utils";

const textDecoder = new TextDecoder();
const textEncoder = new TextEncoder();

function n(value: unknown, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function titleCase(value: string) {
  return normalizeWhitespace(value)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function slugify(value: string) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resultText(title: string, text: string, description?: string): ProcessorResult {
  return { title, text, description };
}

function resultFile(
  title: string,
  blob: Blob,
  name: string,
  mime = blob.type || "application/octet-stream",
  description?: string,
): ProcessorResult {
  return {
    title,
    description,
    file: {
      name,
      blob,
      mime,
    },
    previewType: mime.startsWith("image/")
      ? "image"
      : mime === "application/pdf"
        ? "pdf"
        : mime.startsWith("audio/")
          ? "audio"
          : mime.startsWith("video/")
            ? "video"
            : mime.startsWith("text/") || mime === "application/json"
              ? "text"
              : undefined,
  };
}

function resultFiles(title: string, files: ProcessorFileResult[], description?: string): ProcessorResult {
  return { title, description, files };
}

async function readFileText(file: File) {
  return await file.text();
}

async function readFileBytes(file: File) {
  return new Uint8Array(await file.arrayBuffer());
}

function fileNameWithoutExt(name: string) {
  return name.replace(/\.[^.]+$/, "");
}

function extensionFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/avif") return "avif";
  if (mime === "application/pdf") return "pdf";
  if (mime === "audio/mpeg") return "mp3";
  if (mime === "audio/wav") return "wav";
  if (mime === "video/mp4") return "mp4";
  if (mime === "video/webm") return "webm";
  if (mime === "text/html") return "html";
  if (mime === "text/plain") return "txt";
  return "bin";
}

function makeBlob(text: string, type = "text/plain") {
  return new Blob([text], { type });
}

function base64Encode(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

function base64Decode(value: string) {
  return decodeURIComponent(escape(atob(value.trim())));
}

function encodeUrl(value: string) {
  return encodeURIComponent(value);
}

function decodeUrl(value: string) {
  return decodeURIComponent(value);
}

function countWords(text: string) {
  const matches = text.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

function countLines(text: string) {
  return text.trim() ? text.split(/\r?\n/).length : 0;
}

function countCharacters(text: string) {
  return text.length;
}

function readingTime(text: string) {
  const words = countWords(text);
  const minutes = Math.max(1, Math.ceil(words / 220));
  return { words, minutes };
}

function randomText(words = 24) {
  const pool = [
    "clean",
    "fast",
    "focused",
    "pixel",
    "workflow",
    "studio",
    "result",
    "practical",
    "sharp",
    "simple",
    "clear",
    "useful",
    "modular",
    "precise",
    "smart",
  ];
  return Array.from({ length: words }, (_, i) => pool[(i * 7 + words) % pool.length]).join(" ");
}

function loremText(paragraphs = 2) {
  const base = "A clean workflow keeps the result easy to scan and simple to finish.";
  return Array.from({ length: paragraphs }, () => base).join("\n\n");
}

function extractKeywords(text: string) {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) || [];
  const freq = new Map<string, number>();
  for (const word of words) freq.set(word, (freq.get(word) || 0) + 1);
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word]) => word)
    .join(", ");
}

function summarizeText(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, 3).join(" ");
}

function diffLines(left: string, right: string) {
  const a = left.split(/\r?\n/);
  const b = right.split(/\r?\n/);
  const max = Math.max(a.length, b.length);
  const lines: string[] = [];
  for (let i = 0; i < max; i += 1) {
    const leftLine = a[i] ?? "";
    const rightLine = b[i] ?? "";
    if (leftLine === rightLine) {
      lines.push(`  ${leftLine}`);
    } else {
      if (leftLine) lines.push(`- ${leftLine}`);
      if (rightLine) lines.push(`+ ${rightLine}`);
    }
  }
  return lines.join("\n");
}

function simpleMarkdownToHtml(markdown: string) {
  const escaped = markdown
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const blocks = escaped
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (/^#{1,6}\s/.test(trimmed)) {
        const level = trimmed.match(/^#{1,6}/)?.[0].length ?? 1;
        return `<h${level}>${trimmed.replace(/^#{1,6}\s*/, "")}</h${level}>`;
      }
      if (/^-\s/m.test(trimmed)) {
        const items = trimmed.split(/\n/).map((line) => line.replace(/^-\s*/, "")).filter(Boolean);
        return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
      }
      return `<p>${trimmed
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui,sans-serif;padding:24px;max-width:900px;margin:0 auto;line-height:1.6;color:#0f172a}pre,code{background:#f1f5f9;border-radius:8px;padding:.15rem .35rem}h1,h2,h3,h4,h5,h6{margin:1.2em 0 .5em}</style></head><body>${blocks}</body></html>`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function parseColor(input: string) {
  const value = input.trim();
  if (/^#?[0-9a-f]{3}$/i.test(value)) {
    const hex = value.replace("#", "");
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return { r, g, b, hex: `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toUpperCase() };
  }
  if (/^#?[0-9a-f]{6}$/i.test(value)) {
    const hex = value.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b, hex: `#${hex}`.toUpperCase() };
  }
  const rgb = value.match(/(\d+)\D+(\d+)\D+(\d+)/);
  if (rgb) {
    const r = clamp(Number(rgb[1]), 0, 255);
    const g = clamp(Number(rgb[2]), 0, 255);
    const b = clamp(Number(rgb[3]), 0, 255);
    return { r, g, b, hex: `#${[r, g, b].map((part) => part.toString(16).padStart(2, "0")).join("").toUpperCase()}` };
  }
  return null;
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      default: h = ((r - g) / d + 4); break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function safeEval(expression: string) {
  const sanitized = expression.replace(/\s+/g, "");
  if (!/^[0-9+\-*/().%^]+$/.test(sanitized)) {
    throw new Error("Only basic arithmetic is supported.");
  }
  // eslint-disable-next-line no-new-func
  const fn = new Function(`return (${sanitized.replace(/\^/g, "**")});`);
  const value = Number(fn());
  if (!Number.isFinite(value)) throw new Error("Invalid expression.");
  return value;
}

function formatNumber(value: number, decimals = 2) {
  return Number.isInteger(value) ? String(value) : value.toFixed(decimals).replace(/\.?0+$/, "");
}

function unitConverter(kind: string, value: number, from: string, to: string) {
  const length: Record<string, number> = {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.344,
  };
  const weight: Record<string, number> = { g: 1, kg: 1000, lb: 453.59237, oz: 28.349523125 };
  const speed: Record<string, number> = { "m/s": 1, "km/h": 0.2777777778, mph: 0.44704, knot: 0.514444444 };
  const area: Record<string, number> = { "mm²": 0.000001, "cm²": 0.0001, "m²": 1, "km²": 1000000, acre: 4046.8564224, ha: 10000 };
  const tables: Record<string, Record<string, number>> = { length, weight, speed, area };
  if (kind === "temperature") {
    const celsius = from === "°F" ? (value - 32) * (5 / 9) : from === "K" ? value - 273.15 : value;
    if (to === "°F") return celsius * (9 / 5) + 32;
    if (to === "K") return celsius + 273.15;
    return celsius;
  }
  const table = tables[kind];
  const base = value * (table[from] || 1);
  return base / (table[to] || 1);
}

let ffmpegLoading: Promise<{
  FFmpeg: any;
  fetchFile: (input: File | Blob | string) => Promise<Uint8Array>;
}> | null = null;

async function loadFfmpeg() {
  if (!ffmpegLoading) {
    ffmpegLoading = Promise.all([import("@ffmpeg/ffmpeg"), import("@ffmpeg/util")]).then(
      ([ffmpegModule, utilModule]) => ({
        FFmpeg: ffmpegModule.FFmpeg,
        fetchFile: utilModule.fetchFile,
      }),
    );
  }
  return await ffmpegLoading;
}

async function runFfmpeg(inputs: File[], outputName: string, execArgs: string[], mime: string) {
  const { FFmpeg, fetchFile } = await loadFfmpeg();
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();

  const names: string[] = [];
  for (const file of inputs) {
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
    const name = `input-${names.length}${ext || ".bin"}`;
    names.push(name);
    await ffmpeg.writeFile(name, await fetchFile(file));
  }

  await ffmpeg.exec(execArgs.map((part) => part));
  const out = await ffmpeg.readFile(outputName);
  const bytes = typeof out === "string" ? textEncoder.encode(out) : new Uint8Array(out);
  return new Blob([bytes], { type: mime });
}

async function loadImage(file: File) {
  const bitmap = await fileToImageBitmap(file);
  return await imageBitmapToCanvas(bitmap);
}

async function transformImage(
  file: File,
  draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap) => void,
  type = "image/png",
  quality = 0.92,
) {
  const bitmap = await fileToImageBitmap(file);
  const { canvas, ctx } = await imageBitmapToCanvas(bitmap);
  draw(ctx, canvas, bitmap);
  return await canvasToBlob(canvas, type, quality);
}

function getToolSlug(args: ProcessorArgs) {
  return safeString(args.toolSlug || args.slug || args.fileName || args.title, "").toLowerCase();
}

async function handleImageTool(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  const file = args.file;
  if (!file) return resultText("Image Tool", "Upload an image first.");

  switch (key) {
    case "imageBgRemover":
    case "transparentPng":
      return await backgroundRemoveImage(file, { sensitivity: n(args.sensitivity, 55) });

    case "imageUpscale": {
      const scale = clamp(n(args.scale, 2), 1, 4);
      const blob = await transformImage(file, (ctx, canvas, bitmap) => {
        canvas.width = bitmap.width * scale;
        canvas.height = bitmap.height * scale;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      }, file.type || "image/png");
      return resultFile("Image Upscaler", blob, `upscaled-${fileNameWithoutExt(file.name)}.png`, blob.type || "image/png", `Scaled to ${scale}×.`);
    }

    case "imageCompress": {
      const format = safeString(args.format, "image/jpeg");
      const quality = clamp(n(args.quality, 0.72), 0.1, 1);
      const blob = await transformImage(file, (ctx, canvas, bitmap) => {
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      }, format, quality);
      const ext = extensionFromMime(blob.type || format);
      return resultFile("Image Compressor", blob, `${fileNameWithoutExt(file.name)}-compressed.${ext}`, blob.type || format, "Compressed image ready.");
    }

    case "imageResize": {
      const width = Math.max(1, n(args.width, 1200));
      const height = args.height ? Math.max(1, n(args.height, 0)) : 0;
      const blob = await transformImage(file, (ctx, canvas, bitmap) => {
        const nextHeight = height || Math.round((bitmap.height * width) / bitmap.width);
        canvas.width = width;
        canvas.height = nextHeight;
        ctx.drawImage(bitmap, 0, 0, width, nextHeight);
      }, file.type || "image/png");
      const ext = extensionFromMime(blob.type || file.type || "image/png");
      return resultFile("Image Resizer", blob, `${fileNameWithoutExt(file.name)}-resized.${ext}`, blob.type || file.type || "image/png");
    }

    case "imageCrop": {
      const x = Math.max(0, n(args.x, 0));
      const y = Math.max(0, n(args.y, 0));
      const width = Math.max(1, n(args.width, 500));
      const height = Math.max(1, n(args.height, 500));
      const blob = await transformImage(file, (ctx, canvas, bitmap) => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(bitmap, x, y, width, height, 0, 0, width, height);
      }, file.type || "image/png");
      return resultFile("Image Cropper", blob, `${fileNameWithoutExt(file.name)}-cropped.png`, blob.type || "image/png");
    }

    case "imageConvert": {
      const format = safeString(args.format, "image/png");
      const quality = clamp(n(args.quality, 0.92), 0.1, 1);
      const blob = await transformImage(file, (ctx, canvas, bitmap) => {
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      }, format, quality);
      const ext = extensionFromMime(blob.type || format);
      return resultFile("Image Converter", blob, `${fileNameWithoutExt(file.name)}.${ext}`, blob.type || format);
    }

    case "imageBlur": {
      const amount = clamp(n(args.amount, 6), 0, 64);
      const blob = await transformImage(file, (ctx, canvas, bitmap) => {
        ctx.filter = `blur(${amount}px)`;
        ctx.drawImage(bitmap, 0, 0);
      }, file.type || "image/png");
      return resultFile("Blur Background", blob, `${fileNameWithoutExt(file.name)}-blurred.png`, blob.type || "image/png");
    }

    case "imageSharpen": {
      const amount = clamp(n(args.amount, 3), 1, 6);
      const bitmap = await fileToImageBitmap(file);
      const { canvas: tempCanvas, ctx: tempCtx } = await imageBitmapToCanvas(bitmap);
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const { data } = imageData;
      const copy = new Uint8ClampedArray(data);
      const kernel = [0, -1, 0, -1, 5 + amount, -1, 0, -1, 0];
      for (let y = 1; y < tempCanvas.height - 1; y += 1) {
        for (let x = 1; x < tempCanvas.width - 1; x += 1) {
          let r = 0, g = 0, b = 0, i = 0;
          for (let ky = -1; ky <= 1; ky += 1) {
            for (let kx = -1; kx <= 1; kx += 1) {
              const idx = ((y + ky) * tempCanvas.width + (x + kx)) * 4;
              const weight = kernel[i++];
              r += copy[idx] * weight;
              g += copy[idx + 1] * weight;
              b += copy[idx + 2] * weight;
            }
          }
          const pos = (y * tempCanvas.width + x) * 4;
          data[pos] = clamp(r, 0, 255);
          data[pos + 1] = clamp(g, 0, 255);
          data[pos + 2] = clamp(b, 0, 255);
        }
      }
      tempCtx.putImageData(imageData, 0, 0);
      const blob = await canvasToBlob(tempCanvas, file.type || "image/png");
      return resultFile("Sharpen Image", blob, `${fileNameWithoutExt(file.name)}-sharpened.png`, blob.type || "image/png");
    }

    case "imageRotate": {
      const degreesValue = clamp(n(args.degrees, 90), 90, 270);
      const blob = await transformImage(file, (ctx, canvas, bitmap) => {
        const rad = (degreesValue * Math.PI) / 180;
        canvas.width = degreesValue === 180 ? bitmap.width : bitmap.height;
        canvas.height = degreesValue === 180 ? bitmap.height : bitmap.width;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
      }, file.type || "image/png");
      return resultFile("Rotate Image", blob, `${fileNameWithoutExt(file.name)}-rotated.png`, blob.type || "image/png");
    }

    case "imageFlip": {
      const direction = safeString(args.direction, "horizontal");
      const blob = await transformImage(file, (ctx, canvas, bitmap) => {
        if (direction === "vertical") {
          ctx.translate(0, canvas.height);
          ctx.scale(1, -1);
        } else {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(bitmap, 0, 0);
      }, file.type || "image/png");
      return resultFile("Flip Image", blob, `${fileNameWithoutExt(file.name)}-flipped.png`, blob.type || "image/png");
    }

    case "colorPicker": {
      const x = clamp(n(args.x, 0), 0, Number.MAX_SAFE_INTEGER);
      const y = clamp(n(args.y, 0), 0, Number.MAX_SAFE_INTEGER);
      const { canvas, ctx } = await loadImage(file);
      const pixel = ctx.getImageData(Math.min(x, canvas.width - 1), Math.min(y, canvas.height - 1), 1, 1).data;
      const hex = `#${[pixel[0], pixel[1], pixel[2]].map((part) => part.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
      return resultText("Color Picker", `${hex}\nRGB ${pixel[0]}, ${pixel[1]}, ${pixel[2]}\nSampled at ${Math.min(x, canvas.width - 1)}, ${Math.min(y, canvas.height - 1)}.`);
    }

    case "imageEditor": {
      const mode = safeString(args.mode, "natural");
      const amount = clamp(n(args.amount, 20), 1, 100);
      const blob = await transformImage(file, (ctx, canvas, bitmap) => {
        const presets: Record<string, string> = {
          natural: `brightness(1) contrast(1) saturate(1)`,
          bright: `brightness(${1 + amount / 120}) contrast(1.05) saturate(1.1)`,
          dramatic: `brightness(${0.9 + amount / 200}) contrast(${1.1 + amount / 140}) saturate(${1.15 + amount / 180})`,
          soft: `brightness(${1.03 + amount / 180}) contrast(0.98) saturate(0.95)`,
        };
        ctx.filter = presets[mode] || presets.natural;
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      }, file.type || "image/png");
      return resultFile("Image Editor", blob, `${fileNameWithoutExt(file.name)}-edited.png`, blob.type || "image/png");
    }

    case "memeGenerator":
    case "thumbnailMaker":
    case "stickerMaker":
    case "avatarMaker":
    case "passportPhoto":
    case "aspectRatio": {
      const title = key === "memeGenerator" ? "Meme Generator" : key === "thumbnailMaker" ? "Thumbnail Maker" : key === "stickerMaker" ? "Sticker Maker" : key === "avatarMaker" ? "Profile Picture Maker" : key === "passportPhoto" ? "Passport Photo Tool" : key === "aspectRatio" ? "Aspect Ratio Editor" : "Image Editor";
      const caption = safeString(args.input || args.caption || args.title, "");
      const secondary = safeString(args.secondary || args.subtitle, "");
      const mode = safeString(args.mode, key);
      let width = 1080;
      let height = 1080;
      if (key === "thumbnailMaker") { width = 1280; height = 720; }
      if (key === "avatarMaker") { width = 1024; height = 1024; }
      if (key === "passportPhoto") { width = 600; height = 600; }
      if (key === "aspectRatio") {
        const ratio = safeString(args.ratio, "1:1");
        const [rw, rh] = ratio.split(":").map((part) => Number(part) || 1);
        width = 1200; height = Math.round((1200 * rh) / rw);
      }
      const blob = await transformImage(file, (ctx, canvas, bitmap) => {
        canvas.width = width; canvas.height = height;
        ctx.fillStyle = mode === "passportPhoto" ? "#ffffff" : "#0f172a";
        ctx.fillRect(0, 0, width, height);
        const scale = Math.min(width / bitmap.width, height / bitmap.height);
        const imgW = bitmap.width * scale;
        const imgH = bitmap.height * scale;
        const x = (width - imgW) / 2;
        const y = (height - imgH) / 2;
        if (key === "avatarMaker") {
          const size = Math.min(width, height) * 0.78;
          const cx = width / 2;
          const cy = height / 2;
          const grad = ctx.createLinearGradient(0, 0, width, height);
          grad.addColorStop(0, "#dbeafe");
          grad.addColorStop(1, "#ede9fe");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(0, 0, width, height, Math.min(width, height) * 0.12);
          ctx.fill();
          ctx.save();
          ctx.beginPath();
          ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(bitmap, cx - size / 2, cy - size / 2, size, size);
          ctx.restore();
        } else if (key === "stickerMaker") {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(0, 0, width, height, 80);
          ctx.clip();
          ctx.drawImage(bitmap, x, y, imgW, imgH);
          ctx.restore();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 24;
          ctx.beginPath();
          ctx.roundRect(24, 24, width - 48, height - 48, 64);
          ctx.stroke();
        } else if (key === "passportPhoto") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(bitmap, x, y, imgW, imgH);
        } else {
          ctx.drawImage(bitmap, x, y, imgW, imgH);
        }
        if (caption) {
          ctx.fillStyle = "#ffffff";
          ctx.font = `700 ${Math.max(36, Math.round(height * 0.08))}px system-ui, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.shadowColor = "rgba(15,23,42,.45)";
          ctx.shadowBlur = 14;
          ctx.fillText(caption, width / 2, height - 36);
          if (secondary) {
            ctx.font = `500 ${Math.max(20, Math.round(height * 0.034))}px system-ui, sans-serif`;
            ctx.fillText(secondary, width / 2, height - 12);
          }
        }
      }, "image/png");
      return resultFile(title, blob, `${fileNameWithoutExt(file.name)}-${slugify(title)}.png`, "image/png");
    }

    case "imageMetadata": {
      const { canvas } = await loadImage(file);
      return resultText(
        "Image Metadata",
        [
          `Name: ${file.name}`,
          `Type: ${file.type || "unknown"}`,
          `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB`,
          `Dimensions: ${canvas.width} × ${canvas.height}`,
          `Last modified: ${new Date(file.lastModified).toLocaleString()}`,
        ].join("\n"),
      );
    }

    case "imageToPdf": {
      const files = Array.isArray(args.files) && args.files.length ? args.files : [file];
      const pdf = await PDFDocument.create();
      for (const imageFile of files) {
        const pngBlob = await transformImage(imageFile, (ctx, canvas, bitmap) => {
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          ctx.drawImage(bitmap, 0, 0);
        }, "image/png");
        const embedded = await pdf.embedPng(await pngBlob.arrayBuffer());
        const page = pdf.addPage([embedded.width, embedded.height]);
        page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
      }
      const out = await pdf.save();
      return resultFile("Image to PDF", new Blob([out], { type: "application/pdf" }), `${fileNameWithoutExt(file.name)}.pdf`, "application/pdf");
    }

    default:
      return resultText("Image Tool", "Upload an image first.");
  }
}

async function loadPdf(file: File) {
  return await PDFDocument.load(await file.arrayBuffer());
}

async function handlePdfTool(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  const file = args.file;
  const files = Array.isArray(args.files) ? args.files.filter(Boolean) : [];
  if (!file && !files.length) return resultText("PDF Tool", "Upload a PDF first.");

  switch (key) {
    case "pdfMerge": {
      const source = files.length ? files : file ? [file] : [];
      if (source.length < 2) return resultText("Merge PDF", "Add at least two PDF files.");
      const merged = await PDFDocument.create();
      for (const pdfFile of source) {
        const pdf = await loadPdf(pdfFile);
        const copied = await merged.copyPages(pdf, pdf.getPageIndices());
        copied.forEach((page) => merged.addPage(page));
      }
      const out = await merged.save();
      return resultFile("Merged PDF", new Blob([out], { type: "application/pdf" }), "merged.pdf", "application/pdf", "Merged PDF is ready.");
    }

    case "pdfSplit": {
      const pdf = await loadPdf(file!);
      const outputs: ProcessorFileResult[] = [];
      for (let i = 0; i < pdf.getPageCount(); i += 1) {
        const next = await PDFDocument.create();
        const [page] = await next.copyPages(pdf, [i]);
        next.addPage(page);
        const out = await next.save();
        outputs.push({ name: `page-${i + 1}.pdf`, blob: new Blob([out], { type: "application/pdf" }), mime: "application/pdf" });
      }
      return resultFiles("Split PDF", outputs, `${outputs.length} single-page PDFs prepared.`);
    }

    case "pdfCompress": {
      const pdf = await loadPdf(file!);
      const out = await pdf.save({ useObjectStreams: true });
      return resultFile("Compressed PDF", new Blob([out], { type: "application/pdf" }), `${fileNameWithoutExt(file!.name)}-compressed.pdf`, "application/pdf");
    }

    case "pdfRotate": {
      const pdf = await loadPdf(file!);
      const deg = clamp(n(args.degrees, 90), 90, 270) as 90 | 180 | 270;
      pdf.getPages().forEach((page) => page.setRotation(degrees(deg)));
      const out = await pdf.save();
      return resultFile("Rotated PDF", new Blob([out], { type: "application/pdf" }), `${fileNameWithoutExt(file!.name)}-rotated.pdf`, "application/pdf");
    }

    case "pdfReorder": {
      const pdf = await loadPdf(file!);
      const orderInput = Array.isArray(args.order) ? args.order : String(args.order || "")
        .split(/[,\s]+/)
        .map((part) => Number(part))
        .filter((value) => Number.isFinite(value) && value > 0);
      const pages = orderInput.length
        ? orderInput.map((pageIndex) => pdf.getPageIndices()[Math.max(0, pageIndex - 1)]).filter((v) => typeof v === "number")
        : pdf.getPageIndices();
      const reordered = await PDFDocument.create();
      const copied = await reordered.copyPages(pdf, pages);
      copied.forEach((page) => reordered.addPage(page));
      const out = await reordered.save();
      return resultFile("Reordered PDF", new Blob([out], { type: "application/pdf" }), `${fileNameWithoutExt(file!.name)}-reordered.pdf`, "application/pdf");
    }

    case "pdfRemovePages": {
      const pdf = await loadPdf(file!);
      const removalInput = Array.isArray(args.pagesToRemove)
        ? args.pagesToRemove
        : String(args.pagesToRemove || "")
            .split(/[,\s]+/)
            .map((part) => Number(part))
            .filter((value) => Number.isFinite(value) && value > 0);
      const removal = new Set(removalInput.map((page) => Math.max(1, Number(page))));
      const keep = pdf.getPageIndices().filter((index) => !removal.has(index + 1));
      const next = await PDFDocument.create();
      const copied = await next.copyPages(pdf, keep);
      copied.forEach((page) => next.addPage(page));
      const out = await next.save();
      return resultFile("Pages Removed", new Blob([out], { type: "application/pdf" }), `${fileNameWithoutExt(file!.name)}-pages-removed.pdf`, "application/pdf");
    }

    case "pdfPageNumbers": {
      const pdf = await loadPdf(file!);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      pdf.getPages().forEach((page, index) => {
        page.drawText(String(index + 1), {
          x: page.getWidth() - 24,
          y: 18,
          size: 10,
          font,
          color: rgb(0.35, 0.35, 0.35),
        });
      });
      const out = await pdf.save();
      return resultFile("Numbered PDF", new Blob([out], { type: "application/pdf" }), `${fileNameWithoutExt(file!.name)}-numbered.pdf`, "application/pdf");
    }

    case "pdfWatermark": {
      const pdf = await loadPdf(file!);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const text = safeString(args.input || args.watermark || "OmniTools", "OmniTools");
      pdf.getPages().forEach((page) => {
        page.drawText(text, {
          x: page.getWidth() * 0.12,
          y: page.getHeight() * 0.46,
          size: Math.max(24, Math.round(page.getWidth() * 0.06)),
          font,
          rotate: degrees(315),
          color: rgb(0.55, 0.55, 0.55),
          opacity: clamp(n(args.opacity, 0.2), 0.05, 0.6),
        });
      });
      const out = await pdf.save();
      return resultFile("Watermarked PDF", new Blob([out], { type: "application/pdf" }), `${fileNameWithoutExt(file!.name)}-watermarked.pdf`, "application/pdf");
    }

    case "pdfMetadata": {
      const pdf = await loadPdf(file!);
      const text = [
        `Name: ${file!.name}`,
        `Pages: ${pdf.getPageCount()}`,
        `Title: ${pdf.getTitle() || "-"}`,
        `Author: ${pdf.getAuthor() || "-"}`,
        `Subject: ${pdf.getSubject() || "-"}`,
        `Creator: ${pdf.getCreator() || "-"}`,
        `Producer: ${pdf.getProducer() || "-"}`,
        `Size: ${(file!.size / 1024 / 1024).toFixed(2)} MB`,
      ].join("\n");
      return resultText("PDF Metadata", text);
    }

    case "imagesToPdf": {
      const source = files.length ? files : file ? [file] : [];
      if (!source.length) return resultText("Images to PDF", "Add one or more images.");
      const pdf = await PDFDocument.create();
      for (const imageFile of source) {
        const bytes = await readFileBytes(imageFile);
        const isPng = imageFile.type.includes("png") || imageFile.name.toLowerCase().endsWith(".png");
        const embedded = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        const page = pdf.addPage([embedded.width, embedded.height]);
        page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
      }
      const out = await pdf.save();
      return resultFile("Images to PDF", new Blob([out], { type: "application/pdf" }), "images.pdf", "application/pdf");
    }

    default:
      return resultText("PDF Tool", "Upload a PDF first.");
  }
}

async function handleMediaTool(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  const file = args.file;
  const files = Array.isArray(args.files) ? args.files.filter(Boolean) : [];
  if (!file && !files.length) return resultText("Media Tool", "Upload a video or audio file first.");

  switch (key) {
    case "videoToMp3":
      return await convertVideoToMp3(file!, { bitrateKbps: n(args.bitrate, 192) });

    case "videoTrim": {
      const start = Math.max(0, n(args.start, 0));
      const end = Math.max(start + 1, n(args.end, start + 10));
      const blob = await runFfmpeg([file!], "output.mp4", ["-ss", String(start), "-to", String(end), "-i", "input-0" + (file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp4"), "-c:v", "libx264", "-c:a", "aac", "output.mp4"], "video/mp4");
      return resultFile("Trimmed Video", blob, `${fileNameWithoutExt(file!.name)}-trimmed.mp4`, "video/mp4");
    }

    case "videoMerge": {
      const source = files.length ? files : [file!];
      if (source.length < 2) return resultText("Video Merge", "Add at least two video files.");
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const names: string[] = [];
      for (const src of source) {
        const ext = src.name.includes(".") ? src.name.slice(src.name.lastIndexOf(".")) : ".mp4";
        const name = `clip-${names.length}${ext}`;
        names.push(name);
        await ffmpeg.writeFile(name, await fetchFile(src));
      }
      const list = names.map((name) => `file '${name}'`).join("\n");
      await ffmpeg.writeFile("list.txt", textEncoder.encode(list));
      await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c:v", "libx264", "-c:a", "aac", "output.mp4"]);
      const out = await ffmpeg.readFile("output.mp4");
      const bytes = typeof out === "string" ? textEncoder.encode(out) : new Uint8Array(out);
      return resultFile("Merged Video", new Blob([bytes], { type: "video/mp4" }), "merged.mp4", "video/mp4");
    }

    case "videoCompress": {
      const quality = clamp(n(args.quality, 28), 18, 35);
      const blob = await runFfmpeg([file!], "output.mp4", ["-i", "input-0" + (file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp4"), "-vf", "scale='min(1280,iw)':-2", "-c:v", "libx264", "-preset", "veryfast", "-crf", String(quality), "-c:a", "aac", "output.mp4"], "video/mp4");
      return resultFile("Compressed Video", blob, `${fileNameWithoutExt(file!.name)}-compressed.mp4`, "video/mp4");
    }

    case "muteVideo": {
      const blob = await runFfmpeg([file!], "output.mp4", ["-i", "input-0" + (file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp4"), "-an", "-c:v", "copy", "output.mp4"], "video/mp4");
      return resultFile("Muted Video", blob, `${fileNameWithoutExt(file!.name)}-muted.mp4`, "video/mp4");
    }

    case "playbackSpeed": {
      const speed = clamp(n(args.speed, 1.25), 0.25, 4);
      const atempo = speed <= 2 ? `atempo=${speed}` : `atempo=2,atempo=${speed / 2}`;
      const blob = await runFfmpeg([file!], "output.mp4", ["-i", "input-0" + (file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp4"), "-filter:v", `setpts=${(1 / speed).toFixed(4)}*PTS`, "-filter:a", atempo, "output.mp4"], "video/mp4");
      return resultFile("Playback Speed", blob, `${fileNameWithoutExt(file!.name)}-speed.mp4`, "video/mp4");
    }

    case "reverseVideo": {
      const blob = await runFfmpeg([file!], "output.mp4", ["-i", "input-0" + (file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp4"), "-vf", "reverse", "-af", "areverse", "output.mp4"], "video/mp4");
      return resultFile("Reversed Video", blob, `${fileNameWithoutExt(file!.name)}-reversed.mp4`, "video/mp4");
    }

    case "videoConvert": {
      const format = safeString(args.format, "video/mp4");
      const outName = `output.${extensionFromMime(format)}`;
      const blob = await runFfmpeg([file!], outName, ["-i", "input-0" + (file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp4"), "-c:v", "libx264", "-c:a", "aac", outName], format);
      return resultFile("Video Converter", blob, `${fileNameWithoutExt(file!.name)}.${extensionFromMime(format)}`, format);
    }

    case "gifMaker":
    case "videoToGif": {
      const blob = await runFfmpeg([file!], "output.gif", ["-i", "input-0" + (file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp4"), "-vf", `fps=${clamp(n(args.fps, 12), 1, 60)},scale=720:-1:flags=lanczos`, "output.gif"], "image/gif");
      return resultFile(key === "gifMaker" ? "GIF Maker" : "Video to GIF", blob, `${fileNameWithoutExt(file!.name)}.gif`, "image/gif");
    }

    case "frameGrabber": {
      const time = Math.max(0, n(args.time, 1));
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const inputName = `input${file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp4"}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      await ffmpeg.exec(["-ss", String(time), "-i", inputName, "-frames:v", "1", "frame.png"]);
      const out = await ffmpeg.readFile("frame.png");
      const bytes = typeof out === "string" ? textEncoder.encode(out) : new Uint8Array(out);
      return resultFile("Frame Grabber", new Blob([bytes], { type: "image/png" }), `${fileNameWithoutExt(file!.name)}-frame.png`, "image/png");
    }

    case "subtitleAdder": {
      const subtitleText = safeString(args.input || args.secondary || "", "");
      if (!subtitleText.trim()) return resultText("Subtitle Adder", "Paste subtitle text first.");
      const srt = subtitleText.includes("-->") ? subtitleText : `1\n00:00:00,000 --> 00:00:05,000\n${subtitleText.trim()}\n`;
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const inputName = `input${file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp4"}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      await ffmpeg.writeFile("subs.srt", textEncoder.encode(srt));
      await ffmpeg.exec(["-i", inputName, "-vf", "subtitles=subs.srt", "output.mp4"]);
      const out = await ffmpeg.readFile("output.mp4");
      const bytes = typeof out === "string" ? textEncoder.encode(out) : new Uint8Array(out);
      return resultFile("Subtitle Adder", new Blob([bytes], { type: "video/mp4" }), `${fileNameWithoutExt(file!.name)}-subtitled.mp4`, "video/mp4");
    }

    case "subtitleExtractor": {
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const inputName = `input${file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp4"}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      try {
        await ffmpeg.exec(["-i", inputName, "-map", "0:s:0", "subs.srt"]);
        const out = await ffmpeg.readFile("subs.srt");
        const bytes = typeof out === "string" ? textEncoder.encode(out) : new Uint8Array(out);
        return resultFile("Subtitle Extractor", new Blob([bytes], { type: "text/plain" }), `${fileNameWithoutExt(file!.name)}.srt`, "text/plain");
      } catch {
        return resultText("Subtitle Extractor", "No embedded subtitle track was found.");
      }
    }

    case "videoToMp3":
      return await convertVideoToMp3(file!, { bitrateKbps: n(args.bitrate, 192) });

    case "audioCompress": {
      const bitrate = clamp(n(args.bitrate, 128), 64, 320);
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const inputName = `input${file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp3"}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      await ffmpeg.exec(["-i", inputName, "-b:a", `${bitrate}k`, "output.mp3"]);
      const out = await ffmpeg.readFile("output.mp3");
      const bytes = typeof out === "string" ? textEncoder.encode(out) : new Uint8Array(out);
      return resultFile("Audio Compressor", new Blob([bytes], { type: "audio/mpeg" }), `${fileNameWithoutExt(file!.name)}-compressed.mp3`, "audio/mpeg");
    }

    case "audioCut": {
      const start = Math.max(0, n(args.start, 0));
      const end = Math.max(start + 1, n(args.end, start + 10));
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const inputName = `input${file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp3"}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      await ffmpeg.exec(["-ss", String(start), "-to", String(end), "-i", inputName, "-c:a", "libmp3lame", "output.mp3"]);
      const out = await ffmpeg.readFile("output.mp3");
      const bytes = typeof out === "string" ? textEncoder.encode(out) : new Uint8Array(out);
      return resultFile("Audio Cutter", new Blob([bytes], { type: "audio/mpeg" }), `${fileNameWithoutExt(file!.name)}-cut.mp3`, "audio/mpeg");
    }

    case "audioMerge": {
      const source = files.length ? files : [file!];
      if (source.length < 2) return resultText("Audio Merge", "Add at least two audio files.");
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const names: string[] = [];
      for (const src of source) {
        const ext = src.name.includes(".") ? src.name.slice(src.name.lastIndexOf(".")) : ".mp3";
        const name = `audio-${names.length}${ext}`;
        names.push(name);
        await ffmpeg.writeFile(name, await fetchFile(src));
      }
      const list = names.map((name) => `file '${name}'`).join("\n");
      await ffmpeg.writeFile("list.txt", textEncoder.encode(list));
      await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c:a", "libmp3lame", "output.mp3"]);
      const out = await ffmpeg.readFile("output.mp3");
      const bytes = typeof out === "string" ? textEncoder.encode(out) : new Uint8Array(out);
      return resultFile("Audio Merger", new Blob([bytes], { type: "audio/mpeg" }), "merged-audio.mp3", "audio/mpeg");
    }

    case "audioConvert": {
      const format = safeString(args.format, "audio/mpeg");
      const ext = extensionFromMime(format);
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const inputName = `input${file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".wav"}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      await ffmpeg.exec(["-i", inputName, `output.${ext}`]);
      const out = await ffmpeg.readFile(`output.${ext}`);
      const bytes = typeof out === "string" ? textEncoder.encode(out) : new Uint8Array(out);
      return resultFile("Audio Converter", new Blob([bytes], { type: format }), `${fileNameWithoutExt(file!.name)}.${ext}`, format);
    }

    case "audioNormalize": {
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const inputName = `input${file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp3"}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      await ffmpeg.exec(["-i", inputName, "-filter:a", "loudnorm", "output.mp3"]);
      const out = await ffmpeg.readFile("output.mp3");
      const bytes = typeof out === "string" ? textEncoder.encode(out) : new Uint8Array(out);
      return resultFile("Audio Normalizer", new Blob([bytes], { type: "audio/mpeg" }), `${fileNameWithoutExt(file!.name)}-normalized.mp3`, "audio/mpeg");
    }

    case "muteVideo": {
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const inputName = `input${file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp4"}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      await ffmpeg.exec(["-i", inputName, "-an", "-c:v", "copy", "output.mp4"]);
      const out = await ffmpeg.readFile("output.mp4");
      const bytes = typeof out === "string" ? textEncoder.encode(out) : new Uint8Array(out);
      return resultFile("Muted Video", new Blob([bytes], { type: "video/mp4" }), `${fileNameWithoutExt(file!.name)}-muted.mp4`, "video/mp4");
    }

    default:
      return resultText("Media Tool", "Upload a video or audio file first.");
  }
}

async function handleTextTool(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  const input = normalizeWhitespace(safeString(args.input, ""));
  const secondary = safeString(args.secondary, "");
  const slug = getToolSlug(args);

  switch (key) {
    case "textStats": {
      if (slug.includes("character")) {
        return resultText("Character Counter", `${countCharacters(safeString(args.input, ""))} characters`);
      }
      const words = countWords(safeString(args.input, ""));
      return resultText("Word Counter", `${words} words`);
    }

    case "caseConverter": {
      const mode = safeString(args.mode, "title");
      const source = safeString(args.input, "");
      const value =
        mode === "upper"
          ? source.toUpperCase()
          : mode === "lower"
            ? source.toLowerCase()
            : mode === "sentence"
              ? source.charAt(0).toUpperCase() + source.slice(1).toLowerCase()
              : mode === "camel"
                ? source
                    .toLowerCase()
                    .split(/\s+/)
                    .map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
                    .join("")
                : mode === "pascal"
                  ? source
                      .toLowerCase()
                      .split(/\s+/)
                      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                      .join("")
                  : mode === "snake"
                    ? slugify(source).replace(/-/g, "_")
                    : mode === "kebab"
                      ? slugify(source)
                      : titleCase(source);
      return resultText("Case Converter", value);
    }

    case "loremGenerator":
      return resultText("Lorem Ipsum Generator", loremText(Math.max(1, n(args.paragraphs, 2))));

    case "lineSorter":
      return resultText("Line Sorter", safeString(args.input, "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).sort((a, b) => a.localeCompare(b)).join("\n"));

    case "duplicateLines": {
      const seen = new Set<string>();
      const lines = safeString(args.input, "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      const output = lines.filter((line) => {
        const key = line.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return resultText("Duplicate Line Remover", output.join("\n"));
    }

    case "sentenceSplitter":
      return resultText("Sentence Splitter", safeString(args.input, "").match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean).join("\n") || "");

    case "paragraphRewriter":
      return resultText("Paragraph Rewriter", safeString(args.input, "").split(/\n{2,}/).map((part) => normalizeWhitespace(part)).filter(Boolean).join("\n\n"));

    case "readingTime": {
      const stats = readingTime(safeString(args.input, ""));
      return resultText("Reading Time", `${stats.words} words\n~${stats.minutes} min read`);
    }

    case "textCleaner":
      return resultText("Text Cleaner", normalizeWhitespace(safeString(args.input, "")).replace(/\s*\n\s*/g, "\n"));

    case "slugGenerator":
      return resultText("Slug Generator", slugify(safeString(args.input, "")));

    case "titleCase":
      return resultText("Title Case", titleCase(safeString(args.input, "")));

    case "textCompare":
      return resultText("Text Compare", diffLines(safeString(args.input, ""), secondary));

    case "randomText":
      return resultText("Random Text Generator", randomText(Math.max(6, n(args.words, 24))));

    case "summarizerAssist":
      return resultText("Summarizer Helper", summarizeText(safeString(args.input, "")));

    case "keywordExtractor":
      return resultText("Keyword Extractor", extractKeywords(safeString(args.input, "")));

    default:
      return resultText("Text Tool", safeString(args.input, ""));
  }
}

async function handleDevTool(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  const input = safeString(args.input, "");
  const secondary = safeString(args.secondary, "");
  const slug = getToolSlug(args);

  switch (key) {
    case "jsonFormat": {
      const value = JSON.stringify(JSON.parse(input), null, 2);
      return resultText("JSON Formatter", value);
    }
    case "jsonMinify":
      return resultText("JSON Minifier", JSON.stringify(JSON.parse(input)));
    case "base64Codec":
      return resultText("Base64 Codec", safeString(args.mode, "encode") === "decode" ? base64Decode(input) : base64Encode(input));
    case "jwtDecode": {
      const token = input.trim();
      const [head, body, sig] = token.split(".");
      const decode = (part?: string) => (part ? JSON.parse(base64Decode(part.replace(/-/g, "+").replace(/_/g, "/"))) : null);
      return resultText("JWT Decoder", JSON.stringify({ header: decode(head), payload: decode(body), signature: sig || "" }, null, 2));
    }
    case "sqlFormat":
      return resultText("SQL Formatter", input.replace(/\s+/g, " ").replace(/\b(select|from|where|group by|order by|limit|insert into|values|update|set|delete from)\b/gi, "\n$1"));
    case "htmlMinify":
      return resultText("HTML Minifier", input.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim());
    case "cssMinify":
      return resultText("CSS Minifier", input.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s{2,}/g, " ").replace(/\s*([{}:;,])\s*/g, "$1").trim());
    case "jsMinify":
      return resultText("JS Minifier", input.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s{2,}/g, " ").trim());
    case "urlCodec":
      return resultText("URL Codec", safeString(args.mode, "encode") === "decode" ? decodeUrl(input) : encodeUrl(input));
    case "regexTester": {
      const pattern = safeString(args.pattern || args.secondary || input, input);
      const flags = safeString(args.flags, "g");
      const regex = new RegExp(pattern, flags.includes("g") ? flags : `${flags}g`);
      const matches = Array.from(safeString(args.input || "", "").matchAll(regex)).map((match) => match[0]);
      return resultText("Regex Tester", matches.length ? matches.join("\n") : "No matches");
    }
    case "uuidGenerator":
      return resultText("UUID Generator", Array.from({ length: Math.max(1, n(args.count, 1)) }, () => (crypto?.randomUUID?.() || `uuid-${Date.now()}-${Math.random().toString(16).slice(2)}`)).join("\n"));
    case "hashGenerator": {
      const text = input || secondary;
      let hash = 2166136261;
      for (let i = 0; i < text.length; i += 1) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
      }
      return resultText("Hash Generator", `hash_${(hash >>> 0).toString(16)}`);
    }
    case "timestampConverter": {
      const value = input.trim();
      const parsed = Number(value);
      const date = Number.isFinite(parsed) ? new Date(parsed < 1e12 ? parsed * 1000 : parsed) : new Date(value);
      return resultText("Timestamp Converter", [date.toISOString(), date.toLocaleString(), String(date.getTime())].join("\n"));
    }
    case "cronGenerator": {
      const schedule = safeString(args.schedule, "daily");
      const cron =
        schedule === "weekly"
          ? "0 9 * * 1"
          : schedule === "monthly"
            ? "0 9 1 * *"
            : schedule === "hourly"
              ? "0 * * * *"
              : "0 9 * * *";
      return resultText("Cron Generator", cron);
    }
    case "diffChecker":
      return resultText("Diff Checker", diffLines(input, secondary));
    case "colorConverter": {
      const color = parseColor(input || secondary);
      if (!color) return resultText("Color Converter", "Enter a hex or RGB color first.");
      const hsl = rgbToHsl(color.r, color.g, color.b);
      return resultText("Color Converter", `HEX ${color.hex}\nRGB ${color.r}, ${color.g}, ${color.b}\nHSL ${hsl.h}, ${hsl.s}%, ${hsl.l}%`);
    }
    case "markdownPreview": {
      const html = simpleMarkdownToHtml(input);
      return resultFile("Markdown Preview", makeBlob(html, "text/html"), "preview.html", "text/html");
    }
    case "yamlFormat":
      return resultText("YAML Formatter", safeString(args.mode, "pretty") === "minify" ? input.replace(/\n+/g, "\n").trim() : input.split(/\r?\n/).map((line) => line.replace(/\t/g, "  ")).join("\n").trim());
    case "xmlFormat":
      return resultText("XML Formatter", input.replace(/></g, ">\n<").replace(/\s{2,}/g, " ").trim());
    case "escapeUnescape":
      return resultText("Escape / Unescape Tool", safeString(args.mode, "escape") === "unescape" ? decodeURIComponent(input) : encodeURIComponent(input));
    case "codeSnippetFormatter":
      return resultText("Code Snippet Formatter", `\`\`\`${safeString(args.language, "txt")}\n${input.trim()}\n\`\`\``);
    case "apiRequestBuilder": {
      const url = safeString(args.url || secondary, "");
      const method = safeString(args.method, "GET").toUpperCase();
      const body = input.trim();
      const headers = safeString(args.headers, "").trim();
      return resultText("API Request Builder", [
        `fetch(${JSON.stringify(url)}, {`,
        `  method: ${JSON.stringify(method)},`,
        headers ? `  headers: ${headers},` : "",
        body ? `  body: ${JSON.stringify(body)},` : "",
        `});`,
      ].filter(Boolean).join("\n"));
    }
    default:
      return resultText("Dev Tool", slug || input);
  }
}

async function handleSocialTool(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  const input = safeString(args.input, "");
  const secondary = safeString(args.secondary, "");
  const tone = safeString(args.tone, "clear");
  const platform = safeString(args.platform, "social");
  const count = Math.max(1, n(args.count, 5));

  switch (key) {
    case "socialThumbnail":
      return resultText("Thumbnail Generator", `Headline: ${input || "Your title here"}\nSubhead: ${secondary || "Short supporting line"}\nPlatform: ${platform}`);
    case "socialCaption":
      return resultText("Caption Generator", Array.from({ length: count }, (_, i) => `${i + 1}. ${tone} caption idea for ${input || secondary || "your post"}`).join("\n"));
    case "socialHashtags":
      return resultText("Hashtag Generator", Array.from(new Set((input || secondary || "").toLowerCase().match(/[a-z0-9]+/g) || [])).slice(0, 12).map((tag) => `#${tag}`).join(" "));
    case "postPlanner":
      return resultText("Post Planner", Array.from({ length: count }, (_, i) => `Day ${i + 1}: ${tone} post about ${input || "your topic"}`).join("\n"));
    case "socialBio":
      return resultText("Bio Generator", `${tone} creator focused on ${input || "useful work"}.\n${secondary || ""}`.trim());
    case "socialFormat":
      return resultText("Social Post Formatter", `Platform: ${platform}\n\n${input.trim()}`);
    case "socialRatios":
      return resultText("Aspect Ratio Presets", ["1:1", "4:5", "9:16", "16:9", "3:2"].join("\n"));
    case "profileResize":
      return resultText("Profile Image Resizer", `Target size: ${safeString(args.size, "1080x1080")}`);
    case "socialSizeConvert":
      return resultText("Size Converter", `Source: ${safeString(args.from, "1:1")}\nTarget: ${safeString(args.to, "9:16")}`);
    case "contentIdeas":
      return resultText("Content Idea Generator", Array.from({ length: count }, (_, i) => `${i + 1}. ${tone} idea for ${input || "your niche"}`).join("\n"));
    case "titleGenerator":
      return resultText("Title Generator", Array.from({ length: count }, (_, i) => `${i + 1}. ${titleCase(input || "your topic")} ${i + 1}`).join("\n"));
    case "hookGenerator":
      return resultText("Hook Generator", Array.from({ length: count }, (_, i) => `${i + 1}. ${tone} hook about ${input || "your subject"}`).join("\n"));
    case "scriptHelper":
      return resultText("Script Helper", `Hook: ${input || "Start strong"}\nBody: ${secondary || "Add steps, proof, and value"}\nCTA: Keep it short and specific.`);
    default:
      return resultText("Social Tool", input);
  }
}

async function handleUnitTool(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  switch (key) {
    case "currencyConverter": {
      const amount = n(args.amount, 1);
      const rate = n(args.rate, 1);
      return resultText("Currency Converter", `${formatNumber(amount)} ${safeString(args.from, "BASE")} = ${formatNumber(amount * rate)} ${safeString(args.to, "TARGET")} at rate ${rate}`);
    }
    case "unitConverter": {
      const toolSlug = getToolSlug(args);
      const value = n(args.value, 1);
      const from = safeString(args.from, "");
      const to = safeString(args.to, "");
      const kind = toolSlug.includes("temperature") ? "temperature" : toolSlug.includes("speed") ? "speed" : toolSlug.includes("area") ? "area" : toolSlug.includes("weight") ? "weight" : "length";
      const converted = unitConverter(kind, value, from, to);
      return resultText("Unit Converter", `${formatNumber(value)} ${from} = ${formatNumber(converted)} ${to}`);
    }
    case "percentageCalculator": {
      const base = n(args.base, 0);
      const percent = n(args.percent, 0);
      return resultText("Percentage Calculator", `${percent}% of ${base} = ${formatNumber((base * percent) / 100)}`);
    }
    case "bmiCalculator": {
      const weight = n(args.weight, 0);
      const height = n(args.height, 0);
      const meters = height > 10 ? height / 100 : height;
      const bmi = weight / (meters * meters);
      return resultText("BMI Calculator", `BMI ${formatNumber(bmi, 1)}\n${bmi < 18.5 ? "Underweight" : bmi < 25 ? "Healthy" : bmi < 30 ? "Overweight" : "Obese"}`);
    }
    case "tipCalculator": {
      const bill = n(args.bill, 0);
      const tip = n(args.tip, 0);
      const people = Math.max(1, n(args.people, 1));
      const total = bill + (bill * tip) / 100;
      return resultText("Tip Calculator", `Bill: ${formatNumber(bill)}\nTip: ${formatNumber((bill * tip) / 100)}\nTotal: ${formatNumber(total)}\nEach: ${formatNumber(total / people)}`);
    }
    case "loanCalculator": {
      const principal = n(args.principal, 0);
      const rate = n(args.rate, 0);
      const years = n(args.years, 1);
      const monthly = rate / 100 / 12;
      const payments = years * 12;
      const payment = monthly ? (principal * monthly) / (1 - Math.pow(1 + monthly, -payments)) : principal / payments;
      return resultText("Loan Calculator", `Monthly: ${formatNumber(payment)}\nTotal: ${formatNumber(payment * payments)}\nInterest: ${formatNumber(payment * payments - principal)}`);
    }
    case "taxCalculator": {
      const amount = n(args.amount, 0);
      const rate = n(args.rate, 0);
      const tax = (amount * rate) / 100;
      return resultText("Tax Calculator", `Amount: ${formatNumber(amount)}\nTax: ${formatNumber(tax)}\nTotal: ${formatNumber(amount + tax)}`);
    }
    case "discountCalculator": {
      const amount = n(args.amount, 0);
      const discount = n(args.discount, 0);
      const off = (amount * discount) / 100;
      return resultText("Discount Calculator", `Original: ${formatNumber(amount)}\nDiscount: ${formatNumber(off)}\nFinal: ${formatNumber(amount - off)}`);
    }
    case "basicMathCalculator": {
      const value = safeEval(safeString(args.input, "0"));
      return resultText("Basic Math Calculator", formatNumber(value, 6));
    }
    case "dateCalculator": {
      const date = new Date(safeString(args.date, new Date().toISOString()));
      const days = n(args.days, 0);
      const next = new Date(date.getTime() + days * 86400000);
      return resultText("Date Calculator", `${date.toDateString()}\n+\n${days} day(s)\n=\n${next.toDateString()}`);
    }
    case "ageCalculator": {
      const birth = new Date(safeString(args.date, "2000-01-01"));
      const diff = Date.now() - birth.getTime();
      const years = Math.floor(diff / 31557600000);
      return resultText("Age Calculator", `${years} years old`);
    }
    default:
      return resultText("Calculator", "Enter the required values to continue.");
  }
}

async function handleFileTool(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  const file = args.file;
  const files = Array.isArray(args.files) ? args.files.filter(Boolean) : [];
  if (!file && !files.length) return resultText("File Tool", "Upload one or more files first.");

  switch (key) {
    case "fileInfo": {
      const current = file || files[0];
      const text = [
        `Name: ${current.name}`,
        `Type: ${current.type || "unknown"}`,
        `Size: ${(current.size / 1024 / 1024).toFixed(2)} MB`,
      ];
      if (current.type === "application/pdf") {
        const pdf = await PDFDocument.load(await current.arrayBuffer());
        text.push(`Pages: ${pdf.getPageCount()}`);
      }
      return resultText("File Info", text.join("\n"));
    }
    case "fileRenamer": {
      const current = file || files[0];
      const prefix = safeString(args.prefix, "");
      const suffix = safeString(args.suffix, "");
      const newName = `${prefix}${fileNameWithoutExt(current.name)}${suffix}${current.name.includes(".") ? current.name.slice(current.name.lastIndexOf(".")) : ""}`;
      return resultFile("File Renamer", new Blob([await current.arrayBuffer()], { type: current.type || "application/octet-stream" }), newName, current.type || "application/octet-stream", "Renamed copy ready.");
    }
    case "folderOrganizer":
      return resultText("Folder Organizer", files.length ? Array.from(new Set(files.map((item) => (item.name.split(".").pop() || "misc").toLowerCase()))).map((group) => `/${group}`).join("\n") : "Choose files to generate an organization plan.");
    case "checksumTool": {
      const current = file || files[0];
      const bytes = await readFileBytes(current);
      let hash = 2166136261;
      for (const byte of bytes) {
        hash ^= byte;
        hash = Math.imul(hash, 16777619);
      }
      return resultText("Checksum Tool", `fnv1a_${(hash >>> 0).toString(16)}`);
    }
    case "duplicateFinder": {
      if (files.length < 2) return resultText("Duplicate Finder", "Add at least two files.");
      const summary = files.map((item) => `${item.name} — ${(item.size / 1024).toFixed(1)} KB`).join("\n");
      return resultText("Duplicate Finder", summary);
    }
    case "pageCounter": {
      const current = file || files[0];
      if (current.type === "application/pdf") {
        const pdf = await PDFDocument.load(await current.arrayBuffer());
        return resultText("Page Counter", `${pdf.getPageCount()} pages`);
      }
      const approx = Math.max(1, Math.ceil(countWords(await readFileText(current)) / 300));
      return resultText("Page Counter", `${approx} page(s) estimated`);
    }
    case "filenameSlugifier":
      return resultText("Filename Slugifier", slugify(safeString(args.fileName || args.input || file?.name || "", "")));
    default:
      return resultText("File Tool", safeString(args.input, ""));
  }
}

export async function runProcessorDispatch(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  if (key === "imageBgRemover" || key === "imageUpscale" || key === "imageCompress" || key === "imageResize" || key === "imageCrop" || key === "imageConvert" || key === "imageBlur" || key === "imageSharpen" || key === "imageRotate" || key === "imageFlip" || key === "colorPicker" || key === "memeGenerator" || key === "thumbnailMaker" || key === "stickerMaker" || key === "avatarMaker" || key === "passportPhoto" || key === "aspectRatio" || key === "imageEditor" || key === "imageMetadata" || key === "imageToPdf" || key === "transparentPng") {
    return await handleImageTool(key, args);
  }

  if (key === "pdfMerge" || key === "pdfSplit" || key === "pdfCompress" || key === "pdfRotate" || key === "pdfReorder" || key === "pdfRemovePages" || key === "pdfPageNumbers" || key === "pdfWatermark" || key === "pdfMetadata" || key === "imagesToPdf") {
    return await handlePdfTool(key, args);
  }

  if (key === "videoTrim" || key === "videoMerge" || key === "videoCompress" || key === "videoToMp3" || key === "muteVideo" || key === "playbackSpeed" || key === "reverseVideo" || key === "audioCompress" || key === "audioCut" || key === "audioMerge" || key === "audioConvert" || key === "audioNormalize" || key === "videoConvert" || key === "gifMaker" || key === "subtitleAdder" || key === "subtitleExtractor" || key === "frameGrabber" || key === "videoToGif") {
    return await handleMediaTool(key, args);
  }

  if (key === "socialThumbnail" || key === "socialCaption" || key === "socialHashtags" || key === "postPlanner" || key === "socialBio" || key === "socialFormat" || key === "socialRatios" || key === "profileResize" || key === "socialSizeConvert" || key === "contentIdeas" || key === "titleGenerator" || key === "hookGenerator" || key === "scriptHelper") {
    return await handleSocialTool(key, args);
  }

  if (key === "jsonFormat" || key === "jsonMinify" || key === "base64Codec" || key === "jwtDecode" || key === "sqlFormat" || key === "htmlMinify" || key === "cssMinify" || key === "jsMinify" || key === "urlCodec" || key === "regexTester" || key === "uuidGenerator" || key === "hashGenerator" || key === "timestampConverter" || key === "cronGenerator" || key === "diffChecker" || key === "colorConverter" || key === "markdownPreview" || key === "yamlFormat" || key === "xmlFormat" || key === "escapeUnescape" || key === "codeSnippetFormatter" || key === "apiRequestBuilder") {
    return await handleDevTool(key, args);
  }

  if (key === "textStats" || key === "caseConverter" || key === "loremGenerator" || key === "lineSorter" || key === "duplicateLines" || key === "sentenceSplitter" || key === "paragraphRewriter" || key === "readingTime" || key === "textCleaner" || key === "slugGenerator" || key === "titleCase" || key === "textCompare" || key === "randomText" || key === "translatorAssist" || key === "summarizerAssist" || key === "keywordExtractor") {
    return await handleTextTool(key, args);
  }

  if (key === "currencyConverter" || key === "unitConverter" || key === "percentageCalculator" || key === "bmiCalculator" || key === "tipCalculator" || key === "loanCalculator" || key === "taxCalculator" || key === "discountCalculator" || key === "basicMathCalculator" || key === "dateCalculator" || key === "ageCalculator") {
    return await handleUnitTool(key, args);
  }

  if (key === "fileInfo" || key === "fileRenamer" || key === "folderOrganizer" || key === "checksumTool" || key === "duplicateFinder" || key === "pageCounter" || key === "filenameSlugifier") {
    return await handleFileTool(key, args);
  }

  return resultText("Processor", `No processor is registered for "${key}".`);
}

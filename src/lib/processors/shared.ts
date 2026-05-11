import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import type { ProcessorArgs, ProcessorResult, ProcessorFileResult } from "./types";
import { backgroundRemoveImage } from "./anchor/background-remover";
import { convertVideoToMp3 } from "./video-to-mp3";
import { fileToImageBitmap, imageBitmapToCanvas, canvasToBlob } from "./image-utils";

export const textDecoder = new TextDecoder();
export const textEncoder = new TextEncoder();

export function n(value: unknown, fallback = 0) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

export function safeString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function titleCase(value: string) {
  return normalizeWhitespace(value)
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function slugify(value: string) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resultText(title: string, text: string, description?: string): ProcessorResult {
  return { title, text, description };
}

export function resultFile(
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

export function resultFiles(title: string, files: ProcessorFileResult[], description?: string): ProcessorResult {
  return { title, description, files };
}

export async function readFileText(file: File) {
  return await file.text();
}

export async function readFileBytes(file: File) {
  return new Uint8Array(await file.arrayBuffer());
}

export function fileNameWithoutExt(name: string) {
  return name.replace(/\.[^.]+$/, "");
}

export function extensionFromMime(mime: string) {
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

export function makeBlob(text: string, type = "text/plain") {
  return new Blob([text], { type });
}

export function base64Encode(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

export function base64Decode(value: string) {
  return decodeURIComponent(escape(atob(value.trim())));
}

export function encodeUrl(value: string) {
  return encodeURIComponent(value);
}

export function decodeUrl(value: string) {
  return decodeURIComponent(value);
}

export function countWords(text: string) {
  const matches = text.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

export function countLines(text: string) {
  return text.trim() ? text.split(/\r?\n/).length : 0;
}

export function countCharacters(text: string) {
  return text.length;
}

export function readingTime(text: string) {
  const words = countWords(text);
  const minutes = Math.max(1, Math.ceil(words / 220));
  return { words, minutes };
}

export function randomText(words = 24) {
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

export function loremText(paragraphs = 2) {
  const base = "A clean workflow keeps the result easy to scan and simple to finish.";
  return Array.from({ length: paragraphs }, () => base).join("\n\n");
}

export function extractKeywords(text: string) {
  const words = text.toLowerCase().match(/[a-z0-9]+/g) || [];
  const freq = new Map<string, number>();
  for (const word of words) freq.set(word, (freq.get(word) || 0) + 1);
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word]) => word)
    .join(", ");
}

export function summarizeText(text: string) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  return sentences.slice(0, 3).join(" ");
}

export function diffLines(left: string, right: string) {
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

export function simpleMarkdownToHtml(markdown: string) {
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

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function parseColor(input: string) {
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

export function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
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

export function safeEval(expression: string) {
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

export function formatNumber(value: number, decimals = 2) {
  return Number.isInteger(value) ? String(value) : value.toFixed(decimals).replace(/\.?0+$/, "");
}

export function unitConverter(kind: string, value: number, from: string, to: string) {
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

export async function loadFfmpeg() {
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

export async function runFfmpeg(inputs: File[], outputName: string, execArgs: string[], mime: string) {
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

export async function loadImage(file: File) {
  const bitmap = await fileToImageBitmap(file);

  const canvas = document.createElement("canvas");

  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!ctx) {
    throw new Error("Canvas context unavailable.");
  }

  ctx.drawImage(bitmap, 0, 0);

  return {
    bitmap,
    canvas,
    ctx,
  };
}

export async function transformImage(
  file: File,
  draw: (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    bitmap: ImageBitmap,
  ) => void,
  type = "image/png",
  quality = 0.92,
) {
  const bitmap = await fileToImageBitmap(file);

  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!ctx) {
    throw new Error("Canvas context unavailable.");
  }

  draw(ctx, canvas, bitmap);

  return await canvasToBlob(canvas, type, quality);
}

export { PDFDocument, StandardFonts, degrees, rgb, backgroundRemoveImage, convertVideoToMp3 };
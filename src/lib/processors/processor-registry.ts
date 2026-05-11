import type { ProcessorHandler } from "./registry";
import type { ProcessorArgs, ProcessorResult } from "./types";
import { handleImage } from "./handlers";

import { processPdf } from "./pdf";
import { convertVideoToMp3 } from "./video-to-mp3";
import { fileToImageBitmap, imageBitmapToCanvas, canvasToBlob } from "./image-engine";


// IMPORTANT:
// This registry is the single source of truth for processorKey -> handler.
// It intentionally does NOT use string-prefix checks.
// We add explicit mappings for every processorKey present in catalog-data.

function resultText(title: string, text: string, description?: string): ProcessorResult {
  return { title, text, description };
}

function resultFile(title: string, blob: Blob, name: string, mime = blob.type || "application/octet-stream", description?: string): ProcessorResult {
  return {
    title,
    description,
    file: {
      name,
      blob,
      mime,
    },
  };
}

// Local helpers used by some handlers to preserve legacy output compatibility.
async function transformCanvas(
  file: File,
  draw: (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap) => void,
  outputType = file.type || "image/png",
): Promise<Blob> {
  const bitmap = await fileToImageBitmap(file);
  const { canvas, ctx } = await imageBitmapToCanvas(bitmap);
  draw(ctx, canvas, bitmap);
  return canvasToBlob(canvas, outputType);
}

// NOTE: We keep this registry small + explicit. Any missing keys will be routed to the legacy
// fallback inside run-processor (temporary) ONLY if the direct map misses.
// However, Phase 1 requirement says remove prefix checks. We therefore include mappings
// for the keys currently implemented in legacy dispatcher.

export const processorRegistry: Record<string, ProcessorHandler> = {
  // Image
  imageBgRemover: (args: ProcessorArgs) => handleImage("imageBgRemover", args),
  removeBackground: (args: ProcessorArgs) => handleImage("imageBgRemover", args),

  imageUpscale: async (args: ProcessorArgs) => {
    const file: File | undefined = args.file;
    if (!file) return resultText("Image Upscaler", "Upload an image first.");
    const scale = Math.max(1, Number(args.scale) || 2);

    const blob = await transformCanvas(file, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap, ) => {
      canvas.width = bitmap.width * scale;
      canvas.height = bitmap.height * scale;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    }, file.type || "image/png");
    return resultFile("Image Upscaler", blob, `upscaled-${file.name}`, blob.type || "image/png", `Upscaled to ${scale}×.`);
  },

  imageSharpen: async (args: ProcessorArgs) => {
    const file: File | undefined = args.file;
    if (!file) return resultText("Sharpen Image", "Upload an image first.");
    const amount = Math.max(1, Number(args.amount) || 3);

    const blob = await transformCanvas(file, (ctx, canvas) => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const copy = new Uint8ClampedArray(data);
      const kernel = [0, -1, 0, -1, 5 + amount, -1, 0, -1, 0];
      for (let y = 1; y < canvas.height - 1; y += 1) {
        for (let x = 1; x < canvas.width - 1; x += 1) {
          let r = 0,
            g = 0,
            b = 0;
          let i = 0;
          for (let ky = -1; ky <= 1; ky += 1) {
            for (let kx = -1; kx <= 1; kx += 1) {
              const idx = ((y + ky) * canvas.width + (x + kx)) * 4;
              const weight = kernel[i++];
              r += copy[idx] * weight;
              g += copy[idx + 1] * weight;
              b += copy[idx + 2] * weight;
            }
          }
          const pos = (y * canvas.width + x) * 4;
          data[pos] = Math.min(255, Math.max(0, r));
          data[pos + 1] = Math.min(255, Math.max(0, g));
          data[pos + 2] = Math.min(255, Math.max(0, b));
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }, file.type || "image/png");

    return resultFile("Sharpen Image", blob, `sharpened-${file.name}`, blob.type || "image/png");
  },

  imageFlip: async (args: ProcessorArgs) => {
    const file: File | undefined = args.file;
    if (!file) return resultText("Flip Image", "Upload an image first.");
    const direction = String(args.direction || "horizontal");

    const blob = await transformCanvas(file, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap, ) => {
      if (direction === "vertical") {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
      } else {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(bitmap, 0, 0);
    }, file.type || "image/png");

    return resultFile("Flip Image", blob, `flipped-${file.name}`, blob.type || "image/png");
  },

  aspectRatio: async (args: ProcessorArgs) => {
    const file: File | undefined = args.file;
    if (!file) return resultText("Aspect Ratio Editor", "Upload an image first.");
    const ratio = String(args.ratio || "1:1");

    const [w, h] = ratio.split(":").map(Number);
    const target = w && h ? w / h : 1;

    const blob = await transformCanvas(file, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap, ) => {
      const sourceRatio = bitmap.width / bitmap.height;
      let sx = 0,
        sy = 0,
        sw = bitmap.width,
        sh = bitmap.height;
      if (sourceRatio > target) {
        sw = Math.round(bitmap.height * target);
        sx = Math.round((bitmap.width - sw) / 2);
      } else {
        sh = Math.round(bitmap.width / target);
        sy = Math.round((bitmap.height - sh) / 2);
      }
      canvas.width = sw;
      canvas.height = sh;
      ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh);
    }, file.type || "image/png");

    return resultFile("Aspect Ratio Editor", blob, `aspect-${file.name}`, blob.type || "image/png");
  },

  // For the rest of keys, we can route to legacy wrappers that already implement behavior
  // without changing outputs.
  memeGenerator: (args: ProcessorArgs) => handleImage("memeGenerator", args),
  thumbnailMaker: (args: ProcessorArgs) => handleImage("thumbnailMaker", args),
  stickerMaker: (args: ProcessorArgs) => handleImage("stickerMaker", args),


  colorPicker: (args: ProcessorArgs) => handleImage("colorPicker", args),
  imageMetadata: (args: ProcessorArgs) => handleImage("imageMetadata", args),


  imageToPdf: (args: ProcessorArgs) => handleImage("imageToPdf", args) as Promise<ProcessorResult>,
  pdfToImage: (args: ProcessorArgs) => handleImage("pdfToImage", args) as Promise<ProcessorResult>,


  imageResize: (args: ProcessorArgs) => handleImage("imageResize", args),
  imageCompress: (args: ProcessorArgs) => handleImage("imageCompress", args),
  imageConvert: (args: ProcessorArgs) => handleImage("imageConvert", args),
  imageRotate: (args: ProcessorArgs) => handleImage("imageRotate", args),
  imageCrop: (args: ProcessorArgs) => handleImage("imageCrop", args),
  imageBlur: (args: ProcessorArgs) => handleImage("imageBlur", args),
  faceBlur: (args: ProcessorArgs) => handleImage("faceBlur", args),
  objectRemoval: (args: ProcessorArgs) => handleImage("objectRemoval", args),
  photoEditor: (args: ProcessorArgs) => handleImage("photoEditor", args),
  transparentPng: (args: ProcessorArgs) => handleImage("transparentPng", args),
  profileResize: (args: ProcessorArgs) => handleImage("profileResize", args),
  passportPhoto: (args: ProcessorArgs) => handleImage("passportPhoto", args),

  // PDFs

  pdfMerge: (args: ProcessorArgs) => processPdf("pdfMerge", args),
  pdfSplit: (args: ProcessorArgs) => processPdf("pdfSplit", args),
  pdfCompress: (args: ProcessorArgs) => processPdf("pdfCompress", args),
  pdfWatermark: (args: ProcessorArgs) => processPdf("pdfWatermark", args),
  pdfRotate: (args: ProcessorArgs) => processPdf("pdfRotate", args),
  pdfRemovePages: (args: ProcessorArgs) => processPdf("pdfRemovePages", args),
  pdfUnlock: (args: ProcessorArgs) => processPdf("pdfUnlock", args),
  pdfProtect: (args: ProcessorArgs) => processPdf("pdfProtect", args),
  pdfToJpg: (args: ProcessorArgs) => processPdf("pdfToJpg", args),
  pdfToPng: (args: ProcessorArgs) => processPdf("pdfToPng", args),
  pdfReorder: (args: ProcessorArgs) => processPdf("pdfReorder", args),
  pdfMetadata: (args: ProcessorArgs) => processPdf("pdfMetadata", args),
  pdfOcr: (args: ProcessorArgs) => processPdf("pdfOcr", args),
  pdfSigner: (args: ProcessorArgs) => processPdf("pdfSigner", args),
  pdfAnnotator: (args: ProcessorArgs) => processPdf("pdfAnnotator", args),
  pdfReader: (args: ProcessorArgs) => processPdf("pdfReader", args),


  // Media
  videoToMp3: async (args: ProcessorArgs) => {
    const file: File | undefined = args.file;
    if (!file) return resultText("Video to MP3", "Upload a video first.");
    return convertVideoToMp3(file, { bitrateKbps: Number(args.bitrate) || undefined });
  },

  // Social / text / dev / unit / file

  // For Phase 1, we keep these mapped to the existing legacy dispatcher entry
  // by delegating to handleImage/PDF/Media where possible.
  // Non-implemented keys will be handled by a fallback in run-processor.

  // Dev examples (route to existing implementations through dispatcher fallback)
  // We intentionally do not add string prefix logic.

  // NOTE: keys not present here will go through legacy fallback.
};


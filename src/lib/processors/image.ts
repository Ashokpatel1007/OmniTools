import type { ProcessorArgs, ProcessorResult } from "./types";

import {
  n,
  clamp,
  safeString,
  slugify,
  resultText,
  resultFile,
  transformImage,
  fileNameWithoutExt,
  extensionFromMime,
  loadImage,
  PDFDocument,
} from "./shared";

import {
  fileToImageBitmap,
  imageBitmapToCanvas,
  canvasToBlob,
} from "./image-utils";

import { backgroundRemoveImage } from "./anchor/background-remover";


function safeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const roundCtx = ctx as CanvasRenderingContext2D & {
    roundRect?: (
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number,
    ) => void;
  };

  if (typeof roundCtx.roundRect === "function") {
    roundCtx.roundRect(x, y, width, height, radius);
    return;
  }

  ctx.moveTo(x + radius, y);

  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);

  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height,
  );

  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);

  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}


export async function handleImageTool(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  const file = args.file;
  if (!file) return resultText("Image Tool", "Upload an image first.");

  switch (key) {
    case "imageBgRemover":
    case "transparentPng":
      return await backgroundRemoveImage(file, { sensitivity: n(args.sensitivity, 55) });

    case "imageUpscale": {
      const scale = clamp(n(args.scale, 2), 1, 4);
      const blob = await transformImage(file, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap, ) => {
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
      const blob = await transformImage(file, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap, ) => {
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      }, format, quality);
      const ext = extensionFromMime(blob.type || format);
      return resultFile("Image Compressor", blob, `${fileNameWithoutExt(file.name)}-compressed.${ext}`, blob.type || format, "Compressed image ready.");
    }

    case "imageResize": {
      const width = Math.max(1, n(args.width, 1200));
      const height = args.height ? Math.max(1, n(args.height, 0)) : 0;
      const blob = await transformImage(file, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap, ) => {
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
      const blob = await transformImage(file, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap, ) => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(bitmap, x, y, width, height, 0, 0, width, height);
      }, file.type || "image/png");
      return resultFile("Image Cropper", blob, `${fileNameWithoutExt(file.name)}-cropped.png`, blob.type || "image/png");
    }

    case "imageConvert": {
      const format = safeString(args.format, "image/png");
      const quality = clamp(n(args.quality, 0.92), 0.1, 1);
      const blob = await transformImage(file, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap, ) => {
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      }, format, quality);
      const ext = extensionFromMime(blob.type || format);
      return resultFile("Image Converter", blob, `${fileNameWithoutExt(file.name)}.${ext}`, blob.type || format);
    }

    case "imageBlur": {
      const amount = clamp(n(args.amount, 6), 0, 64);
      const blob = await transformImage(file, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap, ) => {
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
          data[pos] = Number(clamp(r, 0, 255));
          data[pos + 1] = Number(clamp(g, 0, 255));
          data[pos + 2] = Number(clamp(b, 0, 255));
        }
      }
      tempCtx.putImageData(imageData, 0, 0);
      const blob = await canvasToBlob(tempCanvas, file.type || "image/png");
      return resultFile("Sharpen Image", blob, `${fileNameWithoutExt(file.name)}-sharpened.png`, blob.type || "image/png");
    }

    case "imageRotate": {
      const degreesValue = clamp(n(args.degrees, 90), 90, 270);
      const blob = await transformImage(file, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap, ) => {
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
      const blob = await transformImage(file, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap, ) => {
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
      const hex = `#${[pixel[0], pixel[1], pixel[2]].map((part: number) => part.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
      return resultText("Color Picker", `${hex}\nRGB ${pixel[0]}, ${pixel[1]}, ${pixel[2]}\nSampled at ${Math.min(x, canvas.width - 1)}, ${Math.min(y, canvas.height - 1)}.`);
    }

    case "imageEditor": {
      const mode = safeString(args.mode, "natural");
      const amount = clamp(n(args.amount, 20), 1, 100);
      const blob = await transformImage(file, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap, ) => {
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
        const [rw, rh] = ratio.split(":").map((part: string) => Number(part) || 1);
        width = 1200; height = Math.round((1200 * rh) / rw);
      }
      const blob = await transformImage(file, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap, ) => {
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
          safeRoundRect(ctx,0, 0, width, height, Math.min(width, height) * 0.12);
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
          safeRoundRect(ctx,0, 0, width, height, 80);
          ctx.clip();
          ctx.drawImage(bitmap, x, y, imgW, imgH);
          ctx.restore();
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 24;
          ctx.beginPath();
          safeRoundRect(ctx,24, 24, width - 48, height - 48, 64);
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
        const pngBlob = await transformImage(imageFile, (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, bitmap: ImageBitmap, ) => {
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          ctx.drawImage(bitmap, 0, 0);
        }, "image/png");
        const embedded = await pdf.embedPng(await pngBlob.arrayBuffer());
        const page = pdf.addPage([embedded.width, embedded.height]);
        page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
      }
      const out = await pdf.save();
      return resultFile(
        "Image to PDF",
        new Blob([new Uint8Array(out)], {
          type: "application/pdf",
        }),
        `${fileNameWithoutExt(file.name)}.pdf`,
        "application/pdf"
      );
    }

    default:
      return resultText("Image Tool", "Upload an image first.");
  }
}
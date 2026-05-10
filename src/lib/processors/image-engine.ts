export type ImageProcessOperation =
  | "resize"
  | "compress"
  | "convert"
  | "rotate"
  | "crop"
  | "blur";

export async function fileToImageBitmap(file: File) {
  return await createImageBitmap(file);
}

export async function imageBitmapToCanvas(bitmap: ImageBitmap) {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  ctx.drawImage(bitmap, 0, 0);

  return { canvas, ctx };
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality = 0.92
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to export canvas"));
          return;
        }

        resolve(blob);
      },
      type,
      quality
    );
  });
}

export async function processImage(
  file: File,
  operation: ImageProcessOperation,
  options: any = {}
) {
  const bitmap = await fileToImageBitmap(file);

  const { canvas, ctx } = await imageBitmapToCanvas(bitmap);

  switch (operation) {
    case "resize": {
      const width = options.width || bitmap.width;
      const height =
        options.height ||
        Math.round((bitmap.height * width) / bitmap.width);

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(bitmap, 0, 0, width, height);

      return await canvasToBlob(
        canvas,
        file.type || "image/png",
        0.92
      );
    }

    case "compress": {
      return await canvasToBlob(
        canvas,
        "image/jpeg",
        options.quality || 0.7
      );
    }

    case "convert": {
      return await canvasToBlob(
        canvas,
        options.format || "image/png",
        0.92
      );
    }

    case "rotate": {
      const degrees = options.degrees || 90;

      const radians = (degrees * Math.PI) / 180;

      const rotatedCanvas = document.createElement("canvas");
      const rotatedCtx = rotatedCanvas.getContext("2d");

      if (!rotatedCtx) {
        throw new Error("Canvas context unavailable");
      }

      rotatedCanvas.width = bitmap.height;
      rotatedCanvas.height = bitmap.width;

      rotatedCtx.translate(
        rotatedCanvas.width / 2,
        rotatedCanvas.height / 2
      );

      rotatedCtx.rotate(radians);

      rotatedCtx.drawImage(
        bitmap,
        -bitmap.width / 2,
        -bitmap.height / 2
      );

      return await canvasToBlob(
        rotatedCanvas,
        file.type || "image/png",
        0.92
      );
    }

    case "crop": {
      const x = options.x || 0;
      const y = options.y || 0;

      const width = options.width || 300;
      const height = options.height || 300;

      const cropCanvas = document.createElement("canvas");

      cropCanvas.width = width;
      cropCanvas.height = height;

      const cropCtx = cropCanvas.getContext("2d");

      if (!cropCtx) {
        throw new Error("Canvas context unavailable");
      }

      cropCtx.drawImage(
        bitmap,
        x,
        y,
        width,
        height,
        0,
        0,
        width,
        height
      );

      return await canvasToBlob(cropCanvas);
    }

    case "blur": {
      ctx.filter = `blur(${options.amount || 5}px)`;

      ctx.drawImage(bitmap, 0, 0);

      return await canvasToBlob(canvas);
    }

    default:
      throw new Error("Unsupported operation");
  }
}
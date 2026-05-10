export async function fileToImageBitmap(file: File): Promise<ImageBitmap> {
  return await createImageBitmap(file);
}

export async function imageBitmapToCanvas(
  bitmap: ImageBitmap
): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }> {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context not available.");
  }

  ctx.drawImage(bitmap, 0, 0);
  return { canvas, ctx };
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = "image/png",
  quality = 0.92
): Promise<Blob> {
  return await new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to convert canvas to blob."));
          return;
        }
        resolve(blob);
      },
      type,
      quality
    );
  });
}
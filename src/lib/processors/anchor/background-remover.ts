"use client";

import type { ProcessorResult } from "@/lib/processors";

// Lawful, user-owned-content processing:
// This implements a simple, client-side background removal using a luminance-based alpha mask.
// It is intentionally lightweight (no external model downloads) and works best on images
// with clear separation between subject and background.
//
// For production-grade results, you can later swap this implementation behind the same API.

export type BackgroundRemoveOptions = {
  // 0..100 sensitivity; higher means more aggressive masking
  sensitivity?: number;
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

// TS DOM types sometimes infer `canvas.toBlob(...)` callback return as `Blob | null`.
// We always resolve to a Blob to satisfy ProcessorResult.file typing.



export async function backgroundRemoveImage(
  file: File,
  opts: BackgroundRemoveOptions = {},
): Promise<ProcessorResult> {
  const sensitivity = typeof opts.sensitivity === "number" ? opts.sensitivity : 55;
  const sensitivity01 = clamp01(sensitivity / 100);

  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload a valid image file.");
  }

  const imgUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = imgUrl;
    await img.decode();

    const canvas = document.createElement("canvas");
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas context unavailable.");

    ctx.drawImage(img, 0, 0, width, height);

    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    // Heuristic: compute luminance and convert to alpha mask.
    // We treat very bright pixels as background and fade them out.
    // This keeps edges somewhat usable for many simple use cases.
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

      // Map luminance to alpha.
      // sensitivity increases threshold aggressiveness.
      // threshold ~ 0.55..0.85 depending on sensitivity.
      const threshold = 0.55 + sensitivity01 * 0.3;
      const softness = 0.12; // fade band

      // If luminance is above threshold => background => alpha goes to 0.
      // Below threshold => subject => alpha stays 1.
      const t = (lum - threshold) / softness;
      let alpha = 1 - clamp01(t);

      // soften edges
      alpha = Math.pow(alpha, 1.35);

      // remove tiny edge noise
      if (alpha < 0.08) alpha = 0;

      data[i + 3] = Math.round(alpha * 255);
    }

    ctx.putImageData(imgData, 0, 0);

    const blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob(
        (b) => resolve(b || new Blob()),
        "image/png",
        1,
      ),
    );

    const outName = file.name.replace(/\.[^.]+$/, "") + "-bg-removed.png";

    return {
      title: "Background removed",
      description: "Your transparent PNG output is ready.",
      file: {
        name: outName || "omnitool-background-removed.png",
        blob,
        mime: "image/png",
      },
    };
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
}


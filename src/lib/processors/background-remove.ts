"use client";

export async function removeImageBackground(
  file: File
): Promise<Blob> {
  if (typeof window === "undefined") {
    throw new Error("Background removal only runs in browser.");
  }

  const mod = await import("@imgly/background-removal");

  const removeBackground =
    mod.removeBackground || mod.default;

  if (typeof removeBackground !== "function") {
    throw new Error("Failed to load background remover.");
  }

  return removeBackground(file, {
    progress: (
      _key: string,
      current: number,
      total: number
    ) => {
      const percent =
        total > 0
          ? Math.round((current / total) * 100)
          : 0;

      console.log(
        `[OmniTools] BG Removal: ${percent}%`
      );
    },
  });
}
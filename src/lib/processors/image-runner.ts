import { processImage } from "./image-engine";

export async function runImageTool(
  key: string,
  file: File,
  args: any = {}
) {
  switch (key) {
    case "imageResize":
      return await processImage(file, "resize", {
        width: Number(args.width) || 1200,
        height: Number(args.height) || undefined,
      });

    case "imageCompress":
      return await processImage(file, "compress", {
        quality: Number(args.quality) || 0.7,
      });

    case "imageConvert":
      return await processImage(file, "convert", {
        format: args.format || "image/png",
      });

    case "imageRotate":
      return await processImage(file, "rotate", {
        degrees: Number(args.degrees) || 90,
      });

    case "imageCrop":
      return await processImage(file, "crop", {
        x: Number(args.x) || 0,
        y: Number(args.y) || 0,
        width: Number(args.width) || 500,
        height: Number(args.height) || 500,
      });

    case "imageBlur":
      return await processImage(file, "blur", {
        amount: Number(args.amount) || 5,
      });

    case "imageBgRemover":
    case "backgroundRemover":
    case "removeBackground": {
      const { removeImageBackground } = await import("./background-remove");
      return await removeImageBackground(file);
    }

    default:
      throw new Error(`Unsupported image tool: ${key}`);
  }
}
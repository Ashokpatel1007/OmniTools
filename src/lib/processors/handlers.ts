import { runImageTool } from "./image-runner";
import type { ProcessorArgs, ProcessorResult } from "./types";
import { processPdf } from "./pdf";

export async function handleImage(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  const file: File | undefined = args.file;


  if (!file) {
    return {
      title: "Image Tool",
      text: "Upload an image first.",
    };
  }

  const blob: Blob = await runImageTool(key, file, args);

  return {
    title: key,
    file: {
      name: "output.png",
      blob,
      mime: blob.type || "image/png",
    },
  };
}

export async function handlePdf(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  return processPdf(key, args);
}

export async function handleMedia(_key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  void args;
  return {
    title: "Media Tool",
    text: "FFmpeg media processor connected separately.",
  };
}


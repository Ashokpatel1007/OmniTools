import type { ProcessorResult } from "./types";

export type VideoToMp3Options = {
  bitrateKbps?: number;
};

let ffmpegLoading: Promise<{
  FFmpeg: any;
  fetchFile: (input: File | Blob | string) => Promise<Uint8Array>;
}> | null = null;

async function loadFfmpeg() {
  if (!ffmpegLoading) {
    ffmpegLoading = Promise.all([
      import("@ffmpeg/ffmpeg"),
      import("@ffmpeg/util"),
    ]).then(([ffmpegModule, utilModule]) => ({
      FFmpeg: ffmpegModule.FFmpeg,
      fetchFile: utilModule.fetchFile,
    }));
  }

  return await ffmpegLoading;
}

export async function convertVideoToMp3(
  file: File,
  opts: VideoToMp3Options = {},
): Promise<ProcessorResult> {
  if (!file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
    throw new Error("Upload a valid video or audio file.");
  }

  const { FFmpeg, fetchFile } = await loadFfmpeg();

  const ffmpeg = new FFmpeg();

  await ffmpeg.load();

  const inputName = file.name.includes(".")
    ? `input${file.name.slice(file.name.lastIndexOf("."))}`
    : "input.mp4";

  const outputName = "output.mp3";

  const bitrate =
    typeof opts.bitrateKbps === "number"
      ? Math.max(32, Math.min(320, opts.bitrateKbps))
      : 192;

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  await ffmpeg.exec([
    "-i",
    inputName,
    "-vn",
    "-acodec",
    "libmp3lame",
    "-b:a",
    `${bitrate}k`,
    outputName,
  ]);

  const out = await ffmpeg.readFile(outputName);

  const bytes =
    typeof out === "string"
      ? new TextEncoder().encode(out)
      : new Uint8Array(out);

  const blob = new Blob([bytes], {
    type: "audio/mpeg",
  });

  return {
    title: "Video to MP3",
    description: "Your MP3 audio extraction is ready.",
    file: {
      name: `${file.name.replace(/\.[^.]+$/, "") || "omnitool"}-audio.mp3`,
      blob,
      mime: "audio/mpeg",
    },
  };
}
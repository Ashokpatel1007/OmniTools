import type { ProcessorArgs, ProcessorResult } from "./types";
import {
  clamp,
  extensionFromMime,
  fileNameWithoutExt,
  loadFfmpeg,
  resultFile,
  resultText,
  safeString,
  textEncoder,
  convertVideoToMp3,
  runFfmpeg,
} from "./shared";

function inputNameFor(file: File) {
  return `input-0${file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : ".bin"}`;
}

function outputBytesToBlob(out: string | Uint8Array, mime: string) {
  const bytes = typeof out === "string" ? textEncoder.encode(out) : new Uint8Array(out);
  return new Blob([bytes], { type: mime });
}

export async function handleMediaTool(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  const file = args.file;
  const files = Array.isArray(args.files) ? args.files.filter(Boolean) : [];
  if (!file && !files.length) return resultText("Media Tool", "Upload a video or audio file first.");

  switch (key) {
    case "videoToMp3":
      return await convertVideoToMp3(file!, { bitrateKbps: clamp(Number(args.bitrate || 192), 64, 320) });

    case "videoTrim": {
      const start = Math.max(0, Number(args.start || 0));
      const end = Math.max(start + 1, Number(args.end || start + 10));
      const blob = await runFfmpeg(
        [file!],
        "output.mp4",
        ["-ss", String(start), "-to", String(end), "-i", inputNameFor(file!), "-c:v", "libx264", "-c:a", "aac", "output.mp4"],
        "video/mp4"
      );
      return resultFile("Trimmed Video", blob, `${fileNameWithoutExt(file!.name)}-trimmed.mp4`, "video/mp4");
    }

    case "videoMerge": {
      const source = files.length ? files : [file!];
      if (source.length < 2) return resultText("Video Merge", "Add at least two video files.");

      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();

      const names: string[] = [];
      for (const src of source) {
        const ext = src.name.includes(".") ? src.name.slice(src.name.lastIndexOf(".")) : ".mp4";
        const name = `clip-${names.length}${ext}`;
        names.push(name);
        await ffmpeg.writeFile(name, await fetchFile(src));
      }

      const list = names.map((name) => `file '${name}'`).join("\n");
      await ffmpeg.writeFile("list.txt", textEncoder.encode(list));
      await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c:v", "libx264", "-c:a", "aac", "output.mp4"]);

      const out = await ffmpeg.readFile("output.mp4");
      return resultFile("Merged Video", outputBytesToBlob(out, "video/mp4"), "merged.mp4", "video/mp4");
    }

    case "videoCompress": {
      const quality = clamp(Number(args.quality || 28), 18, 35);
      const blob = await runFfmpeg(
        [file!],
        "output.mp4",
        ["-i", inputNameFor(file!), "-vf", "scale='min(1280,iw)':-2", "-c:v", "libx264", "-preset", "veryfast", "-crf", String(quality), "-c:a", "aac", "output.mp4"],
        "video/mp4"
      );
      return resultFile("Compressed Video", blob, `${fileNameWithoutExt(file!.name)}-compressed.mp4`, "video/mp4");
    }

    case "muteVideo": {
      const blob = await runFfmpeg(
        [file!],
        "output.mp4",
        ["-i", inputNameFor(file!), "-an", "-c:v", "copy", "output.mp4"],
        "video/mp4"
      );
      return resultFile("Muted Video", blob, `${fileNameWithoutExt(file!.name)}-muted.mp4`, "video/mp4");
    }

    case "playbackSpeed": {
      const speed = clamp(Number(args.speed || 1.25), 0.25, 4);
      const atempo = speed <= 2 ? `atempo=${speed}` : `atempo=2,atempo=${speed / 2}`;
      const blob = await runFfmpeg(
        [file!],
        "output.mp4",
        ["-i", inputNameFor(file!), "-filter:v", `setpts=${(1 / speed).toFixed(4)}*PTS`, "-filter:a", atempo, "output.mp4"],
        "video/mp4"
      );
      return resultFile("Playback Speed", blob, `${fileNameWithoutExt(file!.name)}-speed.mp4`, "video/mp4");
    }

    case "reverseVideo": {
      const blob = await runFfmpeg(
        [file!],
        "output.mp4",
        ["-i", inputNameFor(file!), "-vf", "reverse", "-af", "areverse", "output.mp4"],
        "video/mp4"
      );
      return resultFile("Reversed Video", blob, `${fileNameWithoutExt(file!.name)}-reversed.mp4`, "video/mp4");
    }

    case "videoConvert": {
      const format = safeString(args.format, "video/mp4");
      const outName = `output.${extensionFromMime(format)}`;
      const blob = await runFfmpeg(
        [file!],
        outName,
        ["-i", inputNameFor(file!), "-c:v", "libx264", "-c:a", "aac", outName],
        format
      );
      return resultFile("Video Converter", blob, `${fileNameWithoutExt(file!.name)}.${extensionFromMime(format)}`, format);
    }

    case "gifMaker":
    case "videoToGif": {
      const fps = clamp(Number(args.fps || 12), 1, 60);
      const blob = await runFfmpeg(
        [file!],
        "output.gif",
        ["-i", inputNameFor(file!), "-vf", `fps=${fps},scale=720:-1:flags=lanczos`, "output.gif"],
        "image/gif"
      );
      return resultFile(key === "gifMaker" ? "GIF Maker" : "Video to GIF", blob, `${fileNameWithoutExt(file!.name)}.gif`, "image/gif");
    }

    case "frameGrabber": {
      const time = Math.max(0, Number(args.time || 1));
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const inputName = inputNameFor(file!);
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      await ffmpeg.exec(["-ss", String(time), "-i", inputName, "-frames:v", "1", "frame.png"]);
      const out = await ffmpeg.readFile("frame.png");
      return resultFile(
        "Frame Grabber",
        outputBytesToBlob(out, "image/png"),
        `${fileNameWithoutExt(file!.name)}-frame.png`,
        "image/png"
      );
    }

    case "subtitleAdder": {
      const subtitleText = safeString(args.input || args.secondary || "", "");
      if (!subtitleText.trim()) return resultText("Subtitle Adder", "Paste subtitle text first.");

      const srt = subtitleText.includes("-->")
        ? subtitleText
        : `1\n00:00:00,000 --> 00:00:05,000\n${subtitleText.trim()}\n`;

      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();

      const inputName = inputNameFor(file!);
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      await ffmpeg.writeFile("subs.srt", textEncoder.encode(srt));
      await ffmpeg.exec(["-i", inputName, "-vf", "subtitles=subs.srt", "output.mp4"]);

      const out = await ffmpeg.readFile("output.mp4");
      return resultFile(
        "Subtitle Adder",
        outputBytesToBlob(out, "video/mp4"),
        `${fileNameWithoutExt(file!.name)}-subtitled.mp4`,
        "video/mp4"
      );
    }

    case "subtitleExtractor": {
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();

      const inputName = inputNameFor(file!);
      await ffmpeg.writeFile(inputName, await fetchFile(file!));

      try {
        await ffmpeg.exec(["-i", inputName, "-map", "0:s:0", "subs.srt"]);
        const out = await ffmpeg.readFile("subs.srt");
        return resultFile(
          "Subtitle Extractor",
          outputBytesToBlob(out, "text/plain"),
          `${fileNameWithoutExt(file!.name)}.srt`,
          "text/plain"
        );
      } catch {
        return resultText("Subtitle Extractor", "No embedded subtitle track was found.");
      }
    }

    case "audioCompress": {
      const bitrate = clamp(Number(args.bitrate || 128), 64, 320);
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const inputName = `input${file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp3"}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      await ffmpeg.exec(["-i", inputName, "-b:a", `${bitrate}k`, "output.mp3"]);
      const out = await ffmpeg.readFile("output.mp3");
      return resultFile(
        "Audio Compressor",
        outputBytesToBlob(out, "audio/mpeg"),
        `${fileNameWithoutExt(file!.name)}-compressed.mp3`,
        "audio/mpeg"
      );
    }

    case "audioCut": {
      const start = Math.max(0, Number(args.start || 0));
      const end = Math.max(start + 1, Number(args.end || start + 10));
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const inputName = `input${file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp3"}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      await ffmpeg.exec(["-ss", String(start), "-to", String(end), "-i", inputName, "-c:a", "libmp3lame", "output.mp3"]);
      const out = await ffmpeg.readFile("output.mp3");
      return resultFile(
        "Audio Cutter",
        outputBytesToBlob(out, "audio/mpeg"),
        `${fileNameWithoutExt(file!.name)}-cut.mp3`,
        "audio/mpeg"
      );
    }

    case "audioMerge": {
      const source = files.length ? files : [file!];
      if (source.length < 2) return resultText("Audio Merge", "Add at least two audio files.");

      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();

      const names: string[] = [];
      for (const src of source) {
        const ext = src.name.includes(".") ? src.name.slice(src.name.lastIndexOf(".")) : ".mp3";
        const name = `audio-${names.length}${ext}`;
        names.push(name);
        await ffmpeg.writeFile(name, await fetchFile(src));
      }

      const list = names.map((name) => `file '${name}'`).join("\n");
      await ffmpeg.writeFile("list.txt", textEncoder.encode(list));
      await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c:a", "libmp3lame", "output.mp3"]);

      const out = await ffmpeg.readFile("output.mp3");
      return resultFile("Audio Merger", outputBytesToBlob(out, "audio/mpeg"), "merged-audio.mp3", "audio/mpeg");
    }

    case "audioConvert": {
      const format = safeString(args.format, "audio/mpeg");
      const ext = extensionFromMime(format);
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const inputName = `input${file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".wav"}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      await ffmpeg.exec(["-i", inputName, `output.${ext}`]);
      const out = await ffmpeg.readFile(`output.${ext}`);
      return resultFile("Audio Converter", outputBytesToBlob(out, format), `${fileNameWithoutExt(file!.name)}.${ext}`, format);
    }

    case "audioNormalize": {
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const inputName = `input${file!.name.includes(".") ? file!.name.slice(file!.name.lastIndexOf(".")) : ".mp3"}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      await ffmpeg.exec(["-i", inputName, "-filter:a", "loudnorm", "output.mp3"]);
      const out = await ffmpeg.readFile("output.mp3");
      return resultFile("Audio Normalizer", outputBytesToBlob(out, "audio/mpeg"), `${fileNameWithoutExt(file!.name)}-normalized.mp3`, "audio/mpeg");
    }

    case "videoToMp3":
      return await convertVideoToMp3(file!, { bitrateKbps: clamp(Number(args.bitrate || 192), 64, 320) });

    case "muteVideo": {
      const { FFmpeg, fetchFile } = await loadFfmpeg();
      const ffmpeg = new FFmpeg();
      await ffmpeg.load();
      const inputName = inputNameFor(file!);
      await ffmpeg.writeFile(inputName, await fetchFile(file!));
      await ffmpeg.exec(["-i", inputName, "-an", "-c:v", "copy", "output.mp4"]);
      const out = await ffmpeg.readFile("output.mp4");
      return resultFile("Muted Video", outputBytesToBlob(out, "video/mp4"), `${fileNameWithoutExt(file!.name)}-muted.mp4`, "video/mp4");
    }

    default:
      return resultText("Media Tool", "Upload a video or audio file first.");
  }
}
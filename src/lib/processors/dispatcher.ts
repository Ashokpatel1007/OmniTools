import type {
  ProcessorArgs,
  ProcessorResult,
  ProcessorFileResult,
} from "./types";

import { backgroundRemoveImage } from "./anchor/background-remover";

import {
  n,
  safeString,
  normalizeWhitespace,
  titleCase,
  slugify,
  resultText,
  resultFile,
  resultFiles,
  readFileText,
  readFileBytes,
  fileNameWithoutExt,
  extensionFromMime,
  makeBlob,
  base64Encode,
  base64Decode,
  encodeUrl,
  decodeUrl,
  countWords,
  countLines,
  countCharacters,
  readingTime,
  randomText,
  loremText,
  extractKeywords,
  summarizeText,
  diffLines,
  simpleMarkdownToHtml,
  clamp,
  parseColor,
  rgbToHsl,
  safeEval,
  formatNumber,
  unitConverter,
} from "./shared";

import { handleImageTool } from "./image";
import { handlePdfTool } from "./pdf";
import { handleMediaTool } from "./media";
import { handleSocialTool } from "./social";
import { handleTextTool } from "./text";
import { handleUnitTool } from "./unit";
import { handleFileTool } from "./file";
import { handleDevTool } from "./dev";

import {
  fileToImageBitmap,
  imageBitmapToCanvas,
  canvasToBlob,
} from "./image-utils";



export async function runProcessorDispatch(key: string, args: ProcessorArgs): Promise<ProcessorResult> {
  if (key === "imageBgRemover" || key === "imageUpscale" || key === "imageCompress" || key === "imageResize" || key === "imageCrop" || key === "imageConvert" || key === "imageBlur" || key === "imageSharpen" || key === "imageRotate" || key === "imageFlip" || key === "colorPicker" || key === "memeGenerator" || key === "thumbnailMaker" || key === "stickerMaker" || key === "avatarMaker" || key === "passportPhoto" || key === "aspectRatio" || key === "imageEditor" || key === "imageMetadata" || key === "imageToPdf" || key === "transparentPng") {
    return await handleImageTool(key, args);
  }

  if (key === "pdfMerge" || key === "pdfSplit" || key === "pdfCompress" || key === "pdfRotate" || key === "pdfReorder" || key === "pdfRemovePages" || key === "pdfPageNumbers" || key === "pdfWatermark" || key === "pdfMetadata" || key === "imagesToPdf") {
    return await handlePdfTool(key, args);
  }

  if (key === "videoTrim" || key === "videoMerge" || key === "videoCompress" || key === "videoToMp3" || key === "muteVideo" || key === "playbackSpeed" || key === "reverseVideo" || key === "audioCompress" || key === "audioCut" || key === "audioMerge" || key === "audioConvert" || key === "audioNormalize" || key === "videoConvert" || key === "gifMaker" || key === "subtitleAdder" || key === "subtitleExtractor" || key === "frameGrabber" || key === "videoToGif") {
    return await handleMediaTool(key, args);
  }

  if (key === "socialThumbnail" || key === "socialCaption" || key === "socialHashtags" || key === "postPlanner" || key === "socialBio" || key === "socialFormat" || key === "socialRatios" || key === "profileResize" || key === "socialSizeConvert" || key === "contentIdeas" || key === "titleGenerator" || key === "hookGenerator" || key === "scriptHelper") {
    return await handleSocialTool(key, args);
  }

  if (key === "jsonFormat" || key === "jsonMinify" || key === "base64Codec" || key === "jwtDecode" || key === "sqlFormat" || key === "htmlMinify" || key === "cssMinify" || key === "jsMinify" || key === "urlCodec" || key === "regexTester" || key === "uuidGenerator" || key === "hashGenerator" || key === "timestampConverter" || key === "cronGenerator" || key === "diffChecker" || key === "colorConverter" || key === "markdownPreview" || key === "yamlFormat" || key === "xmlFormat" || key === "escapeUnescape" || key === "codeSnippetFormatter" || key === "apiRequestBuilder") {
    return await handleDevTool(key, args);
  }

  if (key === "textStats" || key === "caseConverter" || key === "loremGenerator" || key === "lineSorter" || key === "duplicateLines" || key === "sentenceSplitter" || key === "paragraphRewriter" || key === "readingTime" || key === "textCleaner" || key === "slugGenerator" || key === "titleCase" || key === "textCompare" || key === "randomText" || key === "translatorAssist" || key === "summarizerAssist" || key === "keywordExtractor") {
    return await handleTextTool(key, args);
  }

  if (key === "currencyConverter" || key === "unitConverter" || key === "percentageCalculator" || key === "bmiCalculator" || key === "tipCalculator" || key === "loanCalculator" || key === "taxCalculator" || key === "discountCalculator" || key === "basicMathCalculator" || key === "dateCalculator" || key === "ageCalculator") {
    return await handleUnitTool(key, args);
  }

  if (key === "fileInfo" || key === "fileRenamer" || key === "folderOrganizer" || key === "checksumTool" || key === "duplicateFinder" || key === "pageCounter" || key === "filenameSlugifier") {
    return await handleFileTool(key, args);
  }

  return resultText("Processor", `No processor is registered for "${key}".`);
}

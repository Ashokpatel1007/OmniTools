import type { ProcessorResult } from "./types";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

async function blobToArrayBuffer(blob: Blob) {
  return await blob.arrayBuffer();
}

function safeBlob(data: Uint8Array, type: string) {
  const copy = new Uint8Array(data);
  return new Blob([copy], { type });
}

export async function mergePdfs(files: File[]) {
  const merged = await PDFDocument.create();

  for (const file of files) {
    const bytes = await blobToArrayBuffer(file);
    const pdf = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }

  const out = await merged.save();
  return safeBlob(out, "application/pdf");
}

export async function splitPdf(file: File) {
  const bytes = await blobToArrayBuffer(file);
  const pdf = await PDFDocument.load(bytes);

  const docs: Blob[] = [];

  for (let i = 0; i < pdf.getPageCount(); i++) {
    const newPdf = await PDFDocument.create();
    const [page] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(page);
    const out = await newPdf.save();
    docs.push(safeBlob(out, "application/pdf"));
  }

  return docs;
}

export async function rotatePdf(file: File, rotation: 90 | 180 | 270 = 90) {
  const bytes = await blobToArrayBuffer(file);
  const pdf = await PDFDocument.load(bytes);

  pdf.getPages().forEach((p) => p.setRotation(degrees(rotation)));

  const out = await pdf.save();
  return safeBlob(out, "application/pdf");
}

export async function addPdfPageNumbers(file: File) {
  const bytes = await blobToArrayBuffer(file);
  const pdf = await PDFDocument.load(bytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  pdf.getPages().forEach((page, index) => {
    page.drawText(String(index + 1), {
      x: page.getWidth() - 30,
      y: 20,
      size: 10,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  const out = await pdf.save();
  return safeBlob(out, "application/pdf");
}

export async function imageToPdf(file: File) {
  const pdf = await PDFDocument.create();
  const bytes = await blobToArrayBuffer(file);

  const image = file.type.includes("png")
    ? await pdf.embedPng(bytes)
    : await pdf.embedJpg(bytes);

  const page = pdf.addPage([image.width, image.height]);

  page.drawImage(image, {
    x: 0,
    y: 0,
    width: image.width,
    height: image.height,
  });

  const out = await pdf.save();
  return safeBlob(out, "application/pdf");
}

export async function processPdf(key: string, args: any): Promise<ProcessorResult> {
  switch (key) {

    case "pdfMerge": {
      const blob = await mergePdfs(args.files || []);
      return {
        title: "Merged PDF",
        file: {
          name: "merged.pdf",
          blob,
          mime: "application/pdf",
        },
      };
    }

    case "pdfSplit": {
      const docs = await splitPdf(args.file);
      return {
        title: "Split PDF",
        text: `${docs.length} pages exported.`,
        file: {
          name: "page-1.pdf",
          blob: docs[0],
          mime: "application/pdf",
        },
      };
    }

    case "pdfRotate": {
      const blob = await rotatePdf(args.file, args.degrees || 90);
      return {
        title: "Rotated PDF",
        file: {
          name: "rotated.pdf",
          blob,
          mime: "application/pdf",
        },
      };
    }

    case "pdfPageNumbers": {
      const blob = await addPdfPageNumbers(args.file);
      return {
        title: "Numbered PDF",
        file: {
          name: "numbered.pdf",
          blob,
          mime: "application/pdf",
        },
      };
    }

    case "imageToPdf": {
      const blob = await imageToPdf(args.file);
      return {
        title: "Image to PDF",
        file: {
          name: "image.pdf",
          blob,
          mime: "application/pdf",
        },
      };
    }

    default:
      return {
        title: "PDF Tool",
        text: "PDF processor ready.",
      };
  }
}

export async function handlePdfTool(
  key: string,
  args: any,
) {
  return await processPdf(key, args);
}

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument } from "pdf-lib";

// @now - handle 2152.5 case!!!!!
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function mergePdfs(startChapter: number, endChapter: number) {
  const mergedPdf = await PDFDocument.create();
  const pdfDir = path.join(__dirname, "../mp"); // Directory where the PDFs are located

  let i = startChapter;
  while (i <= endChapter) {
    // Convert i to a string. If it's a whole number, remove the decimal part.
    let chapterStr = String(i);
    if (Number.isInteger(i) && chapterStr.includes(".")) {
      chapterStr = chapterStr.substring(0, chapterStr.indexOf("."));
    }

    const fileName = path.join(pdfDir, `${chapterStr}.pdf`);
    if (fs.existsSync(fileName)) {
      const pdfBytes = fs.readFileSync(fileName);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(
        pdfDoc,
        pdfDoc.getPageIndices()
      );
      copiedPages.forEach((page) => {
        mergedPdf.addPage(page);
      });
      console.log(`File ${fileName} has been added!!!!`);
    } else {
      console.log(`File ${fileName} does not exist.`);
    }
    i = Math.round((i + 0.1) * 10) / 10; // Increment by 0.1 and round to handle floating point precision issues
  }

  const outputFileName = path.join(
    pdfDir,
    `${startChapter}-to-${endChapter}.pdf`
  );
  const mergedPdfBytes = await mergedPdf.save();
  fs.writeFileSync(outputFileName, mergedPdfBytes);
  console.log(`Merged PDF saved as ${outputFileName}`);
}

// Get arguments from the command line
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log("Usage: node merge-pdfs.js <startChapter> <endChapter>");
  process.exit(1);
}

const startChapter = Number(args[0]);
const endChapter = Number(args[1]);

// Check if the arguments are numbers and startChapter is less than or equal to endChapter
if (
  !Number.isInteger(startChapter) ||
  !Number.isInteger(endChapter) ||
  startChapter > endChapter
) {
  console.log(
    "Please provide valid chapter numbers where the first is less than or equal to the second."
  );
  process.exit(1);
}

mergePdfs(startChapter, endChapter);

import express from "express";
import { jsPDF } from "jspdf";
import fetch from "node-fetch";
import cors from "cors";
import sharp from "sharp"; // Import sharp

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

app.post("/manhua", async (req, res) => {
  const imageUrls = req.body.imageUrls;
  const chapterNumber = req.body.chapterNumber;
  if (!imageUrls || imageUrls.length === 0) {
    return res.status(400).send("No image URLs provided.");
  }

  try {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    for (let i = 0; i < imageUrls.length; i++) {
      const imgData = await fetchImageAsBase64(imageUrls[i]);
      if (i > 0) doc.addPage();
      doc.addImage(imgData, "JPEG", 10, 10, 190, 280); // Adjust as needed
    }

    const pdfName = chapterNumber
      ? `${chapterNumber}.pdf`
      : `images-${Date.now()}.pdf`;
    doc.save(`./mp/${pdfName}`);
    res.send(`PDF created: ${pdfName}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error creating PDF");
  }
});

const fetchImageAsBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const buffer = await response.buffer();

  // Convert image to grayscale using sharp
  const grayBuffer = await sharp(buffer).grayscale().toBuffer();
  return `data:image/jpeg;base64,${grayBuffer.toString("base64")}`;
};

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

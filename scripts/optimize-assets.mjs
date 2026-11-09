import fs from "node:fs";
import sharp from "sharp";

const tasks = [
  {
    src: "src/app/icon.png",
    out: "src/app/icon.png",
    width: 128,
    height: 128,
    format: "png",
  },
  {
    src: "public/02-logo.png",
    out: "public/02-logo.png",
    width: 128,
    height: 128,
    format: "png",
  },
  {
    src: "public/nen-logo.png",
    out: "public/nen-logo.png",
    width: 128,
    height: 128,
    format: "png",
  },
  {
    src: "public/portrait-twitter.jpg",
    out: "public/portrait-twitter-256.webp",
    width: 256,
    height: 256,
    format: "webp",
  },
];

for (const task of tasks) {
  const input = fs.readFileSync(task.src);
  const pipeline = sharp(input).resize(task.width, task.height, {
    fit: "inside",
  });
  const output =
    task.format === "webp"
      ? await pipeline.webp({ quality: 82, effort: 6 }).toBuffer()
      : await pipeline
          .png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 })
          .toBuffer();
  fs.writeFileSync(task.out, output);
  console.log(`${task.out}: ${output.byteLength} bytes`);
}

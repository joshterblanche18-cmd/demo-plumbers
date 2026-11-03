// Makes small web versions of the source photos in photos-source/ and writes them to public/photos/.
// Includes a phone crop of the top photo and a share picture for link previews.
// Run: node scripts/images.mjs
import { mkdirSync, readFileSync, statSync } from "node:fs";
import sharp from "sharp";

const src = (name) => readFileSync(new URL(`../photos-source/${name}.jpg`, import.meta.url));
const out = (name) => new URL(`../public/photos/${name}`, import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

mkdirSync(new URL("../public/photos/", import.meta.url), { recursive: true });

const jobs = [
  { from: "granite-terrace", to: "granite-terrace.webp", width: 1800 },
  { from: "granite-terrace", to: "granite-terrace-phone.webp", width: 800, height: 520, position: "attention" },
  { from: "dripping-tap", to: "dripping-tap.webp", width: 800 },
  { from: "radiator", to: "radiator.webp", width: 560 },
  { from: "wrenches", to: "wrenches.webp", width: 560 },
  { from: "basin", to: "basin.webp", width: 560 },
  { from: "copper-pipes", to: "copper-pipes.webp", width: 800 },
];

for (const job of jobs) {
  const file = out(job.to);
  await sharp(src(job.from))
    .resize({ width: job.width, height: job.height, fit: "cover", position: job.position ?? "centre" })
    .webp({ quality: 72 })
    .toFile(file);
  console.log(job.to, `${Math.round(statSync(file).size / 1024)} KB`);
}

const share = out("share.jpg");
await sharp(src("granite-terrace")).resize({ width: 1200, height: 630, fit: "cover", position: "attention" }).jpeg({ quality: 74 }).toFile(share);
console.log("share.jpg", `${Math.round(statSync(share).size / 1024)} KB`);

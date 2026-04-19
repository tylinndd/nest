import sharp from "sharp";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const svgPath = fileURLToPath(new URL("../public/og-image.svg", import.meta.url));
const pngPath = fileURLToPath(new URL("../public/og-image.png", import.meta.url));

const svg = await fs.readFile(svgPath);
await sharp(svg, { density: 144 })
  .resize(1200, 630, { fit: "cover" })
  .png({ compressionLevel: 9 })
  .toFile(pngPath);

const stat = await fs.stat(pngPath);
console.log(`wrote og-image.png (${stat.size} bytes)`);

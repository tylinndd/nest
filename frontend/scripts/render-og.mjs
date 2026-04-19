import sharp from "sharp";
import fs from "node:fs/promises";

const svg = await fs.readFile(new URL("../public/og-image.svg", import.meta.url));
await sharp(svg, { density: 144 })
  .resize(1200, 630, { fit: "cover" })
  .png({ compressionLevel: 9 })
  .toFile(new URL("../public/og-image.png", import.meta.url).pathname);

const stat = await fs.stat(new URL("../public/og-image.png", import.meta.url));
console.log(`wrote og-image.png (${stat.size} bytes)`);

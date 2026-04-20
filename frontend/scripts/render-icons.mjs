import sharp from "sharp";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const publicDir = fileURLToPath(new URL("../public/", import.meta.url));

const targets = [
  { src: "icon.svg", out: "icon-192.png", size: 192 },
  { src: "icon.svg", out: "icon-512.png", size: 512 },
  { src: "icon-maskable.svg", out: "icon-maskable-192.png", size: 192 },
  { src: "icon-maskable.svg", out: "icon-maskable-512.png", size: 512 },
  { src: "icon.svg", out: "apple-touch-icon.png", size: 180 },
];

for (const { src, out, size } of targets) {
  const svg = await fs.readFile(publicDir + src);
  await sharp(svg, { density: 384 })
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(publicDir + out);
  const stat = await fs.stat(publicDir + out);
  console.log(`wrote ${out} (${size}×${size}, ${stat.size} bytes)`);
}

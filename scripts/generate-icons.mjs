// Gera os PNGs de ícone do PWA a partir do SVG mestre.
// Uso: npm i -D sharp && node scripts/generate-icons.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(path.join(__dirname, "assets/icon-maskable.svg"));
const outDir = path.join(__dirname, "..", "public", "icons");

const tamanhos = [192, 512];

async function gerar() {
  for (const tamanho of tamanhos) {
    await sharp(svg, { density: 384 })
      .resize(tamanho, tamanho)
      .png()
      .toFile(path.join(outDir, `icon-${tamanho}.png`));
    await sharp(svg, { density: 384 })
      .resize(tamanho, tamanho)
      .png()
      .toFile(path.join(outDir, `icon-maskable-${tamanho}.png`));
  }

  // Apple touch icon: sem transparência, 180x180, iOS aplica o próprio arredondamento.
  await sharp(svg, { density: 384 })
    .resize(180, 180)
    .flatten({ background: "#c2410c" })
    .png()
    .toFile(path.join(outDir, "..", "apple-touch-icon.png"));

  console.log("Ícones gerados em public/icons e public/apple-touch-icon.png");
}

gerar();

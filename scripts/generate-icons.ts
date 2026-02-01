import sharp from "sharp";
import path from "path";

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

const createSvg = (size: number) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#0f172a" rx="${Math.round(size * 0.125)}"/>
  <text x="${size / 2}" y="${size * 0.57}" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.25)}" font-weight="bold" fill="white" text-anchor="middle">RH</text>
  <text x="${size / 2}" y="${size * 0.75}" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.09)}" fill="#94a3b8" text-anchor="middle">RISKA HD</text>
</svg>
`;

async function generateIcons() {
  const outputDir = path.join(process.cwd(), "public", "icons");

  for (const size of sizes) {
    const svg = Buffer.from(createSvg(size));
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    await sharp(svg).png().toFile(outputPath);

    console.log(`Generated: icon-${size}x${size}.png`);
  }

  // Generate apple-touch-icon (180x180)
  const appleSvg = Buffer.from(createSvg(180));
  await sharp(appleSvg)
    .png()
    .toFile(path.join(process.cwd(), "public", "apple-touch-icon.png"));
  console.log("Generated: apple-touch-icon.png");

  // Generate favicon-32x32
  const favicon32Svg = Buffer.from(createSvg(32));
  await sharp(favicon32Svg)
    .png()
    .toFile(path.join(process.cwd(), "public", "favicon-32x32.png"));
  console.log("Generated: favicon-32x32.png");

  // Generate favicon-16x16
  const favicon16Svg = Buffer.from(createSvg(16));
  await sharp(favicon16Svg)
    .png()
    .toFile(path.join(process.cwd(), "public", "favicon-16x16.png"));
  console.log("Generated: favicon-16x16.png");

  console.log("\nAll icons generated successfully!");
}

generateIcons().catch(console.error);

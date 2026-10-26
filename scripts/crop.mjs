import sharp from "sharp";
const [src, out, top, h] = process.argv.slice(2);
await sharp(src).extract({ left: 0, top: +top, width: (await sharp(src).metadata()).width, height: +h }).toFile(out);

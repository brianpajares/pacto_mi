// Recorta los logos desde la portada del informe (962x1074) y los deja cuadrados, con el círculo ocupando todo el
// cuadro, para que el sello de la Embajada y el logo USPA se vean con el mismo diámetro (R-102).
// Reemplazar por los archivos vectoriales oficiales de la GOR cuando lleguen.
import sharp from "sharp";
const src = process.argv[2];
const crops = {
  "pacto-escudo": { left: 240, top: 12, width: 430, height: 478 },
  "pacto-wordmark": { left: 45, top: 492, width: 870, height: 215 },
  "sello-embajada": { left: 380, top: 818, width: 245, height: 240, square: true },
  "logo-uspa": { left: 672, top: 822, width: 265, height: 236, square: true },
};
for (const [name, { square, ...r }] of Object.entries(crops)) {
  let img = sharp(src).extract(r).flatten({ background: "#ffffff" });
  if (square) {
    const buf = await img.png().toBuffer();
    const trimmed = await sharp(buf).trim({ background: "#ffffff", threshold: 28 }).toBuffer({ resolveWithObject: true });
    const side = Math.max(trimmed.info.width, trimmed.info.height);
    img = sharp(trimmed.data).resize(side, side, { fit: "contain", background: "#ffffff" }).extend({ top: 4, bottom: 4, left: 4, right: 4, background: "#ffffff" });
    console.log(name, trimmed.info.width, trimmed.info.height);
  }
  const out = await img.png().toBuffer();
  await sharp(out).toFile(`public/logos/${name}.png`);
  await sharp(out).webp({ quality: 92 }).toFile(`public/logos/${name}.webp`);
}

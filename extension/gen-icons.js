/**
 * Generates icon16.png, icon48.png, icon128.png for the Chrome extension.
 * Run once: node extension/gen-icons.js
 * No external deps — uses Node built-in zlib.
 */
const zlib = require("zlib");
const fs   = require("fs");
const path = require("path");

// CRC32 lookup table
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const tp  = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([tp, data])));
  return Buffer.concat([len, tp, data, crc]);
}

function makePng(size, drawFn) {
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  // Raw image: filter byte per row + RGB pixels
  const raw = Buffer.alloc(size * (1 + size * 3), 0);
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 3)] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const [r, g, b] = drawFn(x, y, size);
      const off = y * (1 + size * 3) + 1 + x * 3;
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b;
    }
  }

  const sig  = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

// Brand colours
const PRIMARY   = [181, 83, 46];   // #B5532E
const BG        = [27, 26, 23];    // #1B1A17
const WHITE     = [255, 255, 255];

/**
 * 5×7 pixel font for digits + lowercase letters we need ("ct")
 * Each glyph is 5 cols × 7 rows, stored as 7 row bytes (bit 4 = leftmost).
 */
const GLYPHS = {
  c: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
  t: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
};

function renderGlyph(glyph, x0, y0, size, raw, fg) {
  const rows = GLYPHS[glyph];
  if (!rows) return;
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      const px = x0 + col, py = y0 + row;
      if (px < 0 || px >= size || py < 0 || py >= size) continue;
      if (rows[row] & (1 << (4 - col))) {
        const off = py * (1 + size * 3) + 1 + px * 3;
        raw[off] = fg[0]; raw[off + 1] = fg[1]; raw[off + 2] = fg[2];
      }
    }
  }
}

function drawIcon(x, y, size) {
  const pad = Math.round(size * 0.12);
  const r   = Math.round(size * 0.22); // corner radius

  // Rounded rect background: PRIMARY inside, transparent (BG) outside
  const dx = Math.max(0, Math.abs(x - (size / 2 - 0.5)) - (size / 2 - pad - r));
  const dy = Math.max(0, Math.abs(y - (size / 2 - 0.5)) - (size / 2 - pad - r));
  const inside = dx * dx + dy * dy <= r * r;
  return inside ? PRIMARY : BG;
}

// We render the text separately after making the raw buffer, so we need to
// restructure slightly — pass a mutable raw buffer into make.
function makePngWithText(size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2;

  const stride = 1 + size * 3;
  const raw    = Buffer.alloc(size * stride, 0);

  // Fill background + rounded-rect badge
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = drawIcon(x, y, size);
      const off = y * stride + 1 + x * 3;
      raw[off] = r; raw[off + 1] = g; raw[off + 2] = b;
    }
  }

  // Draw "ct" text only for sizes ≥ 48
  if (size >= 48) {
    const glyphW = 5, glyphH = 7, gap = 1;
    const totalW = glyphW + gap + glyphW;
    const totalH = glyphH;
    const tx = Math.round((size - totalW) / 2);
    const ty = Math.round((size - totalH) / 2);

    // Inline glyph render (works on raw buffer directly)
    const GLYPHS2 = {
      c: [0b01110, 0b10001, 0b10000, 0b10000, 0b10000, 0b10001, 0b01110],
      t: [0b11111, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100, 0b00100],
    };
    for (const [idx, glyph] of ["c", "t"].entries()) {
      const x0 = tx + idx * (glyphW + gap);
      const rows = GLYPHS2[glyph];
      for (let row = 0; row < 7; row++) {
        for (let col = 0; col < 5; col++) {
          if (!(rows[row] & (1 << (4 - col)))) continue;
          const px = x0 + col, py = ty + row;
          if (px < 0 || px >= size || py < 0 || py >= size) continue;
          const off = py * stride + 1 + px * 3;
          raw[off] = WHITE[0]; raw[off + 1] = WHITE[1]; raw[off + 2] = WHITE[2];
        }
      }
    }
  }

  const sig  = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

const iconsDir = path.join(__dirname, "icons");
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir);

for (const size of [16, 48, 128]) {
  const buf = makePngWithText(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), buf);
  console.log(`  icon${size}.png  (${buf.length} bytes)`);
}
console.log("Done — icons/ ready.");

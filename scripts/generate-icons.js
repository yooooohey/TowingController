import fs from 'node:fs';
import zlib from 'node:zlib';

function createPNG(width, height, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with scanline filter 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0: None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      // Border radius check for rounded icon look
      const cx = width / 2;
      const cy = height / 2;
      const dx = Math.abs(x - cx);
      const dy = Math.abs(y - cy);
      const radius = width * 0.45;
      
      // Basic shading
      const grad = (y / height) * 0.3;
      const curR = Math.min(255, Math.max(0, Math.round(r * (1 - grad))));
      const curG = Math.min(255, Math.max(0, Math.round(g * (1 - grad))));
      const curB = Math.min(255, Math.max(0, Math.round(b * (1 - grad * 0.5))));

      rawData[pixelOffset] = curR;
      rawData[pixelOffset + 1] = curG;
      rawData[pixelOffset + 2] = curB;
      rawData[pixelOffset + 3] = 255;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, body, crcBuf]);
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  }
  return ~c >>> 0;
}

const table = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[n] = c;
}

// Cyan / Marine Blue theme: R=8, G=145, B=178 (#0891b2)
fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, 8, 145, 178));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, 8, 145, 178));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPNG(512, 512, 8, 145, 178));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, 8, 145, 178));
console.log('PNG icons created successfully.');

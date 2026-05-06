// Generates placeholder PWA icons using only Node.js built-ins.
// Run: node scripts/generate-icons.js
// Replace the generated files with final brand assets before launch.
'use strict'

const fs = require('fs')
const zlib = require('zlib')
const path = require('path')

// CRC32 lookup table (PNG chunk checksum requirement)
const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  crcTable[n] = c
}

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.allocUnsafe(4)
  lenBuf.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.allocUnsafe(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])), 0)
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf])
}

function createSolidPNG(width, height, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // colour type: RGB
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  // Build one row then replicate — avoids redundant per-pixel work
  const rowSize = width * 3
  const row = Buffer.allocUnsafe(rowSize + 1)
  row[0] = 0 // filter type: None
  for (let x = 0; x < width; x++) {
    row[1 + x * 3] = r
    row[2 + x * 3] = g
    row[3 + x * 3] = b
  }
  const raw = Buffer.allocUnsafe((rowSize + 1) * height)
  for (let y = 0; y < height; y++) {
    row.copy(raw, y * (rowSize + 1))
  }

  const idat = zlib.deflateSync(raw, { level: 6 })

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0)),
  ])
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons')
fs.mkdirSync(iconsDir, { recursive: true })

// App background colour (#09090b = zinc-950)
const [r, g, b] = [9, 9, 11]

const icons = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  { file: 'apple-touch-icon.png', size: 180 },
]

for (const { file, size } of icons) {
  const dest = path.join(iconsDir, file)
  fs.writeFileSync(dest, createSolidPNG(size, size, r, g, b))
  console.log(`✓ ${file} (${size}×${size})`)
}

console.log(`\nIcons written to ${iconsDir}`)
console.log('Replace with final brand assets before launch.')

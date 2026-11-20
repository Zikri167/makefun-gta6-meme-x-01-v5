// GTA 6 meme v5 — "BREAKING NEWS" parody, drawn from scratch.
// Node stdlib only. Deterministic: no Date, no Math.random, no network.
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const W = 1024;
const H = 1024;
const px = new Uint8Array(W * H * 3);

function setPx(x, y, r, g, b) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = r; px[i + 1] = g; px[i + 2] = b;
}
function blendPx(x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = Math.round(px[i] * (1 - a) + r * a);
  px[i + 1] = Math.round(px[i + 1] * (1 - a) + g * a);
  px[i + 2] = Math.round(px[i + 2] * (1 - a) + b * a);
}
function fillRect(x0, y0, x1, y1, c) {
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) setPx(x, y, c[0], c[1], c[2]);
}
function fillCircle(cx, cy, rad, c) {
  for (let y = cy - rad; y <= cy + rad; y++)
    for (let x = cx - rad; x <= cx + rad; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= rad * rad) setPx(x, y, c[0], c[1], c[2]);
    }
}
function blendCircle(cx, cy, rad, c, a) {
  for (let y = cy - rad; y <= cy + rad; y++)
    for (let x = cx - rad; x <= cx + rad; x++) {
      const dx = x - cx, dy = y - cy;
      if (dx * dx + dy * dy <= rad * rad) blendPx(x, y, c[0], c[1], c[2], a);
    }
}
function thickLine(x0, y0, x1, y1, rad, c) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let s = 0; s <= steps; s++) {
    const x = Math.round(x0 + (x1 - x0) * s / steps);
    const y = Math.round(y0 + (y1 - y0) * s / steps);
    fillCircle(x, y, rad, c);
  }
}

// ---------- 5x7 bitmap font ----------
const FONT = {
  "A": [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  "B": ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  "C": [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  "D": ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  "E": ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  "F": ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  "G": [".####", "#....", "#....", "#.###", "#...#", "#...#", ".###."],
  "H": ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  "I": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  "J": ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  "K": ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  "L": ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  "M": ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  "N": ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  "O": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  "P": ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  "Q": [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  "R": ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  "S": [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  "T": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  "U": ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  "V": ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  "W": ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  "X": ["#...#", ".#.#.", "..#..", "..#..", "..#..", ".#.#.", "#...#"],
  "Y": ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  "Z": ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
  "0": [".###.", "#..##", "#.#.#", "##..#", "#...#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", "#####"],
  "2": [".###.", "#...#", "....#", "..##.", ".#...", "#....", "#####"],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
  "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  "6": [".###.", "#....", "#....", "####.", "#...#", "#...#", ".###."],
  "7": ["#####", "....#", "...#.", "..#..", "..#..", "..#..", "..#.."],
  "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
  "9": [".###.", "#...#", "#...#", ".####", "....#", "....#", ".###."],
  ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
  "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
  "•": [".....", ".....", ".###.", ".###.", ".###.", ".....", "....."]
};
function textWidth(text, scale) {
  return (text.length * 6 - 1) * scale;
}
function drawText(text, x, y, scale, c) {
  for (let n = 0; n < text.length; n++) {
    const glyph = FONT[text[n]] || FONT[" "];
    for (let row = 0; row < 7; row++)
      for (let col = 0; col < 5; col++)
        if (glyph[row][col] === "#")
          fillRect(x + n * 6 * scale + col * scale, y + row * scale,
                   x + n * 6 * scale + col * scale + scale, y + row * scale + scale, c);
  }
}
function drawTextOutlined(text, x, y, scale, c, outline, t) {
  for (let dy = -t; dy <= t; dy++)
    for (let dx = -t; dx <= t; dx++)
      if (dx !== 0 || dy !== 0) drawText(text, x + dx, y + dy, scale, outline);
  drawText(text, x, y, scale, c);
}
function drawTextCentered(text, y, scale, c) {
  drawText(text, Math.round((W - textWidth(text, scale)) / 2), y, scale, c);
}
function drawTextCenteredOutlined(text, y, scale, c, outline, t) {
  drawTextOutlined(text, Math.round((W - textWidth(text, scale)) / 2), y, scale, c, outline, t);
}

// ---------- scene: Vice City sunset ----------
const SKY_STOPS = [
  [0, [43, 16, 101]],
  [300, [147, 31, 155]],
  [470, [219, 39, 119]],
  [620, [249, 115, 22]]
];
for (let y = 0; y < 640; y++) {
  let a = SKY_STOPS[0], b = SKY_STOPS[SKY_STOPS.length - 1];
  for (let s = 0; s < SKY_STOPS.length - 1; s++)
    if (y >= SKY_STOPS[s][0] && y <= SKY_STOPS[s + 1][0]) { a = SKY_STOPS[s]; b = SKY_STOPS[s + 1]; break; }
  const f = (y - a[0]) / Math.max(1, b[0] - a[0]);
  const r = Math.round(a[1][0] + (b[1][0] - a[1][0]) * f);
  const g = Math.round(a[1][1] + (b[1][1] - a[1][1]) * f);
  const bl = Math.round(a[1][2] + (b[1][2] - a[1][2]) * f);
  for (let x = 0; x < W; x++) setPx(x, y, r, g, bl);
}
// street / sea band below the horizon
fillRect(0, 640, W, H, [26, 22, 64]);

// low sun disc, offset right of the ghost so it stays visible in the sky
fillCircle(762, 318, 100, [253, 186, 58]);
fillCircle(762, 318, 82, [253, 208, 84]);

// city skyline silhouette along the horizon
const SIL = [13, 27, 39];
const BUILDINGS = [
  [0, 90, 105], [88, 60, 165], [146, 80, 120], [224, 52, 195], [274, 74, 140],
  [346, 58, 175], [402, 84, 110], [484, 54, 185], [536, 76, 130], [610, 60, 160],
  [668, 82, 115], [748, 56, 190], [802, 72, 145], [872, 62, 170], [932, 92, 125]
];
for (const bd of BUILDINGS) fillRect(bd[0], 640 - bd[2], bd[0] + bd[1], 640, SIL);

// warm lit windows scattered through the skyline
const WINDOWS = [
  [20, 556], [48, 592], [104, 500], [122, 548], [168, 548], [196, 584],
  [238, 472], [252, 516], [296, 524], [322, 568], [364, 492], [380, 540],
  [428, 556], [452, 592], [498, 484], [516, 528], [560, 536], [586, 580],
  [628, 504], [646, 552], [692, 548], [716, 592], [762, 480], [778, 524],
  [824, 520], [848, 564], [890, 496], [908, 544], [956, 540], [984, 584]
];
for (const wn of WINDOWS) fillRect(wn[0], wn[1], wn[0] + 9, wn[1] + 13, [250, 204, 21]);

// palm tree silhouettes
function palm(baseX, baseY, topX, topY) {
  thickLine(baseX, baseY, topX, topY, 9, SIL);
  const fronds = [[-156, -34, 120], [-112, -58, 104], [-52, -72, 92], [52, -72, 92], [112, -58, 104], [156, -34, 120]];
  for (const fr of fronds) {
    for (let s = 0; s <= 40; s++) {
      const t = s / 40;
      const x = Math.round(topX + fr[0] * t);
      const y = Math.round(topY + fr[1] * t + fr[2] * t * t);
      fillCircle(x, y, 4, SIL);
    }
  }
}
palm(92, 640, 140, 392);
palm(940, 640, 890, 380);

// ---------- centerpiece: the make.fun ghost reporter ----------
const WHITE = [255, 255, 255];
// soft shadow under the ghost
blendCircle(512, 612, 150, [0, 0, 0], 0.18);
// body: domed head + straight sides + scalloped bottom
fillCircle(512, 402, 142, WHITE);
fillRect(370, 402, 654, 556, WHITE);
fillCircle(417, 556, 47, WHITE);
fillCircle(512, 556, 47, WHITE);
fillCircle(607, 556, 47, WHITE);
// face: two eyes and a smile (kept clear of all text)
fillCircle(464, 384, 19, [10, 10, 16]);
fillCircle(560, 384, 19, [10, 10, 16]);
for (let deg = 25; deg <= 155; deg += 4) {
  const rad = deg * Math.PI / 180;
  fillCircle(Math.round(512 + 40 * Math.cos(rad)), Math.round(398 + 40 * Math.sin(rad)), 5, [10, 10, 16]);
}
// tiny press badge on the ghost's chest
fillRect(404, 474, 470, 544, [30, 58, 138]);
fillRect(416, 486, 458, 512, WHITE);
fillRect(416, 522, 458, 530, [250, 204, 21]);

// glowing magenta star coin, held up like a reporter's microphone
const STAR_C = [660, 522];
blendCircle(STAR_C[0], STAR_C[1], 102, [255, 0, 200], 0.10);
blendCircle(STAR_C[0], STAR_C[1], 86, [255, 0, 200], 0.14);
blendCircle(STAR_C[0], STAR_C[1], 70, [255, 0, 200], 0.18);
const starPts = [];
for (let k = 0; k < 10; k++) {
  const ang = -Math.PI / 2 + k * Math.PI / 5;
  const rad = k % 2 === 0 ? 72 : 30;
  starPts.push([STAR_C[0] + rad * Math.cos(ang), STAR_C[1] + rad * Math.sin(ang)]);
}
function inStar(x, y) {
  let inside = false;
  for (let i = 0, j = starPts.length - 1; i < starPts.length; j = i++) {
    const xi = starPts[i][0], yi = starPts[i][1], xj = starPts[j][0], yj = starPts[j][1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
for (let y = STAR_C[1] - 74; y <= STAR_C[1] + 74; y++)
  for (let x = STAR_C[0] - 74; x <= STAR_C[0] + 74; x++)
    if (inStar(x, y)) setPx(x, y, 255, 0, 200);
fillCircle(STAR_C[0], STAR_C[1], 11, [255, 214, 245]);

// ---------- breaking news banner ----------
fillRect(0, 0, W, 112, [204, 22, 22]);
fillRect(0, 112, W, 120, [127, 12, 12]);
drawText("BREAKING NEWS", 28, 21, 10, WHITE);
fillRect(838, 18, 1006, 94, WHITE);
drawText("LIVE", 853, 35, 6, [204, 22, 22]);

// ---------- headline ----------
drawTextCenteredOutlined("ROCKSTAR DELAYS", 656, 9, WHITE, [8, 8, 20], 4);
drawTextCenteredOutlined("GTA 6 AGAIN", 748, 9, WHITE, [8, 8, 20], 4);

// ---------- chyron ----------
fillRect(0, 884, W, H, [10, 16, 38]);
fillRect(0, 884, W, 892, [250, 204, 21]);
drawTextCentered("LOCAL GHOST ALREADY EARNING ON MAKE.FUN", 904, 4, [250, 204, 21]);
drawTextCentered("LEONIDA • STILL NO RELEASE DATE", 962, 3, WHITE);

// ---------- PNG encoder (own, zlib deflate) ----------
const CRC_TABLE = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE.push(c >>> 0);
}
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) {
  raw[y * (W * 3 + 1)] = 0;
  Buffer.from(px.buffer, y * W * 3, W * 3).copy(raw, y * (W * 3 + 1) + 1);
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type RGB
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0))
]);

const botDir = process.env.MAKEFUN_BOT_DIR || ".";
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "out";
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "meme.png"), png);
fs.copyFileSync(path.join(botDir, "POST.json"), path.join(outDir, "POST.json"));

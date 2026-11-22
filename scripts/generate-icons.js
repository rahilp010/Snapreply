// scripts/generate-icons.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.resolve(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate the Thin-Film Iridescent Soap-Bubble AI Orb SVG icon (matched to ChromaticOrb.tsx)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <clipPath id="bubbleClip">
      <circle cx="64" cy="64" r="46"/>
    </clipPath>

    <!-- Subtle Outer Thin-Film Ambient Bloom -->
    <radialGradient id="outerAura" cx="50%" cy="50%" r="50%">
      <stop offset="68%" stop-color="#010103" stop-opacity="0"/>
      <stop offset="82%" stop-color="#fbbf24" stop-opacity="0.14"/>
      <stop offset="92%" stop-color="#67e8f9" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#040407" stop-opacity="0"/>
    </radialGradient>

    <!-- Deep Pitch-Black Hollow Core Mask -->
    <radialGradient id="voidCore" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#010103" stop-opacity="1"/>
      <stop offset="64%" stop-color="#010103" stop-opacity="0.98"/>
      <stop offset="82%" stop-color="#010103" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#010103" stop-opacity="0"/>
    </radialGradient>

    <!-- Right-Side Warm Amber / Tangerine Crescent (1 to 5 o'clock) -->
    <linearGradient id="amberCrescent" x1="20%" y1="0%" x2="85%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.95"/>
      <stop offset="32%" stop-color="#fbbf24" stop-opacity="0.98"/>
      <stop offset="68%" stop-color="#f97316" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#c2410c" stop-opacity="0.2"/>
    </linearGradient>

    <!-- Top-Left White -> Cream Gold -> Orchid Thin-Film Arc (10 to 1 o'clock) -->
    <linearGradient id="topFilm" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#67e8f9" stop-opacity="0.9"/>
      <stop offset="30%" stop-color="#ffffff" stop-opacity="0.98"/>
      <stop offset="58%" stop-color="#fef08a" stop-opacity="0.92"/>
      <stop offset="82%" stop-color="#c084fc" stop-opacity="0.88"/>
      <stop offset="100%" stop-color="#9333ea" stop-opacity="0.25"/>
    </linearGradient>

    <!-- Inner Violet-Purple Thin-Film Refraction Band -->
    <linearGradient id="violetBand" x1="85%" y1="10%" x2="15%" y2="90%">
      <stop offset="0%" stop-color="#9333ea" stop-opacity="0"/>
      <stop offset="38%" stop-color="#9333ea" stop-opacity="0.9"/>
      <stop offset="68%" stop-color="#c084fc" stop-opacity="0.74"/>
      <stop offset="100%" stop-color="#9333ea" stop-opacity="0"/>
    </linearGradient>

    <!-- Bottom-Left Warm Amber & Icy Cyan Reflection (6:30 to 9:30) -->
    <linearGradient id="bottomLeftArc" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f97316" stop-opacity="0.85"/>
      <stop offset="45%" stop-color="#fbbf24" stop-opacity="0.9"/>
      <stop offset="78%" stop-color="#ecfeff" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#67e8f9" stop-opacity="0.85"/>
    </linearGradient>

    <!-- Crisp Icy Cyan / White Fresnel Glass Edge -->
    <radialGradient id="fresnelEdge" cx="50%" cy="50%" r="50%">
      <stop offset="86%" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="94%" stop-color="#67e8f9" stop-opacity="0.54"/>
      <stop offset="98.5%" stop-color="#ecfeff" stop-opacity="0.92"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.98"/>
    </radialGradient>

    <filter id="softGlow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="3.4"/>
    </filter>

    <filter id="wideGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5.2"/>
    </filter>
  </defs>

  <!-- Deep Obsidian Squircle Background -->
  <rect x="0" y="0" width="128" height="128" rx="28" fill="#040407"/>
  <rect x="1" y="1" width="126" height="126" rx="27" fill="none" stroke="#ffffff" stroke-opacity="0.1" stroke-width="1.5"/>

  <!-- Subtle Outer Ambient Glow -->
  <circle cx="64" cy="64" r="58" fill="url(#outerAura)"/>

  <!-- Thin-Film Soap Bubble Orb -->
  <g clip-path="url(#bubbleClip)">
    <!-- Pitch-Black Bubble Interior -->
    <circle cx="64" cy="64" r="46" fill="#010103"/>

    <!-- 1. Primary Warm Golden-Amber & Tangerine Right Crescent -->
    <path d="M 68 25 A 39 39 0 0 1 91 94" fill="none" stroke="url(#amberCrescent)" stroke-width="12" stroke-linecap="round" filter="url(#wideGlow)"/>
    <path d="M 66 24 A 40 40 0 0 1 94 91" fill="none" stroke="url(#amberCrescent)" stroke-width="6.5" stroke-linecap="round" filter="url(#softGlow)"/>

    <!-- 2. Top-Left White -> Cream Gold -> Violet Iridescent Film -->
    <path d="M 28 58 A 37 37 0 0 1 78 27" fill="none" stroke="url(#violetBand)" stroke-width="9.5" stroke-linecap="round" filter="url(#softGlow)"/>
    <path d="M 26 56 A 40 40 0 0 1 80 26" fill="none" stroke="url(#topFilm)" stroke-width="5.2" stroke-linecap="round" filter="url(#softGlow)"/>
    <path d="M 30 47 A 42 42 0 0 1 72 23.5" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-opacity="0.95"/>

    <!-- 3. Bottom-Left Warm Amber & Icy Cyan Reflection -->
    <path d="M 25 68 A 40 40 0 0 0 58 103" fill="none" stroke="url(#bottomLeftArc)" stroke-width="6.5" stroke-linecap="round" filter="url(#softGlow)"/>
    <path d="M 23.5 70 A 42 42 0 0 0 54 104" fill="none" stroke="#ecfeff" stroke-width="2.2" stroke-linecap="round" stroke-opacity="0.92"/>

    <!-- Deep Pitch-Black Core Vignette -->
    <circle cx="64" cy="64" r="42" fill="url(#voidCore)"/>

    <!-- Stationary Outer Icy Cyan / White Fresnel Glass Edge -->
    <circle cx="64" cy="64" r="46" fill="url(#fresnelEdge)"/>
  </g>

  <!-- Subtle Liquid Bubble Rim Contour (Top-Right) -->
  <path d="M 80 25.5 A 42.5 42.5 0 0 1 103 48" fill="none" stroke="#67e8f9" stroke-width="1.4" stroke-linecap="round" stroke-opacity="0.72"/>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);

// Helper to write valid uncompressed RGBA PNG buffers with 4x4 MSAA supersampling
function createPngBuffer(width, height, getSample) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const rawData = Buffer.alloc(height * (width * 4 + 1));
  const samples = 4; // 4x4 supersampling for crisp edges at 16px-128px
  const invSamples = 1 / (samples * samples);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0;
    for (let x = 0; x < width; x++) {
      let rAcc = 0, gAcc = 0, bAcc = 0, aAcc = 0;

      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const nx = (x + (sx + 0.5) / samples) / width;
          const ny = (y + (sy + 0.5) / samples) / height;
          const [sr, sg, sb, sa] = getSample(nx, ny);
          const alphaNorm = sa / 255;
          rAcc += sr * alphaNorm;
          gAcc += sg * alphaNorm;
          bAcc += sb * alphaNorm;
          aAcc += sa;
        }
      }

      const avgAlpha = aAcc * invSamples;
      if (avgAlpha > 0.5) {
        const unpremul = 255 / avgAlpha;
        rawData[offset++] = clampByte(rAcc * invSamples * unpremul);
        rawData[offset++] = clampByte(gAcc * invSamples * unpremul);
        rawData[offset++] = clampByte(bAcc * invSamples * unpremul);
        rawData[offset++] = clampByte(avgAlpha);
      } else {
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function clampByte(v) {
  return v <= 0 ? 0 : v >= 255 ? 255 : Math.round(v);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

// Shortest wrapped angular distance in radians (-PI to PI)
function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function gaussian(x, sigma) {
  const t = x / sigma;
  return Math.exp(-0.5 * t * t);
}

// Renders the Thin-Film Soap-Bubble ChromaticOrb on Deep Obsidian Squircle
function renderChromaticBubbleSample(nx, ny) {
  const cx = 0.5;
  const cy = 0.5;

  // Squircle rounded corners
  const cornerRadius = 0.22;
  const dx = Math.max(0, Math.abs(nx - cx) - (0.5 - cornerRadius));
  const dy = Math.max(0, Math.abs(ny - cy) - (0.5 - cornerRadius));
  const cornerDist = Math.hypot(dx, dy);

  if (cornerDist > cornerRadius) {
    return [0, 0, 0, 0];
  }

  // Deep obsidian background (#040407)
  let bgR = 4;
  let bgG = 4;
  let bgB = 7;

  // Subtle squircle glass rim highlight
  if (cornerDist > cornerRadius - 0.014) {
    bgR += 22;
    bgG += 22;
    bgB += 28;
  }

  // Normalized bubble coordinates (radius = 46/128 = 0.359375)
  const orbRadius = 0.36;
  const ox = (nx - cx) / orbRadius;
  const oy = (ny - cy) / orbRadius;
  const r = Math.hypot(ox, oy);
  const theta = Math.atan2(oy, ox); // 0=3 o'clock, -PI/2=12 o'clock, PI/2=6 o'clock, ±PI=9 o'clock

  // Outside the bubble: subtle thin-film ambient bloom
  if (r >= 1.0) {
    const outerFade = Math.exp(-(r - 1.0) * 9.5);
    const rightWarm = gaussian(angleDiff(theta, 0.1), 0.9);
    const topCool = gaussian(angleDiff(theta, -2.05), 0.8);
    const botLeft = gaussian(angleDiff(theta, 2.35), 0.7);

    const auraR = rightWarm * 245 + topCool * 140 + botLeft * 180;
    const auraG = rightWarm * 145 + topCool * 185 + botLeft * 195;
    const auraB = rightWarm * 35 + topCool * 255 + botLeft * 245;

    return [
      clampByte(bgR + auraR * outerFade * 0.16),
      clampByte(bgG + auraG * outerFade * 0.16),
      clampByte(bgB + auraB * outerFade * 0.18),
      255,
    ];
  }

  // Pitch-black void interior (#010103)
  let rCol = 1;
  let gCol = 1;
  let bCol = 3;

  // Hollow core attenuation mask (keeps center pure obsidian black)
  const coreMask = Math.min(1.0, Math.max(0.0, (r - 0.56) / 0.24));
  const rimCurve = coreMask * coreMask * (3 - 2 * coreMask);

  // 1. Right-Side Golden-Amber & Tangerine Crescent (1 o'clock to 5 o'clock)
  const rightAng = gaussian(angleDiff(theta, 0.12), 0.78);
  const rightRad = gaussian(r - 0.84, 0.105);
  const rightInt = rightAng * rightRad * rimCurve;
  if (rightInt > 0.001) {
    // Inner edge shifts toward cream-gold (#fef08a), outer/lower toward tangerine (#f97316)
    const goldMix = Math.max(0, Math.min(1, (0.92 - r) * 4.5 + Math.max(0, -theta) * 0.45));
    const ambR = 249 + (254 - 249) * goldMix;
    const ambG = 115 + (235 - 115) * goldMix;
    const ambB = 22 + (130 - 22) * goldMix;
    rCol += ambR * rightInt * 1.15;
    gCol += ambG * rightInt * 1.15;
    bCol += ambB * rightInt * 1.15;
  }

  // 2. Top-Left Violet-Purple Thin-Film Refraction Band (9:30 to 12:30, slightly inside rim)
  const violetAng = gaussian(angleDiff(theta, -2.15), 0.56);
  const violetRad = gaussian(r - 0.78, 0.082);
  const violetInt = violetAng * violetRad * rimCurve;
  if (violetInt > 0.001) {
    rCol += 168 * violetInt * 1.15;
    gCol += 72 * violetInt * 1.15;
    bCol += 248 * violetInt * 1.25;
  }

  // 3. Top-Left Luminous White & Cream-Gold Thin-Film Arc (10 o'clock to 1 o'clock)
  const topAng = gaussian(angleDiff(theta, -1.92), 0.62);
  const topRad = gaussian(r - 0.89, 0.068);
  const topInt = topAng * topRad * rimCurve;
  if (topInt > 0.001) {
    const warmShift = Math.max(0, Math.min(1, (theta + 2.25) / 0.85));
    const topR = 255;
    const topG = 252 - 14 * warmShift;
    const topB = 255 - 115 * warmShift;
    rCol += topR * topInt * 1.15;
    gCol += topG * topInt * 1.15;
    bCol += topB * topInt * 1.15;
  }

  // 4. Bottom-Left Warm Amber & Icy Cyan Reflection (6:30 to 9:30)
  const botLeftAng = gaussian(angleDiff(theta, 2.38), 0.56);
  const botLeftRad = gaussian(r - 0.85, 0.09);
  const botLeftInt = botLeftAng * botLeftRad * rimCurve;
  if (botLeftInt > 0.001) {
    // Transition from orchid/amber near 6:30 to bright amber/cyan toward 9 o'clock
    const cyanShift = Math.max(0, Math.min(1, (theta - 1.95) / 0.9));
    const blR = 245 - 65 * cyanShift;
    const blG = 135 + 85 * cyanShift;
    const blB = 65 + 175 * cyanShift;
    rCol += blR * botLeftInt * 1.05;
    gCol += blG * botLeftInt * 1.05;
    bCol += blB * botLeftInt * 1.05;
  }

  // 5. Crisp Icy Cyan & White Fresnel Glass Rim (0.91 <= r <= 1.0)
  if (r > 0.88) {
    const rimBand = gaussian(r - 0.965, 0.028);
    // Modulate brightness around the perimeter (brighter at top-left, right edge, bottom-left; dim at 5:30 gap)
    const bottomGap = 1.0 - 0.72 * gaussian(angleDiff(theta, 1.48), 0.42);
    const topLeftBoost = 0.55 + 0.45 * gaussian(angleDiff(theta, -2.0), 0.75);
    const rightBoost = 0.4 * gaussian(angleDiff(theta, 0.05), 0.65);
    const botLeftBoost = 0.45 * gaussian(angleDiff(theta, 2.45), 0.55);
    const rimStrength = rimBand * bottomGap * Math.min(1.25, topLeftBoost + rightBoost + botLeftBoost);

    // Outer edge shifts from cyan (#67e8f9) to crisp ice white (#ffffff)
    const whiteCore = Math.max(0, Math.min(1, (r - 0.94) / 0.045));
    const rimR = 103 + (255 - 103) * whiteCore;
    const rimG = 232 + (255 - 232) * whiteCore;
    const rimB = 249 + (255 - 249) * whiteCore;

    rCol += rimR * rimStrength * 0.95;
    gCol += rimG * rimStrength * 0.95;
    bCol += rimB * rimStrength * 0.95;
  }

  // Smooth anti-aliased edge blend into background at r = 0.985..1.0
  const edgeBlend = Math.min(1.0, Math.max(0.0, (1.0 - r) / 0.018));
  const finalR = bgR + (Math.min(255, rCol) - bgR) * edgeBlend;
  const finalG = bgG + (Math.min(255, gCol) - bgG) * edgeBlend;
  const finalB = bgB + (Math.min(255, bCol) - bgB) * edgeBlend;

  return [
    clampByte(finalR),
    clampByte(finalG),
    clampByte(finalB),
    255,
  ];
}

const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  const buf = createPngBuffer(size, size, renderChromaticBubbleSample);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), buf);
  console.log(`Generated icon${size}.png (${size}x${size})`);
});
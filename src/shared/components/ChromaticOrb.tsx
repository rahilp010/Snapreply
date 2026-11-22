// src/shared/components/ChromaticOrb.tsx
import React, { useId } from 'react';

interface ChromaticOrbProps {
  size?: number;
  isGenerating?: boolean;
  className?: string;
}

// Exact Thin-Film Optical Bubble Palette matched to reference orb
const BUBBLE_COLORS = {
  voidBlack: '#010103',
  cyanRim: '#67e8f9',
  iceWhite: '#ecfeff',
  pureWhite: '#ffffff',
  creamGold: '#fef08a',
  amberGold: '#fbbf24',
  tangerine: '#f97316',
  deepOrange: '#c2410c',
  violetMid: '#9333ea',
  orchidSoft: '#c084fc',
};

const ORBIT_PARTICLES = [
  { angle: 25, dist: 54, r: 1.6, color: '#fbbf24', duration: '2.4s', delay: '0s' },
  { angle: 85, dist: 57, r: 1.3, color: '#67e8f9', duration: '2.9s', delay: '-0.6s' },
  { angle: 145, dist: 53, r: 1.7, color: '#f97316', duration: '2.6s', delay: '-1.2s' },
  { angle: 210, dist: 56, r: 1.4, color: '#ffffff', duration: '3.1s', delay: '-1.8s' },
  { angle: 275, dist: 54, r: 1.6, color: '#c084fc', duration: '2.5s', delay: '-0.9s' },
  { angle: 330, dist: 57, r: 1.3, color: '#fde047', duration: '2.8s', delay: '-2.1s' },
];

const RIM_SPARKS = [
  { cx: 79, cy: 36, r: 1.3, color: '#fef08a', duration: '2.0s', delay: '0s' },
  { cx: 83, cy: 61, r: 1.5, color: '#fb923c', duration: '2.3s', delay: '-0.7s' },
  { cx: 30, cy: 23, r: 1.4, color: '#ffffff', duration: '1.9s', delay: '-1.1s' },
  { cx: 21, cy: 68, r: 1.3, color: '#67e8f9', duration: '2.4s', delay: '-1.5s' },
  { cx: 46, cy: 17, r: 1.2, color: '#e9d5ff', duration: '2.1s', delay: '-0.4s' },
];

export const ChromaticOrb: React.FC<ChromaticOrbProps> = ({
  size = 28,
  isGenerating = false,
  className = '',
}) => {
  const uid = useId().replace(/:/g, '');

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
    >
      <style>{`
        @keyframes sr-bubble-swirl-cw {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.03); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes sr-bubble-swirl-ccw {
          0% { transform: rotate(360deg) scale(1.02); }
          50% { transform: rotate(180deg) scale(0.98); }
          100% { transform: rotate(0deg) scale(1.02); }
        }
        @keyframes sr-bubble-drift {
          0%, 100% { transform: rotate(-4deg) scale(1); }
          50% { transform: rotate(6deg) scale(1.025); }
        }
        @keyframes sr-bubble-aura-idle {
          0%, 100% { transform: scale(0.94); opacity: 0.45; }
          50% { transform: scale(1.06); opacity: 0.72; }
        }
        @keyframes sr-bubble-aura-active {
          0% { transform: rotate(0deg) scale(1.18); opacity: 0.85; }
          50% { transform: rotate(180deg) scale(1.32); opacity: 1; }
          100% { transform: rotate(360deg) scale(1.18); opacity: 0.85; }
        }
        @keyframes sr-bubble-pulse-ring {
          0% { transform: scale(0.9); opacity: 0.7; }
          100% { transform: scale(1.42); opacity: 0; }
        }
        @keyframes sr-bubble-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes sr-bubble-twinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.75); }
          50% { opacity: 1; transform: scale(1.25); }
        }
      `}</style>

      {/* Subtle Outer Thin-Film Ambient Glow */}
      <div
        className="absolute inset-0 rounded-full blur-md pointer-events-none transition-all duration-700"
        style={{
          background:
            'conic-gradient(from 25deg, rgba(103, 232, 249, 0.45), rgba(251, 191, 36, 0.52), rgba(249, 115, 22, 0.55), rgba(168, 85, 247, 0.45), rgba(103, 232, 249, 0.45))',
          animation: isGenerating
            ? 'sr-bubble-aura-active 2.4s linear infinite'
            : 'sr-bubble-aura-idle 4.8s ease-in-out infinite',
        }}
      />

      {/* Expanding Shockwave Ring when Generating */}
      {isGenerating && (
        <div
          className="absolute inset-0 rounded-full border border-amber-200/55 pointer-events-none"
          style={{
            animation: 'sr-bubble-pulse-ring 1.6s cubic-bezier(0.16, 1, 0.3, 1) infinite',
          }}
        />
      )}

      {/* Iridescent Soap-Bubble AI Orb SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 overflow-visible transition-transform duration-500"
        style={{
          transform: isGenerating ? 'scale(1.06)' : 'scale(1)',
          filter: isGenerating
            ? 'drop-shadow(0 0 7px rgba(251, 191, 36, 0.55))'
            : 'drop-shadow(0 0 3px rgba(103, 232, 249, 0.28))',
        }}
      >
        <defs>
          <clipPath id={`${uid}-bubbleClip`}>
            <circle cx="50" cy="50" r="46" />
          </clipPath>

          {/* Deep Pitch-Black Hollow Core Mask */}
          <radialGradient id={`${uid}-voidCore`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={BUBBLE_COLORS.voidBlack} stopOpacity="1" />
            <stop offset="65%" stopColor={BUBBLE_COLORS.voidBlack} stopOpacity="0.98" />
            <stop offset="82%" stopColor={BUBBLE_COLORS.voidBlack} stopOpacity="0.45" />
            <stop offset="100%" stopColor={BUBBLE_COLORS.voidBlack} stopOpacity="0" />
          </radialGradient>

          {/* Right-Side Warm Amber / Tangerine Crescent Gradient */}
          <linearGradient id={`${uid}-amberCrescent`} x1="20%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor={BUBBLE_COLORS.creamGold} stopOpacity="0.95" />
            <stop offset="32%" stopColor={BUBBLE_COLORS.amberGold} stopOpacity="0.98" />
            <stop offset="68%" stopColor={BUBBLE_COLORS.tangerine} stopOpacity="0.95" />
            <stop offset="100%" stopColor={BUBBLE_COLORS.deepOrange} stopOpacity="0.2" />
          </linearGradient>

          {/* Top-Left Iridescent White -> Gold -> Violet Thin-Film Arc */}
          <linearGradient id={`${uid}-topFilm`} x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={BUBBLE_COLORS.cyanRim} stopOpacity="0.9" />
            <stop offset="30%" stopColor={BUBBLE_COLORS.pureWhite} stopOpacity="0.98" />
            <stop offset="58%" stopColor={BUBBLE_COLORS.creamGold} stopOpacity="0.92" />
            <stop offset="82%" stopColor={BUBBLE_COLORS.orchidSoft} stopOpacity="0.88" />
            <stop offset="100%" stopColor={BUBBLE_COLORS.violetMid} stopOpacity="0.25" />
          </linearGradient>

          {/* Inner Violet-Purple Thin-Film Refraction Band */}
          <linearGradient id={`${uid}-violetBand`} x1="85%" y1="10%" x2="15%" y2="90%">
            <stop offset="0%" stopColor={BUBBLE_COLORS.violetMid} stopOpacity="0" />
            <stop offset="38%" stopColor={BUBBLE_COLORS.violetMid} stopOpacity="0.88" />
            <stop offset="68%" stopColor={BUBBLE_COLORS.orchidSoft} stopOpacity="0.72" />
            <stop offset="100%" stopColor={BUBBLE_COLORS.violetMid} stopOpacity="0" />
          </linearGradient>

          {/* Bottom-Left Cyan-to-Amber Rim Reflection */}
          <linearGradient id={`${uid}-bottomLeftArc`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={BUBBLE_COLORS.tangerine} stopOpacity="0.85" />
            <stop offset="45%" stopColor={BUBBLE_COLORS.amberGold} stopOpacity="0.9" />
            <stop offset="78%" stopColor={BUBBLE_COLORS.iceWhite} stopOpacity="0.95" />
            <stop offset="100%" stopColor={BUBBLE_COLORS.cyanRim} stopOpacity="0.85" />
          </linearGradient>

          {/* Crisp Icy Cyan / White Fresnel Edge */}
          <radialGradient id={`${uid}-fresnelEdge`} cx="50%" cy="50%" r="50%">
            <stop offset="86%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="94%" stopColor={BUBBLE_COLORS.cyanRim} stopOpacity="0.52" />
            <stop offset="98.5%" stopColor={BUBBLE_COLORS.iceWhite} stopOpacity="0.92" />
            <stop offset="100%" stopColor={BUBBLE_COLORS.pureWhite} stopOpacity="0.98" />
          </radialGradient>

          <filter id={`${uid}-softGlow`} x="-25%" y="-25%" width="150%" height="150%">
            <feGaussianBlur stdDeviation="3.4" />
          </filter>

          <filter id={`${uid}-wideGlow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="5.2" />
          </filter>
        </defs>

        {/* Orbital Micro-Particles Around Bubble Rim */}
        <g
          style={{
            opacity: isGenerating ? 1 : 0.3,
            transition: 'opacity 450ms ease',
          }}
        >
          {ORBIT_PARTICLES.map((p, idx) => {
            const rad = (p.angle * Math.PI) / 180;
            const orbitDist = isGenerating ? p.dist : 49;
            const px = 50 + Math.cos(rad) * orbitDist;
            const py = 50 + Math.sin(rad) * orbitDist;
            return (
              <g
                key={idx}
                style={{
                  transformOrigin: '50px 50px',
                  animation: `sr-bubble-orbit ${isGenerating ? p.duration : '10s'} linear infinite`,
                  animationDelay: p.delay,
                }}
              >
                <circle
                  cx={px}
                  cy={py}
                  r={isGenerating ? p.r * 1.15 : p.r * 0.78}
                  fill={p.color}
                  style={{
                    transformOrigin: `${px}px ${py}px`,
                    animation: `sr-bubble-twinkle ${p.duration} ease-in-out infinite`,
                    animationDelay: p.delay,
                    filter: `drop-shadow(0 0 2.5px ${p.color})`,
                  }}
                />
              </g>
            );
          })}
        </g>

        {/* Clipped Thin-Film Soap Bubble */}
        <g clipPath={`url(#${uid}-bubbleClip)`}>
          {/* Pitch-Black Bubble Interior */}
          <circle cx="50" cy="50" r="46" fill={BUBBLE_COLORS.voidBlack} />

          {/* Layer 1: Primary Warm Golden-Amber & Tangerine Right Crescent (1 o'clock to 5 o'clock) */}
          <g
            style={{
              transformOrigin: '50px 50px',
              animation: isGenerating
                ? 'sr-bubble-swirl-cw 2.4s linear infinite'
                : 'sr-bubble-drift 6.5s ease-in-out infinite',
            }}
          >
            {/* Soft Volumetric Amber Bloom */}
            <path
              d="M 54 11 A 39 39 0 0 1 77 80"
              fill="none"
              stroke={`url(#${uid}-amberCrescent)`}
              strokeWidth="12"
              strokeLinecap="round"
              filter={`url(#${uid}-wideGlow)`}
            />
            {/* Crisp Bright Amber Inner Ribbon */}
            <path
              d="M 52 10 A 40 40 0 0 1 80 77"
              fill="none"
              stroke={`url(#${uid}-amberCrescent)`}
              strokeWidth="6.5"
              strokeLinecap="round"
              filter={`url(#${uid}-softGlow)`}
            />
          </g>

          {/* Layer 2: Top-Left White -> Cream Gold -> Violet Iridescent Film (10 o'clock to 1 o'clock) */}
          <g
            style={{
              transformOrigin: '50px 50px',
              animation: isGenerating
                ? 'sr-bubble-swirl-ccw 2.1s linear infinite'
                : 'sr-bubble-drift 7.5s ease-in-out infinite reverse',
            }}
          >
            {/* Inner Violet-Purple Thin-Film Refraction */}
            <path
              d="M 14 44 A 37 37 0 0 1 64 13"
              fill="none"
              stroke={`url(#${uid}-violetBand)`}
              strokeWidth="9.5"
              strokeLinecap="round"
              filter={`url(#${uid}-softGlow)`}
            />
            {/* Luminous White-Gold Thin-Film Band */}
            <path
              d="M 12 42 A 40 40 0 0 1 66 12"
              fill="none"
              stroke={`url(#${uid}-topFilm)`}
              strokeWidth="5.2"
              strokeLinecap="round"
              filter={`url(#${uid}-softGlow)`}
            />
            {/* Razor-Sharp Specular Highlight along Top-Left Edge */}
            <path
              d="M 16 33 A 42 42 0 0 1 58 9.5"
              fill="none"
              stroke={BUBBLE_COLORS.pureWhite}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeOpacity="0.95"
            />
          </g>

          {/* Layer 3: Bottom-Left Warm Amber & Icy Cyan Reflection (6:30 to 9:30) */}
          <g
            style={{
              transformOrigin: '50px 50px',
              animation: isGenerating
                ? 'sr-bubble-swirl-cw 2.8s linear infinite'
                : 'sr-bubble-drift 8s ease-in-out infinite',
            }}
          >
            <path
              d="M 11 54 A 40 40 0 0 0 44 89"
              fill="none"
              stroke={`url(#${uid}-bottomLeftArc)`}
              strokeWidth="6.5"
              strokeLinecap="round"
              filter={`url(#${uid}-softGlow)`}
            />
            {/* Crisp Ice-Cyan Outer Crescent on Bottom-Left */}
            <path
              d="M 9.5 56 A 42 42 0 0 0 40 90"
              fill="none"
              stroke={BUBBLE_COLORS.iceWhite}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeOpacity="0.92"
            />
          </g>

          {/* Deep Pitch-Black Core Vignette so Center Stays Pure Obsidian */}
          <circle cx="50" cy="50" r="42" fill={`url(#${uid}-voidCore)`} />

          {/* Rim-Hugging Thin-Film Spark Particles */}
          <g style={{ mixBlendMode: 'screen' }}>
            {RIM_SPARKS.map((s, idx) => (
              <circle
                key={idx}
                cx={s.cx}
                cy={s.cy}
                r={isGenerating ? s.r * 1.2 : s.r * 0.8}
                fill={s.color}
                style={{
                  transformOrigin: `${s.cx}px ${s.cy}px`,
                  animation: `sr-bubble-twinkle ${isGenerating ? '1.3s' : s.duration} ease-in-out infinite`,
                  animationDelay: s.delay,
                }}
              />
            ))}
          </g>

          {/* Stationary Outer Icy Cyan / White Fresnel Glass Edge */}
          <circle cx="50" cy="50" r="46" fill={`url(#${uid}-fresnelEdge)`} />
        </g>

        {/* Subtle Liquid Bubble Rim Accent (Top-Right Organic Contour) */}
        <path
          d="M 66 11.5 A 42.5 42.5 0 0 1 89 34"
          fill="none"
          stroke={BUBBLE_COLORS.cyanRim}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeOpacity="0.7"
        />
      </svg>
    </div>
  );
};
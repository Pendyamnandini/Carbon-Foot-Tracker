import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { keyframes } from '@mui/system';

/* ───────────────────────── KEYFRAMES ───────────────────────── */

const meshShift = keyframes`
  0%   { background-position: 0% 0%; }
  25%  { background-position: 100% 0%; }
  50%  { background-position: 100% 100%; }
  75%  { background-position: 0% 100%; }
  100% { background-position: 0% 0%; }
`;

const breathe = keyframes`
  0%   { transform: translate3d(0, 0, 0) scale(1);   opacity: var(--blob-opacity-start); }
  33%  { transform: translate3d(12px, -18px, 0) scale(1.08); opacity: var(--blob-opacity-peak); }
  66%  { transform: translate3d(-8px, 10px, 0) scale(0.95); opacity: var(--blob-opacity-start); }
  100% { transform: translate3d(0, 0, 0) scale(1);   opacity: var(--blob-opacity-start); }
`;

const drift = keyframes`
  0%   { transform: translate3d(0, 0, 0); }
  50%  { transform: translate3d(var(--dx), var(--dy), 0); }
  100% { transform: translate3d(0, 0, 0); }
`;

const pulseGlow = keyframes`
  0%   { opacity: 0.2; }
  50%  { opacity: 0.6; }
  100% { opacity: 0.2; }
`;

const flowLine = keyframes`
  0%   { stroke-dashoffset: 1000; opacity: 0; }
  10%  { opacity: 0.6; }
  90%  { opacity: 0.6; }
  100% { stroke-dashoffset: 0; opacity: 0; }
`;

const gridPulse = keyframes`
  0%   { opacity: 0.02; }
  50%  { opacity: 0.07; }
  100% { opacity: 0.02; }
`;

const particlePulse = keyframes`
  0%   { transform: scale(1); opacity: var(--base-opacity); }
  50%  { transform: scale(1.5); opacity: calc(var(--base-opacity) * 2); }
  100% { transform: scale(1); opacity: var(--base-opacity); }
`;

const auroraWave = keyframes`
  0% { background-position: 50% 50%, 50% 50%; }
  50% { background-position: 100% 50%, 0% 50%; }
  100% { background-position: 50% 50%, 50% 50%; }
`;

const beamSway = keyframes`
  0% { transform: translateX(-10%); }
  50% { transform: translateX(10%); }
  100% { transform: translateX(-10%); }
`;

const spin = keyframes`
  100% { transform: rotate(360deg); }
`;


/* ───────────────────────── SUB-COMPONENTS ───────────────────────── */

/** Enhanced mesh gradient with organic, nature-inspired transitions including emerald and teal tones. */
const AnimatedMeshGradient = ({ isDark }) => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      background: isDark
        ? `
          radial-gradient(ellipse 80% 80% at 20% 30%, rgba(34,197,94,0.12) 0%, transparent 60%),
          radial-gradient(ellipse 70% 60% at 80% 20%, rgba(132,204,22,0.1) 0%, transparent 50%),
          radial-gradient(ellipse 90% 70% at 50% 90%, rgba(16,185,129,0.1) 0%, transparent 60%),
          radial-gradient(ellipse 60% 60% at 10% 80%, rgba(20,184,166,0.08) 0%, transparent 55%),
          linear-gradient(to bottom, #0b0f19, #062f22)
        `
        : `
          radial-gradient(ellipse 80% 80% at 20% 30%, rgba(34,197,94,0.07) 0%, transparent 60%),
          radial-gradient(ellipse 70% 60% at 80% 20%, rgba(132,204,22,0.05) 0%, transparent 50%),
          radial-gradient(ellipse 90% 70% at 50% 90%, rgba(16,185,129,0.05) 0%, transparent 60%),
          radial-gradient(ellipse 60% 60% at 10% 80%, rgba(20,184,166,0.04) 0%, transparent 55%),
          linear-gradient(to bottom, #f8fafc, #e2e8f0)
        `,
      backgroundSize: '200% 200%',
      animation: `${meshShift} 35s ease-in-out infinite`,
      willChange: 'background-position',
    }}
  />
);

/** Abstract aurora-like gradient waves at the top. */
const AuroraWaves = ({ isDark }) => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '60vh',
      background: isDark
        ? `
          radial-gradient(circle at 15% 50%, rgba(34,197,94,0.05), transparent 25%),
          radial-gradient(circle at 85% 30%, rgba(132,204,22,0.06), transparent 25%)
        `
        : `
          radial-gradient(circle at 15% 50%, rgba(34,197,94,0.03), transparent 25%),
          radial-gradient(circle at 85% 30%, rgba(132,204,22,0.04), transparent 25%)
        `,
      backgroundSize: '200% 100%',
      animation: `${auroraWave} 40s ease-in-out infinite`,
      willChange: 'background-position',
      filter: 'blur(40px)',
    }}
  />
);

/** Blurred orbs that slowly breathe and drift. */
const GlowingOrbs = ({ isDark }) => {
  const orbs = useMemo(() => [
    { w: 520, h: 420, top: '-5%', left: '-8%',  color: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(5,150,105,0.05)', delay: '0s',  dur: '25s' },
    { w: 440, h: 380, top: '55%', left: '65%',  color: isDark ? 'rgba(6,182,212,0.09)'  : 'rgba(8,145,178,0.04)', delay: '4s',  dur: '30s' },
    { w: 360, h: 300, top: '25%', left: '40%',  color: isDark ? 'rgba(16,185,129,0.07)' : 'rgba(16,185,129,0.03)', delay: '8s',  dur: '28s' },
    { w: 280, h: 240, top: '75%', left: '10%',  color: isDark ? 'rgba(5,150,105,0.08)' : 'rgba(5,150,105,0.04)', delay: '12s', dur: '22s' },
  ], [isDark]);

  return (
    <>
      {orbs.map((orb, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: orb.w,
            height: orb.h,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(ellipse at center, ${orb.color} 0%, transparent 70%)`,
            borderRadius: '50%',
            filter: 'blur(60px)',
            '--blob-opacity-start': 0.7,
            '--blob-opacity-peak': 1,
            animation: `${breathe} ${orb.dur} ease-in-out infinite`,
            animationDelay: orb.delay,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </>
  );
};

/** Subtle SVG grid texture overlay. */
const GridTexture = ({ isDark }) => {
  const strokeEncoded = isDark
    ? 'rgba(255%2C255%2C255%2C0.03)'
    : 'rgba(0%2C0%2C0%2C0.02)';

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M80 0H0v80' fill='none' stroke='${strokeEncoded}' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        animation: `${gridPulse} 25s ease-in-out infinite`,
        willChange: 'opacity',
      }}
    />
  );
};

/** Radial light – warm ambient glow at the top-center of the page. */
const RadialLight = ({ isDark }) => (
  <Box
    sx={{
      position: 'absolute',
      top: '-30%',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '150%',
      height: '80%',
      background: isDark
        ? 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.02) 40%, transparent 70%)'
        : 'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.06) 0%, rgba(6, 182, 212, 0.03) 40%, transparent 70%)',
      animation: `${pulseGlow} 25s ease-in-out infinite`,
      willChange: 'opacity',
    }}
  />
);

/** Horizontal light beam effect near the hero section. */
const HorizontalLightBeam = ({ isDark }) => (
  <Box
    sx={{
      position: 'absolute',
      top: '15%',
      left: '0',
      right: '0',
      height: '1px',
      background: isDark
        ? 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.4) 50%, transparent 100%)'
        : 'linear-gradient(90deg, transparent 0%, rgba(16,185,129,0.3) 50%, transparent 100%)',
      boxShadow: isDark
        ? '0 0 20px 2px rgba(16,185,129,0.2)'
        : '0 0 20px 2px rgba(16,185,129,0.1)',
      animation: `${beamSway} 20s ease-in-out infinite`,
      willChange: 'transform',
    }}
  />
);

/** Flowing energy lines (SVG) – carbon network connections with nodes. */
const EnergyLines = ({ isDark }) => {
  const strokeColor = isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.15)';
  const strokeColor2 = isDark ? 'rgba(6,182,212,0.2)' : 'rgba(6,182,212,0.15)';
  const dotColor = isDark ? 'rgba(16,185,129,0.5)' : 'rgba(16,185,129,0.4)';

  return (
    <Box
      component="svg"
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    >
      {/* Network Lines */}
      <path
        d="M-100 200 L200 350 L500 250 L800 450 L1100 300 L1540 500"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeDasharray="20 15"
        style={{ animation: `${flowLine} 30s linear infinite` }}
      />
      <path
        d="M-100 600 L300 450 L600 650 L900 500 L1200 700 L1540 600"
        fill="none"
        stroke={strokeColor2}
        strokeWidth="1.2"
        strokeDasharray="15 20"
        style={{ animation: `${flowLine} 35s linear infinite`, animationDelay: '5s' }}
      />
      <path
        d="M200 350 L300 450 M500 250 L600 650 M800 450 L900 500 M1100 300 L1200 700"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1"
        strokeDasharray="10 10"
        style={{ animation: `${flowLine} 25s linear infinite`, animationDelay: '10s' }}
      />
      
      {/* Network Nodes (Dots) */}
      <circle cx="200" cy="350" r="3" fill={dotColor} style={{ animation: `${pulseGlow} 15s ease-in-out infinite` }}/>
      <circle cx="500" cy="250" r="4" fill={dotColor} style={{ animation: `${pulseGlow} 18s ease-in-out infinite`, animationDelay: '2s' }}/>
      <circle cx="800" cy="450" r="3.5" fill={dotColor} style={{ animation: `${pulseGlow} 20s ease-in-out infinite`, animationDelay: '1s' }}/>
      <circle cx="1100" cy="300" r="3" fill={dotColor} style={{ animation: `${pulseGlow} 16s ease-in-out infinite`, animationDelay: '4s' }}/>
      
      <circle cx="300" cy="450" r="3" fill={dotColor} style={{ animation: `${pulseGlow} 19s ease-in-out infinite`, animationDelay: '3s' }}/>
      <circle cx="600" cy="650" r="3.5" fill={dotColor} style={{ animation: `${pulseGlow} 17s ease-in-out infinite`, animationDelay: '5s' }}/>
      <circle cx="900" cy="500" r="4" fill={dotColor} style={{ animation: `${pulseGlow} 22s ease-in-out infinite`, animationDelay: '2s' }}/>
      <circle cx="1200" cy="700" r="3" fill={dotColor} style={{ animation: `${pulseGlow} 15s ease-in-out infinite`, animationDelay: '6s' }}/>
    </Box>
  );
};

/** Tiny floating particles with gentle vertical drift and subtle pulsing. Glowing/blurred. */
const Particles = ({ isDark }) => {
  const particles = useMemo(() => {
    const seed = [];
    for (let i = 0; i < 45; i++) {
      const isLeaf = Math.random() > 0.4;
      const s = isLeaf ? 10 + Math.random() * 15 : 1.5 + Math.random() * 3.5;
      seed.push({
        size: s,
        isLeaf,
        rotation: Math.random() * 360,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        dx: `${(Math.random() - 0.5) * 60}px`,
        dy: `${(Math.random() - 0.5) * 80}px`,
        delay: `${Math.random() * 20}s`,
        dur: `${15 + Math.random() * 25}s`,
        pulseDur: `${4 + Math.random() * 6}s`,
        opacity: isDark ? (isLeaf ? 0.3 + Math.random() * 0.3 : 0.2 + Math.random() * 0.4) : (isLeaf ? 0.2 + Math.random() * 0.3 : 0.15 + Math.random() * 0.3),
        shouldPulse: Math.random() > 0.4,
        colorIndex: Math.random(),
      });
    }
    return seed;
  }, [isDark]);

  const color1 = isDark ? 'rgba(16,185,129,1)' : 'rgba(5,150,105,1)';
  const color2 = isDark ? 'rgba(6,182,212,1)' : 'rgba(8,145,178,1)';
  
  return (
    <>
      {particles.map((p, i) => {
        const particleColor = p.colorIndex > 0.5 ? color1 : color2;
        return (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: p.top,
              left: p.left,
              '--dx': p.dx,
              '--dy': p.dy,
              animation: `${drift} ${p.dur} ease-in-out infinite`,
              animationDelay: p.delay,
              willChange: 'transform',
            }}
          >
            {p.isLeaf ? (
              <Box
                sx={{
                  width: p.size,
                  height: p.size,
                  transform: `rotate(${p.rotation}deg)`,
                  opacity: p.opacity,
                  color: particleColor,
                  animation: p.shouldPulse ? `${particlePulse} ${p.pulseDur} ease-in-out infinite` : 'none',
                  animationDelay: p.delay,
                  willChange: p.shouldPulse ? 'transform, opacity' : 'auto',
                  filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.3))',
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
                  <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 7,11.5 7,11.5C7,11.5 12,8 17,8Z" />
                </svg>
              </Box>
            ) : (
              <Box
                sx={{
                  width: p.size,
                  height: p.size,
                  borderRadius: '50%',
                  background: particleColor,
                  boxShadow: `0 0 ${p.size * 2}px ${p.size}px ${particleColor}`,
                  '--base-opacity': p.opacity,
                  opacity: p.opacity,
                  animation: p.shouldPulse ? `${particlePulse} ${p.pulseDur} ease-in-out infinite` : 'none',
                  animationDelay: p.delay,
                  willChange: p.shouldPulse ? 'transform, opacity' : 'auto',
                  filter: 'blur(0.5px)',
                }}
              />
            )}
          </Box>
        );
      })}
    </>
  );
};

/** Subtle noise/grain texture overlay for premium enterprise depth. */
const NoiseTexture = ({ isDark }) => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      opacity: isDark ? 0.05 : 0.03,
      mixBlendMode: isDark ? 'overlay' : 'multiply',
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);

/** Subtle vignette effect for depth. */
const VignetteEffect = ({ isDark }) => (
  <Box
    sx={{
      position: 'absolute',
      inset: 0,
      background: isDark
        ? 'radial-gradient(circle at center, transparent 30%, rgba(11, 15, 25, 0.8) 100%)'
        : 'radial-gradient(circle at center, transparent 40%, rgba(248, 250, 252, 0.6) 100%)',
    }}
  />
);

/** Gentle vertical gradient fade at the bottom. */
const BottomFade = ({ isDark }) => (
  <Box
    sx={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '30vh',
      background: isDark
        ? 'linear-gradient(to top, rgba(11, 15, 25, 1) 0%, transparent 100%)'
        : 'linear-gradient(to top, rgba(248, 250, 252, 1) 0%, transparent 100%)',
    }}
  />
);

/** Animated CO2 pattern overlay. */
const Co2Pattern = ({ isDark }) => {
  const color = isDark ? 'rgba(34,197,94,0.03)' : 'rgba(21,128,61,0.02)';
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='${encodeURIComponent(color)}' stroke-width='1.5'%3E%3Ccircle cx='60' cy='60' r='10'/%3E%3Ccircle cx='30' cy='60' r='8'/%3E%3Ccircle cx='90' cy='60' r='8'/%3E%3Cline x1='40' y1='57' x2='48' y2='57'/%3E%3Cline x1='40' y1='63' x2='48' y2='63'/%3E%3Cline x1='72' y1='57' x2='80' y2='57'/%3E%3Cline x1='72' y1='63' x2='80' y2='63'/%3E%3Ctext x='57' y='64' font-family='sans-serif' font-size='10' fill='${encodeURIComponent(color)}' stroke='none'%3EC%3C/text%3E%3Ctext x='26' y='64' font-family='sans-serif' font-size='10' fill='${encodeURIComponent(color)}' stroke='none'%3EO%3C/text%3E%3Ctext x='86' y='64' font-family='sans-serif' font-size='10' fill='${encodeURIComponent(color)}' stroke='none'%3EO%3C/text%3E%3C/g%3E%3C/svg%3E")`,
        animation: `${drift} 40s linear infinite`,
        '--dx': '40px',
        '--dy': '-40px',
        willChange: 'transform',
        zIndex: 0,
      }}
    />
  );
};

/** SVG Mountain Horizon */
const MountainHorizon = ({ isDark }) => (
  <Box
    sx={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      height: '25vh',
      opacity: isDark ? 0.3 : 0.15,
      zIndex: 1,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'flex-end',
    }}
  >
    <svg viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      <path fill={isDark ? '#064e3b' : '#34d399'} d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      <path fill={isDark ? '#022c22' : '#10b981'} d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,234.7C840,267,960,309,1080,309.3C1200,309,1320,267,1380,245.3L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path>
    </svg>
  </Box>
);

/** Cityscape and Trees Horizon */
const CityNatureSkyline = ({ isDark }) => (
  <Box
    sx={{
      position: 'absolute',
      bottom: '10vh',
      left: 0,
      width: '100%',
      height: '15vh',
      opacity: isDark ? 0.2 : 0.1,
      zIndex: 2,
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'flex-end',
    }}
  >
    <svg viewBox="0 0 1000 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
      <path fill={isDark ? '#115e59' : '#34d399'} d="M0,100 L0,70 L20,70 L20,60 L40,60 L40,80 L60,80 L60,50 L90,50 L90,90 L110,90 L110,70 L130,70 L130,40 L160,40 L160,80 L180,80 L180,55 L210,55 L210,85 L230,85 L230,60 L260,60 L260,100 Z" />
      <circle cx="280" cy="80" r="15" fill={isDark ? '#047857' : '#10b981'} />
      <path d="M280,65 L285,100 L275,100 Z" fill={isDark ? '#064e3b' : '#059669'} />
      <circle cx="320" cy="70" r="20" fill={isDark ? '#047857' : '#10b981'} />
      <path d="M320,50 L325,100 L315,100 Z" fill={isDark ? '#064e3b' : '#059669'} />
      
      <path fill={isDark ? '#115e59' : '#34d399'} d="M360,100 L360,40 L400,40 L400,30 L420,30 L420,60 L450,60 L450,80 L480,80 L480,50 L520,50 L520,100 Z" />
      
      <circle cx="560" cy="75" r="18" fill={isDark ? '#047857' : '#10b981'} />
      <path d="M560,57 L565,100 L555,100 Z" fill={isDark ? '#064e3b' : '#059669'} />
      <circle cx="600" cy="65" r="25" fill={isDark ? '#047857' : '#10b981'} />
      <path d="M600,40 L605,100 L595,100 Z" fill={isDark ? '#064e3b' : '#059669'} />

      <path fill={isDark ? '#115e59' : '#34d399'} d="M650,100 L650,60 L680,60 L680,45 L710,45 L710,75 L740,75 L740,35 L780,35 L780,85 L810,85 L810,55 L840,55 L840,100 Z" />
      <circle cx="880" cy="70" r="22" fill={isDark ? '#047857' : '#10b981'} />
      <path d="M880,48 L885,100 L875,100 Z" fill={isDark ? '#064e3b' : '#059669'} />
      <circle cx="940" cy="80" r="15" fill={isDark ? '#047857' : '#10b981'} />
      <path d="M940,65 L945,100 L935,100 Z" fill={isDark ? '#064e3b' : '#059669'} />
      <path fill={isDark ? '#115e59' : '#34d399'} d="M970,100 L970,70 L1000,70 L1000,100 Z" />
    </svg>
  </Box>
);

const WindTurbine = ({ x, y, scale, isDark, speed }) => (
  <Box
    sx={{
      position: 'absolute',
      left: x,
      bottom: y,
      transform: `scale(${scale})`,
      opacity: isDark ? 0.25 : 0.15,
      pointerEvents: 'none',
      zIndex: 1,
    }}
  >
    <Box sx={{ width: '4px', height: '100px', background: isDark ? '#34d399' : '#059669', position: 'absolute', bottom: 0, left: '-2px' }} />
    <Box
      sx={{
        position: 'absolute',
        bottom: '95px',
        left: '-10px',
        width: '20px',
        height: '20px',
        animation: `${spin} ${speed}s linear infinite`,
        transformOrigin: '50% 50%',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        <circle cx="50" cy="50" r="5" fill={isDark ? '#34d399' : '#059669'} />
        <path d="M50 50 L50 0 C55 10 55 40 50 50" fill={isDark ? '#6ee7b7' : '#10b981'} />
        <path d="M50 50 L95 75 C85 70 65 60 50 50" fill={isDark ? '#6ee7b7' : '#10b981'} />
        <path d="M50 50 L5 75 C15 70 35 60 50 50" fill={isDark ? '#6ee7b7' : '#10b981'} />
      </svg>
    </Box>
  </Box>
);

const WindFarm = ({ isDark }) => (
  <>
    <WindTurbine x="15%" y="15vh" scale={0.8} isDark={isDark} speed={8} />
    <WindTurbine x="25%" y="18vh" scale={0.5} isDark={isDark} speed={10} />
    <WindTurbine x="80%" y="16vh" scale={0.7} isDark={isDark} speed={7} />
    <WindTurbine x="88%" y="14vh" scale={1.1} isDark={isDark} speed={9} />
  </>
);

/* ───────────────────── MAIN COMPONENT ───────────────────── */

const LandingBackground = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <AnimatedMeshGradient isDark={isDark} />
      <Co2Pattern isDark={isDark} />
      <AuroraWaves isDark={isDark} />
      <GlowingOrbs isDark={isDark} />
      <RadialLight isDark={isDark} />
      <GridTexture isDark={isDark} />
      <HorizontalLightBeam isDark={isDark} />
      <EnergyLines isDark={isDark} />
      <MountainHorizon isDark={isDark} />
      <CityNatureSkyline isDark={isDark} />
      <WindFarm isDark={isDark} />
      <Particles isDark={isDark} />
      <VignetteEffect isDark={isDark} />
      <BottomFade isDark={isDark} />
      <NoiseTexture isDark={isDark} />
    </Box>
  );
};

export default LandingBackground;

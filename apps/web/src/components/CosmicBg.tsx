'use client';

import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

export type CosmicIntensity = 'low' | 'med' | 'high';

interface CosmicBgProps {
  intensity?: CosmicIntensity;
}

const COUNTS: Record<CosmicIntensity, number> = { low: 30, med: 55, high: 90 };

/** Faint constellation lines SVG — 7 star nodes wired by delicate arcs */
function ConstellationLayer() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      {/* Star nodes */}
      {[
        [120, 180], [340, 90], [600, 240], [820, 130],
        [1100, 200], [1300, 80], [1380, 350],
        [200, 600], [500, 520], [780, 680], [1050, 560], [1320, 620],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2.5} fill="#c89146" />
      ))}
      {/* Connecting lines */}
      <polyline points="120,180 340,90 600,240 820,130 1100,200 1300,80 1380,350" stroke="#c89146" strokeWidth="0.7" />
      <polyline points="200,600 500,520 780,680 1050,560 1320,620" stroke="#c89146" strokeWidth="0.7" />
      {/* Cross-connect */}
      <line x1="340" y1="90" x2="200" y2="600" stroke="#c89146" strokeWidth="0.4" strokeDasharray="4 8" />
      <line x1="820" y1="130" x2="780" y2="680" stroke="#c89146" strokeWidth="0.4" strokeDasharray="4 8" />
      <line x1="1100" y1="200" x2="1050" y2="560" stroke="#c89146" strokeWidth="0.4" strokeDasharray="4 8" />
    </svg>
  );
}

/**
 * CosmicBg — full-viewport dark space background.
 * Layer 0: solid #05060a
 * Layer 1: radial vignette + constellation SVG
 * Layer 2: tsParticles starfield (intensity-driven count)
 */
export function CosmicBg({ intensity = 'low' }: CosmicBgProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const count = COUNTS[intensity];

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: 'transparent' },
      fpsLimit: 40,
      detectRetina: true,
      particles: {
        number: { value: count, density: { enable: true, width: 1440, height: 900 } },
        color: { value: ['#ffffff', '#f4ecd6', '#c89146', '#e9d4b6'] },
        shape: { type: 'circle' },
        opacity: {
          value: { min: 0.2, max: 0.7 },
          animation: { enable: true, speed: 0.5, sync: false },
        },
        size: { value: { min: 0.5, max: intensity === 'high' ? 2.5 : 1.8 } },
        move: {
          enable: true,
          speed: 0.3,
          direction: 'none',
          random: true,
          straight: false,
          outModes: { default: 'out' },
        },
        links: { enable: false },
      },
      interactivity: {
        detectsOn: 'window',
        events: { onHover: { enable: false } },
      },
    }),
    [count, intensity]
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05060a]">
      {/* Radial vignette */}
      <div className="absolute inset-0 bg-cosmic-vignette" />
      {/* Constellation overlay */}
      <ConstellationLayer />
      {/* Particle starfield */}
      {ready && (
        <Particles
          id="cosmic-bg-particles"
          options={options}
          className="absolute inset-0 h-full w-full"
        />
      )}
    </div>
  );
}

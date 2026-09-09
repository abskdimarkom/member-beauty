'use client';

import { useMemo } from 'react';

/**
 * Dependency-free Code 39 barcode renderer.
 *
 * Code 39 supports A-Z, 0-9, space, and -.$/+%. Lowercase input is converted
 * to uppercase. The start/stop characters are added only to the barcode, so a
 * successful scan returns the member number itself.
 */
const PATTERNS: Record<string, string> = {
  '0': 'nnnwwnwnn',
  '1': 'wnnwnnnnw',
  '2': 'nnwwnnnnw',
  '3': 'wnwwnnnnn',
  '4': 'nnnwwnnnw',
  '5': 'wnnwwnnnn',
  '6': 'nnwwwnnnn',
  '7': 'nnnwnnwnw',
  '8': 'wnnwnnwnn',
  '9': 'nnwwnnwnn',
  A: 'wnnnnwnnw',
  B: 'nnwnnwnnw',
  C: 'wnwnnwnnn',
  D: 'nnnnwwnnw',
  E: 'wnnnwwnnn',
  F: 'nnwnwwnnn',
  G: 'nnnnnwwnw',
  H: 'wnnnnwwnn',
  I: 'nnwnnwwnn',
  J: 'nnnnwwwnn',
  K: 'wnnnnnnww',
  L: 'nnwnnnnww',
  M: 'wnwnnnnwn',
  N: 'nnnnwnnww',
  O: 'wnnnwnnwn',
  P: 'nnwnwnnwn',
  Q: 'nnnnnnwww',
  R: 'wnnnnnwwn',
  S: 'nnwnnnwwn',
  T: 'nnnnwnwwn',
  U: 'wwnnnnnnw',
  V: 'nwwnnnnnw',
  W: 'wwwnnnnnn',
  X: 'nwnnwnnnw',
  Y: 'wwnnwnnnn',
  Z: 'nwwnwnnnn',
  '-': 'nwnnnnwnw',
  '.': 'wwnnnnwnn',
  ' ': 'nwwnnnwnn',
  '$': 'nwnwnwnnn',
  '/': 'nwnwnnnwn',
  '+': 'nwnnnwnwn',
  '%': 'nnnwnwnwn',
  '*': 'nwnnwnwnn',
};

const QUIET_ZONE = 10;
const NARROW = 1;
const WIDE = 2;
const CHARACTER_GAP = 1;

function buildBars(value: string) {
  const code = value.trim().toUpperCase();
  if (!code || [...code].some(character => character === '*' || !PATTERNS[character])) {
    return { bars: [], code: null, total: QUIET_ZONE * 2 };
  }

  const encoded = `*${code}*`;
  const bars: { x: number; width: number }[] = [];
  let x = QUIET_ZONE;

  [...encoded].forEach((character, characterIndex) => {
    [...PATTERNS[character]].forEach((element, elementIndex) => {
      const width = element === 'w' ? WIDE : NARROW;
      if (elementIndex % 2 === 0) bars.push({ x, width });
      x += width;
    });
    if (characterIndex < encoded.length - 1) x += CHARACTER_GAP;
  });

  return { bars, code, total: x + QUIET_ZONE };
}

export function Code39({ value, width, height, className, title }: { value: string; width?: number; height: number; className?: string; title?: string }) {
  const { bars, code, total } = useMemo(() => buildBars(value), [value]);
  const accessibleTitle = title ?? (code ? `Code 39 ${code}` : `Barcode tidak tersedia untuk ${value}`);

  return (
    <svg className={className} role="img" aria-label={accessibleTitle} width={width} height={height} viewBox={`0 0 ${total} 100`} preserveAspectRatio="none" style={{ maxWidth: '100%', display: 'block' }}>
      <title>{accessibleTitle}</title>
      <rect x={0} y={0} width={total} height={100} fill="#fff" />
      {bars.map((bar, index) => <rect key={index} x={bar.x} y={0} width={bar.width} height={100} fill="#111" />)}
    </svg>
  );
}

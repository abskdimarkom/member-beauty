'use client';

import { useMemo } from 'react';

/**
 * Dependency-free Code 128 (auto B/C) barcode renderer.
 * Encodes numeric-only, even-length values with Code C for density and
 * falls back to Code B for anything else. Renders crisp SVG bars that
 * stretch to the requested box via preserveAspectRatio="none".
 */
const PATTERNS = ['212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', '114131', '311141', '411131', '211412', '211214', '211232', '2331112'];

const QUIET = 10;

function encode(value: string) {
  const codeC = value.length > 0 && value.length % 2 === 0 && /^\d+$/.test(value);
  const codes: number[] = [];
  if (codeC) {
    codes.push(105);
    for (let i = 0; i < value.length; i += 2) codes.push(Number(value.slice(i, i + 2)));
  } else {
    codes.push(104);
    for (const ch of value) {
      const point = ch.charCodeAt(0);
      codes.push((point < 32 || point > 126 ? 32 : point) - 32);
    }
  }
  let sum = codes[0];
  for (let i = 1; i < codes.length; i++) sum += codes[i] * i;
  codes.push(sum % 103, 106);
  return codes;
}

function buildBars(value: string) {
  const bars: { x: number; w: number }[] = [];
  let x = QUIET;
  for (const code of encode(value)) {
    let dark = true;
    for (const char of PATTERNS[code]) {
      const w = Number(char);
      if (dark) bars.push({ x, w });
      x += w;
      dark = !dark;
    }
  }
  return { bars, total: x + QUIET };
}

export function Barcode128({ value, width, height, className, title }: { value: string; width?: number; height: number; className?: string; title?: string }) {
  const { bars, total } = useMemo(() => buildBars(value), [value]);
  return (
    <svg className={className} role="img" aria-label={title ?? value} width={width} height={height} viewBox={`0 0 ${total} 100`} preserveAspectRatio="none" style={{ maxWidth: '100%', display: 'block' }}>
      <rect x={0} y={0} width={total} height={100} fill="#fff" />
      {bars.map((bar, i) => <rect key={i} x={bar.x} y={0} width={bar.w} height={100} fill="#111" />)}
    </svg>
  );
}

'use client';

import { useMemo } from 'react';

/**
 * Dependency-free EAN-13 barcode renderer. Retail cashier scanners read EAN-13
 * far more reliably than Code 128. Non-digits are stripped, then:
 *   - 13 digits  -> used as-is (assumed to already carry the check digit),
 *   - <= 12 digits -> left-padded with zeros to 12, then the 13th check digit
 *     is computed. So a 10-digit card like 1000174281 becomes 0010001742812.
 *   - > 13 digits -> cannot form a valid EAN-13, renders nothing.
 * NOTE: padding + the check digit mean the scanned value is 13 digits, not the
 * raw card number — the POS lookup must accept this padded form.
 * Bars stretch to the requested box via preserveAspectRatio="none".
 */
const L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
const R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];
const PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'];

const QUIET = 11; // quiet-zone width in modules (EAN-13 requires >= 11 on the left, >= 7 on the right)

function checkDigit(twelve: string) {
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(twelve[i]) * (i % 2 === 0 ? 1 : 3);
  return String((10 - (sum % 10)) % 10);
}

function normalize(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0 || digits.length > 13) return null;
  if (digits.length === 13) return digits;
  const twelve = digits.padStart(12, '0');
  return twelve + checkDigit(twelve);
}

function buildModules(code: string) {
  const parity = PARITY[Number(code[0])];
  let modules = '101'; // start guard
  for (let i = 1; i <= 6; i++) modules += (parity[i - 1] === 'L' ? L : G)[Number(code[i])];
  modules += '01010'; // center guard
  for (let i = 7; i <= 12; i++) modules += R[Number(code[i])];
  modules += '101'; // end guard
  return modules;
}

function buildBars(value: string) {
  const code = normalize(value);
  if (!code) return { bars: [], total: QUIET * 2, code: null };
  const modules = buildModules(code);
  const bars: { x: number; w: number }[] = [];
  let x = QUIET;
  for (let i = 0; i < modules.length; ) {
    if (modules[i] === '1') {
      let w = 1;
      while (modules[i + w] === '1') w++;
      bars.push({ x, w });
      x += w;
      i += w;
    } else {
      x += 1;
      i += 1;
    }
  }
  return { bars, total: x + QUIET, code };
}

export function Ean13({ value, width, height, className, title }: { value: string; width?: number; height: number; className?: string; title?: string }) {
  const { bars, total, code } = useMemo(() => buildBars(value), [value]);
  return (
    <svg className={className} role="img" aria-label={title ?? code ?? value} width={width} height={height} viewBox={`0 0 ${total} 100`} preserveAspectRatio="none" style={{ maxWidth: '100%', display: 'block' }}>
      <rect x={0} y={0} width={total} height={100} fill="#fff" />
      {bars.map((bar, i) => <rect key={i} x={bar.x} y={0} width={bar.w} height={100} fill="#111" />)}
    </svg>
  );
}

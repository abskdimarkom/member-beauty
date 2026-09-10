'use client';

import { useId, useRef, useState } from 'react';
import { DownloadSimple, Check, Copy, Heart, Crown, BarcodeIcon } from '@phosphor-icons/react';
import { Code39 } from './code39';
import type { Member } from '@/lib/types';

/** Original membership layout with a self-contained SVG for PNG export. */
export function MemberCard({ member, demo, onOpen, onCopy, copied }: {
  member: Member; demo: boolean; onOpen?: () => void; onCopy: () => void; copied: boolean;
}) {
  const id = useId().replace(/:/g, '');
  const ref = useRef<SVGSVGElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  async function download() {
    if (!ref.current || busy) return;
    setBusy(true); setMessage('');
    let sourceUrl: string | undefined;
    try {
      const svg = ref.current.cloneNode(true) as SVGSVGElement;
      // Inline the brand asset so the PNG has no external image dependencies.
      const response = await fetch('/logo.png');
      if (!response.ok) throw new Error('Logo unavailable');
      const logo = await response.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(logo);
      });
      svg.querySelector('image')?.setAttribute('href', dataUrl);
      svg.setAttribute('width', '1720'); svg.setAttribute('height', '1080');
      sourceUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' }));
      const image = new window.Image();
      image.src = sourceUrl;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 1720; canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unavailable');
      ctx.drawImage(image, 0, 0);
      const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Export failed')), 'image/png'));
      const url = URL.createObjectURL(png);
      const link = document.createElement('a');
      link.href = url; link.download = `beauty-emember-${member.card.replace(/[^a-z0-9-]/gi, '')}${demo ? '-contoh' : ''}.png`;
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      setMessage('Kartu siap disimpan. Periksa unduhanmu.');
    } catch { setMessage('Kartu belum bisa diunduh. Silakan coba lagi.'); }
    finally { if (sourceUrl) URL.revokeObjectURL(sourceUrl); setBusy(false); }
  }
  const nameSize = member.name.length > 24 ? 30 : 42;
  const artwork = <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 860 540" width="860" height="540">
    <defs>
      <linearGradient id={`${id}-pink`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ff6fb8" /><stop offset=".42" stopColor="#ff3b9d" /><stop offset="1" stopColor="#b81568" /></linearGradient>
      <clipPath id={`${id}-clip`}><rect width="860" height="540" rx="40" /></clipPath>
      <pattern id={`${id}-dots`} width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="1.5" fill="#fff" opacity=".12" /></pattern>
    </defs>
    <g clipPath={`url(#${id}-clip)`} fontFamily="Arial, sans-serif" fill="#fff">
      <rect width="860" height="540" fill={`url(#${id}-pink)`} />
      <rect width="860" height="540" fill={`url(#${id}-dots)`} />
      <g fill="none" stroke="#fff" strokeWidth="7" opacity=".13">
        <path d="M760 245 C450 70 670 -120 760 30 C850 -120 1070 70 760 245Z" />
        <path d="M540 580 C310 455 470 340 540 435 C610 340 770 455 540 580Z" />
      </g>
      <image href="/logo.png" x="40" y="42" width="100" height="90" />
      <text x="157" y="91" fontSize="36" fontWeight="700">beauty</text>
      <text x="158" y="118" fontSize="17" letterSpacing="6">KENDARI</text>
      <rect x="490" y="46" width="328" height="64" rx="32" fill="#fff" fillOpacity=".16" stroke="#fff" strokeOpacity=".35" strokeWidth="2" />
      <path d="M516 70 L523 85 L541 85 L548 70 L537 76 L532 63 L527 76Z" fill="#ffdf9a" />
      <text x="560" y="86" fontSize="21" fontWeight="700" letterSpacing="1">{member.tier.toUpperCase()} MEMBER</text>
      <text x="44" y="210" fontSize="20" fontWeight="700" letterSpacing="3" fillOpacity=".8">YOUR BEAUTY MEMBERSHIP</text>
      <text x="44" y="276" fontSize={nameSize} fontWeight="700" textLength={member.name.length > 20 ? 480 : undefined} lengthAdjust="spacingAndGlyphs">{member.name.toUpperCase()}</text>
      <rect x="44" y="307" width="302" height="76" rx="20" fill="#fff" fillOpacity=".16" stroke="#fff" strokeOpacity=".3" strokeWidth="2" />
      <text x="66" y="355" fontSize="29" fontWeight="700" letterSpacing="3">{member.card}</text>
      <rect x="553" y="253" width="265" height="154" rx="30" fill="#fff" />
      <g transform="translate(571 269)"><Code39 value={member.card} width={229} height={87} /></g>
      <text x="685" y="385" textAnchor="middle" fontSize="19" fontWeight="700" fill="#ff3b9d">KARTU MEMBER</text>
      <path d="M44 449 H816" stroke="#fff" strokeOpacity=".3" />
      <text x="44" y="502" fontSize="21" fillOpacity=".8">{demo ? 'Kartu contoh. Bukan kartu member asli.' : 'Teman perjalanan cantikmu.'}</text>
      {!demo && <text x="816" y="502" textAnchor="end" fontSize="19" fontWeight="700" letterSpacing="2" fillOpacity=".8">BEAUTY MEMBER</text>}
    </g>
  </svg>;
  const barcode = <><Code39 value={member.card} width={112} height={40} title={`Code 39 nomor kartu ${member.card}`} /><span><BarcodeIcon size={12} />{onOpen ? 'Lihat barcode' : 'Kartu member'}</span></>;
  return <div className="emember">
    <div hidden aria-hidden="true">{artwork}</div>
    <div className={onOpen ? '' : 'modal-card'}><div className="membership-card">
      <Heart className="card-heart heart-one" weight="thin" /><Heart className="card-heart heart-two" weight="thin" />
      <div className="card-top"><span className="brand brand-light"><img className="brand-symbol" src="/logo.png" alt="" width={591} height={548} /><span className="brand-type">beauty<span>KENDARI</span></span></span><span className="gold-label"><Crown size={17} weight="fill" />{member.tier} MEMBER</span></div>
      <div className="card-bottom"><div><span className="card-label">YOUR BEAUTY MEMBERSHIP</span><h2>{member.name}</h2><button className="card-number" aria-label="Salin nomor kartu" onClick={onCopy}>{member.card}<Copy size={15} /></button></div>{onOpen ? <button className="card-qr" onClick={onOpen} aria-label="Perbesar barcode kartu member">{barcode}</button> : <div className="card-qr">{barcode}</div>}</div>
      <div className="card-footer"><span>Teman perjalanan cantikmu.</span><span>beauty member</span></div>
    </div></div>
    {demo && <span className="demo-disclaimer">Kartu contoh. Bukan kartu member asli.</span>}
    {!onOpen && <><div className="emember-actions">
      <button className="button primary" onClick={download} disabled={busy}><DownloadSimple size={19} />{busy ? 'Menyiapkan kartu…' : 'Unduh e-member'}</button>
      <button className="button secondary" onClick={onCopy}>{copied ? <Check size={18} /> : <Copy size={18} />}{copied ? 'Tersalin' : 'Salin nomor'}</button>
    </div>
    <p className="emember-hint" role="status">{message || 'Simpan kartu di HP agar mudah ditunjukkan saat belanja.'}</p></>}
  </div>;
}

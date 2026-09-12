'use client';

import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Copy, Info, ShieldCheck, WarningCircle, WhatsappLogo, X } from '@phosphor-icons/react';
import { HELP_WHATSAPP_DISPLAY, HELP_WHATSAPP_URL } from '@/lib/terms';
import type { Member } from '@/lib/types';

/**
 * Sign-in sheet. Every `[data-login-open]` element on the page opens it, so the
 * header, the hero and the access section all reach the form in one tap instead
 * of scrolling to a section whose form sits below four feature cards on mobile.
 *
 * Rendered as a native <dialog>: focus trapping, Esc to close and the backdrop
 * come from the platform rather than a dialog library.
 */
export function LoginDialog({ demo, sample }: { demo: boolean; sample?: Member }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    // The page still scrolls behind an open dialog in several browsers.
    function unlock() { document.documentElement.style.overflow = ''; }

    function open(event: Event) {
      event.preventDefault();
      dialog?.showModal();
      document.documentElement.style.overflow = 'hidden';
      // showModal() would otherwise hand focus to the close button.
      inputRef.current?.focus();
    }

    const triggers = Array.from(document.querySelectorAll<HTMLElement>('[data-login-open]'));
    triggers.forEach(trigger => trigger.addEventListener('click', open));
    dialog.addEventListener('close', unlock);

    return () => {
      triggers.forEach(trigger => trigger.removeEventListener('click', open));
      dialog.removeEventListener('close', unlock);
      unlock();
    };
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!input.trim()) { setError('Masukkan nomor HP atau nomor kartu terlebih dahulu.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: input.trim() }) });
      const body = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok) { setError(body.error ?? 'Gagal masuk. Coba lagi sebentar lagi.'); setLoading(false); return; }
      router.replace('/'); router.refresh();
    } catch { setError('Tidak bisa terhubung. Periksa koneksi internetmu lalu coba lagi.'); setLoading(false); }
  }

  function close() { dialogRef.current?.close(); }

  // A click on the backdrop lands on the dialog element itself.
  function onBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) close();
  }

  return (
    <dialog ref={dialogRef} className="login-dialog" aria-labelledby="login-dialog-title" onClick={onBackdrop} onClose={() => { document.documentElement.style.overflow = ''; setError(''); setLoading(false); }}>
      <div className="login-dialog-panel">
        <span className="login-dialog-grip" aria-hidden="true" />
        <button type="button" className="icon-button login-dialog-close" onClick={close} aria-label="Tutup">
          <X size={20} />
        </button>
        <span className="login-form-eyebrow">BEAUTY MEMBER</span>
        <h2 id="login-dialog-title">Masuk ke akunmu.</h2>
        <p className="login-description">Kartu dan poin membermu, dalam satu tempat.</p>
        <form onSubmit={submit} aria-busy={loading}>
          <label htmlFor="member-number">Nomor HP atau nomor kartu</label>
          <input ref={inputRef} id="member-number" name="member-number" inputMode="numeric" autoComplete="tel" placeholder="Masukkan nomor terdaftar" value={input} onChange={e => { setInput(e.target.value); setError(''); }} aria-invalid={!!error} aria-describedby={error ? 'login-error' : 'login-helper'} disabled={loading} />
          <small id="login-helper">Gunakan nomor yang terdaftar di Beauty Kendari.</small>
          {error && <p id="login-error" className="form-error" role="alert"><WarningCircle size={17} />{error}</p>}
          <button className="button primary full" disabled={loading}>{loading ? 'Memeriksa nomor…' : 'Masuk'}{!loading && <ArrowRight size={19} />}</button>
        </form>
        <span className="login-assurance"><ShieldCheck size={15} />Masuk praktis, tanpa password.</span>
        {demo && sample && <div className="demo-login"><Info size={19} /><div><strong>Pratinjau frontend</strong><p>Belum terhubung ke data member asli.</p><button type="button" className="text-link" onClick={() => { setInput(sample.phone); setError(''); }}>Gunakan nomor demo <Copy size={14} /></button></div></div>}
        <p className="registration-note">Belum menjadi member?<span>Daftar langsung di kasir outlet Beauty Kendari.</span></p>
        <a className="login-help" href={HELP_WHATSAPP_URL} target="_blank" rel="noreferrer">
          <span className="login-help-icon"><WhatsappLogo size={18} weight="fill" /></span>
          <span><strong>Nomormu nggak dikenali?</strong><small>Chat admin di {HELP_WHATSAPP_DISPLAY}</small></span>
          <ArrowUpRight size={16} />
        </a>
      </div>
    </dialog>
  );
}

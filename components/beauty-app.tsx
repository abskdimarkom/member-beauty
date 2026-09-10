'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { Brand } from '@/components/brand';
import { MemberCard } from '@/components/member-card';
import { ThemeButton } from '@/components/theme-button';
import { ArrowClockwise, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Bag, BarcodeIcon, CalendarBlank, CameraIcon, CaretDown, CaretRight, Check, CheckCircle, Clock, DeviceMobile, DownloadSimple, Gift, Heart, House, Info, Receipt, ShieldCheck, SignOut, Sparkle, TrashSimpleIcon, WarningCircle, WhatsappLogo, X } from '@phosphor-icons/react';
import { dateLabel, number, rupiah } from '@/lib/format';
import type { PageData } from '@/lib/load';
import type { Transaction } from '@/lib/types';
import { COMMUNITY_URL, redemptionOptions, terms } from '@/lib/terms';

type Page = 'home' | 'history' | 'info';
type InstallPrompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const navigation = [{ href: '/', label: 'Beranda', icon: House, page: 'home' }, { href: '/riwayat', label: 'Riwayat poin', icon: Clock, page: 'history' }, { href: '/info', label: 'Info penukaran', icon: Gift, page: 'info' }];
const initials = (name: string) => name.split(/\s+/).slice(0, 2).map(word => word[0] ?? '').join('').toUpperCase() || 'B';
const MAX_PROFILE_PHOTO_SIZE = 8 * 1024 * 1024;
const PROFILE_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function avatarContent(photo: string | null, name: string, onError: () => void) {
  return photo ? <img className="avatar-photo" src={photo} alt="" onError={onError} /> : initials(name);
}

/** Centre-crops and compresses the selected image before uploading it to R2. */
function prepareProfilePhoto(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const photo = new window.Image();

    photo.onload = () => {
      const canvas = document.createElement('canvas');
      const outputSize = 512;
      const cropSize = Math.min(photo.naturalWidth, photo.naturalHeight);
      const cropX = (photo.naturalWidth - cropSize) / 2;
      const cropY = (photo.naturalHeight - cropSize) / 2;
      canvas.width = outputSize;
      canvas.height = outputSize;
      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Foto belum bisa diproses. Coba pilih foto lain.'));
        return;
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';
      context.drawImage(photo, cropX, cropY, cropSize, cropSize, 0, 0, outputSize, outputSize);
      canvas.toBlob((result) => {
        URL.revokeObjectURL(objectUrl);
        if (result) resolve(result);
        else reject(new Error('Foto belum bisa diproses. Coba pilih foto lain.'));
      }, 'image/webp', 0.82);
    };

    photo.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Foto tidak dapat dibuka. Coba pilih foto lain.'));
    };
    photo.src = objectUrl;
  });
}
/** Months offered by the history filter: the current month and the eleven before it. */
function monthOptions() { const now = new Date(); return Array.from({ length: 12 }, (_, index) => { const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1)); return { value: date.toISOString().slice(0, 7), label: new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date) }; }); }

function Modal({ open, setOpen, title, description, children, className = '' }: { open: boolean; setOpen: (open: boolean) => void; title: string; description: string; children: ReactNode; className?: string }) { return <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Portal><Dialog.Overlay className="modal-overlay" /><Dialog.Content className={`modal-content ${className}`}><Dialog.Close className="icon-button modal-close" aria-label="Tutup"><X size={21} /></Dialog.Close><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description}</Dialog.Description>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>; }

export function BeautyApp({ page, data }: { page: Page; data: PageData }) {
 const { member, transactions, demo, historyFailed } = data;
 const router = useRouter();
 const [qrOpen, setQrOpen] = useState(false); const [helpOpen, setHelpOpen] = useState(false); const [accountOpen, setAccountOpen] = useState(false); const [installOpen, setInstallOpen] = useState(false); const [installPrompt, setInstallPrompt] = useState<InstallPrompt | null>(null); const [installed, setInstalled] = useState(false); const [copied, setCopied] = useState(false); const [selection, setSelection] = useState<Transaction | null>(null);
 const [avatarPhoto, setAvatarPhoto] = useState<string | null>(null); const [avatarBusy, setAvatarBusy] = useState(false); const [avatarMessage, setAvatarMessage] = useState(''); const [avatarError, setAvatarError] = useState('');
 const avatarInputRef = useRef<HTMLInputElement>(null);
 useEffect(() => { if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {}); const handler = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPrompt); }; const onInstalled = () => { setInstalled(true); setInstallPrompt(null); }; window.addEventListener('beforeinstallprompt', handler); window.addEventListener('appinstalled', onInstalled); setInstalled(window.matchMedia('(display-mode: standalone)').matches); return () => { window.removeEventListener('beforeinstallprompt', handler); window.removeEventListener('appinstalled', onInstalled); }; }, []);
 useEffect(() => { setAvatarPhoto(`/api/profile-photo?v=${encodeURIComponent(member.kode || member.card)}`); setAvatarMessage(''); setAvatarError(''); }, [member.card, member.kode]);
 async function copyCard() { try { await navigator.clipboard.writeText(member.card); setCopied(true); } catch { setCopied(false); } }
 async function changeAvatar(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  setAvatarMessage(''); setAvatarError('');
  if (!PROFILE_PHOTO_TYPES.has(file.type)) { setAvatarError('Pilih foto berformat JPG, PNG, atau WebP.'); return; }
  if (file.size > MAX_PROFILE_PHOTO_SIZE) { setAvatarError('Ukuran foto maksimal 8 MB. Pilih foto yang lebih kecil.'); return; }
  setAvatarBusy(true);
  try {
   const photo = await prepareProfilePhoto(file);
   const response = await fetch('/api/profile-photo', { method: 'PUT', headers: { 'Content-Type': 'image/webp' }, body: photo });
   const result = await response.json().catch(() => ({})) as { error?: string };
   if (!response.ok) throw new Error(result.error ?? 'Foto belum bisa disimpan. Coba lagi.');
   setAvatarPhoto(`/api/profile-photo?v=${Date.now()}`);
   setAvatarMessage('Foto profil berhasil diperbarui.');
  } catch (error) {
   setAvatarError(error instanceof Error ? error.message : 'Foto belum bisa disimpan. Coba lagi.');
  } finally {
   setAvatarBusy(false);
  }
 }
 async function removeAvatar() {
  setAvatarBusy(true); setAvatarMessage(''); setAvatarError('');
  try {
   const response = await fetch('/api/profile-photo', { method: 'DELETE' });
   const result = await response.json().catch(() => ({})) as { error?: string };
   if (!response.ok) throw new Error(result.error ?? 'Foto belum bisa dihapus. Coba lagi.');
   setAvatarPhoto(null);
   setAvatarMessage('Foto profil dihapus.');
  } catch (error) {
   setAvatarError(error instanceof Error ? error.message : 'Foto belum bisa dihapus. Coba lagi.');
  } finally {
   setAvatarBusy(false);
  }
 }
 async function install() { if (installPrompt) { await installPrompt.prompt(); const choice = await installPrompt.userChoice; if (choice.outcome === 'accepted') setInstalled(true); setInstallPrompt(null); } else setInstallOpen(true); }
 async function logout() { try { await fetch('/api/logout', { method: 'POST' }); } finally { router.replace('/login'); router.refresh(); } }
 return <div className={`app-shell ${page === 'home' ? 'home-page' : page === 'history' ? 'history-page' : 'info-page'}`}>
  <aside className="sidebar"><Link href="/" aria-label="Beauty Kendari beranda"><Brand /></Link><div className="sidebar-label">RUANG MEMBER</div><nav aria-label="Navigasi utama">{navigation.map(item => <Link key={item.page} href={item.href} className={`nav-link ${page === item.page ? 'active' : ''}`} aria-current={page === item.page ? 'page' : undefined}><item.icon size={22} weight={page === item.page ? 'fill' : 'regular'} /><span>{item.label}</span>{page === item.page && <span className="nav-active-mark" />}</Link>)}</nav><div className="sidebar-bottom"><div className="pocket-card"><span className="pocket-icon"><DeviceMobile size={26} /></span><h3>Beauty, selalu dekat.</h3><p>Akses kartu member langsung dari layar utama HP.</p><button className="button secondary small" onClick={install} disabled={installed}><DownloadSimple size={17} />{installed ? 'Sudah terpasang' : 'Pasang aplikasi'}</button></div><button className="help-link" onClick={() => setHelpOpen(true)}><Info size={20} />Butuh bantuan?<ArrowUpRight size={16} /></button><div className="sidebar-account"><span className={`avatar ${avatarPhoto ? 'has-photo' : ''}`}>{avatarContent(avatarPhoto, member.name, () => setAvatarPhoto(null))}</span><span><strong>{member.name}</strong><small>Beauty member</small></span><button className="icon-button" onClick={logout} aria-label="Keluar"><SignOut size={21} /></button></div></div></aside>
  <div className="workspace"><header className="topbar"><span className="desktop-breadcrumb">Member area <CaretRight size={14} /><strong>{page === 'home' ? 'Beranda' : page === 'history' ? 'Riwayat poin' : 'Info penukaran'}</strong></span><Link href="/" className="mobile-brand" aria-label="Beauty Kendari"><Brand /></Link><div className="header-actions">{demo && <Link href="/login" className="demo-label">Data demo <ArrowUpRight size={13} /></Link>}<ThemeButton /><span className="header-divider" /><button className={`avatar small-avatar account-button ${avatarPhoto ? 'has-photo' : ''}`} onClick={() => setAccountOpen(true)} aria-label="Akun dan pengaturan">{avatarContent(avatarPhoto, member.name, () => setAvatarPhoto(null))}</button></div></header>
  <main id="main-content"><div className="page-heading"><div><div className="greeting">{page === 'home' ? 'RUANG MEMBER' : 'BEAUTY MEMBER'}</div><h1>{page === 'home' ? <>Halo, {member.firstName}! <Sparkle className="heading-sparkle" weight="duotone" /></> : page === 'history' ? 'Riwayat poin' : 'Info penukaran'}</h1><p>{page === 'home' ? 'Kartu member dan poin, selalu dekat denganmu.' : page === 'history' ? 'Pantau poin masuk dan penukaranmu.' : 'Pilih nilai penukaran, lalu tunjukkan kartu ke kasir.'}</p></div>{member.since && <span className="member-since"><Heart size={17} />Member sejak {member.since}</span>}</div>
  {page === 'home' ? <><section className="overview-grid" aria-label="Kartu dan saldo member"><div className="membership-wrap"><MemberCard member={member} demo={demo} onOpen={() => setQrOpen(true)} onCopy={copyCard} copied={copied} /><div className="card-validity"><span><ShieldCheck size={17} />{member.expires ? <>Kartu aktif sampai <strong>{member.expires}</strong></> : 'Tanggal berakhir kartu belum tersedia'}</span><span className="copy-feedback" aria-live="polite">{copied ? 'Nomor tersalin' : ''}</span></div></div>
  <div className="points-card"><div className="points-top"><span className="label-icon"><span className="circle-icon"><Sparkle size={21} weight="duotone" /></span>Saldo poin kamu</span><span className="status-pill"><CheckCircle size={14} weight="fill" />Aktif</span></div><div className="point-number">{number(member.points)}<span>poin</span></div><div className="points-divider" /><div className="points-note"><Gift size={22} /><span><strong>100 poin = Rp10.000</strong><br />Tukar langsung di kasir outlet.</span></div><Link href="/info" className="text-link">Cara menggunakan poin <ArrowRight size={18} /></Link></div></section>
  <section className="lower-grid"><History compact demo={demo} failed={historyFailed} transactions={transactions} onSelect={setSelection} /><div className="right-column"><div className="beauty-banner"><Image src="/beauty-still-life.webp" alt="Koleksi skincare dan kosmetik bernuansa pink" fill sizes="(max-width: 767px) 100vw, 400px" priority /><div className="banner-copy"><span>UNTUK DIRIMU</span><h2>Cantikmu,<br /><em>lebih berarti.</em></h2><Link href="/info">Lihat pilihan penukaran <ArrowUpRight size={17} /></Link></div></div><a className="outlet-note community-note" href={COMMUNITY_URL} target="_blank" rel="noreferrer"><span className="circle-icon"><WhatsappLogo size={22} weight="fill" /></span><span><strong>Gabung komunitas member</strong><small>Info produk, promo, dan kegiatan eksklusif.</small></span><ArrowUpRight size={19} /></a></div></section></> : page === 'history' ? <History demo={demo} failed={historyFailed} transactions={transactions} onSelect={setSelection} /> : <InfoPage onQr={() => setQrOpen(true)} />}
  <footer className="page-footer"><span>© {new Date().getFullYear()} Beauty Kendari</span><span>Dibuat untuk perjalanan cantikmu <Heart size={13} /></span></footer></main>
  </div><nav className="mobile-nav" aria-label="Navigasi ponsel">{navigation.map(item => <Link key={item.page} href={item.href} className={page === item.page ? 'active' : ''} aria-current={page === item.page ? 'page' : undefined}><item.icon size={22} weight={page === item.page ? 'fill' : 'regular'} /><span>{item.label}</span></Link>)}</nav>
  <Modal open={qrOpen} setOpen={setQrOpen} className="emember-modal" title="Kartu membermu" description="Tunjukkan barcode ke kasir untuk menggunakan poin dan menikmati hadiah."><MemberCard member={member} demo={demo} onCopy={copyCard} copied={copied} /></Modal>
  <Modal open={helpOpen} setOpen={setHelpOpen} title="Ada yang bisa kami bantu?" description="Tim kasir dan CS Beauty Kendari siap membantu saat kamu berkunjung ke outlet."><div className="help-content"><Info size={26} /><p>Siapkan nomor kartu <strong>{member.card}</strong> dan bukti transaksi untuk pertanyaan seputar saldo atau data member.</p></div><p className="muted">Kontak dan alamat resmi outlet akan ditambahkan setelah dikonfirmasi tim Beauty Kendari.</p><Link className="button primary full" href="/info" onClick={() => setHelpOpen(false)}>Baca info penukaran <ArrowRight size={18} /></Link></Modal>
  <Modal open={installOpen} setOpen={setInstallOpen} title="Beauty di layar utamamu" description="Buka aplikasi lebih cepat tanpa mengetik alamat website."><div className="install-instructions"><h3>iPhone / iPad</h3><p>Buka melalui Safari, ketuk Bagikan, lalu pilih Tambahkan ke Layar Utama.</p><h3>Android / desktop</h3><p>Buka menu browser, pilih Instal aplikasi atau Tambahkan ke layar utama. Opsi muncul jika browser mendukung dan situs diakses lewat HTTPS.</p></div></Modal>
  <Modal open={accountOpen} setOpen={setAccountOpen} className="account-modal" title="Profil kamu" description="Atur foto dan akses akunmu di satu tempat.">
   <section className="account-profile" aria-label="Ringkasan profil">
    <button type="button" className="profile-avatar-button" onClick={() => avatarInputRef.current?.click()} disabled={avatarBusy} aria-label={avatarPhoto ? 'Ganti foto profil' : 'Tambahkan foto profil'}>
     <span className={`avatar account-avatar ${avatarPhoto ? 'has-photo' : ''}`}>{avatarContent(avatarPhoto, member.name, () => setAvatarPhoto(null))}</span>
     <span className="profile-avatar-badge" aria-hidden="true"><CameraIcon size={14} weight="fill" /></span>
    </button>
    <span className="account-profile-copy"><strong>{member.name}</strong><span>{member.tier} MEMBER</span><small>No. member {member.card}</small></span>
   </section>
   <input ref={avatarInputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={changeAvatar} aria-label="Pilih foto profil" />
   <button type="button" className="button primary full profile-photo-cta" onClick={() => avatarInputRef.current?.click()} disabled={avatarBusy}>
    <CameraIcon size={19} weight="fill" />{avatarBusy ? 'Mengunggah foto…' : avatarPhoto ? 'Ganti foto profil' : 'Pilih foto profil'}
   </button>
   <div className="profile-photo-meta"><span>JPG, PNG, atau WebP · maks. 8 MB</span><span><ShieldCheck size={14} weight="fill" />Tersimpan privat</span></div>
   {avatarError && <p className="form-error profile-photo-feedback" role="alert"><WarningCircle size={17} />{avatarError}</p>}
   {avatarMessage && <p className="profile-photo-success" role="status"><CheckCircle size={17} weight="fill" />{avatarMessage}</p>}
   {avatarPhoto && <button type="button" className="profile-photo-remove" onClick={removeAvatar} disabled={avatarBusy}><TrashSimpleIcon size={16} />Hapus foto</button>}
   <span className="account-section-label">PENGATURAN</span>
   <div className="account-actions">
    <button type="button" onClick={() => { setAccountOpen(false); void install(); }} disabled={installed}><span className="account-action-icon"><DownloadSimple size={19} /></span><span className="account-action-copy"><strong>{installed ? 'Aplikasi sudah terpasang' : 'Pasang aplikasi'}</strong><small>Akses Beauty lebih cepat</small></span><CaretRight size={16} /></button>
    <button type="button" onClick={() => { setAccountOpen(false); setHelpOpen(true); }}><span className="account-action-icon"><Info size={19} /></span><span className="account-action-copy"><strong>Butuh bantuan?</strong><small>Hubungi tim Beauty Kendari</small></span><CaretRight size={16} /></button>
   </div>
   <button type="button" className="account-logout" onClick={logout}><SignOut size={17} />Keluar dari akun</button>
  </Modal>
  <Modal open={selection !== null} setOpen={open => { if (!open) setSelection(null); }} title="Detail transaksi" description={selection ? dateLabel(selection.date) : ''}>{selection && <><div className="transaction-detail"><span className="circle-icon"><Receipt size={28} /></span><h3>{selection.title}</h3><strong className={selection.points > 0 ? 'positive' : ''}>{selection.points > 0 ? '+' : ''}{number(selection.points)} poin</strong></div><dl className="detail-list"><div><dt>No. transaksi</dt><dd>{selection.id}</dd></div><div><dt>Outlet</dt><dd>{selection.outlet}</dd></div><div><dt>Nominal belanja</dt><dd>{selection.amount ? rupiah(selection.amount) : 'Tidak berlaku'}</dd></div></dl>{demo && <p className="demo-disclaimer">Data transaksi contoh untuk pratinjau frontend.</p>}</>}</Modal>
 </div>;
}

/** Styled month filter: a pill trigger opening a themed listbox, replacing the native (unstylable) select popup. */
function MonthSelect({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const options = useMemo(() => [{ value: 'all', label: 'Semua bulan' }, ...monthOptions()], []);
  const current = options.find(option => option.value === value) ?? options[0];
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => { if (!wrapRef.current?.contains(event.target as Node)) setOpen(false); };
    const onKey = (event: globalThis.KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus(); } };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onPointer); document.removeEventListener('keydown', onKey); };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const target = listRef.current?.querySelector<HTMLButtonElement>('[data-selected="true"]') ?? listRef.current?.querySelector<HTMLButtonElement>('button');
    target?.focus();
  }, [open]);

  const move = (event: KeyboardEvent<HTMLDivElement>, delta: number) => {
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
    if (!buttons.length) return;
    event.preventDefault();
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    buttons[(index + delta + buttons.length) % buttons.length]?.focus();
  };

  const pick = (next: string) => { onChange(next); setOpen(false); triggerRef.current?.focus(); };

  return <div className="month-select" ref={wrapRef}>
    <button ref={triggerRef} type="button" className="month-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(prev => !prev)} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); } }}>
      <CalendarBlank size={16} /><span className="sr-only">Filter bulan</span><span className="month-value">{current.label}</span><CaretDown className="month-caret" size={12} />
    </button>
    {open && <div ref={listRef} className="month-menu" role="listbox" aria-label="Filter bulan" onKeyDown={event => { if (event.key === 'ArrowDown') move(event, 1); else if (event.key === 'ArrowUp') move(event, -1); else if (event.key === 'Home') move(event, -options.length); else if (event.key === 'End') move(event, options.length); }}>
      {options.map(option => { const active = option.value === value; return <button key={option.value} type="button" role="option" aria-selected={active} data-selected={active} className={active ? 'selected' : ''} onClick={() => pick(option.value)}><span>{option.label}</span>{active && <Check size={14} weight="bold" />}</button>; })}
    </div>}
  </div>;
}

function History({ compact = false, demo, failed, transactions, onSelect }: { compact?: boolean; demo: boolean; failed: boolean; transactions: Transaction[]; onSelect: (transaction: Transaction) => void }) {
 const router = useRouter();
 const [filter, setFilter] = useState('all'); const [month, setMonth] = useState('all'); const [visible, setVisible] = useState(5);
 const filtered = transactions.filter(t => (filter === 'all' || (filter === 'in' ? t.points > 0 : t.points < 0)) && (month === 'all' || t.date.startsWith(month)));
 const shown = filtered.slice(0, compact ? 4 : visible);
 const filtersActive = filter !== 'all' || month !== 'all';
 return <section className={`history-panel ${compact ? 'compact-history' : 'full-history'}`} aria-label="Riwayat poin"><div className="section-heading"><div><h2>{compact ? 'Aktivitas terbaru' : 'Aktivitas poin'}</h2><p>{compact ? 'Empat transaksi poin terakhir.' : demo ? 'Semua aktivitas di bawah merupakan data contoh.' : 'Poin masuk dan keluar dari transaksimu di outlet.'}</p></div>{compact && <Link href="/riwayat" className="text-link">Lihat semua <ArrowRight size={16} /></Link>}</div>{!compact && <div className="history-controls"><div className="filter-tabs" aria-label="Filter jenis transaksi">{[{ value: 'all', text: 'Semua' }, { value: 'in', text: 'Poin masuk' }, { value: 'out', text: 'Poin keluar' }].map(item => <button key={item.value} className={filter === item.value ? 'selected' : ''} aria-pressed={filter === item.value} onClick={() => { setFilter(item.value); setVisible(5); }}>{item.text}</button>)}</div><MonthSelect value={month} onChange={next => { setMonth(next); setVisible(5); }} /></div>}
 {failed ? <div className="empty-state error-state" role="alert"><WarningCircle size={35} /><h3>Riwayat poin gagal dimuat</h3><p>Saldo dan kartumu tetap benar. Riwayat transaksi belum bisa diambil dari server.</p><button className="button secondary small" onClick={() => router.refresh()}><ArrowClockwise size={16} />Coba lagi</button></div>
 : <><div className="transaction-list">{shown.length ? shown.map((t, index) => <button className="transaction-row" key={`${t.id}-${index}`} onClick={() => onSelect(t)}><span className={`transaction-icon ${t.points < 0 ? 'spent' : ''}`}>{t.points > 0 ? <Bag size={21} /> : <Gift size={21} />}</span><span className="transaction-info"><strong>{t.title}</strong><small>{dateLabel(t.date)}<span className="transaction-amount"> · {t.amount ? rupiah(t.amount) : 'Penukaran di outlet'}</span></small></span><span className={`transaction-points ${t.points > 0 ? 'positive' : ''}`}>{t.points > 0 ? '+' : ''}{number(t.points)}<small>poin</small></span><CaretRight className="transaction-chevron" size={15} /></button>) : <div className="empty-state"><Receipt size={35} /><h3>Belum ada riwayat transaksi</h3><p>{filtersActive ? 'Tidak ada transaksi pada filter ini.' : 'Transaksi poinmu akan muncul di sini setelah belanja di outlet.'}</p>{filtersActive && <button className="text-link" onClick={() => { setFilter('all'); setMonth('all'); }}>Tampilkan semua transaksi</button>}</div>}</div>{!compact && filtered.length > visible && <button className="button secondary load-more" onClick={() => setVisible(visible + 5)}>Muat lebih banyak <ArrowDown size={17} /></button>}</>}
 {!compact && <div className="history-footnote"><Info size={14} />Penukaran poin dilakukan langsung di kasir outlet.</div>}</section>;
}
function InfoPage({ onQr }: { onQr: () => void }) {
 const [openFaq, setOpenFaq] = useState<number | null>(0);
 return <div className="info-layout"><div><section className="redemption-panel" aria-labelledby="redemption-title"><span className="circle-icon"><Gift size={24} /></span><h2 id="redemption-title">Pilihan penukaran poin</h2><p>Tukar poinmu saat berbelanja langsung di outlet.</p><table className="redemption-table"><caption className="sr-only">Jumlah poin dan nilai penukaran</caption><thead><tr><th scope="col">Poin ditukar</th><th scope="col">Nilai penukaran</th></tr></thead><tbody>{redemptionOptions.map(option => <tr key={option.points}><th scope="row">{number(option.points)} <span>poin</span></th><td>{rupiah(option.value)}</td></tr>)}</tbody></table><span className="redemption-note"><Info size={16} />Penukaran diproses oleh kasir dengan kartu membermu.</span></section><section className="faq-section"><h2>Yang perlu kamu tahu</h2>{terms.map((term, i) => <details key={term.title} open={openFaq === i} onToggle={event => { if (event.currentTarget.open) setOpenFaq(i); else setOpenFaq(current => current === i ? null : current); }}><summary>{term.title}<CaretDown size={19} /></summary><p>{term.text}</p></details>)}</section></div><aside className="info-aside"><span className="circle-icon"><Gift size={29} /></span><h2>Siap menukar poin?</h2><p>Tunjukkan kartu membermu saat berbelanja. Kasir akan membantu penukarannya.</p><button className="button primary full" onClick={onQr}><BarcodeIcon size={20} />Tampilkan kartu</button><div className="simple-steps"><span><CheckCircle size={18} />Datang ke outlet</span><span><CheckCircle size={18} />Tunjukkan kartu member</span><span><CheckCircle size={18} />Konfirmasi penukaran ke kasir</span></div><a className="community-link" href={COMMUNITY_URL} target="_blank" rel="noreferrer"><WhatsappLogo size={20} weight="fill" /><span>Komunitas member</span><ArrowUpRight size={16} /></a></aside></div>;
}

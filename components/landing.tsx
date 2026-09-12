import { Fragment, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, ArrowUpRight, Barcode, Camera, CaretDown, CheckCircle, Clock, Copy,
  Crown, DeviceMobile, DownloadSimple, Gift, Heart, House, Info, ListMagnifyingGlass,
  LockKey, Moon, Percent, Receipt, ShieldCheck, Sparkle, Ticket, WhatsappLogo, WifiSlash,
} from '@phosphor-icons/react/ssr';
import type { Icon } from '@phosphor-icons/react';
import { Brand } from '@/components/brand';
import { Code39 } from '@/components/code39';
import { LoginDialog } from '@/components/login-dialog';
import { ThemeButton } from '@/components/theme-button';
import * as demo from '@/lib/demo';
import { dateLabel, number, rupiah } from '@/lib/format';
import { faq } from '@/lib/seo';
import { COMMUNITY_URL, redemptionOptions } from '@/lib/terms';
import type { Member } from '@/lib/types';

type Feature = [icon: Icon, text: string];

/* Kept short and scannable on purpose: one idea per line, no line longer than a
   phone can read at a glance. Detail belongs in the app, not on the landing. */
const cardFeatures: Feature[] = [
  [Barcode, 'Barcode langsung discan kasir'],
  [DownloadSimple, 'Simpan ke galeri, tetap jalan offline'],
  [Camera, 'Pasang foto profil di kartumu'],
  [DeviceMobile, 'Pasang di layar utama HP'],
];

const pointFeatures: Feature[] = [
  [Sparkle, 'Saldo poin kelihatan paling depan'],
  [Receipt, 'Poin masuk dan poin tertukar, tercatat rapi'],
  [ListMagnifyingGlass, 'Ketuk transaksi buat lihat detailnya'],
];

const accessFeatures: Feature[] = [
  [DeviceMobile, 'Cukup nomor HP atau nomor kartu'],
  [LockKey, 'Tanpa password, tanpa daftar ulang'],
  [ShieldCheck, 'Data kamu privat, cuma kamu yang lihat'],
];

/* What membership is actually worth, concrete first. "Tahu duluan" is the fourth
   perk but it lives in the paragraph instead: it is the reason to tap the
   WhatsApp button, so it belongs next to it rather than in this list. */
const memberPerks: Feature[] = [
  [Percent, 'Diskon 10% untuk layanan di Prodia'],
  [Ticket, 'Poin kamu bisa ditukar jadi voucher'],
  [Gift, 'Promo spesial khusus member'],
];

/* The no-break space is load-bearing: `text-wrap: balance` otherwise splits this
   as "Kartu Member" / "& Poin Kamu," because that rag is a hair more even, which
   leaves the ampersand orphaned at the head of a line. Gluing it to "Member"
   forces the break after it, where a conjunction belongs. Written as an escape
   so a formatter cannot silently turn it back into a plain space. */
const HEADLINE_LEAD = 'Kartu Member\u00A0& Poin Kamu,';
/* First phrase is the one in copywritingseo.md; it is what screen readers get
   and what renders before the rotation starts. */
const HEADLINE_PHRASES = ['Sekarang di HP', 'Selalu Kebawa', 'Gampang Dicek', 'Siap Dipakai'];

const redemptionSteps = [
  'Belanja di outlet Beauty Kendari kayak biasa',
  'Tunjukkan kartu member dari HP kamu',
  'Bilang ke kasir mau tukar berapa poin — beres',
];

function FeatureList({ items }: { items: Feature[] }) {
  return (
    <ul className="landing-features">
      {items.map(([Icon, text]) => (
        <li key={text}>
          <span className="landing-feature-icon"><Icon size={20} /></span>
          {text}
        </li>
      ))}
    </ul>
  );
}

/**
 * The real membership card and points screen, rendered live from the sample
 * member. Showing the actual UI keeps the hero sharp on every screen, follows
 * dark mode, and costs no image bytes — and the sample member means no real
 * customer data is ever published.
 */
function PhoneShowcase({ member }: { member: Member }) {
  return (
    <div className="showcase">
      <div className="showcase-glow" aria-hidden="true" />
      <div className="showcase-phone" aria-hidden="true">
        <span className="showcase-key showcase-key-silent" />
        <span className="showcase-key showcase-key-up" />
        <span className="showcase-key showcase-key-down" />
        <span className="showcase-key showcase-key-power" />
        <div className="showcase-screen">
          <span className="showcase-island" />

          <div className="showcase-bar">
            <Brand />
            <span className="showcase-bar-actions">
              <Moon size={13} />
              <span className="showcase-bar-divider" />
              <span className="showcase-avatar">NP</span>
            </span>
          </div>

          <div className="showcase-body">
            <div className="showcase-greeting">
              <span className="showcase-greeting-kicker">RUANG MEMBER</span>
              <strong>Halo, {member.firstName}!</strong>
              <p>Kartu member dan poin, selalu dekat denganmu.</p>
            </div>

            <div className="membership-card showcase-card">
              <Heart className="card-heart heart-one" weight="thin" />
              <div className="card-top">
                <Brand light />
                <span className="gold-label"><Crown size={12} weight="fill" />{member.tier} MEMBER</span>
              </div>
              <div className="card-bottom">
                <div>
                  <span className="card-label">YOUR BEAUTY MEMBERSHIP</span>
                  <span className="card-name">{member.name}</span>
                  <span className="card-number">{member.card}<Copy size={9} /></span>
                </div>
                <span className="card-qr">
                  <Code39 value={member.card} width={80} height={30} title={`Contoh barcode kartu member ${member.card}`} />
                  <span><Barcode size={9} />Lihat barcode</span>
                </span>
              </div>
              <div className="card-footer"><span>Teman perjalanan cantikmu.</span><span>beauty member</span></div>
            </div>

            <span className="showcase-card-note">Kartu contoh. Bukan kartu member asli.</span>
            {member.expires && (
              <span className="showcase-validity">
                <ShieldCheck size={12} weight="fill" />Kartu aktif sampai <strong>{member.expires}</strong>
              </span>
            )}

            <div className="showcase-points">
              <div className="showcase-points-top">
                <span className="showcase-points-label"><Sparkle size={13} weight="duotone" />Saldo poin kamu</span>
                <span className="showcase-pill"><CheckCircle size={10} weight="fill" />Aktif</span>
              </div>
              <strong className="showcase-points-value">{number(member.points)}<span>poin</span></strong>
              <span className="showcase-points-rule" />
              <span className="showcase-points-note">
                <Gift size={16} />
                <span><strong>100 poin = {rupiah(10000)}</strong>Tukar langsung di kasir outlet.</span>
              </span>
              <span className="showcase-points-link">Cara menggunakan poin <ArrowRight size={12} /></span>
            </div>

            <div className="showcase-activity">
              <span className="showcase-activity-head">Aktivitas terbaru</span>
              {demo.transactions.slice(0, 2).map(transaction => (
                <span className="showcase-activity-row" key={transaction.id}>
                  <span className="showcase-activity-icon">{transaction.points < 0 ? <Gift size={12} /> : <Receipt size={12} />}</span>
                  <span className="showcase-activity-copy">
                    <strong>{transaction.points < 0 ? 'Penukaran poin' : 'Belanja di outlet'}</strong>
                    <small>{dateLabel(transaction.date)}</small>
                  </span>
                  <span className={transaction.points < 0 ? 'showcase-out' : 'showcase-in'}>
                    {transaction.points > 0 ? '+' : ''}{number(transaction.points)}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="showcase-nav">
            <span className="showcase-nav-active"><House size={15} weight="fill" />Beranda</span>
            <span><Clock size={15} />Riwayat poin</span>
            <span><Gift size={15} />Info penukaran</span>
          </div>
        </div>
        <span className="showcase-badge showcase-badge-one"><Sparkle size={15} weight="fill" />Poin nambah otomatis</span>
        <span className="showcase-badge showcase-badge-two"><Barcode size={15} />Scan di kasir</span>
      </div>
      <p className="showcase-note">Tampilan aplikasi dengan kartu contoh. Bukan data member asli.</p>
    </div>
  );
}

/**
 * Two lines: a fixed opener whose words rise in one at a time, then a phrase
 * that cycles. Only the first phrase is exposed to assistive tech, so the
 * headline is still read as the single sentence the copy deck specifies.
 */
function Headline() {
  return (
    <h1 className="landing-headline">
      <span className="landing-headline-lead">
        {HEADLINE_LEAD.split(' ').map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            {index > 0 && ' '}
            <span className="landing-word" style={{ '--word-index': index } as CSSProperties}>{word}</span>
          </Fragment>
        ))}
      </span>
      <span className="landing-rotator">
        <span className="landing-rotator-track">
          {[...HEADLINE_PHRASES, HEADLINE_PHRASES[0]].map((phrase, index) => (
            <span key={index} aria-hidden={index > 0 || undefined}>{phrase}</span>
          ))}
        </span>
      </span>
    </h1>
  );
}

/** Public landing page and sign-in, served as the one crawlable route. */
export function Landing({ demo: isDemo, notice, sample }: { demo: boolean; notice?: string; sample?: Member }) {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-header-inner">
          <Link href="/login"><Brand /></Link>
          <div className="landing-header-actions">
            {isDemo && <Link href="/" className="text-link landing-demo-link">Lihat demo <ArrowUpRight size={14} /></Link>}
            <ThemeButton />
            <a className="button primary small" href="#masuk" data-login-open>Masuk</a>
          </div>
        </div>
      </header>

      <main>
        {notice && (
          <div className="landing-notice" role="status">
            <Info size={18} />
            <p>{notice}</p>
            <a className="text-link" href="#masuk" data-login-open>Masuk lagi <ArrowRight size={15} /></a>
          </div>
        )}

        <section className="landing-hero">
          <div className="landing-hero-copy">
            <Headline />
            <p className="landing-lead">Nggak perlu bawa kartu fisik lagi. Buka HP, tunjukkan ke kasir, selesai.</p>
            <div className="landing-cta">
              <a className="button primary" href="#masuk" data-login-open>Masuk ke akun member <ArrowRight size={18} /></a>
              <a className="button secondary" href="#kartu">Lihat cara kerjanya</a>
            </div>
            <ul className="landing-trust">
              <li><Gift size={17} />100 poin = Rp10.000</li>
              <li><LockKey size={17} />Tanpa password</li>
              <li><WifiSlash size={17} />Tetap jalan offline</li>
            </ul>
          </div>
          <PhoneShowcase member={demo.member} />
        </section>

        <section className="landing-section" id="kartu" aria-labelledby="kartu-title">
          <div className="landing-head">
            <span className="landing-kicker">Kartu member digital</span>
            <h2 id="kartu-title">Kartu Member Kamu, Selalu Ada di HP</h2>
            <p>Lupa bawa kartu fisik? Buka HP, tunjukkan barcode ke kasir — selesai.</p>
          </div>
          <FeatureList items={cardFeatures} />
        </section>

        <section className="landing-section landing-split landing-tinted" id="poin" aria-labelledby="poin-title">
          <div>
            <div className="landing-head">
              <span className="landing-kicker">Saldo &amp; riwayat poin</span>
              <h2 id="poin-title">Cek Poin Kapan Aja, Nggak Perlu Nanya Kasir</h2>
              <p>Tiap belanja, poin nambah otomatis. Buka aplikasi, saldonya langsung kelihatan.</p>
            </div>
            <FeatureList items={pointFeatures} />
          </div>
          <div className="landing-panel landing-history" aria-hidden="true">
            <div className="landing-history-top">
              <span>Aktivitas poin</span>
              <span className="showcase-pill"><CheckCircle size={12} weight="fill" />Kartu aktif</span>
            </div>
            <ul>
              {demo.transactions.slice(0, 4).map(transaction => (
                <li key={transaction.id}>
                  <span className="landing-history-icon">{transaction.points < 0 ? <Gift size={17} /> : <Receipt size={17} />}</span>
                  <span className="landing-history-copy">
                    <strong>{transaction.points < 0 ? 'Penukaran poin di kasir' : 'Belanja di Beauty Kendari'}</strong>
                    <small>{dateLabel(transaction.date)}{transaction.amount > 0 ? ` · ${rupiah(transaction.amount)}` : ''}</small>
                  </span>
                  <span className={transaction.points < 0 ? 'showcase-out' : 'showcase-in'}>
                    {transaction.points > 0 ? '+' : ''}{number(transaction.points)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="landing-history-note">Contoh tampilan riwayat poin.</p>
          </div>
        </section>

        <section className="landing-section landing-split" id="tukar" aria-labelledby="tukar-title">
          <div>
            <div className="landing-head">
              <span className="landing-kicker">Tukar poin</span>
              <h2 id="tukar-title">Poin Kamu Bisa Jadi Potongan Belanja</h2>
              <p>Poin yang udah ngumpul jangan cuma didiemin. Tukar aja pas lagi belanja — langsung jadi potongan di kasir.</p>
            </div>
            <ol className="landing-steps">
              {redemptionSteps.map((step, index) => (
                <li key={step}><span className="landing-step-number">{index + 1}</span>{step}</li>
              ))}
            </ol>
          </div>
          <div className="landing-panel landing-redemption">
            <span className="circle-icon"><Gift size={24} /></span>
            <h3>Pilihan penukaran</h3>
            <table className="redemption-table">
              <caption className="sr-only">Jumlah poin yang ditukar dan nilai potongannya</caption>
              <thead><tr><th scope="col">Poin yang ditukar</th><th scope="col">Kamu hemat</th></tr></thead>
              <tbody>
                {redemptionOptions.map(option => (
                  <tr key={option.points}>
                    <th scope="row">{number(option.points)} <span>poin</span></th>
                    <td>{rupiah(option.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <span className="redemption-note"><Info size={16} />Penukaran diproses kasir dengan kartu membermu.</span>
          </div>
        </section>

        <section className="landing-community" aria-labelledby="komunitas-title">
          <Image src="/beauty-still-life.webp" alt="Koleksi skincare dan kosmetik Beauty Kendari" fill sizes="100vw" />
          <div className="landing-community-copy">
            <span className="landing-kicker landing-kicker-light">Benefit member</span>
            <h2 id="komunitas-title">Enaknya Jadi Member Beauty</h2>
            <ul className="landing-perks">
              {memberPerks.map(([Icon, text]) => (
                <li key={text}>
                  <span className="landing-perk-icon"><Icon size={18} weight="fill" /></span>
                  {text}
                </li>
              ))}
            </ul>
            <p>Info promo dan event selalu masuk duluan ke grup WhatsApp member. Gabung aja, gratis.</p>
            <a className="button primary" href={COMMUNITY_URL} target="_blank" rel="noreferrer">
              <WhatsappLogo size={19} weight="fill" />Gabung Grup Member
            </a>
          </div>
        </section>

        <section className="landing-section landing-split landing-tinted landing-access" id="masuk" aria-labelledby="masuk-title">
          <div>
            <div className="landing-head">
              <span className="landing-kicker">Kemudahan akses</span>
              <h2 id="masuk-title">Masuk Cukup Pakai Nomor HP</h2>
              <p>Akunmu sudah dibuat waktu daftar di kasir. Tinggal masuk.</p>
            </div>
            <FeatureList items={accessFeatures} />
          </div>
          <div className="landing-panel landing-login-cta">
            <span className="circle-icon"><LockKey size={24} /></span>
            <h3>Masuk ke akun membermu</h3>
            <button type="button" className="button primary full" data-login-open>Masuk sekarang <ArrowRight size={18} /></button>
            <span className="login-assurance"><ShieldCheck size={15} />Masuk praktis, tanpa password.</span>
            <p className="registration-note">Belum menjadi member?<span>Daftar langsung di kasir outlet Beauty Kendari.</span></p>
          </div>
        </section>

        <section className="landing-section landing-split landing-faq-section" aria-labelledby="faq-title">
          <div className="landing-head">
            <span className="landing-kicker">FAQ</span>
            <h2 id="faq-title">Yang sering ditanya member</h2>
            <p>Belum ketemu jawabannya? Tanya langsung ke kasir outlet Beauty Kendari.</p>
          </div>
          <div className="faq-section">
            {faq.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}<CaretDown size={19} /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <Brand />
        <p>Program member resmi Beauty Kendari. Pendaftaran member dilakukan langsung di kasir outlet.</p>
        <span>© {new Date().getFullYear()} Beauty Kendari</span>
      </footer>

      <LoginDialog demo={isDemo} sample={sample} />
    </div>
  );
}

# Design System — Beauty Kendari

Acuan satu pintu untuk tampilan member app dan landing `/login`. Semua nilai mentah
(warna, ukuran, jarak, durasi) hidup di [app/styles/tokens.css](app/styles/tokens.css).
Stylesheet lain cuma membaca token — kalau butuh nilai baru, tambahkan token dulu.

## Struktur file

| File | Isi |
|---|---|
| [app/globals.css](app/globals.css) | Entry, hanya `@import` berurutan |
| [app/styles/tokens.css](app/styles/tokens.css) | Palet, warna semantik, tipografi, spacing, radius, motion, z-index, dark mode |
| [app/styles/base.css](app/styles/base.css) | Reset, tipografi dokumen, utilitas (`.sr-only`, `.skip-link`, `.eyebrow`, `.serif`) |
| [app/styles/components.css](app/styles/components.css) | Primitif bersama: brand, button, icon-chip, pill, kartu member, modal, login sheet, FAQ, tabel penukaran |
| [app/styles/member.css](app/styles/member.css) | Shell member (sidebar, topbar, bottom nav) + halaman Beranda, Riwayat, Info, sheet Akun |
| [app/styles/landing.css](app/styles/landing.css) | Landing publik `/login` |

## Warna

- **Brand** `--pink` (#FE3E9F) untuk logo, ikon, dekorasi. **Jangan** jadi warna teks
  atau latar teks putih — kontrasnya cuma 3.3:1.
- **Aksi utama** `--primary` / `--primary-gradient` (pink-600 → 700). Teks putih di atasnya lolos AA.
- **Teks aksen / link** `--pink-deep` (7.2:1 di putih; otomatis terang di dark mode).
- **Teks**: `--ink` (utama) → `--ink-soft` (isi kartu) → `--muted` (sekunder) → `--faint` (tersier, masih AA).
  `--icon-subtle` khusus chevron/dekorasi, **bukan** teks.
- **Permukaan**: `--ground` (halaman) → `--surface` (kartu/sheet) → `--surface-2` (sumur di dalam kartu) → `--surface-3` (segmented control, hover).
- **Status**: `--positive` (poin masuk), `--danger` (error, keluar akun), `--whatsapp` (semua CTA WhatsApp), `--gold-foil` (mahkota di kartu).
- **Kartu member**: `--card-gradient`. Stop warnanya diulang manual di SVG export
  [components/member-card.tsx](components/member-card.tsx) — ubah keduanya bersamaan.

Satu keluarga abu-abu (`--plum-*`, bernuansa plum). Jangan campur abu dingin/netral.

## Tipografi

- **Sans** `--font-sans` (Plus Jakarta Sans) untuk semua UI.
- **Serif** `--font-serif` (Instrument Serif, dimuat via `next/font`) hanya untuk
  judul halaman, headline landing, judul sheet login, banner, dan aksen miring
  (`<em>`). Jangan untuk teks kecil di bawah 20px kecuali aksen seperti "setiamu.".
- Skala: `--text-3xs` 11 · `2xs` 12 · `xs` 13 · `sm` 14 · `base` 15 · `lg` 17 · `xl` 20 · `2xl` 24 ·
  `3xl` 30–40 (judul halaman) · `4xl` 32–48 (judul seksi landing) · `5xl` 38–68 (headline) · `--text-number` (saldo poin).
- **11px adalah batas bawah** untuk teks yang harus dibaca member. Pengecualian
  satu-satunya: mockup HP mini di hero landing (`.showcase-*`), yang memang skala kecil.
- Berat huruf: 400 / 500 / 600 / 700 / 800 saja.
- Angka (poin, rupiah, nomor kartu) selalu `font-variant-numeric: tabular-nums`.
- Label huruf kapital pakai `.eyebrow` (11px, tracking `--tracking-caps`). Tulis teksnya
  sentence case di markup; CSS yang meng-kapitalkan.

## Spacing, radius, elevasi

- Spacing kelipatan 4: `--space-1` 4 · `2` 8 · `3` 12 · `4` 16 · `5` 20 · `6` 24 · `7` 32 · `8` 40 · `9` 56 · `10` 72.
- Radius: `--r-xs` 8 · `sm` 10 · `md` 14 · `lg` 18 · `xl` 24 · `2xl` 32 · `pill`.
  Konsentris: kontainer `xl`, elemen di dalamnya `md`/`sm`.
- Bayangan bernuansa plum: `--shadow-xs` (tombol sekunder) → `sm` (panel) → `md` (kartu penting) → `lg` (sheet, dropdown).
  `--shadow-primary` khusus tombol utama, `--shadow-card` khusus kartu member.
- Target sentuh minimum `--tap` (44px).

## Motion

- `--ease` untuk hampir semua transisi; `--ease-spring` untuk pop kecil (indikator nav).
- Durasi: `--dur-fast` 140ms (hover warna) · `--dur` 200ms (default) · `--dur-slow` 320ms (sheet masuk).
- Hanya animasikan `transform` dan `opacity`. `prefers-reduced-motion` mematikan semuanya di base.css.

## Komponen

| Kelas | Pakai untuk |
|---|---|
| `.button.primary` | Satu aksi utama per layar |
| `.button.secondary` | Aksi pendamping |
| `.button.soft` | Aksi dalam panel (mis. "Muat lebih banyak") |
| `.small` / `.large` / `.full` | Ukuran 38 / 52px, lebar penuh |
| `.icon-button` | Tombol ikon 40px (tema, tutup, keluar) |
| `.text-link` | Link teks aksen dengan panah |
| `.icon-chip` (+ `.small`, `.neutral`, `.whatsapp`) | Kotak ikon ber-tint di baris/panel |
| `.status-pill` | Status positif ("Aktif") |
| `.eyebrow` | Label kapital di atas judul |
| `.empty-state` (+ `.error-state`) | Daftar kosong / gagal muat |
| `.membership-card` | Kartu member (dipakai app, modal, dan mockup landing) |
| `.scan-panel` | Barcode besar untuk dipindai kasir — selalu putih, di mode apa pun |

## Tema

Default terang. Mode gelap hanya jika member memilih; pilihan disimpan di
`localStorage['beauty-theme']` dan diterapkan skrip inline di
[app/layout.tsx](app/layout.tsx) sebelum paint pertama, jadi tidak berkedip.
Token gelap ada di blok `:root[data-theme='dark']` di tokens.css.

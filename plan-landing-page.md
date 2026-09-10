# Rencana Landing Page — SEO & Ads

## State sekarang

- `/` redirect ke `/login?alasan=sesi` kalau belum ada sesi ([lib/load.ts](lib/load.ts)) — `/login` udah otomatis jadi tampilan awal pengunjung baru.
- [app/login/page.tsx](app/login/page.tsx) cuma render form login + JSON-LD. Konten marketing nol.
- [copywritingseo.md](copywritingseo.md) udah lengkap: hero, 5 section fitur, tabel poin, FAQ, CTA — belum nempel ke UI manapun.
- [lib/seo.ts](lib/seo.ts) + JSON-LD (Organization/WebSite/ProgramMembership/FAQPage) udah jalan di `/login`.
- [app/robots.ts](app/robots.ts) & [app/sitemap.ts](app/sitemap.ts) cuma allow `/login`. Rute lain sengaja noindex (data member asli).
- Asset visual: cuma 1 foto produk (`beauty-still-life.webp`) + logo/icon di `public/`. Belum ada mockup kartu/screenshot app.

## Keputusan

- **Route**: landing digabung di `/login` (bukan rute baru). Satu URL nampung SEO + jadi tujuan ads + tetap jalur masuk.
- **Tracking**: GA4 dulu (Google Ads / Meta Pixel nanti kalau udah ada akun).
- **Hero visual**: screenshot app asli (bukan foto produk stok).

## Struktur `/login` (landing + login satu halaman)

1. **Hero** — H1 "Kartu Member & Poin Kamu, Sekarang di HP" + sub-headline + screenshot app asli (kartu member/dashboard, ambil dari `demo.member` biar gak bocorin data member asli) jadi visual utama. CTA scroll ke form login di bawah.
2. **Section Kartu Member Digital** — H2 + bullet dari copywritingseo.md.
3. **Section Saldo & Riwayat Poin**.
4. **Section Tukar Poin** — tabel 100/200/500 poin + langkah.
5. **Section Komunitas** — CTA gabung grup WA.
6. **Section Kemudahan Akses** — nyambung langsung ke form login (Affari, nomor HP/kartu).
7. **FAQ** — pakai `<details>` (kebaca crawler tanpa JS), isi persis 6 pertanyaan yang match `landingJsonLd` FAQPage.
8. **Form login** — pindah ke modal (lihat Hasil eksekusi). Section 6 nyisain panel CTA
   yang bukanya.

## Teknis SEO

- `robots.ts` / `sitemap.ts` gak ubah — masih cuma allow `/login`.
- Heading H1/H2 disamain persis teks copywritingseo.md biar cocok sama title/meta description.
- Alt text tiap gambar diisi.

## Teknis Ads-ready

- Hero screenshot pakai `next/image` + `priority` (LCP cepat).
- Pasang GA4 (`NEXT_PUBLIC_GA_ID` di env, script di `app/layout.tsx`, load client-side aja, gak ganggu SSR).
- Cek redirect `'/login?alasan=sesi'` gak strip query param lain (`utm_source` dst) — supaya traffic dari ads kebaca sumbernya.
- Mobile-first (audience HP), cek Lighthouse/Core Web Vitals pas kelar.

## Keputusan hero (diambil pas eksekusi)

Hero **bukan** pakai screenshot PNG. Yang dipajang: mockup HP berisi UI aplikasi asli
yang di-render live dari `lib/demo.ts` — kartu member, saldo poin, dan dua baris riwayat.
Alasannya: tajam di layar retina, ikut mode gelap, nol berat gambar (LCP-nya teks, bukan
raster), dan tetap nggak bocorin data member asli. Foto `beauty-still-life.webp` pindah
jadi latar section Komunitas.

## Hasil eksekusi

- [components/landing.tsx](components/landing.tsx) — halaman publik: header sticky, hero +
  mockup HP, 5 section, FAQ `<details>`, footer.
- Mockup HP pakai rasio handset asli 1:2.14 (aspect-ratio dikunci dengan `.showcase-screen`
  absolute — kalau nggak, content-based minimum size bikin frame melar jadi gendut). Isinya
  layar beranda app: top bar, sapaan, kartu, masa aktif, kartu poin, aktivitas, bottom nav.
- Headline hero dua baris: pembuka `Kartu Member & Poin Kamu,` naik per kata (jeda 50 ms,
  durasi 450 ms), baris kedua muter 4 frasa dalam gradien pink — CSS murni, track 5 item
  (4 frasa + ulang frasa pertama) supaya loop-nya nggak kedip. Frasa non-kanonik diberi
  `aria-hidden`, jadi screen reader tetap baca satu kalimat sesuai copywritingseo.md.
- Bagian putih dan bagian ber-tint (`--surface-2`) selang-seling: `#poin` dan `#masuk`
  jadi band ber-tint dengan sudut membulat di ≥900px. Garis hairline dilepas di tiap batas
  yang warnanya sudah beda.
- [components/login-dialog.tsx](components/login-dialog.tsx) — form login pindah ke sheet
  `<dialog>` native. Di mobile `#masuk` itu section, dan formnya ada paling bawah setelah 4
  kartu fitur, jadi scroll dari tombol "Masuk" mendarat di judul, bukan di form. Sekarang
  semua elemen `[data-login-open]` (header, hero, panel akses) buka sheet yang sama dalam
  satu ketuk. Login memang sudah butuh JavaScript (fetch ke `/api/login`), jadi nggak ada
  yang hilang. Bottom sheet di HP, kartu di tengah pada ≥600px; focus trap, Esc, dan
  backdrop dari platform — bukan library dialog.
- [components/brand.tsx](components/brand.tsx) & [components/theme-button.tsx](components/theme-button.tsx)
  — dicabut dari `beauty-app.tsx` biar landing nggak narik bundel app member.
- `Login` lama di `beauty-app.tsx` dihapus; CSS `.login-page`/`.login-visual` yang jadi mati
  ikut dibersihin. Rule `main { … }` di globals.css di-scope ke `.app-shell main` karena
  bocor ke `<main>` landing.
- FAQ landing dan `FAQPage` schema baca array yang sama (`faq` di [lib/seo.ts](lib/seo.ts)),
  jadi nggak bisa beda.
- GA4 di [app/layout.tsx](app/layout.tsx) lewat `next/script`, mati total selama
  `NEXT_PUBLIC_GA_ID` kosong.
- `loadMemberData(searchParams)` sekarang bawa `utm_*`/`gclid` ikut pas redirect ke `/login`.
- Lighthouse (build produksi, emulasi mobile): accessibility 100, best practices 100,
  SEO 100, CLS 0 — stabil tiap run. Skor performance goyang 52–88 antar-run di mesin dev
  (CPU rebutan sama dev server), jadi jangan dipercaya dari sini; ukur ulang lewat
  PageSpeed Insights setelah deploy. Run paling bersih: performance 88, LCP 2.0–2.9 s.

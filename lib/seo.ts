/**
 * Public SEO surface. `/login` is the only crawlable route — every other page
 * renders a real member's card, balance and transactions, so the root layout
 * defaults to noindex and only the login page opts back in.
 */

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://member.beautykendari.id').replace(/\/+$/, '');

export const siteName = 'Beauty Kendari';
export const landingTitle = 'Beauty Member Kendari — Kartu & Poin Belanja di HP';
export const landingDescription = 'Kartu member Beauty Kendari sekarang ada di HP kamu. Cek poin kapan aja, lihat riwayat belanja, tukar poin jadi potongan harga. 100 poin = Rp10.000.';

export const ogImage = { url: '/beauty-still-life.webp', width: 1400, height: 933, alt: 'Koleksi skincare dan kosmetik Beauty Kendari' };

/** Rendered on the landing page and emitted as FAQPage schema — one source so the two never drift. */
export const faq = [
  ['Gimana cara pakai poinnya?', 'Pas belanja di outlet, tunjukkan aja kartu member dari HP kamu ke kasir. Nanti kasir yang bantu cek saldo dan proses penukarannya.'],
  ['Bisa tukar poin lewat aplikasi langsung?', 'Belum bisa. Penukaran poin dilakukan kasir di outlet. Aplikasinya buat lihat kartu, cek saldo, dan riwayat poin kamu.'],
  ['1 poin nilainya berapa?', '100 poin = Rp10.000, 200 poin = Rp20.000, 500 poin = Rp50.000.'],
  ['Gimana caranya jadi member?', 'Daftar langsung di kasir outlet Beauty Kendari. Cepat kok, cukup sekali.'],
  ['Kalau lagi nggak ada internet, kartunya masih bisa dipakai?', 'Bisa. Simpan dulu kartunya ke galeri HP, nanti tinggal tunjukkan ke kasir walau lagi offline.'],
  ['Poin aku kayaknya kurang, gimana?', 'Bawa nomor kartu sama struk belanja kamu ke kasir atau CS outlet. Mereka yang bantu cek dan betulin datanya.'],
] as const;

/** Organisation, loyalty programme and FAQ, emitted as one graph on the login page. */
export const landingJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/icon-512.png`,
      areaServed: 'Kendari, Sulawesi Tenggara, Indonesia',
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: landingTitle,
      url: siteUrl,
      inLanguage: 'id-ID',
      publisher: { '@id': `${siteUrl}/#organization` },
    },
    {
      '@type': 'ProgramMembership',
      '@id': `${siteUrl}/#membership`,
      programName: 'Beauty Member',
      description: 'Program member Beauty Kendari — kartu digital di HP, poin dari tiap belanja, dan penukaran poin jadi potongan harga di outlet.',
      hostingOrganization: { '@id': `${siteUrl}/#organization` },
    },
    {
      '@type': 'FAQPage',
      '@id': `${siteUrl}/login#faq`,
      inLanguage: 'id-ID',
      mainEntity: faq.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
    },
  ],
};

import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { landingDescription, landingTitle, ogImage, siteName, siteUrl } from '@/lib/seo';
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });
// Display serif for page titles and the landing headlines. Loaded rather than
// left to Georgia, which Android (most members) does not ship.
const instrument = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-instrument', display: 'swap' });
// Applies a saved dark theme before first paint, so it never flashes light.
const themeScript = `try{if(localStorage.getItem('beauty-theme')==='dark')document.documentElement.dataset.theme='dark'}catch(e){}`;
// Analytics stays off until a measurement id / beacon token is configured, so local
// and preview builds never report traffic into the production property. Both vars are
// inlined at build time (NEXT_PUBLIC_*), so they must be set before `next build`.
const gaId = process.env.NEXT_PUBLIC_GA_ID;
const cfBeaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: landingTitle, template: `%s | ${siteName}` },
  description: landingDescription,
  applicationName: siteName,
  appleWebApp: { capable: true, title: siteName, statusBarStyle: 'default' },
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  // Every member route renders real customer data; only /login opts back in.
  robots: { index: false, follow: false },
  openGraph: { type: 'website', siteName, locale: 'id_ID', title: landingTitle, description: landingDescription, url: '/login', images: [ogImage] },
  twitter: { card: 'summary_large_image', title: landingTitle, description: landingDescription, images: [ogImage.url] },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#FE3E9F' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The font variables sit on <html> so the :root tokens in tokens.css can read them.
    <html lang="id" className={`${jakarta.variable} ${instrument.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        {gaId && <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}</Script>
        </>}
        {cfBeaconToken && (
          <Script
            id="cf-web-analytics"
            src="https://static.cloudflareinsights.com/beacon.min.js"
            strategy="afterInteractive"
            data-cf-beacon={JSON.stringify({ token: cfBeaconToken })}
          />
        )}
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Landing } from '@/components/landing';
import { demoMode } from '@/lib/affari/client';
import * as demo from '@/lib/demo';
import { landingDescription, landingJsonLd, landingTitle } from '@/lib/seo';

const NOTICES: Record<string, string> = {
  sesi: 'Sesi kamu sudah berakhir. Masuk lagi dengan nomor HP atau nomor kartu.',
};

// The only public route: it opts back in to indexing that the root layout denies.
export const metadata: Metadata = {
  title: { absolute: landingTitle },
  description: landingDescription,
  alternates: { canonical: '/login' },
  robots: { index: true, follow: true },
};

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { alasan } = await searchParams;
  const isDemo = demoMode();
  const notice = typeof alasan === 'string' ? NOTICES[alasan] : undefined;
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(landingJsonLd) }} />
    <Landing demo={isDemo} notice={notice} sample={isDemo ? demo.member : undefined} />
  </>;
}

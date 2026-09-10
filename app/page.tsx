import type { Metadata } from 'next';
import { BeautyApp } from '@/components/beauty-app';
import { loadMemberData } from '@/lib/load';
import { siteName } from '@/lib/seo';

// The root page shares the root layout's segment, so the title template does not apply here.
export const metadata: Metadata = { title: { absolute: `Kartu & poin kamu | ${siteName}` } };
// Member data is per-request and must never be prerendered or shared.
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <BeautyApp page="home" data={await loadMemberData(await searchParams)} />; }

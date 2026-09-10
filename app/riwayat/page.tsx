import type { Metadata } from 'next';
import { BeautyApp } from '@/components/beauty-app';
import { loadMemberData } from '@/lib/load';

export const metadata: Metadata = { title: 'Riwayat poin' };
// Member data is per-request and must never be prerendered or shared.
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <BeautyApp page="history" data={await loadMemberData(await searchParams)} />; }

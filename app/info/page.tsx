import type { Metadata } from 'next';
import { BeautyApp } from '@/components/beauty-app';
import { loadMemberData } from '@/lib/load';

export const metadata: Metadata = { title: 'Cara tukar poin' };
// Member data is per-request and must never be prerendered or shared.
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) { return <BeautyApp page="info" data={await loadMemberData(await searchParams)} />; }

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { demoMode } from '@/lib/affari/client';
import * as demo from '@/lib/demo';
import { readSession, SESSION_COOKIE } from '@/lib/session';

const MAX_UPLOAD_SIZE = 1024 * 1024;
const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store',
  'X-Content-Type-Options': 'nosniff',
};

async function currentMemberCode() {
  if (demoMode()) return demo.member.kode;
  return readSession((await cookies()).get(SESSION_COOKIE)?.value);
}

async function profilePhotoKey(memberCode: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(memberCode));
  const hash = [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
  return `profile-photos/v1/${hash}.webp`;
}

function profilePhotoBucket(): R2Bucket | null {
  try {
    return getCloudflareContext().env.PROFILE_PHOTOS ?? null;
  } catch {
    return null;
  }
}

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  const requestUrl = new URL(request.url);
  if (origin === requestUrl.origin) return true;

  // Next.js builds request.url from the configured dev hostname (0.0.0.0),
  // while browsers use the public Host value (for example localhost:3000).
  const host = request.headers.get('host')?.split(',', 1)[0].trim();
  if (!host) return false;

  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',', 1)[0].trim();
  const protocol = forwardedProtocol || requestUrl.protocol.slice(0, -1);
  return origin === `${protocol}://${host}`;
}

function isWebP(bytes: Uint8Array) {
  return bytes.length >= 12
    && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF'
    && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
}

export async function GET() {
  const memberCode = await currentMemberCode();
  if (!memberCode) return NextResponse.json({ error: 'Sesi telah berakhir. Silakan masuk kembali.' }, { status: 401, headers: NO_STORE_HEADERS });

  const bucket = profilePhotoBucket();
  if (!bucket) return NextResponse.json({ error: 'Penyimpanan foto belum tersedia.' }, { status: 503, headers: NO_STORE_HEADERS });

  const object = await bucket.get(await profilePhotoKey(memberCode));
  if (!object) return new Response(null, { status: 404, headers: NO_STORE_HEADERS });

  const headers = new Headers(NO_STORE_HEADERS);
  headers.set('Content-Type', object.httpMetadata?.contentType ?? 'image/webp');
  headers.set('ETag', object.httpEtag);
  headers.set('Cache-Control', 'private, no-store');
  return new Response(await object.arrayBuffer(), { headers });
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Permintaan tidak diizinkan.' }, { status: 403, headers: NO_STORE_HEADERS });

  const memberCode = await currentMemberCode();
  if (!memberCode) return NextResponse.json({ error: 'Sesi telah berakhir. Silakan masuk kembali.' }, { status: 401, headers: NO_STORE_HEADERS });

  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (contentType !== 'image/webp') return NextResponse.json({ error: 'Format foto tidak didukung.' }, { status: 415, headers: NO_STORE_HEADERS });
  if (contentLength > MAX_UPLOAD_SIZE) return NextResponse.json({ error: 'Foto hasil pemrosesan terlalu besar.' }, { status: 413, headers: NO_STORE_HEADERS });

  const body = await request.arrayBuffer();
  if (!body.byteLength || body.byteLength > MAX_UPLOAD_SIZE || !isWebP(new Uint8Array(body))) {
    return NextResponse.json({ error: 'File foto tidak valid.' }, { status: 400, headers: NO_STORE_HEADERS });
  }

  const bucket = profilePhotoBucket();
  if (!bucket) return NextResponse.json({ error: 'Penyimpanan foto belum tersedia.' }, { status: 503, headers: NO_STORE_HEADERS });

  await bucket.put(await profilePhotoKey(memberCode), body, {
    httpMetadata: { contentType: 'image/webp', cacheControl: 'private, no-store' },
  });
  return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Permintaan tidak diizinkan.' }, { status: 403, headers: NO_STORE_HEADERS });

  const memberCode = await currentMemberCode();
  if (!memberCode) return NextResponse.json({ error: 'Sesi telah berakhir. Silakan masuk kembali.' }, { status: 401, headers: NO_STORE_HEADERS });

  const bucket = profilePhotoBucket();
  if (!bucket) return NextResponse.json({ error: 'Penyimpanan foto belum tersedia.' }, { status: 503, headers: NO_STORE_HEADERS });

  await bucket.delete(await profilePhotoKey(memberCode));
  return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS });
}

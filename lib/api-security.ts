import { NextResponse } from 'next/server';
import { createSupabaseAdmin } from './supabase-admin';

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function getBearerToken(req: Request) {
  const authHeader = req.headers.get('authorization');
  return authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
}

export async function requireUser(req: Request) {
  const token = getBearerToken(req);
  if (!token) return { user: null, error: jsonError('Unauthorized', 401) };

  const supabaseAdmin = createSupabaseAdmin();
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return { user: null, error: jsonError('Unauthorized', 401) };

  return { user: data.user, error: null };
}

export async function requireAdmin(req: Request) {
  const auth = await requireUser(req);
  if (auth.error || !auth.user) return auth;

  const supabaseAdmin = createSupabaseAdmin();
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', auth.user.id)
    .single();

  if (profile?.role !== 'admin') {
    return { user: null, error: jsonError('Forbidden', 403) };
  }

  return auth;
}

export function requireInternalSecret(req: Request) {
  const configured = process.env.INTERNAL_API_SECRET || process.env.TRIGGER_SECRET;
  if (!configured) return false;

  const headerSecret = req.headers.get('x-internal-secret');
  const bearer = getBearerToken(req);
  return headerSecret === configured || bearer === configured;
}

export function getRequestOrigin(req: Request) {
  const urlOrigin = req.url.startsWith('http') ? new URL(req.url).origin : '';
  return req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || urlOrigin || 'http://localhost:3000';
}

export function isUuid(value: unknown) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

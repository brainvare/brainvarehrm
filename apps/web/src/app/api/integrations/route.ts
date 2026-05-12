import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvDelete, kvSeedOnce } from '@/lib/kv-store';

const NS = 'integration';
const SEED = [
  { name: 'Slack', category: 'Communication', status: 'ACTIVE', connected: true, lastSync: '2026-04-19T10:00:00Z', icon: 'slack' },
  { name: 'Google Workspace', category: 'Productivity', status: 'ACTIVE', connected: true, lastSync: '2026-04-19T09:30:00Z', icon: 'google' },
  { name: 'Razorpay', category: 'Payments', status: 'CONFIGURED', connected: false, lastSync: null, icon: 'payment' },
  { name: 'Zoho Books', category: 'Accounting', status: 'NOT_CONFIGURED', connected: false, lastSync: null, icon: 'accounting' },
  { name: 'Jira', category: 'Project Management', status: 'NOT_CONFIGURED', connected: false, lastSync: null, icon: 'jira' },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList(NS);
  return NextResponse.json({ data, total: data.length });
}
export async function POST(request: Request) {
  const body = await request.json();
  const i = await kvCreate(NS, { status: 'NOT_CONFIGURED', connected: false, ...body });
  return NextResponse.json(i, { status: 201 });
}
export async function PUT(request: Request) {
  const { id, ...patch } = await request.json();
  const r = await kvUpdate(NS, id, patch);
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(r);
}
export async function DELETE(request: Request) {
  const { id } = await request.json();
  const ok = await kvDelete(NS, id);
  return ok ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
}

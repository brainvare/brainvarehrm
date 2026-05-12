import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvSeedOnce } from '@/lib/kv-store';

const NS = 'timesheet';
const SEED = [
  { employee: 'Sneha Reddy', code: 'EMP-0002', week: '2026-W16', project: 'BrainvareHRM v2.0', hours: { mon: 8, tue: 8, wed: 7, thu: 8, fri: 9, sat: 0, sun: 0 }, totalHours: 40, status: 'APPROVED', submittedAt: '2026-04-19' },
  { employee: 'Amit Kumar', code: 'EMP-0003', week: '2026-W16', project: 'Client Portal Redesign', hours: { mon: 8, tue: 7, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0 }, totalHours: 39, status: 'PENDING', submittedAt: '2026-04-19' },
  { employee: 'Rohit Mehta', code: 'EMP-0007', week: '2026-W16', project: 'BrainvareHRM v2.0', hours: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 3, sun: 0 }, totalHours: 43, status: 'PENDING', submittedAt: '2026-04-19' },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList(NS);
  return NextResponse.json({ data, total: data.length });
}
export async function POST(request: Request) {
  const body = await request.json();
  const t = await kvCreate(NS, { status: 'DRAFT', ...body });
  return NextResponse.json(t, { status: 201 });
}
export async function PUT(request: Request) {
  const { id, ...patch } = await request.json();
  const r = await kvUpdate(NS, id, patch);
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(r);
}

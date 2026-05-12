import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvDelete, kvSeedOnce } from '@/lib/kv-store';

const NS = 'project';
const SEED = [
  { name: 'BrainvareHRM v2.0', client: 'Internal', status: 'IN_PROGRESS', progress: 65, startDate: '2026-01-01', endDate: '2026-06-30', members: 6, budget: 5000000, spent: 3200000, manager: 'Arjun Nair' },
  { name: 'Client Portal Redesign', client: 'Acme Corp', status: 'IN_PROGRESS', progress: 40, startDate: '2026-03-01', endDate: '2026-07-31', members: 4, budget: 3000000, spent: 1200000, manager: 'Sneha Reddy' },
  { name: 'Mobile App MVP', client: 'Internal', status: 'PLANNING', progress: 10, startDate: '2026-05-01', endDate: '2026-09-30', members: 3, budget: 2000000, spent: 0, manager: 'Amit Kumar' },
  { name: 'Data Migration v1', client: 'TechStart Inc', status: 'COMPLETED', progress: 100, startDate: '2025-10-01', endDate: '2026-02-28', members: 5, budget: 4000000, spent: 3800000, manager: 'Rohit Mehta' },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList(NS);
  return NextResponse.json({ data, total: data.length });
}
export async function POST(request: Request) {
  const body = await request.json();
  const p = await kvCreate(NS, { progress: 0, status: 'PLANNING', spent: 0, ...body });
  return NextResponse.json(p, { status: 201 });
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

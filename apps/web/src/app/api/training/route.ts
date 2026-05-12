import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvDelete, kvSeedOnce } from '@/lib/kv-store';

const NS = 'training';
const SEED = [
  { title: 'React Advanced Patterns & Performance', category: 'Technical', mode: 'ONLINE', duration: 16, trainer: 'Sneha Reddy', startDate: '2026-05-05', endDate: '2026-05-09', participants: 12, maxParticipants: 20, status: 'UPCOMING', description: 'Advanced React patterns including compound components, render props, and performance optimization.' },
  { title: 'Leadership Fundamentals', category: 'Leadership', mode: 'CLASSROOM', duration: 8, trainer: 'External - Dr. Sharma', startDate: '2026-04-28', endDate: '2026-04-29', participants: 8, maxParticipants: 15, status: 'ACTIVE', description: 'Develop essential leadership skills for new managers.' },
  { title: 'POSH Compliance Training', category: 'Compliance', mode: 'ONLINE', duration: 2, trainer: 'HR Team', startDate: '2026-04-15', endDate: '2026-04-15', participants: 45, maxParticipants: 50, status: 'COMPLETED', description: 'Mandatory POSH awareness training.' },
  { title: 'Effective Communication Workshop', category: 'Soft Skills', mode: 'HYBRID', duration: 6, trainer: 'Priya Sharma', startDate: '2026-05-12', endDate: '2026-05-13', participants: 0, maxParticipants: 25, status: 'UPCOMING', description: 'Improve communication & stakeholder management.' },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList(NS);
  return NextResponse.json({ data, total: data.length });
}
export async function POST(request: Request) {
  const body = await request.json();
  const t = await kvCreate(NS, { participants: 0, status: 'UPCOMING', ...body });
  return NextResponse.json(t, { status: 201 });
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

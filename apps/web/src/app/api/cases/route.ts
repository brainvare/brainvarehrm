import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvSeedOnce } from '@/lib/kv-store';

const NS = 'case';
const SEED = [
  { title: 'Workplace harassment report', category: 'Grievance', priority: 'CRITICAL', status: 'UNDER_INVESTIGATION', reportedBy: 'Anonymous', assignedTo: 'HR Head', createdAt: '2026-04-10', isConfidential: true },
  { title: 'Policy violation — dress code', category: 'Disciplinary', priority: 'LOW', status: 'CLOSED', reportedBy: 'Manager', assignedTo: 'HR Team', createdAt: '2026-03-25', isConfidential: false },
  { title: 'Property damage complaint', category: 'Incident', priority: 'MEDIUM', status: 'OPEN', reportedBy: 'Admin Team', assignedTo: 'HR Team', createdAt: '2026-04-18', isConfidential: false },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList<any>(NS);
  const openCases = data.filter((c: any) => c.status !== 'CLOSED').length;
  return NextResponse.json({ data, total: data.length, openCases });
}
export async function POST(request: Request) {
  const body = await request.json();
  const c = await kvCreate(NS, { status: 'OPEN', createdAt: new Date().toISOString().split('T')[0], ...body });
  return NextResponse.json(c, { status: 201 });
}
export async function PUT(request: Request) {
  const { id, ...patch } = await request.json();
  const r = await kvUpdate(NS, id, patch);
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(r);
}

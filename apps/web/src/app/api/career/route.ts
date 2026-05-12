import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvDelete, kvSeedOnce } from '@/lib/kv-store';

const NS = 'career';
const SEED = [
  { title: 'Software Engineering Track', department: 'Engineering', description: 'Growth path from junior to technical leadership.', levels: [{ title: 'Junior Engineer', grade: 'L1', yearsExp: '0-2 years', skills: 'HTML, CSS, JS' }, { title: 'Software Engineer', grade: 'L2', yearsExp: '2-4 years', skills: 'React, Node.js, APIs' }, { title: 'Senior Engineer', grade: 'L3', yearsExp: '4-7 years', skills: 'System Design, Mentoring' }, { title: 'Staff Engineer', grade: 'L4', yearsExp: '7-10 years', skills: 'Architecture, Tech Strategy' }, { title: 'Principal Engineer', grade: 'L5', yearsExp: '10+ years', skills: 'Org-wide direction' }] },
  { title: 'Design Track', department: 'Design', description: 'From designer to design leadership.', levels: [{ title: 'Junior Designer', grade: 'L1', yearsExp: '0-2 years' }, { title: 'Product Designer', grade: 'L2', yearsExp: '2-4 years' }, { title: 'Senior Designer', grade: 'L3', yearsExp: '4-6 years' }, { title: 'Design Lead', grade: 'L4', yearsExp: '6+ years' }] },
  { title: 'People Operations Track', department: 'Human Resources', description: 'HR career progression.', levels: [{ title: 'HR Executive', grade: 'L1', yearsExp: '0-2 years' }, { title: 'HR Manager', grade: 'L2', yearsExp: '2-5 years' }, { title: 'Senior HRBP', grade: 'L3', yearsExp: '5-8 years' }, { title: 'HR Director', grade: 'L4', yearsExp: '8+ years' }] },
  { title: 'Marketing Track', department: 'Marketing', description: 'Content to CMO growth path.', levels: [{ title: 'Marketing Associate', grade: 'L1', yearsExp: '0-2 years' }, { title: 'Marketing Manager', grade: 'L2', yearsExp: '2-5 years' }, { title: 'Marketing Head', grade: 'L3', yearsExp: '5+ years' }] },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList(NS);
  return NextResponse.json({ data, total: data.length });
}
export async function POST(request: Request) {
  const body = await request.json();
  const c = await kvCreate(NS, { levels: [], ...body });
  return NextResponse.json(c, { status: 201 });
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

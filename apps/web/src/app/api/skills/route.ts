import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvDelete, kvSeedOnce } from '@/lib/kv-store';

const NS = 'skill';
const SEED = [
  { name: 'React.js', category: 'Technical', requiredLevel: 4, description: 'Component-based UI library', avgLevel: 3.6 },
  { name: 'TypeScript', category: 'Technical', requiredLevel: 4, description: 'Typed superset of JavaScript', avgLevel: 3.2 },
  { name: 'Node.js', category: 'Technical', requiredLevel: 3, description: 'Server-side JavaScript runtime', avgLevel: 3.5 },
  { name: 'System Design', category: 'Technical', requiredLevel: 4, description: 'Designing scalable systems', avgLevel: 2.8 },
  { name: 'UI/UX Design', category: 'Design', requiredLevel: 4, description: 'UI/UX principles', avgLevel: 3.0 },
  { name: 'Figma', category: 'Design', requiredLevel: 3, description: 'Collaborative design tool', avgLevel: 3.8 },
  { name: 'Project Management', category: 'Management', requiredLevel: 3, description: 'Plan, execute, close projects', avgLevel: 3.1 },
  { name: 'Communication', category: 'Communication', requiredLevel: 4, description: 'Written & verbal communication', avgLevel: 3.4 },
  { name: 'Data Analytics', category: 'Analytics', requiredLevel: 3, description: 'Analyzing data for insights', avgLevel: 2.5 },
  { name: 'Python', category: 'Technical', requiredLevel: 3, description: 'General-purpose programming', avgLevel: 2.9 },
  { name: 'AWS', category: 'Technical', requiredLevel: 3, description: 'Amazon Web Services', avgLevel: 2.4 },
  { name: 'SQL / Database', category: 'Technical', requiredLevel: 3, description: 'Relational DB design & queries', avgLevel: 3.3 },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList(NS);
  return NextResponse.json({ data, total: data.length });
}
export async function POST(request: Request) {
  const body = await request.json();
  const s = await kvCreate(NS, { avgLevel: 0, ...body });
  return NextResponse.json(s, { status: 201 });
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

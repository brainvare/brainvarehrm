import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvDelete, kvSeedOnce } from '@/lib/kv-store';

const NS = 'freelancer';
const SEED = [
  { name: 'Raj Singhania', email: 'raj@freelance.com', phone: '+91 98765 43210', company: 'Independent', skill: 'Motion Design', projectName: 'Brand Videos', rate: 60000, rateType: 'MONTHLY', currency: 'INR', status: 'ACTIVE', contractStart: '2026-02-01', contractEnd: '2026-06-30', notes: 'Excellent motion graphics for marketing', createdAt: '2026-02-01' },
  { name: 'Lisa Chen', email: 'lisa@design.co', phone: '+91 87654 32109', company: 'DesignCo Studio', skill: 'UI/UX Design', projectName: 'HRM Redesign', rate: 85000, rateType: 'MONTHLY', currency: 'INR', status: 'ACTIVE', contractStart: '2026-03-15', contractEnd: '2026-09-15', notes: 'Leading the UI overhaul', createdAt: '2026-03-15' },
  { name: 'Mohammed Hussain', email: 'mh@code.dev', phone: '+91 76543 21098', company: 'TechFreelance', skill: 'Backend Development', projectName: 'API Integration', rate: 100000, rateType: 'MONTHLY', currency: 'INR', status: 'COMPLETED', contractStart: '2025-11-01', contractEnd: '2026-02-28', notes: 'Completed API integration', createdAt: '2025-11-01' },
  { name: 'Ananya Iyer', email: 'ananya@content.in', phone: '+91 65432 10987', company: 'Independent', skill: 'Content Writing', projectName: 'Blog & SEO', rate: 35000, rateType: 'MONTHLY', currency: 'INR', status: 'ACTIVE', contractStart: '2026-04-01', contractEnd: '2026-10-01', notes: 'Weekly blog posts & SEO', createdAt: '2026-04-01' },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList(NS);
  return NextResponse.json({ data, total: data.length });
}
export async function POST(request: Request) {
  const body = await request.json();
  const f = await kvCreate(NS, { createdAt: new Date().toISOString(), ...body });
  return NextResponse.json(f, { status: 201 });
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

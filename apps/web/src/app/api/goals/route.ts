import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvDelete, kvSeedOnce } from '@/lib/kv-store';

const NS = 'goal';
const SEED = [
  { title: 'Increase Platform Adoption to 500 Users', category: 'COMPANY', priority: 'HIGH', ownerName: 'Leadership Team', status: 'ACTIVE', progress: 62, startDate: '2026-01-01', endDate: '2026-06-30', description: 'Drive internal product adoption across departments', keyResults: [{ id: 'kr1', title: 'Onboard 200 new users', target: '200 users', progress: 75 }, { id: 'kr2', title: 'Achieve 85% daily active rate', target: '85% DAU', progress: 55 }, { id: 'kr3', title: 'Reduce support tickets by 30%', target: '-30%', progress: 60 }] },
  { title: 'Launch Performance Module V2', category: 'TEAM', priority: 'HIGH', ownerName: 'Engineering', status: 'ACTIVE', progress: 40, startDate: '2026-02-01', endDate: '2026-05-31', description: 'Rebuild performance reviews with 360° feedback', keyResults: [{ id: 'kr4', title: 'Complete 360° feedback feature', target: 'Ship', progress: 60 }, { id: 'kr5', title: 'Migrate legacy reviews', target: '100%', progress: 20 }] },
  { title: 'Improve Employee Retention to 92%', category: 'COMPANY', priority: 'MEDIUM', ownerName: 'HR Team', status: 'ACTIVE', progress: 78, startDate: '2026-01-01', endDate: '2026-12-31', description: 'Reduce attrition through engagement programs', keyResults: [{ id: 'kr6', title: 'Run quarterly engagement surveys', target: '4 surveys', progress: 50 }, { id: 'kr7', title: 'Implement 3 wellness programs', target: '3 programs', progress: 100 }, { id: 'kr8', title: 'Achieve eNPS > 60', target: 'eNPS 60+', progress: 85 }] },
  { title: 'Complete Design System Overhaul', category: 'INDIVIDUAL', priority: 'MEDIUM', ownerName: 'Lisa Chen', status: 'COMPLETED', progress: 100, startDate: '2026-01-15', endDate: '2026-03-31', keyResults: [{ id: 'kr9', title: 'Design 40 components', target: '40 components', progress: 100 }, { id: 'kr10', title: 'Write docs for all tokens', target: '100% docs', progress: 100 }] },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList(NS);
  return NextResponse.json({ data, total: data.length });
}
export async function POST(request: Request) {
  const body = await request.json();
  const g = await kvCreate(NS, { progress: 0, keyResults: [], ...body });
  return NextResponse.json(g, { status: 201 });
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

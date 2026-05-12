import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvDelete, kvSeedOnce } from '@/lib/kv-store';

const NS = 'compliance';
const SEED = [
  { area: 'PF Registration', status: 'COMPLIANT', lastAudit: '2026-03-01', nextDue: '2026-09-01', risk: 'LOW' },
  { area: 'ESIC Registration', status: 'COMPLIANT', lastAudit: '2026-02-15', nextDue: '2026-08-15', risk: 'LOW' },
  { area: 'POSH Committee', status: 'COMPLIANT', lastAudit: '2026-01-10', nextDue: '2026-07-10', risk: 'LOW' },
  { area: 'Professional Tax', status: 'ATTENTION', lastAudit: '2025-12-01', nextDue: '2026-06-01', risk: 'MEDIUM' },
  { area: 'Labor Law Poster Display', status: 'COMPLIANT', lastAudit: '2026-03-15', nextDue: '2027-03-15', risk: 'LOW' },
  { area: 'GDPR Data Processing', status: 'ATTENTION', lastAudit: '2025-11-01', nextDue: '2026-05-01', risk: 'HIGH' },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList<any>(NS);
  const upcomingDeadlines = data.filter((c: any) => {
    const due = new Date(c.nextDue).getTime();
    return due - Date.now() < 60 * 86400000 && due > Date.now();
  }).length;
  const complianceScore = Math.round((data.filter((c: any) => c.status === 'COMPLIANT').length / Math.max(data.length, 1)) * 100);
  return NextResponse.json({ data, total: data.length, complianceScore, upcomingDeadlines });
}
export async function POST(request: Request) {
  const body = await request.json();
  const i = await kvCreate(NS, body);
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

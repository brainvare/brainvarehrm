import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvDelete, kvSeedOnce } from '@/lib/kv-store';

const NS = 'succession';
const SEED = [
  { positionTitle: 'VP Engineering', criticality: 'HIGH', readiness: 'READY_1_2', status: 'ACTIVE', currentHolderName: 'Rajesh Kumar', successors: [{ name: 'Sneha Reddy', readiness: 'Ready 1-2yr' }, { name: 'Rohit Mehta', readiness: 'Developing' }] },
  { positionTitle: 'Head of Design', criticality: 'HIGH', readiness: 'NOT_READY', status: 'ACTIVE', currentHolderName: 'Arun Desai', successors: [{ name: 'Lisa Chen', readiness: 'Developing' }] },
  { positionTitle: 'CHRO', criticality: 'HIGH', readiness: 'READY_NOW', status: 'ACTIVE', currentHolderName: 'Priya Sharma', successors: [{ name: 'Neha Gupta', readiness: 'Ready Now' }, { name: 'Kiran Das', readiness: 'Ready 1-2yr' }] },
  { positionTitle: 'Engineering Manager', criticality: 'MEDIUM', readiness: 'READY_NOW', status: 'ACTIVE', currentHolderName: 'Deepak Mishra', successors: [{ name: 'Sanya Gupta', readiness: 'Ready Now' }] },
  { positionTitle: 'Finance Director', criticality: 'MEDIUM', readiness: 'READY_1_2', status: 'ACTIVE', currentHolderName: 'Vikram Shah', successors: [] },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList(NS);
  return NextResponse.json({ data, total: data.length });
}
export async function POST(request: Request) {
  const body = await request.json();
  const p = await kvCreate(NS, { successors: [], ...body });
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

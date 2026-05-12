import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvDelete, kvSeedOnce } from '@/lib/kv-store';

const NS = 'workflow';
const SEED = [
  { name: 'Leave Approval', trigger: 'Leave Application', steps: ['Manager Approval', 'HR Review', 'Auto Update Balance'], status: 'ACTIVE', executions: 45, category: 'HR' },
  { name: 'Onboarding Checklist', trigger: 'New Hire', steps: ['IT Setup', 'HR Documents', 'Manager Introduction', 'Training Assignment'], status: 'ACTIVE', executions: 12, category: 'Onboarding' },
  { name: 'Exit Process', trigger: 'Resignation', steps: ['Manager Approval', 'Clearance Tasks', 'Asset Return', 'F&F Settlement'], status: 'ACTIVE', executions: 3, category: 'Exit' },
  { name: 'Expense Approval', trigger: 'Expense Claim', steps: ['Manager Approval', 'Finance Review', 'Reimbursement'], status: 'ACTIVE', executions: 28, category: 'Finance' },
  { name: 'Payroll Processing', trigger: 'Monthly Cycle', steps: ['Generate Payroll', 'Review', 'Approve', 'Process Payment'], status: 'ACTIVE', executions: 6, category: 'Payroll' },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList(NS);
  return NextResponse.json({ data, total: data.length });
}

export async function POST(request: Request) {
  const body = await request.json();
  const w = await kvCreate(NS, { ...body, status: body.status || 'DRAFT', executions: 0 });
  return NextResponse.json(w, { status: 201 });
}

export async function PUT(request: Request) {
  const { id, ...patch } = await request.json();
  const updated = await kvUpdate(NS, id, patch);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  const ok = await kvDelete(NS, id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}

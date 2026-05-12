import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvDelete, kvSeedOnce } from '@/lib/kv-store';

const NS = 'performance';
const SEED = [
  { employeeName: 'Sneha Reddy', employeeCode: 'EMP-0002', reviewPeriod: 'FY 2025-26 Annual', reviewType: 'ANNUAL', reviewerName: 'Rajesh Kumar', overallRating: 4.2, status: 'COMPLETED', managerComments: 'Excellent performance, consistently exceeds expectations.', selfAssessment: 'Delivered 3 major features on time, mentored 2 juniors.' },
  { employeeName: 'Amit Kumar', employeeCode: 'EMP-0003', reviewPeriod: 'FY 2025-26 Annual', reviewType: 'ANNUAL', reviewerName: 'Priya Sharma', overallRating: 3.8, status: 'IN_PROGRESS', managerComments: '', selfAssessment: '' },
  { employeeName: 'Priya Patel', employeeCode: 'EMP-0004', reviewPeriod: 'FY 2025-26 Annual', reviewType: 'ANNUAL', reviewerName: 'Rajesh Kumar', overallRating: 0, status: 'PENDING', managerComments: '', selfAssessment: '' },
  { employeeName: 'Rohit Mehta', employeeCode: 'EMP-0007', reviewPeriod: 'FY 2025-26 Annual', reviewType: 'ANNUAL', reviewerName: 'Sneha Reddy', overallRating: 4.5, status: 'COMPLETED', managerComments: 'Outstanding contributor. Ready for promotion.', selfAssessment: 'Led platform migration, improved performance by 40%.' },
  { employeeName: 'Neha Gupta', employeeCode: 'EMP-0005', reviewPeriod: 'Q4 2025 Review', reviewType: 'QUARTERLY', reviewerName: 'Amit Kumar', overallRating: 3.2, status: 'COMPLETED', managerComments: 'Meets expectations.', selfAssessment: '' },
  { employeeName: 'Kiran Das', employeeCode: 'EMP-0008', reviewPeriod: 'Probation Review', reviewType: 'PROBATION', reviewerName: 'HR Manager', overallRating: 4.0, status: 'COMPLETED', managerComments: 'Confirmed. Good adaptability.', selfAssessment: '' },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList(NS);
  return NextResponse.json({ data, total: data.length });
}
export async function POST(request: Request) {
  const body = await request.json();
  const r = await kvCreate(NS, { overallRating: 0, status: 'PENDING', managerComments: '', selfAssessment: '', ...body });
  return NextResponse.json(r, { status: 201 });
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

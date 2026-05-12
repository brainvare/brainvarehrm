import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvSeedOnce } from '@/lib/kv-store';

const NS = 'compensation';
const SEED = [
  { employeeName: 'Sneha Reddy', employeeCode: 'EMP-0002', department: 'Engineering', grade: 'L3', ctc: 1800000, basic: 720000, hra: 360000, allowances: 270000, lastRevision: 'Apr 2026', reason: 'Annual', hike: '12' },
  { employeeName: 'Amit Kumar', employeeCode: 'EMP-0003', department: 'Engineering', grade: 'L2', ctc: 1200000, basic: 480000, hra: 240000, allowances: 180000, lastRevision: 'Apr 2026', reason: 'Annual', hike: '10' },
  { employeeName: 'Priya Patel', employeeCode: 'EMP-0004', department: 'Design', grade: 'L3', ctc: 1500000, basic: 600000, hra: 300000, allowances: 225000, lastRevision: 'Apr 2025', reason: 'Annual', hike: '8' },
  { employeeName: 'Rohit Mehta', employeeCode: 'EMP-0007', department: 'Engineering', grade: 'L4', ctc: 2400000, basic: 960000, hra: 480000, allowances: 360000, lastRevision: 'Apr 2026', reason: 'Promotion', hike: '25' },
  { employeeName: 'Neha Gupta', employeeCode: 'EMP-0005', department: 'Human Resources', grade: 'L2', ctc: 900000, basic: 360000, hra: 180000, allowances: 135000, lastRevision: 'Apr 2025', reason: 'Annual', hike: '10' },
  { employeeName: 'Kiran Das', employeeCode: 'EMP-0008', department: 'Marketing', grade: 'L2', ctc: 1000000, basic: 400000, hra: 200000, allowances: 150000, lastRevision: 'Oct 2025', reason: 'Performance', hike: '15' },
  { employeeName: 'Deepak Mishra', employeeCode: 'EMP-0009', department: 'Engineering', grade: 'L4', ctc: 2800000, basic: 1120000, hra: 560000, allowances: 420000, lastRevision: 'Apr 2026', reason: 'Market Correction', hike: '18' },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList(NS);
  return NextResponse.json({ data, total: data.length });
}
export async function POST(request: Request) {
  const body = await request.json();
  await kvCreate(NS, body);
  return NextResponse.json({ success: true }, { status: 201 });
}

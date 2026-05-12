import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvSeedOnce } from '@/lib/kv-store';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

const NS = 'notification';
const SEED = [
  { title: 'Leave Approved', message: 'Your casual leave for Apr 21-22 has been approved', type: 'leave', read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { title: 'New Joiner', message: 'Karan Malhotra has joined as Software Engineer', type: 'joining', read: false, createdAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { title: 'Payslip Ready', message: 'March 2026 payslip is now available for download', type: 'payroll', read: false, createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  { title: 'Training Due', message: 'React 19 Advanced Patterns training is due by May 15', type: 'training', read: true, createdAt: new Date(Date.now() - 48 * 3600000).toISOString() },
  { title: 'Birthday', message: "Sneha Reddy's birthday is coming up on Apr 22", type: 'birthday', read: true, createdAt: new Date(Date.now() - 72 * 3600000).toISOString() },
  { title: 'Attendance Alert', message: 'Rohit Mehta missed clock-out yesterday', type: 'attendance', read: true, createdAt: new Date(Date.now() - 96 * 3600000).toISOString() },
];

export async function GET() {
  await kvSeedOnce(NS, SEED);
  const data = await kvList<any>(NS);
  const unreadCount = data.filter((n: any) => !n.read).length;
  return NextResponse.json({ data, unreadCount, total: data.length });
}
export async function POST(request: Request) {
  const body = await request.json();
  if (body.action === 'markAllRead') {
    const orgId = await getOrgId();
    const rows = await prisma.kvRecord.findMany({ where: { namespace: NS, organizationId: orgId } });
    for (const r of rows) {
      const v = JSON.parse(r.data);
      v.read = true;
      await prisma.kvRecord.update({ where: { id: r.id }, data: { data: JSON.stringify(v) } });
    }
    return NextResponse.json({ success: true, unreadCount: 0 });
  }
  if (body.action === 'markRead' && body.id) {
    await kvUpdate(NS, body.id, { read: true });
    return NextResponse.json({ success: true });
  }
  // Treat any other POST as creating a new notification
  const n = await kvCreate(NS, { read: false, createdAt: new Date().toISOString(), ...body });
  return NextResponse.json(n, { status: 201 });
}

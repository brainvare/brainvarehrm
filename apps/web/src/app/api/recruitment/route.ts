import { NextResponse } from 'next/server';
import { kvList, kvCreate, kvUpdate, kvDelete, kvSeedOnce } from '@/lib/kv-store';

const JOBS_NS = 'job';
const CANDS_NS = 'candidate';

const JOBS_SEED = [
  { title: 'Senior React Developer', department: 'Engineering', location: 'Bangalore', type: 'FULL_TIME', openings: 2, filled: 0, priority: 'HIGH', status: 'OPEN', publishedAt: '2026-04-10', salary: '₹15-25L', description: 'Experienced React developer with 5+ years building scalable web apps.', requirements: 'React, TypeScript, Node.js, System Design, CI/CD' },
  { title: 'UI/UX Designer', department: 'Design', location: 'Remote', type: 'FULL_TIME', openings: 1, filled: 0, priority: 'NORMAL', status: 'OPEN', publishedAt: '2026-04-05', salary: '₹10-18L', description: 'Designer with portfolio in enterprise SaaS.', requirements: 'Figma, Design Systems, User Research' },
  { title: 'Content Strategist', department: 'Marketing', location: 'Mumbai', type: 'CONTRACT', openings: 1, filled: 0, priority: 'NORMAL', status: 'OPEN', publishedAt: '2026-04-12', salary: '₹8-14L', description: 'Content strategist for marketing & brand.', requirements: 'SEO, Copywriting, Content Marketing' },
  { title: 'DevOps Engineer', department: 'Engineering', location: 'Bangalore', type: 'FULL_TIME', openings: 1, filled: 1, priority: 'URGENT', status: 'CLOSED', publishedAt: '2026-03-15', salary: '₹18-28L', description: 'DevOps with AWS and Kubernetes experience.', requirements: 'AWS, Terraform, Docker, K8s' },
  { title: 'HR Business Partner', department: 'Human Resources', location: 'Bangalore', type: 'FULL_TIME', openings: 1, filled: 0, priority: 'HIGH', status: 'OPEN', publishedAt: '2026-04-14', salary: '₹12-20L', description: 'Strategic HRBP partnering on talent and culture.', requirements: 'MBA HR, 5+ years HRBP' },
];

const CANDS_SEED = [
  { name: 'Ravi Kumar', email: 'ravi@example.com', phone: '+91 98765 43210', role: 'Senior React Developer', source: 'LinkedIn', stage: 'Applied', days: 2, rating: 0, experience: '6 years', notes: 'Strong portfolio, ex-Flipkart' },
  { name: 'Meera Shah', email: 'meera@example.com', phone: '+91 87654 32109', role: 'Senior React Developer', source: 'Referral', stage: 'Screening', days: 4, rating: 3.8, experience: '5 years', notes: 'Referred by Amit from Engineering' },
  { name: 'Yash Patel', email: 'yash@example.com', phone: '+91 76543 21098', role: 'UI/UX Designer', source: 'Website', stage: 'Applied', days: 3, rating: 0, experience: '3 years' },
  { name: 'Priyanka Nair', email: 'priyanka@example.com', phone: '+91 65432 10987', role: 'Senior React Developer', source: 'Naukri', stage: 'Interview', days: 7, rating: 4.2, experience: '7 years', notes: 'Excellent system design' },
  { name: 'Aditya Rao', email: 'aditya@example.com', phone: '', role: 'Content Strategist', source: 'LinkedIn', stage: 'Screening', days: 4, rating: 4.0, experience: '4 years' },
  { name: 'Deepak Mishra', email: 'deepak@example.com', phone: '+91 54321 09876', role: 'Senior React Developer', source: 'Referral', stage: 'Technical', days: 10, rating: 4.5, experience: '8 years', notes: 'Cleared all technical rounds' },
  { name: 'Sanya Gupta', email: 'sanya@example.com', phone: '', role: 'UI/UX Designer', source: 'Behance', stage: 'Technical', days: 8, rating: 4.0, experience: '5 years' },
  { name: 'Neha Verma', email: 'neha@example.com', phone: '+91 43210 98765', role: 'Content Strategist', source: 'LinkedIn', stage: 'HR Round', days: 12, rating: 4.3, experience: '6 years' },
  { name: 'Rohan Kapoor', email: 'rohan@example.com', phone: '+91 32109 87654', role: 'DevOps Engineer', source: 'Referral', stage: 'Offer', days: 18, rating: 4.7, experience: '7 years', notes: 'Offer sent' },
  { name: 'Kiran Deshpande', email: 'kiran@example.com', phone: '', role: 'HR Business Partner', source: 'LinkedIn', stage: 'Applied', days: 1, rating: 0, experience: '9 years' },
];

export async function GET() {
  await kvSeedOnce(JOBS_NS, JOBS_SEED);
  await kvSeedOnce(CANDS_NS, CANDS_SEED);
  const [jobs, candidates] = await Promise.all([kvList(JOBS_NS), kvList(CANDS_NS)]);
  return NextResponse.json({ jobs, candidates, total: jobs.length });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (body.type === 'candidate') {
    const { type: _t, ...rest } = body;
    void _t;
    const c = await kvCreate(CANDS_NS, rest);
    return NextResponse.json(c, { status: 201 });
  }
  const j = await kvCreate(JOBS_NS, {
    type: body.type || 'FULL_TIME', filled: 0, status: body.status || 'OPEN',
    publishedAt: new Date().toISOString().split('T')[0], ...body,
  });
  return NextResponse.json(j, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const ns = body.type === 'candidate' ? CANDS_NS : JOBS_NS;
  const { id, ...patch } = body;
  delete patch.type;
  const r = await kvUpdate(ns, id, patch);
  if (!r) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(r);
}

export async function DELETE(request: Request) {
  const { id, type } = await request.json();
  const ns = type === 'candidate' ? CANDS_NS : JOBS_NS;
  const ok = await kvDelete(ns, id);
  return ok ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Not found' }, { status: 404 });
}

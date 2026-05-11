import { SchemaType, FunctionDeclaration } from '@google/generative-ai';
import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

type ToolHandler = (args: any) => Promise<any>;

async function org() {
  const id = await getOrgId();
  if (!id) throw new Error('No organization configured');
  return id;
}

async function findEmployee(query: string) {
  const orgId = await org();
  const byId = await prisma.employee.findFirst({ where: { id: query, organizationId: orgId } });
  if (byId) return byId;
  const byEmail = await prisma.employee.findFirst({ where: { email: query, organizationId: orgId } });
  if (byEmail) return byEmail;
  const parts = query.split(/\s+/).filter(Boolean);
  return prisma.employee.findFirst({
    where: {
      organizationId: orgId,
      OR: [
        { firstName: { contains: parts[0] || query, mode: 'insensitive' } },
        { lastName: { contains: parts[parts.length - 1] || query, mode: 'insensitive' } },
        { employeeCode: { contains: query, mode: 'insensitive' } },
      ],
    },
  });
}

export const aiToolDeclarations: FunctionDeclaration[] = [
  {
    name: 'list_employees',
    description: 'List employees with optional filters by department or status. Returns up to 50 employees with basic info.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        department: { type: SchemaType.STRING, description: 'Department name or code (e.g. Engineering, HR)' },
        status: { type: SchemaType.STRING, description: 'ACTIVE, INACTIVE, ON_LEAVE, TERMINATED' },
      },
    } as any,
  },
  {
    name: 'get_employee',
    description: 'Get a single employee by ID, work email, employee code, or name.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        query: { type: SchemaType.STRING, description: 'Employee ID, email, code, or name' },
      },
      required: ['query'],
    } as any,
  },
  {
    name: 'get_org_stats',
    description: 'Get high-level organization statistics: total employees, departments, active leaves, open helpdesk tickets, pending expenses, etc.',
    parameters: { type: SchemaType.OBJECT, properties: {} } as any,
  },
  {
    name: 'list_departments',
    description: 'List all departments in the organization.',
    parameters: { type: SchemaType.OBJECT, properties: {} } as any,
  },
  {
    name: 'list_leave_requests',
    description: 'List leave requests/transactions, optionally filtered by status.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        status: { type: SchemaType.STRING, description: 'PENDING, APPROVED, REJECTED, CANCELLED' },
      },
    } as any,
  },
  {
    name: 'approve_leave',
    description: 'Approve a pending leave request by its transaction ID.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { transactionId: { type: SchemaType.STRING } },
      required: ['transactionId'],
    } as any,
  },
  {
    name: 'reject_leave',
    description: 'Reject a pending leave request.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        transactionId: { type: SchemaType.STRING },
        reason: { type: SchemaType.STRING },
      },
      required: ['transactionId'],
    } as any,
  },
  {
    name: 'list_announcements',
    description: 'List all current announcements.',
    parameters: { type: SchemaType.OBJECT, properties: {} } as any,
  },
  {
    name: 'create_announcement',
    description: 'Post a new company-wide announcement.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        content: { type: SchemaType.STRING },
        category: { type: SchemaType.STRING, description: 'General, Policy, Event, Holiday, Achievement, Alert' },
        priority: { type: SchemaType.STRING, description: 'LOW, NORMAL, HIGH, URGENT' },
        isPinned: { type: SchemaType.BOOLEAN },
      },
      required: ['title', 'content'],
    } as any,
  },
  {
    name: 'list_policies',
    description: 'List all HR policies.',
    parameters: { type: SchemaType.OBJECT, properties: {} } as any,
  },
  {
    name: 'create_policy',
    description: 'Create a new HR policy document.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        category: { type: SchemaType.STRING, description: 'Leave, Attendance, Code of Conduct, Compensation, etc.' },
        content: { type: SchemaType.STRING },
      },
      required: ['title', 'content'],
    } as any,
  },
  {
    name: 'list_helpdesk_tickets',
    description: 'List helpdesk tickets, optionally filtered by status.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { status: { type: SchemaType.STRING, description: 'OPEN, IN_PROGRESS, RESOLVED, CLOSED' } },
    } as any,
  },
  {
    name: 'create_helpdesk_ticket',
    description: 'Raise a helpdesk ticket on behalf of an employee.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        employeeQuery: { type: SchemaType.STRING, description: 'Employee ID, email, or name' },
        title: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING },
        category: { type: SchemaType.STRING, description: 'HR, IT, Admin, Payroll, Finance, Other' },
        priority: { type: SchemaType.STRING, description: 'LOW, MEDIUM, HIGH, URGENT' },
      },
      required: ['employeeQuery', 'title'],
    } as any,
  },
  {
    name: 'resolve_helpdesk_ticket',
    description: 'Mark a helpdesk ticket as resolved.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        ticketId: { type: SchemaType.STRING },
        resolution: { type: SchemaType.STRING },
      },
      required: ['ticketId'],
    } as any,
  },
  {
    name: 'list_expenses',
    description: 'List expense claims, optionally filtered by status.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { status: { type: SchemaType.STRING, description: 'PENDING, APPROVED, REJECTED' } },
    } as any,
  },
  {
    name: 'approve_expense',
    description: 'Approve a pending expense claim.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { expenseId: { type: SchemaType.STRING } },
      required: ['expenseId'],
    } as any,
  },
  {
    name: 'reject_expense',
    description: 'Reject an expense claim.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { expenseId: { type: SchemaType.STRING } },
      required: ['expenseId'],
    } as any,
  },
  {
    name: 'list_loans',
    description: 'List loans, optionally filtered by status.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { status: { type: SchemaType.STRING, description: 'PENDING, APPROVED, ACTIVE, CLOSED, REJECTED' } },
    } as any,
  },
  {
    name: 'create_loan',
    description: 'Create a loan application for an employee.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        employeeQuery: { type: SchemaType.STRING },
        type: { type: SchemaType.STRING, description: 'SALARY_ADVANCE, EMERGENCY, PERSONAL, HOME, VEHICLE' },
        amount: { type: SchemaType.NUMBER },
        tenure: { type: SchemaType.NUMBER, description: 'Months' },
        reason: { type: SchemaType.STRING },
      },
      required: ['employeeQuery', 'amount', 'tenure'],
    } as any,
  },
  {
    name: 'list_assets',
    description: 'List company assets, optionally filtered by status.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: { status: { type: SchemaType.STRING, description: 'AVAILABLE, ASSIGNED, MAINTENANCE, RETIRED' } },
    } as any,
  },
  {
    name: 'create_asset',
    description: 'Register a new company asset.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING },
        category: { type: SchemaType.STRING, description: 'Laptop, Monitor, Mobile, Accessory, Furniture, Other' },
        serialNo: { type: SchemaType.STRING },
        value: { type: SchemaType.NUMBER },
      },
      required: ['name', 'category'],
    } as any,
  },
  {
    name: 'assign_asset',
    description: 'Assign an asset to an employee.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        assetId: { type: SchemaType.STRING },
        employeeQuery: { type: SchemaType.STRING },
      },
      required: ['assetId', 'employeeQuery'],
    } as any,
  },
  {
    name: 'give_recognition',
    description: 'Give peer recognition from one employee to another.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        fromEmployeeQuery: { type: SchemaType.STRING },
        toEmployeeQuery: { type: SchemaType.STRING },
        message: { type: SchemaType.STRING },
        badge: { type: SchemaType.STRING, description: 'Emoji or short label (e.g. 🌟, 🚀)' },
        category: { type: SchemaType.STRING, description: 'Excellence, Innovation, Collaboration, Leadership, Initiative' },
      },
      required: ['fromEmployeeQuery', 'toEmployeeQuery', 'message'],
    } as any,
  },
  {
    name: 'award_xp',
    description: 'Award XP points to an employee for an action.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        employeeQuery: { type: SchemaType.STRING },
        amount: { type: SchemaType.NUMBER },
        action: { type: SchemaType.STRING, description: 'ATTENDANCE, TRAINING, SOCIAL, GOAL, WELLNESS, REFERRAL, BADGE' },
        description: { type: SchemaType.STRING },
      },
      required: ['employeeQuery', 'amount', 'action'],
    } as any,
  },
  {
    name: 'create_wellness_program',
    description: 'Create a new wellness program / challenge.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING },
        type: { type: SchemaType.STRING, description: 'Fitness, Mental Health, Health, Nutrition, Other' },
        schedule: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING },
      },
      required: ['name'],
    } as any,
  },
  {
    name: 'create_survey',
    description: 'Create a pulse survey.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        description: { type: SchemaType.STRING },
        deadlineDays: { type: SchemaType.NUMBER, description: 'Days from now until deadline' },
      },
      required: ['title'],
    } as any,
  },
  {
    name: 'post_social',
    description: 'Post a message to the company social feed.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        content: { type: SchemaType.STRING },
        type: { type: SchemaType.STRING, description: 'post, announcement, achievement, welcome, celebration' },
        authorEmployeeQuery: { type: SchemaType.STRING, description: 'Optional — defaults to system' },
      },
      required: ['content'],
    } as any,
  },
  {
    name: 'create_travel_request',
    description: 'Create a travel request for an employee.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        employeeQuery: { type: SchemaType.STRING },
        destination: { type: SchemaType.STRING },
        purpose: { type: SchemaType.STRING },
        startDate: { type: SchemaType.STRING, description: 'YYYY-MM-DD' },
        endDate: { type: SchemaType.STRING, description: 'YYYY-MM-DD' },
        estimatedCost: { type: SchemaType.NUMBER },
      },
      required: ['employeeQuery', 'destination', 'startDate', 'endDate'],
    } as any,
  },
  {
    name: 'log_overtime',
    description: 'Log an overtime entry for an employee.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        employeeQuery: { type: SchemaType.STRING },
        hours: { type: SchemaType.NUMBER },
        rate: { type: SchemaType.NUMBER, description: 'Per-hour rate, default 500' },
        reason: { type: SchemaType.STRING },
      },
      required: ['employeeQuery', 'hours'],
    } as any,
  },
];

export const aiToolHandlers: Record<string, ToolHandler> = {
  list_employees: async ({ department, status }) => {
    const orgId = await org();
    const where: any = { organizationId: orgId };
    if (status) where.employmentStatus = status;
    if (department) {
      where.department = { OR: [{ name: { contains: department, mode: 'insensitive' } }, { code: { equals: department, mode: 'insensitive' } }] };
    }
    const employees = await prisma.employee.findMany({
      where, take: 50,
      include: { department: true, designation: true },
    });
    return employees.map(e => ({
      id: e.id, name: `${e.firstName} ${e.lastName}`, code: e.employeeCode,
      email: e.email, status: e.employmentStatus,
      department: e.department?.name, designation: e.designation?.title,
    }));
  },

  get_employee: async ({ query }) => {
    const emp = await findEmployee(query);
    if (!emp) return { error: `No employee found for "${query}"` };
    return {
      id: emp.id, code: emp.employeeCode,
      name: `${emp.firstName} ${emp.lastName}`,
      email: emp.email, personalEmail: emp.personalEmail,
      phone: emp.phone, status: emp.employmentStatus,
      dateOfJoining: emp.dateOfJoining, departmentId: emp.departmentId,
      designationId: emp.designationId,
    };
  },

  get_org_stats: async () => {
    const orgId = await org();
    const [emp, dept, openLeaves, openTickets, pendingExp, pendingLoans, activeAnn] = await Promise.all([
      prisma.employee.count({ where: { organizationId: orgId, employmentStatus: 'ACTIVE' } }),
      prisma.department.count({ where: { organizationId: orgId } }),
      prisma.leaveTransaction.count({ where: { employee: { organizationId: orgId }, status: 'PENDING' } }),
      prisma.helpdeskTicket.count({ where: { organizationId: orgId, status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.expense.count({ where: { organizationId: orgId, status: 'PENDING' } }),
      prisma.loan.count({ where: { organizationId: orgId, status: 'PENDING' } }),
      prisma.announcement.count({ where: { organizationId: orgId } }),
    ]);
    return { activeEmployees: emp, departments: dept, pendingLeaves: openLeaves, openTickets, pendingExpenses: pendingExp, pendingLoans, announcements: activeAnn };
  },

  list_departments: async () => {
    const orgId = await org();
    const depts = await prisma.department.findMany({ where: { organizationId: orgId } });
    return depts.map(d => ({ id: d.id, name: d.name, code: d.code }));
  },

  list_leave_requests: async ({ status }) => {
    const orgId = await org();
    const where: any = { employee: { organizationId: orgId } };
    if (status) where.status = status;
    const txns = await prisma.leaveTransaction.findMany({
      where, take: 30, orderBy: { createdAt: 'desc' },
      include: { employee: true, leaveType: true },
    });
    return txns.map(t => ({
      id: t.id, employee: `${t.employee.firstName} ${t.employee.lastName}`,
      type: t.leaveType.name, startDate: t.startDate, endDate: t.endDate,
      days: t.days, status: t.status, reason: t.reason,
    }));
  },

  approve_leave: async ({ transactionId }) => {
    const updated = await prisma.leaveTransaction.update({
      where: { id: transactionId }, data: { status: 'APPROVED' },
    });
    return { ok: true, id: updated.id, status: updated.status };
  },

  reject_leave: async ({ transactionId, reason }) => {
    const updated = await prisma.leaveTransaction.update({
      where: { id: transactionId },
      data: { status: 'REJECTED', rejectionReason: reason },
    });
    return { ok: true, id: updated.id, status: updated.status };
  },

  list_announcements: async () => {
    const orgId = await org();
    return prisma.announcement.findMany({
      where: { organizationId: orgId },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 20,
    });
  },

  create_announcement: async ({ title, content, category, priority, isPinned }) => {
    const orgId = await org();
    const a = await prisma.announcement.create({
      data: {
        title, content,
        category: category || 'General',
        priority: priority || 'NORMAL',
        isPinned: !!isPinned,
        organizationId: orgId, authorName: 'AI Copilot',
      },
    });
    return { ok: true, id: a.id, title: a.title };
  },

  list_policies: async () => {
    const orgId = await org();
    return prisma.policy.findMany({ where: { organizationId: orgId }, take: 50 });
  },

  create_policy: async ({ title, category, content }) => {
    const orgId = await org();
    const p = await prisma.policy.create({
      data: { title, category: category || 'General', content, organizationId: orgId, effectiveFrom: new Date() },
    });
    return { ok: true, id: p.id, title: p.title };
  },

  list_helpdesk_tickets: async ({ status }) => {
    const orgId = await org();
    const where: any = { organizationId: orgId };
    if (status) where.status = status;
    const tickets = await prisma.helpdeskTicket.findMany({
      where, take: 30, orderBy: { createdAt: 'desc' },
      include: { raisedBy: true },
    });
    return tickets.map(t => ({
      id: t.id, title: t.title, status: t.status, priority: t.priority,
      category: t.category, raisedBy: `${t.raisedBy.firstName} ${t.raisedBy.lastName}`,
      createdAt: t.createdAt,
    }));
  },

  create_helpdesk_ticket: async ({ employeeQuery, title, description, category, priority }) => {
    const emp = await findEmployee(employeeQuery);
    if (!emp) return { error: `Employee not found: ${employeeQuery}` };
    const orgId = await org();
    const t = await prisma.helpdeskTicket.create({
      data: {
        title, description: description || '',
        category: category || 'HR', priority: priority || 'MEDIUM',
        raisedById: emp.id, organizationId: orgId,
      },
    });
    return { ok: true, id: t.id, title: t.title };
  },

  resolve_helpdesk_ticket: async ({ ticketId, resolution }) => {
    const t = await prisma.helpdeskTicket.update({
      where: { id: ticketId },
      data: { status: 'RESOLVED', resolution: resolution || 'Resolved by AI Copilot', resolvedAt: new Date() },
    });
    return { ok: true, id: t.id, status: t.status };
  },

  list_expenses: async ({ status }) => {
    const orgId = await org();
    const where: any = { organizationId: orgId };
    if (status) where.status = status;
    const expenses = await prisma.expense.findMany({
      where, take: 30, orderBy: { createdAt: 'desc' },
      include: { employee: true },
    });
    return expenses.map(e => ({
      id: e.id, employee: `${e.employee.firstName} ${e.employee.lastName}`,
      category: e.category, amount: e.amount, status: e.status, description: e.description,
    }));
  },

  approve_expense: async ({ expenseId }) => {
    const e = await prisma.expense.update({
      where: { id: expenseId },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: 'AI Copilot' },
    });
    return { ok: true, id: e.id, status: e.status };
  },

  reject_expense: async ({ expenseId }) => {
    const e = await prisma.expense.update({ where: { id: expenseId }, data: { status: 'REJECTED' } });
    return { ok: true, id: e.id, status: e.status };
  },

  list_loans: async ({ status }) => {
    const orgId = await org();
    const where: any = { organizationId: orgId };
    if (status) where.status = status;
    const loans = await prisma.loan.findMany({
      where, take: 30, orderBy: { createdAt: 'desc' },
      include: { employee: true },
    });
    return loans.map(l => ({
      id: l.id, employee: `${l.employee.firstName} ${l.employee.lastName}`,
      type: l.type, amount: l.amount, status: l.status, emi: l.emi, tenure: l.tenure,
    }));
  },

  create_loan: async ({ employeeQuery, type, amount, tenure, reason }) => {
    const emp = await findEmployee(employeeQuery);
    if (!emp) return { error: `Employee not found: ${employeeQuery}` };
    const orgId = await org();
    const emi = Math.round(amount / tenure);
    const l = await prisma.loan.create({
      data: {
        employeeId: emp.id, organizationId: orgId,
        type: type || 'SALARY_ADVANCE', amount, tenure, emi,
        outstanding: amount, reason: reason || '',
      },
    });
    return { ok: true, id: l.id, amount: l.amount, emi: l.emi };
  },

  list_assets: async ({ status }) => {
    const orgId = await org();
    const where: any = { organizationId: orgId };
    if (status) where.status = status;
    const assets = await prisma.asset.findMany({
      where, take: 50, orderBy: { createdAt: 'desc' },
      include: { assignedTo: true },
    });
    return assets.map(a => ({
      id: a.id, name: a.name, category: a.category, status: a.status,
      assignedTo: a.assignedTo ? `${a.assignedTo.firstName} ${a.assignedTo.lastName}` : null,
      value: a.value, serialNo: a.serialNo,
    }));
  },

  create_asset: async ({ name, category, serialNo, value }) => {
    const orgId = await org();
    const a = await prisma.asset.create({
      data: { name, category, serialNo, value, organizationId: orgId },
    });
    return { ok: true, id: a.id, name: a.name };
  },

  assign_asset: async ({ assetId, employeeQuery }) => {
    const emp = await findEmployee(employeeQuery);
    if (!emp) return { error: `Employee not found: ${employeeQuery}` };
    const a = await prisma.asset.update({
      where: { id: assetId },
      data: { assignedToId: emp.id, status: 'ASSIGNED' },
    });
    return { ok: true, id: a.id, assignedTo: `${emp.firstName} ${emp.lastName}` };
  },

  give_recognition: async ({ fromEmployeeQuery, toEmployeeQuery, message, badge, category }) => {
    const from = await findEmployee(fromEmployeeQuery);
    const to = await findEmployee(toEmployeeQuery);
    if (!from) return { error: `From-employee not found: ${fromEmployeeQuery}` };
    if (!to) return { error: `To-employee not found: ${toEmployeeQuery}` };
    const orgId = await org();
    const r = await prisma.recognition.create({
      data: {
        fromEmployeeId: from.id, toEmployeeId: to.id, organizationId: orgId,
        message, badge: badge || '🌟', category: category || 'Excellence',
      },
    });
    return { ok: true, id: r.id, from: `${from.firstName} ${from.lastName}`, to: `${to.firstName} ${to.lastName}` };
  },

  award_xp: async ({ employeeQuery, amount, action, description }) => {
    const emp = await findEmployee(employeeQuery);
    if (!emp) return { error: `Employee not found: ${employeeQuery}` };
    const orgId = await org();
    const tx = await prisma.xpTransaction.create({
      data: { employeeId: emp.id, amount, action, description: description || '' },
    });
    const existing = await prisma.employeeLevel.findUnique({ where: { employeeId: emp.id } });
    if (existing) {
      await prisma.employeeLevel.update({
        where: { employeeId: emp.id },
        data: { xp: existing.xp + amount, level: Math.floor((existing.xp + amount) / 250) + 1 },
      });
    } else {
      await prisma.employeeLevel.create({
        data: { employeeId: emp.id, organizationId: orgId, xp: amount, level: Math.floor(amount / 250) + 1 },
      });
    }
    return { ok: true, id: tx.id, amount, employee: `${emp.firstName} ${emp.lastName}` };
  },

  create_wellness_program: async ({ name, type, schedule, description }) => {
    const orgId = await org();
    const w = await prisma.wellnessProgram.create({
      data: { name, type: type || 'Fitness', schedule, description, organizationId: orgId },
    });
    return { ok: true, id: w.id, name: w.name };
  },

  create_survey: async ({ title, description, deadlineDays }) => {
    const orgId = await org();
    const deadline = deadlineDays ? new Date(Date.now() + deadlineDays * 86400000) : null;
    const empCount = await prisma.employee.count({ where: { organizationId: orgId, employmentStatus: 'ACTIVE' } });
    const s = await prisma.survey.create({
      data: { title, description, organizationId: orgId, status: 'ACTIVE', deadline, totalTargeted: empCount },
    });
    return { ok: true, id: s.id, title: s.title };
  },

  post_social: async ({ content, type, authorEmployeeQuery }) => {
    const orgId = await org();
    let authorId: string | undefined;
    let authorName = 'AI Copilot';
    if (authorEmployeeQuery) {
      const emp = await findEmployee(authorEmployeeQuery);
      if (emp) { authorId = emp.id; authorName = `${emp.firstName} ${emp.lastName}`; }
    }
    const p = await prisma.socialPost.create({
      data: { content, type: type || 'post', authorId, authorName, organizationId: orgId },
    });
    return { ok: true, id: p.id };
  },

  create_travel_request: async ({ employeeQuery, destination, purpose, startDate, endDate, estimatedCost }) => {
    const emp = await findEmployee(employeeQuery);
    if (!emp) return { error: `Employee not found: ${employeeQuery}` };
    const orgId = await org();
    const t = await prisma.travelRequest.create({
      data: {
        employeeId: emp.id, organizationId: orgId,
        destination, purpose: purpose || '',
        startDate: new Date(startDate), endDate: new Date(endDate),
        estimatedCost: estimatedCost || 0,
      },
    });
    return { ok: true, id: t.id, destination };
  },

  log_overtime: async ({ employeeQuery, hours, rate, reason }) => {
    const emp = await findEmployee(employeeQuery);
    if (!emp) return { error: `Employee not found: ${employeeQuery}` };
    const orgId = await org();
    const r = rate || 500;
    const o = await prisma.overtimeEntry.create({
      data: {
        employeeId: emp.id, organizationId: orgId,
        date: new Date(), hours, rate: r, amount: hours * r,
        reason: reason || '',
      },
    });
    return { ok: true, id: o.id, hours, amount: o.amount };
  },
};

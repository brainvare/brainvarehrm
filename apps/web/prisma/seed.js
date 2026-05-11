// BrainvareHRM — Database Seed
// Run: npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed.ts

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding BrainvareHRM database...\n');

  // ─── Cleanup (idempotent reseed) ───
  console.log('🧹 Clearing existing data...');
  const tables = [
    'xpTransaction', 'badgeAward', 'employeeLevel', 'badgeType',
    'surveyResponse', 'survey', 'socialPost', 'wellnessProgram', 'travelRequest',
    'asset', 'recognition', 'overtimeEntry', 'helpdeskTicket', 'expense',
    'loan', 'loanRepayment', 'announcement',
    'auditLog', 'user', 'letterIssue', 'letterTemplate', 'document',
    'clearanceTask', 'exitCase', 'onboardingTask', 'payrollEntry', 'payrollRun',
    'salaryStructure', 'leaveTransaction', 'leaveBalance', 'leaveType',
    'attendanceRecord', 'shift', 'emergencyContact', 'employeeAddress',
    'employee', 'holiday', 'grade', 'designation', 'location', 'department',
    'policy', 'position', 'benefit', 'organization',
  ];
  for (const t of tables) {
    try { await prisma[t].deleteMany({}); } catch {}
  }
  console.log('✅ Cleared\n');

  // ─── Organization ───
  const org = await prisma.organization.create({
    data: {
      name: 'Brainvare Technologies',
      legalName: 'Brainvare Technologies Pvt. Ltd.',
      industry: 'Technology',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    },
  });
  console.log('✅ Organization created:', org.name);

  // ─── Departments ───
  const deptData = [
    { name: 'Engineering', code: 'ENG' },
    { name: 'Human Resources', code: 'HR' },
    { name: 'Design', code: 'DES' },
    { name: 'Marketing', code: 'MKT' },
    { name: 'Finance', code: 'FIN' },
    { name: 'Operations', code: 'OPS' },
  ];
  const departments = {};
  for (const d of deptData) {
    const dept = await prisma.department.create({
      data: { ...d, organizationId: org.id },
    });
    departments[d.code] = dept;
  }
  console.log('✅ 6 departments created');

  // ─── Locations ───
  const loc = await prisma.location.create({
    data: {
      name: 'Bangalore HQ',
      code: 'BLR-HQ',
      address: '42, 3rd Cross, Koramangala',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      pincode: '560034',
      organizationId: org.id,
    },
  });
  console.log('✅ Location created:', loc.name);

  // ─── Designations ───
  const desigData = [
    'CEO', 'CTO', 'VP Engineering', 'Sr. Developer', 'Developer',
    'Jr. Developer', 'HR Manager', 'HR Executive', 'Designer', 'Marketing Manager',
  ];
  const designations = {};
  for (const title of desigData) {
    const d = await prisma.designation.create({
      data: { title, organizationId: org.id },
    });
    designations[title] = d;
  }
  console.log('✅ 10 designations created');

  // ─── Grades ───
  const gradeData = [
    { name: 'L1 — Entry', level: 1 },
    { name: 'L2 — Junior', level: 2 },
    { name: 'L3 — Mid', level: 3 },
    { name: 'L4 — Senior', level: 4 },
    { name: 'L5 — Lead', level: 5 },
    { name: 'L6 — Director', level: 6 },
    { name: 'L7 — VP', level: 7 },
    { name: 'L8 — CXO', level: 8 },
  ];
  const grades = {};
  for (const g of gradeData) {
    const grade = await prisma.grade.create({
      data: { ...g, organizationId: org.id },
    });
    grades[g.name] = grade;
  }
  console.log('✅ 8 grades created');

  // ─── Shifts ───
  const shift = await prisma.shift.create({
    data: {
      name: 'General Shift',
      code: 'GEN',
      startTime: '09:00',
      endTime: '18:00',
      graceMinutes: 15,
      organizationId: org.id,
    },
  });
  console.log('✅ Shift created:', shift.name);

  // ─── Employees ───
  const empData = [
    { firstName: 'Arjun', lastName: 'Nair', email: 'arjun@brainvare.com', phone: '+91 98765 43210', gender: 'MALE', dateOfBirth: '1985-06-15', dateOfJoining: '2020-01-15', designation: 'CEO', grade: 'L8 — CXO', dept: 'ENG', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'HYBRID', pan: 'ABCPN1234A', bank: 'HDFC Bank', bankAcc: '50100012345678', bankIfsc: 'HDFC0001234' },
    { firstName: 'Sneha', lastName: 'Reddy', email: 'sneha@brainvare.com', phone: '+91 98765 43211', gender: 'FEMALE', dateOfBirth: '1990-03-22', dateOfJoining: '2021-04-01', designation: 'VP Engineering', grade: 'L7 — VP', dept: 'ENG', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'OFFICE', pan: 'DEFPN5678B', bank: 'ICICI Bank', bankAcc: '60200012345678', bankIfsc: 'ICIC0002345' },
    { firstName: 'Karan', lastName: 'Malhotra', email: 'karan@brainvare.com', phone: '+91 98765 43212', gender: 'MALE', dateOfBirth: '1992-11-08', dateOfJoining: '2022-01-10', designation: 'Sr. Developer', grade: 'L4 — Senior', dept: 'ENG', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'HYBRID', pan: 'GHIPN9012C', bank: 'SBI', bankAcc: '30300012345678', bankIfsc: 'SBIN0003456' },
    { firstName: 'Priya', lastName: 'Patel', email: 'priya@brainvare.com', phone: '+91 98765 43213', gender: 'FEMALE', dateOfBirth: '1991-07-14', dateOfJoining: '2021-06-15', designation: 'HR Manager', grade: 'L5 — Lead', dept: 'HR', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'OFFICE', pan: 'JKLPN3456D', bank: 'Axis Bank', bankAcc: '91700012345678', bankIfsc: 'UTIB0004567' },
    { firstName: 'Amit', lastName: 'Kumar', email: 'amit@brainvare.com', phone: '+91 98765 43214', gender: 'MALE', dateOfBirth: '1993-01-30', dateOfJoining: '2022-08-01', designation: 'Marketing Manager', grade: 'L4 — Senior', dept: 'MKT', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'OFFICE', pan: 'MNOPN7890E', bank: 'HDFC Bank', bankAcc: '50100098765432', bankIfsc: 'HDFC0005678' },
    { firstName: 'Meera', lastName: 'Nair', email: 'meera@brainvare.com', phone: '+91 98765 43215', gender: 'FEMALE', dateOfBirth: '1994-09-18', dateOfJoining: '2023-02-01', designation: 'Designer', grade: 'L3 — Mid', dept: 'DES', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'REMOTE', pan: 'PQRPN1234F', bank: 'Kotak', bankAcc: '41100012345678', bankIfsc: 'KKBK0006789' },
    { firstName: 'Rahul', lastName: 'Sharma', email: 'rahul@brainvare.com', phone: '+91 98765 43216', gender: 'MALE', dateOfBirth: '1995-05-25', dateOfJoining: '2023-06-01', designation: 'Developer', grade: 'L3 — Mid', dept: 'ENG', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'HYBRID', pan: 'STUPN5678G', bank: 'SBI', bankAcc: '30300098765432', bankIfsc: 'SBIN0007890' },
    { firstName: 'Deepika', lastName: 'Joshi', email: 'deepika@brainvare.com', phone: '+91 98765 43217', gender: 'FEMALE', dateOfBirth: '1996-12-02', dateOfJoining: '2024-01-15', designation: 'HR Executive', grade: 'L2 — Junior', dept: 'HR', empStatus: 'ACTIVE', empType: 'FULL_TIME', workMode: 'OFFICE', pan: 'VWXPN9012H', bank: 'ICICI Bank', bankAcc: '60200098765432', bankIfsc: 'ICIC0008901' },
    { firstName: 'Vikram', lastName: 'Singh', email: 'vikram@brainvare.com', phone: '+91 98765 43218', gender: 'MALE', dateOfBirth: '1997-04-10', dateOfJoining: '2024-06-01', designation: 'Jr. Developer', grade: 'L2 — Junior', dept: 'ENG', empStatus: 'PROBATION', empType: 'FULL_TIME', workMode: 'OFFICE', pan: 'YZAPN3456I', bank: 'Axis Bank', bankAcc: '91700098765432', bankIfsc: 'UTIB0009012' },
    { firstName: 'Ravi', lastName: 'Kumar', email: 'ravi@brainvare.com', phone: '+91 98765 43219', gender: 'MALE', dateOfBirth: '1998-08-20', dateOfJoining: '2026-04-28', designation: 'Jr. Developer', grade: 'L1 — Entry', dept: 'ENG', empStatus: 'PROBATION', empType: 'FULL_TIME', workMode: 'OFFICE', pan: 'BCDPN7890J', bank: 'HDFC Bank', bankAcc: '50100011111111', bankIfsc: 'HDFC0001111' },
  ];

  const employees = [];
  for (let i = 0; i < empData.length; i++) {
    const e = empData[i];
    const emp = await prisma.employee.create({
      data: {
        employeeCode: `EMP-${String(i + 1).padStart(4, '0')}`,
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        phone: e.phone,
        gender: e.gender,
        dateOfBirth: new Date(e.dateOfBirth),
        dateOfJoining: new Date(e.dateOfJoining),
        employmentStatus: e.empStatus,
        employmentType: e.empType,
        workMode: e.workMode,
        panNumber: e.pan,
        bankName: e.bank,
        bankAccountNo: e.bankAcc,
        bankIfsc: e.bankIfsc,
        organizationId: org.id,
        departmentId: departments[e.dept].id,
        locationId: loc.id,
        designationId: designations[e.designation].id,
        gradeId: grades[e.grade].id,
        reportingManagerId: i > 0 ? employees[0]?.id : null,
      },
    });
    employees.push(emp);
  }
  // Update reporting: Sneha → Arjun, Karan → Sneha, etc.
  await prisma.employee.update({ where: { id: employees[2].id }, data: { reportingManagerId: employees[1].id } }); // Karan → Sneha
  await prisma.employee.update({ where: { id: employees[6].id }, data: { reportingManagerId: employees[1].id } }); // Rahul → Sneha
  await prisma.employee.update({ where: { id: employees[8].id }, data: { reportingManagerId: employees[2].id } }); // Vikram → Karan
  await prisma.employee.update({ where: { id: employees[7].id }, data: { reportingManagerId: employees[3].id } }); // Deepika → Priya
  console.log('✅ 10 employees created');

  // ─── Addresses ───
  for (const emp of employees) {
    await prisma.employeeAddress.create({
      data: {
        employeeId: emp.id,
        type: 'CURRENT',
        addressLine1: `${Math.floor(Math.random() * 200) + 1}, MG Road`,
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
      },
    });
  }
  console.log('✅ Addresses created');

  // ─── Emergency Contacts ───
  for (const emp of employees) {
    await prisma.emergencyContact.create({
      data: {
        employeeId: emp.id,
        name: `${emp.firstName}'s Family`,
        relationship: 'Spouse',
        phone: '+91 98765 00000',
        isPrimary: true,
      },
    });
  }
  console.log('✅ Emergency contacts created');

  // ─── Leave Types ───
  const leaveTypeData = [
    { name: 'Casual Leave', code: 'CL', annualQuota: 12 },
    { name: 'Sick Leave', code: 'SL', annualQuota: 6 },
    { name: 'Earned Leave', code: 'EL', annualQuota: 15, carryForward: true, maxCarryForward: 30 },
    { name: 'Maternity Leave', code: 'ML', annualQuota: 182, isPaid: true },
    { name: 'Paternity Leave', code: 'PL', annualQuota: 15 },
    { name: 'Loss of Pay', code: 'LOP', annualQuota: 0, isPaid: false },
  ];
  const leaveTypes = {};
  for (const lt of leaveTypeData) {
    const l = await prisma.leaveType.create({
      data: { ...lt, organizationId: org.id },
    });
    leaveTypes[lt.code] = l;
  }
  console.log('✅ 6 leave types created');

  // ─── Leave Balances ───
  for (const emp of employees) {
    for (const [code, lt] of Object.entries(leaveTypes)) {
      if (code === 'LOP' || code === 'ML' || code === 'PL') continue;
      const taken = Math.floor(Math.random() * 4);
      await prisma.leaveBalance.create({
        data: {
          employeeId: emp.id,
          leaveTypeId: lt.id,
          year: 2026,
          opening: lt.annualQuota,
          accrued: lt.annualQuota,
          taken,
          closing: lt.annualQuota - taken,
        },
      });
    }
  }
  console.log('✅ Leave balances created');

  // ─── Leave Transactions ───
  const leaveTransactions = [
    { empIdx: 3, type: 'CL', start: '2026-04-21', end: '2026-04-22', days: 2, reason: 'Family function', status: 'APPROVED' },
    { empIdx: 2, type: 'SL', start: '2026-04-10', end: '2026-04-10', days: 1, reason: 'Unwell', status: 'APPROVED' },
    { empIdx: 6, type: 'CL', start: '2026-04-28', end: '2026-04-28', days: 1, reason: 'Personal work', status: 'PENDING' },
    { empIdx: 5, type: 'EL', start: '2026-05-01', end: '2026-05-05', days: 5, reason: 'Vacation', status: 'PENDING' },
  ];
  for (const lt of leaveTransactions) {
    await prisma.leaveTransaction.create({
      data: {
        employeeId: employees[lt.empIdx].id,
        leaveTypeId: leaveTypes[lt.type].id,
        startDate: new Date(lt.start),
        endDate: new Date(lt.end),
        days: lt.days,
        reason: lt.reason,
        status: lt.status,
        approvedBy: lt.status === 'APPROVED' ? employees[0].id : null,
        approvedAt: lt.status === 'APPROVED' ? new Date() : null,
      },
    });
  }
  console.log('✅ Leave transactions created');

  // ─── Attendance (last 20 working days) ───
  const today = new Date();
  for (const emp of employees) {
    for (let d = 1; d <= 20; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends

      const isPresent = Math.random() > 0.08;
      const clockIn = new Date(date);
      clockIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
      const clockOut = new Date(date);
      clockOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
      const workedMinutes = Math.floor((clockOut.getTime() - clockIn.getTime()) / 60000);

      try {
        await prisma.attendanceRecord.create({
          data: {
            employeeId: emp.id,
            date,
            clockIn: isPresent ? clockIn : null,
            clockOut: isPresent ? clockOut : null,
            workedMinutes: isPresent ? workedMinutes : 0,
            status: isPresent ? (clockIn.getHours() >= 10 ? 'LATE' : 'PRESENT') : 'ABSENT',
            shiftId: shift.id,
            source: 'WEB',
          },
        });
      } catch (e) {
        // skip duplicate dates
      }
    }
  }
  console.log('✅ Attendance records created (20 days × 10 employees)');

  // ─── Salary Structures ───
  const salaryData = [
    { empIdx: 0, ctc: 3600000, basic: 150000, hra: 60000, special: 50000 },
    { empIdx: 1, ctc: 2400000, basic: 100000, hra: 40000, special: 35000 },
    { empIdx: 2, ctc: 2000000, basic: 83000, hra: 33000, special: 30000 },
    { empIdx: 3, ctc: 1800000, basic: 75000, hra: 30000, special: 25000 },
    { empIdx: 4, ctc: 1500000, basic: 62500, hra: 25000, special: 20000 },
    { empIdx: 5, ctc: 1200000, basic: 50000, hra: 20000, special: 15000 },
    { empIdx: 6, ctc: 1000000, basic: 41666, hra: 16666, special: 12500 },
    { empIdx: 7, ctc: 600000, basic: 25000, hra: 10000, special: 8000 },
    { empIdx: 8, ctc: 500000, basic: 20833, hra: 8333, special: 6500 },
    { empIdx: 9, ctc: 400000, basic: 16666, hra: 6666, special: 5000 },
  ];
  for (const s of salaryData) {
    const pfEmp = Math.round(s.basic * 0.12);
    const pfEr = Math.round(s.basic * 0.12);
    const pt = s.basic > 15000 ? 200 : 0;
    const tds = Math.round(s.ctc > 1000000 ? (s.ctc - 500000) * 0.2 / 12 : 0);
    const gross = s.basic + s.hra + (s.special || 0);
    const net = gross - pfEmp - pt - tds;

    await prisma.salaryStructure.create({
      data: {
        employeeId: employees[s.empIdx].id,
        ctc: s.ctc,
        basic: s.basic,
        hra: s.hra,
        special: s.special,
        pfEmployee: pfEmp,
        pfEmployer: pfEr,
        pt,
        tds,
        grossMonthly: gross,
        netMonthly: net,
        effectiveFrom: new Date('2026-04-01'),
      },
    });
  }
  console.log('✅ Salary structures created');

  // ─── Payroll Run (March 2026) ───
  const payrollRun = await prisma.payrollRun.create({
    data: {
      organizationId: org.id,
      month: 3,
      year: 2026,
      status: 'PAID',
      totalGross: salaryData.reduce((s, d) => s + d.basic + d.hra + (d.special || 0), 0),
      totalNet: salaryData.reduce((s, d) => {
        const pfEmp = Math.round(d.basic * 0.12);
        const pt = d.basic > 15000 ? 200 : 0;
        const tds = Math.round(d.ctc > 1000000 ? (d.ctc - 500000) * 0.2 / 12 : 0);
        return s + d.basic + d.hra + (d.special || 0) - pfEmp - pt - tds;
      }, 0),
      totalEmployees: 10,
      processedAt: new Date('2026-03-28'),
    },
  });
  for (const s of salaryData) {
    const pfEmp = Math.round(s.basic * 0.12);
    const pt = s.basic > 15000 ? 200 : 0;
    const tds = Math.round(s.ctc > 1000000 ? (s.ctc - 500000) * 0.2 / 12 : 0);
    const gross = s.basic + s.hra + (s.special || 0);
    await prisma.payrollEntry.create({
      data: {
        payrollRunId: payrollRun.id,
        employeeId: employees[s.empIdx].id,
        grossPay: gross,
        totalDeductions: pfEmp + pt + tds,
        netPay: gross - pfEmp - pt - tds,
        workingDays: 22,
      },
    });
  }
  console.log('✅ Payroll run (Mar 2026) created');

  // ─── Documents ───
  for (const emp of employees) {
    const docs = [
      { name: 'Aadhaar Card', category: 'IDENTITY' },
      { name: 'PAN Card', category: 'IDENTITY' },
      { name: 'Resume', category: 'EMPLOYMENT' },
    ];
    for (const d of docs) {
      await prisma.document.create({
        data: { ...d, employeeId: emp.id, uploadedBy: emp.id, isVerified: Math.random() > 0.3 },
      });
    }
  }
  console.log('✅ Documents created (3 per employee)');

  // ─── Onboarding Tasks (for newest employees) ───
  const newJoiners = [employees[8], employees[9]];
  const obTasks = [
    { title: 'Submit ID proofs', category: 'HR', sortOrder: 1 },
    { title: 'Sign offer letter', category: 'HR', sortOrder: 2 },
    { title: 'Laptop setup', category: 'IT', sortOrder: 3 },
    { title: 'Email + Slack access', category: 'IT', sortOrder: 4 },
    { title: 'Meet reporting manager', category: 'MANAGER', sortOrder: 5 },
    { title: 'Company values training', category: 'TRAINING', sortOrder: 6 },
    { title: 'Office tour', category: 'ADMIN', sortOrder: 7 },
  ];
  for (const emp of newJoiners) {
    for (const task of obTasks) {
      await prisma.onboardingTask.create({
        data: {
          ...task,
          employeeId: emp.id,
          status: Math.random() > 0.5 ? 'COMPLETED' : 'PENDING',
          completedAt: Math.random() > 0.5 ? new Date() : null,
        },
      });
    }
  }
  console.log('✅ Onboarding tasks created');

  // ─── Letter Templates ───
  const templates = [
    { name: 'Offer Letter', category: 'OFFER', subject: 'Offer of Employment', body: 'Dear {{firstName}},\n\nWe are pleased to offer you the position of {{designation}} at Brainvare Technologies.\n\nYour CTC will be ₹{{ctc}} per annum.\n\nPlease confirm your acceptance by {{joinDate}}.\n\nRegards,\nBrainvare HR' },
    { name: 'Appointment Letter', category: 'APPOINTMENT', subject: 'Appointment Letter', body: 'Dear {{firstName}},\n\nThis is to confirm your appointment as {{designation}} effective {{joinDate}}.\n\nYour terms and conditions are as follows...' },
    { name: 'Experience Letter', category: 'EXPERIENCE', subject: 'Experience Certificate', body: 'To Whom It May Concern,\n\nThis is to certify that {{firstName}} {{lastName}} was employed with Brainvare Technologies from {{joinDate}} to {{exitDate}} as {{designation}}.\n\nWe wish them all the best.' },
  ];
  for (const t of templates) {
    await prisma.letterTemplate.create({
      data: { ...t, organizationId: org.id },
    });
  }
  console.log('✅ Letter templates created');

  // ─── Policies ───
  const policyData = [
    { title: 'Work From Home Policy', category: 'HR', content: 'Employees may work from home up to 3 days per week with manager approval. WFH days must be logged in the attendance system by 10 AM. Employees must be available on Slack/Teams during working hours (9 AM - 6 PM IST).', isMandatory: true },
    { title: 'Leave Policy', category: 'LEAVE', content: 'All employees are entitled to 12 Casual Leaves, 6 Sick Leaves, and 15 Earned Leaves per calendar year. Leave applications must be submitted at least 3 days in advance for planned leave. Sick leave of 3+ days requires a medical certificate.', isMandatory: true },
    { title: 'Code of Conduct', category: 'CODE_OF_CONDUCT', content: 'All employees are expected to maintain professional behavior, respect colleagues, protect company assets, and maintain confidentiality of business information.', isMandatory: true },
    { title: 'Anti-Harassment Policy (POSH)', category: 'POSH', content: 'Brainvare Technologies has zero tolerance for sexual harassment. All complaints should be reported to the Internal Complaints Committee (ICC). The ICC will investigate within 90 days.', isMandatory: true },
    { title: 'Dress Code Policy', category: 'HR', content: 'Business casual is the standard dress code. Fridays are casual dress days. Client-facing meetings require formal attire.', isMandatory: false },
  ];
  for (const p of policyData) {
    await prisma.policy.create({
      data: { ...p, effectiveFrom: new Date('2026-01-01'), organizationId: org.id, createdBy: employees[3].id },
    });
  }
  console.log('✅ 5 policies created');

  // ─── Holidays ───
  const holidayData = [
    { name: 'Republic Day', date: '2026-01-26', type: 'MANDATORY' },
    { name: 'Holi', date: '2026-03-17', type: 'MANDATORY' },
    { name: 'Ram Navami', date: '2026-04-06', type: 'RESTRICTED' },
    { name: 'Ambedkar Jayanti', date: '2026-04-14', type: 'MANDATORY' },
    { name: 'May Day', date: '2026-05-01', type: 'MANDATORY' },
    { name: 'Independence Day', date: '2026-08-15', type: 'MANDATORY' },
    { name: 'Gandhi Jayanti', date: '2026-10-02', type: 'MANDATORY' },
    { name: 'Dussehra', date: '2026-10-20', type: 'MANDATORY' },
    { name: 'Diwali', date: '2026-11-08', type: 'MANDATORY' },
    { name: 'Christmas', date: '2026-12-25', type: 'MANDATORY' },
  ];
  for (const h of holidayData) {
    await prisma.holiday.create({
      data: { name: h.name, date: new Date(h.date), type: h.type, organizationId: org.id },
    });
  }
  console.log('✅ 10 holidays created');

  // ─── Users (Auth) ───
  const usersData = [
    { email: 'admin@brainvare.com', password: 'admin123', role: 'SUPER_ADMIN', isSuperAdmin: true, empIdx: 0 },
    { email: 'sneha@brainvare.com', password: 'sneha123', role: 'MANAGER', isSuperAdmin: false, empIdx: 1 },
    { email: 'priya@brainvare.com', password: 'priya123', role: 'HR_ADMIN', isSuperAdmin: false, empIdx: 3 },
    { email: 'karan@brainvare.com', password: 'karan123', role: 'EMPLOYEE', isSuperAdmin: false, empIdx: 2 },
  ];
  for (const u of usersData) {
    await prisma.user.create({
      data: {
        email: u.email,
        passwordHash: hashPassword(u.password),
        role: u.role,
        isSuperAdmin: u.isSuperAdmin,
        employeeId: employees[u.empIdx].id,
      },
    });
  }
  console.log('✅ 4 users created');

  // ─── Announcements ───
  const announcements = [
    { title: 'Welcome to Q2 2026!', content: 'New quarter, new goals. Let\'s make it count!', category: 'General', priority: 'NORMAL', isPinned: true },
    { title: 'Holiday: Labour Day', content: 'Office will remain closed on May 1st.', category: 'Holiday', priority: 'HIGH', isPinned: false },
    { title: 'New Health Insurance Provider', content: 'We\'ve switched to Star Health. Check benefits page for details.', category: 'Policy', priority: 'HIGH', isPinned: true },
    { title: 'Town Hall Meeting', content: 'Quarterly town hall on May 20th at 4 PM. All hands required.', category: 'Event', priority: 'NORMAL' },
    { title: 'POSH Training Mandatory', content: 'Complete the POSH module by May 31st.', category: 'Policy', priority: 'URGENT' },
  ];
  for (const a of announcements) {
    await prisma.announcement.create({ data: { ...a, organizationId: org.id, authorName: 'HR Team' } });
  }
  console.log('✅ 5 announcements created');

  // ─── Loans ───
  const loanData = [
    { empIdx: 2, type: 'SALARY_ADVANCE', amount: 50000, status: 'ACTIVE', tenure: 5, emi: 10000, reason: 'Medical emergency' },
    { empIdx: 4, type: 'PERSONAL', amount: 200000, status: 'APPROVED', tenure: 24, emi: 9500, reason: 'Home renovation' },
    { empIdx: 5, type: 'EMERGENCY', amount: 30000, status: 'PENDING', tenure: 3, emi: 10500, reason: 'Family medical' },
    { empIdx: 7, type: 'VEHICLE', amount: 500000, status: 'ACTIVE', tenure: 36, emi: 16000, reason: 'Two-wheeler purchase' },
  ];
  for (const l of loanData) {
    await prisma.loan.create({
      data: {
        employeeId: employees[l.empIdx].id,
        organizationId: org.id,
        type: l.type,
        amount: l.amount,
        emi: l.emi,
        tenure: l.tenure,
        status: l.status,
        reason: l.reason,
        disbursed: l.status === 'ACTIVE' ? l.amount : 0,
        outstanding: l.status === 'ACTIVE' ? l.amount * 0.7 : l.amount,
        repaid: l.status === 'ACTIVE' ? l.amount * 0.3 : 0,
      },
    });
  }
  console.log('✅ 4 loans created');

  // ─── Expenses ───
  const expenseData = [
    { empIdx: 1, category: 'Travel', amount: 8500, description: 'Client visit Mumbai', status: 'APPROVED', receipt: true },
    { empIdx: 2, category: 'Meals', amount: 1200, description: 'Team lunch', status: 'PENDING', receipt: true },
    { empIdx: 3, category: 'Software', amount: 4500, description: 'Figma annual subscription', status: 'APPROVED', receipt: true },
    { empIdx: 4, category: 'Equipment', amount: 15000, description: 'External monitor', status: 'PENDING', receipt: false },
    { empIdx: 6, category: 'Travel', amount: 22000, description: 'Conference Delhi', status: 'APPROVED', receipt: true },
    { empIdx: 8, category: 'Other', amount: 3000, description: 'Internet reimbursement', status: 'REJECTED', receipt: false },
  ];
  for (const e of expenseData) {
    await prisma.expense.create({
      data: {
        employeeId: employees[e.empIdx].id, organizationId: org.id,
        category: e.category, amount: e.amount, description: e.description,
        status: e.status, receipt: e.receipt,
      },
    });
  }
  console.log('✅ 6 expenses created');

  // ─── Helpdesk Tickets ───
  const ticketData = [
    { empIdx: 1, title: 'Laptop running slow', description: 'Browser hangs frequently', category: 'IT', priority: 'MEDIUM', status: 'IN_PROGRESS' },
    { empIdx: 2, title: 'Payslip not generated', description: 'April payslip missing', category: 'Payroll', priority: 'HIGH', status: 'OPEN' },
    { empIdx: 3, title: 'Update emergency contact', description: 'Need to change phone number', category: 'HR', priority: 'LOW', status: 'RESOLVED', resolution: 'Updated in profile' },
    { empIdx: 5, title: 'Office WiFi unstable', description: 'Disconnects every 10 mins', category: 'IT', priority: 'HIGH', status: 'IN_PROGRESS' },
    { empIdx: 7, title: 'Reimbursement query', description: 'Status of March travel claim', category: 'Finance', priority: 'MEDIUM', status: 'OPEN' },
  ];
  for (const t of ticketData) {
    await prisma.helpdeskTicket.create({
      data: {
        title: t.title, description: t.description, category: t.category, priority: t.priority, status: t.status,
        resolution: t.resolution, raisedById: employees[t.empIdx].id, organizationId: org.id,
        resolvedAt: t.status === 'RESOLVED' ? new Date() : null,
      },
    });
  }
  console.log('✅ 5 helpdesk tickets created');

  // ─── Overtime Entries ───
  const otData = [
    { empIdx: 1, hours: 4, rate: 500, status: 'APPROVED', reason: 'Sprint release' },
    { empIdx: 2, hours: 3, rate: 600, status: 'PENDING', reason: 'Production hotfix' },
    { empIdx: 4, hours: 6, rate: 450, status: 'APPROVED', reason: 'Weekend deployment' },
    { empIdx: 6, hours: 2, rate: 500, status: 'PENDING', reason: 'Design review' },
  ];
  for (const o of otData) {
    await prisma.overtimeEntry.create({
      data: {
        employeeId: employees[o.empIdx].id, organizationId: org.id,
        date: new Date(Date.now() - Math.random() * 7 * 86400000),
        hours: o.hours, rate: o.rate, amount: o.hours * o.rate, reason: o.reason, status: o.status,
      },
    });
  }
  console.log('✅ 4 overtime entries created');

  // ─── Recognitions ───
  const recogData = [
    { from: 0, to: 1, badge: '🌟', message: 'Outstanding sprint delivery!', category: 'Excellence' },
    { from: 1, to: 2, badge: '🚀', message: 'Saved the day with that hotfix.', category: 'Initiative' },
    { from: 3, to: 4, badge: '🤝', message: 'Great cross-team collaboration.', category: 'Collaboration' },
    { from: 2, to: 5, badge: '💡', message: 'Brilliant idea for the new dashboard.', category: 'Innovation' },
    { from: 0, to: 3, badge: '👑', message: 'Exceptional leadership this quarter.', category: 'Leadership' },
    { from: 5, to: 6, badge: '🎯', message: 'Crushed all your quarterly goals.', category: 'Excellence' },
  ];
  for (const r of recogData) {
    await prisma.recognition.create({
      data: {
        fromEmployeeId: employees[r.from].id, toEmployeeId: employees[r.to].id,
        organizationId: org.id, badge: r.badge, message: r.message, category: r.category,
        likes: Math.floor(Math.random() * 20),
      },
    });
  }
  console.log('✅ 6 recognitions created');

  // ─── Assets ───
  const assetData = [
    { name: 'MacBook Pro M3', category: 'Laptop', serialNo: 'MBP-2024-001', empIdx: 0, status: 'ASSIGNED', value: 220000 },
    { name: 'MacBook Air M2', category: 'Laptop', serialNo: 'MBA-2024-002', empIdx: 1, status: 'ASSIGNED', value: 110000 },
    { name: 'Dell XPS 15', category: 'Laptop', serialNo: 'DXP-2024-003', empIdx: 2, status: 'ASSIGNED', value: 145000 },
    { name: 'LG UltraFine 27"', category: 'Monitor', serialNo: 'LG-27-004', empIdx: 0, status: 'ASSIGNED', value: 55000 },
    { name: 'iPhone 15', category: 'Mobile', serialNo: 'IPH15-005', empIdx: 3, status: 'ASSIGNED', value: 80000 },
    { name: 'Logitech MX Master', category: 'Accessory', serialNo: 'LOG-MX-006', empIdx: null, status: 'AVAILABLE', value: 9000 },
    { name: 'Herman Miller Chair', category: 'Furniture', serialNo: 'HM-007', empIdx: null, status: 'MAINTENANCE', value: 75000 },
    { name: 'iPad Pro', category: 'Mobile', serialNo: 'IPD-008', empIdx: null, status: 'AVAILABLE', value: 95000 },
  ];
  for (const a of assetData) {
    await prisma.asset.create({
      data: {
        name: a.name, category: a.category, serialNo: a.serialNo, status: a.status,
        organizationId: org.id, value: a.value,
        assignedToId: a.empIdx !== null ? employees[a.empIdx].id : null,
        purchaseDate: new Date(2024, 5, 1),
      },
    });
  }
  console.log('✅ 8 assets created');

  // ─── Travel Requests ───
  const travelData = [
    { empIdx: 0, destination: 'Mumbai', purpose: 'Client meeting', days: 2, cost: 25000, status: 'APPROVED' },
    { empIdx: 2, destination: 'Delhi', purpose: 'Conference', days: 3, cost: 40000, status: 'APPROVED' },
    { empIdx: 4, destination: 'Singapore', purpose: 'Customer onboarding', days: 5, cost: 150000, status: 'PENDING' },
    { empIdx: 5, destination: 'Hyderabad', purpose: 'Team offsite', days: 4, cost: 60000, status: 'COMPLETED' },
  ];
  for (const t of travelData) {
    const start = new Date(Date.now() + Math.random() * 30 * 86400000);
    await prisma.travelRequest.create({
      data: {
        employeeId: employees[t.empIdx].id, organizationId: org.id,
        destination: t.destination, purpose: t.purpose,
        startDate: start, endDate: new Date(start.getTime() + t.days * 86400000),
        estimatedCost: t.cost, status: t.status,
      },
    });
  }
  console.log('✅ 4 travel requests created');

  // ─── Wellness Programs ───
  const wellnessData = [
    { name: '10K Steps Challenge', type: 'Fitness', schedule: 'Daily, 30 days', status: 'ACTIVE', participants: 24, description: 'Walk 10,000 steps daily for a month' },
    { name: 'Mindful Mondays', type: 'Mental Health', schedule: 'Every Monday, 9 AM', status: 'ACTIVE', participants: 18, description: 'Guided meditation sessions' },
    { name: 'Yoga at Work', type: 'Fitness', schedule: 'Tue/Thu 7 AM', status: 'ACTIVE', participants: 12, description: 'On-site yoga classes' },
    { name: 'Nutrition Workshop', type: 'Nutrition', schedule: 'May 25th, 3 PM', status: 'UPCOMING', participants: 0, description: 'Workplace nutrition by certified dietician' },
    { name: 'Annual Health Checkup', type: 'Health', schedule: 'June 1-7', status: 'UPCOMING', participants: 0, description: 'Free full-body checkup for all employees' },
  ];
  for (const w of wellnessData) {
    await prisma.wellnessProgram.create({ data: { ...w, organizationId: org.id } });
  }
  console.log('✅ 5 wellness programs created');

  // ─── Social Posts ───
  const postData = [
    { empIdx: 0, content: 'Excited to join Brainvare! Looking forward to building great things with this team. 🚀', type: 'welcome' },
    { empIdx: 1, content: 'Our team just shipped the new dashboard. Massive shoutout to everyone involved! 🎉', type: 'achievement' },
    { empIdx: 3, content: 'Happy birthday Priya! 🎂 Wishing you an amazing year ahead.', type: 'celebration' },
    { empIdx: 2, content: 'Anyone interested in joining the running club? We meet at Cubbon Park, Saturdays 6 AM.', type: 'post' },
    { empIdx: 5, content: 'Reminder: Lunch and Learn this Friday — topic is "Scaling PostgreSQL". Don\'t miss it!', type: 'announcement' },
    { empIdx: 4, content: 'Great brainstorming session with the design team today. Loving the new direction! 🎨', type: 'post' },
  ];
  for (const p of postData) {
    const emp = employees[p.empIdx];
    await prisma.socialPost.create({
      data: {
        organizationId: org.id, authorId: emp.id,
        authorName: `${emp.firstName} ${emp.lastName}`,
        content: p.content, type: p.type,
        likes: Math.floor(Math.random() * 50),
      },
    });
  }
  console.log('✅ 6 social posts created');

  // ─── Surveys ───
  const surveyData = [
    { title: 'Q2 Employee Engagement Pulse', description: 'Quick 5-min pulse on team morale.', status: 'ACTIVE', totalTargeted: 10 },
    { title: 'WFH Policy Feedback', description: 'Help us refine the hybrid work policy.', status: 'ACTIVE', totalTargeted: 10 },
    { title: 'Q1 Manager Effectiveness', description: 'Anonymous feedback on managers.', status: 'COMPLETED', totalTargeted: 10 },
    { title: 'Office Amenities Survey', description: 'What would improve your office experience?', status: 'DRAFT', totalTargeted: 10 },
  ];
  for (const s of surveyData) {
    await prisma.survey.create({
      data: {
        title: s.title, description: s.description, organizationId: org.id,
        status: s.status, totalTargeted: s.totalTargeted, anonymous: true,
        deadline: s.status === 'ACTIVE' ? new Date(Date.now() + 14 * 86400000) : null,
      },
    });
  }
  console.log('✅ 4 surveys created');

  // ─── Gamification: Badge Types ───
  const badgeData = [
    { name: 'Streak Master', icon: '🔥', description: '30-day perfect attendance', xpReward: 100 },
    { name: 'Goal Crusher', icon: '🎯', description: 'Completed all quarterly goals', xpReward: 50 },
    { name: 'Knowledge Seeker', icon: '📚', description: 'Completed 10 courses', xpReward: 50 },
    { name: 'Team Player', icon: '🤝', description: '50 peer recognitions given', xpReward: 75 },
    { name: 'Wellness Warrior', icon: '💪', description: '5 wellness challenges done', xpReward: 50 },
    { name: 'Quick Starter', icon: '🚀', description: 'Onboarded in 3 days', xpReward: 50 },
    { name: 'Early Bird', icon: '🐦', description: 'In before 9 AM for 20 days', xpReward: 40 },
    { name: 'Survey Star', icon: '📊', description: 'Completed 10 pulse surveys', xpReward: 25 },
  ];
  const badgeTypes = [];
  for (const b of badgeData) {
    const bt = await prisma.badgeType.create({ data: { ...b, organizationId: org.id } });
    badgeTypes.push(bt);
  }
  console.log('✅ 8 badge types created');

  // ─── Badge Awards ───
  const awardsToCreate = [
    [0, 0], [0, 1], [0, 6], [1, 0], [1, 1], [2, 2], [2, 7], [3, 1], [3, 3], [4, 5],
  ];
  for (const [empIdx, badgeIdx] of awardsToCreate) {
    await prisma.badgeAward.create({
      data: { employeeId: employees[empIdx].id, badgeTypeId: badgeTypes[badgeIdx].id },
    });
  }
  console.log('✅ 10 badge awards created');

  // ─── XP Transactions & Employee Levels ───
  for (let i = 0; i < employees.length; i++) {
    const baseXp = [4200, 3850, 2680, 3600, 2400, 1900, 2100, 1500, 1200, 1000][i] || 500;
    await prisma.employeeLevel.create({
      data: {
        employeeId: employees[i].id, organizationId: org.id,
        level: Math.floor(baseXp / 250) + 1, xp: baseXp,
        streak: Math.floor(Math.random() * 20) + 1, rank: i + 1,
      },
    });
    const txns = [
      { amount: 5, action: 'ATTENDANCE', description: 'Clock-in on time' },
      { amount: 10, action: 'TRAINING', description: 'Course completed' },
      { amount: 25, action: 'BADGE', description: 'Earned a badge' },
      { amount: 3, action: 'SOCIAL', description: 'Gave recognition' },
    ];
    for (const tx of txns) {
      await prisma.xpTransaction.create({
        data: { ...tx, employeeId: employees[i].id },
      });
    }
  }
  console.log('✅ Levels + XP transactions created for all employees');

  console.log('\n🎉 Seeding complete!\n');
  console.log('Login credentials:');
  console.log('  admin@brainvare.com / admin123 (Super Admin)');
  console.log('  sneha@brainvare.com / sneha123 (Manager)');
  console.log('  priya@brainvare.com / priya123 (HR Admin)');
  console.log('  karan@brainvare.com / karan123 (Employee)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

const statusStyles: Record<string, { label: string; bg: string; color: string; icon: string }> = {
  PENDING: { label: 'Pending', bg: 'rgba(245,158,11,0.12)', color: 'var(--color-warning-400)', icon: '⏳' },
  APPROVED: { label: 'Approved', bg: 'rgba(59,130,246,0.12)', color: 'var(--color-primary-400)', icon: '✅' },
  REIMBURSED: { label: 'Reimbursed', bg: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-400)', icon: '💰' },
  REJECTED: { label: 'Rejected', bg: 'rgba(239,68,68,0.12)', color: 'var(--color-danger-400)', icon: '❌' },
};
const categories = ['All', 'Travel', 'Training', 'Meals', 'Equipment', 'Transport', 'Software', 'Miscellaneous'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [catFilter, setCatFilter] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  useEffect(() => {
    fetch('/api/expenses').then(r => r.json()).then(d => setExpenses((d.data || []).map((e: any) => ({ ...e, title: e.title || e.description, submittedBy: e.employee ? `${e.employee.firstName} ${e.employee.lastName}` : (e.submittedBy || 'Unknown') })))).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(d => setEmployees(d.employees || [])).catch(() => {});
  }, []);

  const filtered = expenses.filter(e => { if (statusFilter !== 'ALL' && e.status !== statusFilter) return false; if (catFilter !== 'All' && e.category !== catFilter) return false; return true; });
  const totals = { pending: expenses.filter(e => e.status === 'PENDING').reduce((s, e) => s + (e.amount || 0), 0), approved: expenses.filter(e => e.status === 'APPROVED').reduce((s, e) => s + (e.amount || 0), 0), reimbursed: expenses.filter(e => e.status === 'REIMBURSED').reduce((s, e) => s + (e.amount || 0), 0), total: expenses.reduce((s, e) => s + (e.amount || 0), 0) };

  const handleCreate = async (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; const r = await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: (f.elements.namedItem('employeeId') as HTMLSelectElement).value, title: (f.elements.namedItem('title') as HTMLInputElement).value, category: (f.elements.namedItem('category') as HTMLSelectElement).value, amount: parseFloat((f.elements.namedItem('amount') as HTMLInputElement).value) || 0, date: (f.elements.namedItem('date') as HTMLInputElement).value || new Date().toISOString().split('T')[0], notes: (f.elements.namedItem('notes') as HTMLTextAreaElement).value }) }); if (r.ok) { const ex = await r.json(); setExpenses([{ ...ex, title: ex.title || ex.description, submittedBy: ex.employee ? `${ex.employee.firstName} ${ex.employee.lastName}` : 'You' }, ...expenses]); setShowCreate(false); toast('Expense submitted!', 'success'); } else toast('Failed', 'error'); };
  const saveEdits = async () => { const r = await fetch('/api/expenses', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showDetail.id, status: editData.status }) }); if (r.ok) { const updated = await r.json(); setExpenses(expenses.map(ex => ex.id === updated.id ? { ...updated, title: updated.title || updated.description, submittedBy: showDetail.submittedBy } : ex)); setShowDetail({ ...showDetail, ...editData }); setEditing(false); toast('Updated!', 'success'); } };
  const deleteExpense = (id: string) => { setExpenses(expenses.filter(e => e.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Expense deleted', 'success'); };
  const changeStatus = async (id: string, status: string) => { const r = await fetch('/api/expenses', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); if (r.ok) { setExpenses(expenses.map(e => e.id === id ? { ...e, status } : e)); if (showDetail?.id === id) setShowDetail({ ...showDetail, status }); toast(`Status → ${statusStyles[status]?.label || status}`, 'success'); } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Expense Claims</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Submit and track expense reimbursements</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Claim</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Pending', v: `₹${totals.pending.toLocaleString('en-IN')}`, c: 'var(--color-warning-400)', i: '⏳' }, { l: 'Approved', v: `₹${totals.approved.toLocaleString('en-IN')}`, c: 'var(--color-primary-400)', i: '✅' }, { l: 'Reimbursed', v: `₹${totals.reimbursed.toLocaleString('en-IN')}`, c: 'var(--color-accent-400)', i: '💰' }, { l: 'Total Claims', v: `₹${totals.total.toLocaleString('en-IN')}`, c: 'var(--text-primary)', i: '📊' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span>{s.i}</span><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div><div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: s.c }}>{s.v}</div></div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {['ALL', 'PENDING', 'APPROVED', 'REIMBURSED', 'REJECTED'].map(s => <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '4px 12px', fontSize: 'var(--text-xs)', borderRadius: 9999, border: '1px solid', borderColor: statusFilter === s ? 'var(--color-primary-500)' : 'var(--border-primary)', background: statusFilter === s ? 'rgba(59,130,246,0.08)' : 'transparent', color: statusFilter === s ? 'var(--color-primary-400)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: statusFilter === s ? 600 : 400 }}>{s === 'ALL' ? 'All' : statusStyles[s]?.label || s}</button>)}
        </div>
        <select className="input-field" style={{ width: 140, height: 32 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {filtered.map(exp => { const ss = statusStyles[exp.status]; return (
          <div key={exp.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }} onClick={() => { setShowDetail(exp); setEditData(exp); setEditing(false); }}>
            <span style={{ fontSize: 20 }}>{ss.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}><span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>{exp.id}</span><span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{exp.title}</span></div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{exp.category} · {exp.submittedBy} · {new Date(exp.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · 📎 {exp.receipts}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>₹{exp.amount.toLocaleString('en-IN')}</div>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: ss.bg, color: ss.color }}>{ss.label}</span>
            </div>
          </div>
        ); })}
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}><div style={{ fontSize: 40 }}>🧾</div>No expense claims found</div>}
      </div>

      {/* Delete */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Delete {deleteConfirm.id}?</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteExpense(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Create */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Submit Expense Claim</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Employee *</label><select className="input-field" name="employeeId" required><option value="">Select employee...</option>{employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>)}</select></div>
          <div><label className="input-label">Title *</label><input className="input-field" name="title" required placeholder="e.g. Client meeting travel" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Category</label><select className="input-field" name="category"><option>Travel</option><option>Training</option><option>Meals</option><option>Equipment</option><option>Transport</option><option>Software</option><option>Miscellaneous</option></select></div>
            <div><label className="input-label">Amount (₹) *</label><input className="input-field" name="amount" type="number" required placeholder="0" /></div>
          </div>
          <div><label className="input-label">Date *</label><input className="input-field" name="date" type="date" required /></div>
          <div><label className="input-label">Notes</label><textarea className="input-field" name="notes" rows={3} placeholder="Additional details..." /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Submit Claim</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{showDetail.id}</span><h2 style={{ margin: 0 }}>{showDetail.title}</h2></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['PENDING', 'APPROVED', 'REIMBURSED', 'REJECTED'].map(s => { const ss = statusStyles[s]; return <button key={s} onClick={() => changeStatus(showDetail.id, s)} style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 10, fontWeight: 600, background: showDetail.status === s ? ss.bg : 'var(--bg-tertiary)', color: showDetail.status === s ? ss.color : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{ss.label}</button>; })}
          </div>
          <div style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-primary-400)' }}>₹{showDetail.amount?.toLocaleString('en-IN')}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            {[{ l: 'Title', f: 'title' }, { l: 'Category', f: 'category' }, { l: 'Amount', f: 'amount', t: 'number' }, { l: 'Date', f: 'date', v: new Date(showDetail.date).toLocaleDateString('en-IN'), t: 'date' }, { l: 'Submitted By', f: 'submittedBy' }, { l: 'Receipts', f: 'receipts', t: 'number' }].map(item => (
              <div key={item.l}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>{editing ? <input className="input-field" type={item.t || 'text'} style={{ height: 30, marginTop: 2 }} value={editData[item.f] || ''} onChange={e => setEditData({ ...editData, [item.f]: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{item.v || showDetail[item.f]}</div>}</div>
            ))}
          </div>
          {showDetail.notes && <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Notes</div><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>{showDetail.notes}</p></div>}
        </div>
      </div></div>}
    </div>
  );
}

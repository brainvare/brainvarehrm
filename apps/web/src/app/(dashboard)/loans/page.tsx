'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'active' | 'apply' | 'types';

const LOAN_TYPES = [
  { id: 'salary-advance', name: 'Salary Advance', maxAmount: 100000, maxTenure: 3, interest: 0, icon: '💰' },
  { id: 'personal-loan', name: 'Personal Loan', maxAmount: 500000, maxTenure: 24, interest: 8.5, icon: '🏦' },
  { id: 'emergency-fund', name: 'Emergency Fund', maxAmount: 50000, maxTenure: 6, interest: 0, icon: '🚨' },
  { id: 'education-loan', name: 'Education Loan', maxAmount: 200000, maxTenure: 36, interest: 6, icon: '📚' },
];

export default function LoansPage() {
  const [tab, setTab] = useState<Tab>('active');
  const [loans, setLoans] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const loanTypes = LOAN_TYPES;
  const [showApply, setShowApply] = useState(false);
  const [applyType, setApplyType] = useState<any>(null);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  useEffect(() => {
    fetch('/api/loans').then(r => r.json()).then(d => setLoans(d.data || [])).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(d => setEmployees(d.employees || [])).catch(() => {});
  }, []);

  const fm = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const stats = { active: loans.filter(l => l.status === 'ACTIVE').length, outstanding: loans.filter(l => l.status === 'ACTIVE').reduce((s, l) => s + (l.outstanding || l.amount || 0), 0), closed: loans.filter(l => l.status === 'CLOSED').length, monthlyEmi: loans.filter(l => l.status === 'ACTIVE').reduce((s, l) => s + (l.emi || 0), 0) };

  const handleApply = async (e: any) => {
    e.preventDefault(); const f = e.target as HTMLFormElement;
    const employeeId = (f.elements.namedItem('employeeId') as HTMLSelectElement).value;
    const amount = parseFloat((f.elements.namedItem('amount') as HTMLInputElement).value);
    const tenure = parseInt((f.elements.namedItem('tenure') as HTMLInputElement).value);
    const startDate = (f.elements.namedItem('startDate') as HTMLInputElement).value;
    const notes = (f.elements.namedItem('notes') as HTMLTextAreaElement)?.value || '';
    const r = await fetch('/api/loans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId, loanType: applyType.name, amount, tenure, interestRate: applyType.interest, disbursementDate: startDate, notes }) });
    if (r.ok) { const loan = await r.json(); setLoans([loan, ...loans]); setShowApply(false); setApplyType(null); toast('Loan application submitted!', 'success'); }
    else toast('Failed to submit', 'error');
  };

  const saveEdits = async () => {
    const r = await fetch('/api/loans', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showDetail.id, status: editData.status }) });
    if (r.ok) { const updated = await r.json(); setLoans(loans.map(l => l.id === updated.id ? updated : l)); setShowDetail(updated); setEditing(false); toast('Updated!', 'success'); }
    else toast('Failed to update', 'error');
  };
  const deleteLoan = (id: string) => { setLoans(loans.filter(l => l.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Loan removed', 'success'); };
  const statusClr = (s: string) => s === 'ACTIVE' ? 'var(--color-accent-400)' : s === 'PENDING' ? 'var(--color-warning-400)' : s === 'CLOSED' ? 'var(--text-muted)' : 'var(--color-danger-400)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Loans & Advances</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{loans.length} loans · {fm(stats.outstanding)} outstanding</p></div>
        <button className="btn btn-primary" onClick={() => setTab('apply')}>Apply for Loan</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Active', v: stats.active, c: 'var(--color-accent-400)' }, { l: 'Outstanding', v: fm(stats.outstanding), c: 'var(--color-primary-400)' }, { l: 'Closed', v: stats.closed, c: 'var(--text-muted)' }, { l: 'Monthly EMI', v: fm(stats.monthlyEmi), c: 'var(--color-warning-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'active' as Tab, l: 'Active Loans' }, { k: 'apply' as Tab, l: 'Apply' }, { k: 'types' as Tab, l: 'Loan Types' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {loans.map(loan => {
            const paidPct = (loan.paidEmis / loan.tenure) * 100;
            return (
              <div key={loan.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', cursor: 'pointer' }} onClick={() => { setShowDetail(loan); setEditData(loan); setEditing(false); }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <div><h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{loan.type}</h3><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{loan.employee} · Started {new Date(loan.startDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</div></div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: loan.status === 'ACTIVE' ? 'rgba(16,185,129,0.12)' : loan.status === 'PENDING' ? 'rgba(245,158,11,0.12)' : 'rgba(100,116,139,0.12)', color: statusClr(loan.status) }}>{loan.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Principal</div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{fm(loan.amount)}</div></div>
                  <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>EMI/Month</div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{fm(loan.emi)}</div></div>
                  <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Outstanding</div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-primary-400)' }}>{fm(loan.outstanding)}</div></div>
                  <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>EMIs Paid</div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{loan.paidEmis}/{loan.tenure}</div></div>
                </div>
                <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${paidPct}%`, background: paidPct >= 100 ? 'var(--color-accent-400)' : 'var(--color-primary-400)', borderRadius: 9999, transition: 'width 0.5s' }} /></div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>{Math.round(paidPct)}% repaid</div>
              </div>
            );
          })}
          {loans.length === 0 && <div className="empty-state"><h3>No loans</h3></div>}
        </div>
      )}

      {tab === 'apply' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
          {loanTypes.map(lt => (
            <div key={lt.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 'var(--space-2)' }}>{lt.icon}</div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>{lt.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                <span>Max: {fm(lt.maxAmount)}</span><span>{lt.maxTenure}mo</span><span>{lt.interest === 0 ? 'No Interest' : `${lt.interest}%`}</span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { setApplyType(lt); setShowApply(true); }}>Apply →</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'types' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {loanTypes.map(lt => (
            <div key={lt.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)' }}>
              <span style={{ fontSize: 24 }}>{lt.icon}</span>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{lt.name}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Max {fm(lt.maxAmount)} · {lt.maxTenure} months · {lt.interest === 0 ? 'Interest-free' : `${lt.interest}% p.a.`}</div></div>
              <span style={{ fontSize: 11, fontWeight: 600, color: lt.interest === 0 ? 'var(--color-accent-400)' : 'var(--color-primary-400)' }}>{lt.interest === 0 ? '🟢 No Interest' : `${lt.interest}%`}</span>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8 }}>Delete loan for {deleteConfirm.employee}?</p><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>This loan record will be permanently removed.</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteLoan(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Apply Modal */}
      {showApply && applyType && <div className="modal-overlay" onClick={() => setShowApply(false)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Apply: {applyType.name}</h2><button onClick={() => setShowApply(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleApply}>
          <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Max Amount: {fm(applyType.maxAmount)} · Max Tenure: {applyType.maxTenure} months · Interest: {applyType.interest === 0 ? 'None' : `${applyType.interest}%`}</div>
          <div><label className="input-label">Employee *</label><select className="input-field" name="employeeId" required><option value="">Select employee...</option>{employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>)}</select></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Amount (₹) *</label><input className="input-field" name="amount" type="number" required max={applyType.maxAmount} placeholder={`Max ${applyType.maxAmount}`} /></div>
            <div><label className="input-label">Tenure (months) *</label><input className="input-field" name="tenure" type="number" required max={applyType.maxTenure} placeholder={`Max ${applyType.maxTenure}`} /></div>
          </div>
          <div><label className="input-label">Start Date</label><input className="input-field" name="startDate" type="date" /></div>
          <div><label className="input-label">Notes</label><textarea className="input-field" name="notes" rows={2} placeholder="Purpose, justification..." /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowApply(false)}>Cancel</button><button type="submit" className="btn btn-primary">Submit Application</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><h2>{showDetail.type}</h2><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showDetail.employee}</p></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑 Delete</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Status */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['PENDING', 'ACTIVE', 'CLOSED'].map(s => (
              <button key={s} onClick={async () => { const r = await fetch('/api/loans', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showDetail.id, status: s }) }); if (r.ok) { const updated = await r.json(); setLoans(loans.map(l => l.id === updated.id ? updated : l)); setShowDetail(updated); toast(`Status → ${s}`, 'success'); } }} style={{ flex: 1, padding: '8px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600, background: showDetail.status === s ? (s === 'ACTIVE' ? 'rgba(16,185,129,0.12)' : s === 'CLOSED' ? 'rgba(100,116,139,0.12)' : 'rgba(245,158,11,0.12)') : 'var(--bg-tertiary)', color: showDetail.status === s ? statusClr(s) : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{s}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            {[{ l: 'Employee', f: 'employee', v: showDetail.employee }, { l: 'Type', f: 'type', v: showDetail.type }, { l: 'Start Date', f: 'startDate', v: new Date(showDetail.startDate || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), t: 'date' }, { l: 'Amount', f: 'amount', v: fm(showDetail.amount), t: 'number' }, { l: 'EMI', f: 'emi', v: fm(showDetail.emi), t: 'number' }, { l: 'Tenure', f: 'tenure', v: `${showDetail.tenure} months`, t: 'number' }, { l: 'Paid EMIs', f: 'paidEmis', v: `${showDetail.paidEmis}/${showDetail.tenure}`, t: 'number' }, { l: 'Outstanding', f: 'outstanding', v: fm(showDetail.outstanding), t: 'number' }, { l: 'Interest', f: 'interest', v: showDetail.interest === 0 ? 'None' : `${showDetail.interest}%`, t: 'number' }].map(item => (
              <div key={item.l}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>{editing ? <input className="input-field" type={item.t || 'text'} style={{ height: 30, marginTop: 2 }} value={editData[item.f] || ''} onChange={e => setEditData({ ...editData, [item.f]: item.t === 'number' ? parseInt(e.target.value) || 0 : e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{item.v}</div>}</div>
            ))}
          </div>

          {/* Repayment Progress */}
          <div style={{ padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 'var(--text-xs)' }}><span style={{ color: 'var(--text-muted)' }}>Repayment Progress</span><span style={{ fontWeight: 600 }}>{Math.round((showDetail.paidEmis / showDetail.tenure) * 100)}%</span></div>
            <div style={{ height: 8, background: 'var(--bg-primary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${(showDetail.paidEmis / showDetail.tenure) * 100}%`, background: showDetail.paidEmis >= showDetail.tenure ? 'var(--color-accent-500)' : 'var(--color-primary-500)', borderRadius: 9999 }} /></div>
          </div>

          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Notes</div>{editing ? <textarea className="input-field" rows={2} value={editData.notes || ''} onChange={e => setEditData({ ...editData, notes: e.target.value })} placeholder="Additional notes..." /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>{showDetail.notes || 'No notes.'}</p>}</div>
        </div>
      </div></div>}
    </div>
  );
}

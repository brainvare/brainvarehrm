'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'plans' | 'enrollment' | 'claims';

export default function BenefitsPage() {
  const [tab, setTab] = useState<Tab>('plans');
  const [plans, setPlans] = useState<any[]>([]);
  const [claims, setClaims] = useState([
    { id: '1', employee: 'Sneha Reddy', plan: 'Health Insurance', amount: 15000, type: 'MEDICAL', date: '2026-04-10', status: 'APPROVED', docs: 2, notes: 'Hospital visit for child' },
    { id: '2', employee: 'Karan Malhotra', plan: 'Health Insurance', amount: 8500, type: 'DENTAL', date: '2026-04-15', status: 'PENDING', docs: 1, notes: 'Root canal treatment' },
    { id: '3', employee: 'Rahul Sharma', plan: 'Learning Budget', amount: 12000, type: 'COURSE', date: '2026-04-08', status: 'APPROVED', docs: 1, notes: 'Coursera ML course' },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [showClaim, setShowClaim] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [showClaimDetail, setShowClaimDetail] = useState<any>(null);

  useEffect(() => {
    fetch('/api/benefits').then(r => r.json()).then(d => setPlans(d.data || [])).catch(() => {});
  }, []);

  const statusClr = (s: string) => s === 'ACTIVE' || s === 'APPROVED' ? 'var(--color-accent-400)' : s === 'PENDING' ? 'var(--color-warning-400)' : 'var(--color-danger-400)';

  const handleCreatePlan = async (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; const r = await fetch('/api/benefits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: (f.elements.namedItem('name') as HTMLInputElement).value, type: (f.elements.namedItem('type') as HTMLSelectElement).value, provider: (f.elements.namedItem('provider') as HTMLInputElement).value, coverage: (f.elements.namedItem('coverage') as HTMLInputElement).value, premium: parseInt((f.elements.namedItem('premium') as HTMLInputElement).value) || 0, description: (f.elements.namedItem('desc') as HTMLTextAreaElement)?.value || '' }) }); if (r.ok) { const p = await r.json(); setPlans([...plans, p]); setShowCreate(false); toast('Plan created!', 'success'); } else toast('Failed', 'error'); };
  const handleCreateClaim = (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; const c = { id: Date.now().toString(), employee: (f.elements.namedItem('employee') as HTMLInputElement).value, plan: (f.elements.namedItem('plan') as HTMLSelectElement).value, amount: parseInt((f.elements.namedItem('amount') as HTMLInputElement).value), type: (f.elements.namedItem('claimType') as HTMLSelectElement).value, date: (f.elements.namedItem('date') as HTMLInputElement).value || new Date().toISOString().split('T')[0], status: 'PENDING', docs: 0, notes: (f.elements.namedItem('notes') as HTMLInputElement)?.value || '' }; setClaims([c, ...claims]); setShowClaim(false); toast('Claim submitted!', 'success'); };
  const saveEdits = () => { setPlans(plans.map(p => p.id === showDetail.id ? { ...p, ...editData } : p)); setShowDetail({ ...showDetail, ...editData }); setEditing(false); toast('Updated!', 'success'); };
  const deletePlan = (id: string) => { setPlans(plans.filter(p => p.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Plan removed', 'success'); };
  const handleClaimAction = (id: string, status: string) => { setClaims(claims.map(c => c.id === id ? { ...c, status } : c)); if (showClaimDetail?.id === id) setShowClaimDetail({ ...showClaimDetail, status }); toast(`Claim ${status.toLowerCase()}`, 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Benefits Administration</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{plans.length} plans · {claims.filter(c => c.status === 'PENDING').length} claims pending</p></div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-ghost" onClick={() => setShowClaim(true)}>📝 Submit Claim</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Plan</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Plans', v: plans.length, c: 'var(--text-primary)' }, { l: 'Active', v: plans.filter(p => p.status === 'ACTIVE').length, c: 'var(--color-accent-400)' }, { l: 'Claims', v: claims.length, c: 'var(--color-primary-400)' }, { l: 'Pending', v: claims.filter(c => c.status === 'PENDING').length, c: 'var(--color-warning-400)' }, { l: 'Monthly Cost', v: `₹${plans.reduce((s, p) => s + p.premium, 0).toLocaleString()}`, c: '#a78bfa' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'plans' as Tab, l: 'Benefit Plans' }, { k: 'enrollment' as Tab, l: 'My Enrollment' }, { k: 'claims' as Tab, l: `Claims (${claims.filter(c => c.status === 'PENDING').length})` }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {plans.map(p => {
            const pct = Math.round((p.enrolled / p.eligible) * 100);
            return (
              <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', cursor: 'pointer' }} onClick={() => { setShowDetail(p); setEditData(p); setEditing(false); }}>
                <div style={{ fontSize: 28, marginBottom: 'var(--space-2)' }}>{p.icon}</div>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 4 }}>{p.name}</h3>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{p.type}</span>
                <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Provider</span><strong style={{ color: 'var(--text-primary)' }}>{p.provider}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Coverage</span><strong style={{ color: 'var(--text-primary)' }}>{p.coverage}</strong></div>
                  {p.premium > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Premium</span><strong style={{ color: 'var(--text-primary)' }}>₹{p.premium}/mo</strong></div>}
                </div>
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}><span style={{ color: 'var(--text-muted)' }}>Enrollment</span><span style={{ fontWeight: 600 }}>{p.enrolled}/{p.eligible}</span></div>
                  <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-accent-500)', borderRadius: 9999 }} /></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'enrollment' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📊 Your Benefits Summary</h3>
            {plans.slice(0, 4).map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '6px 0', borderBottom: '1px solid var(--border-secondary)' }}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{p.name}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.coverage}</div></div>
                <span style={{ fontSize: 14, color: 'var(--color-accent-400)' }}>✅</span>
              </div>
            ))}
          </div>
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>👨‍👩‍👧 Dependents</h3>
            {[{ name: 'Spouse', relation: 'Wife', covered: 'Health' }, { name: 'Child 1', relation: 'Son', covered: 'Health' }].map((dep, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-secondary)', fontSize: 'var(--text-sm)' }}>
                <span style={{ fontWeight: 500 }}>{dep.name}</span>
                <span style={{ color: 'var(--text-muted)' }}>{dep.relation} · {dep.covered}</span>
              </div>
            ))}
            <button className="btn btn-sm" style={{ marginTop: 'var(--space-3)' }} onClick={() => toast('Add dependent form', 'info')}>+ Add Dependent</button>
          </div>
        </div>
      )}

      {tab === 'claims' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {claims.map(claim => (
            <div key={claim.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer' }} onClick={() => setShowClaimDetail(claim)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{claim.employee}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{claim.plan} · {claim.type}</div></div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: claim.status === 'APPROVED' ? 'rgba(16,185,129,0.12)' : claim.status === 'PENDING' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.08)', color: statusClr(claim.status) }}>{claim.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                <span>💰 ₹{claim.amount.toLocaleString()}</span>
                <span>📅 {new Date(claim.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                <span>📎 {claim.docs} doc{claim.docs > 1 ? 's' : ''}</span>
              </div>
              {claim.status === 'PENDING' && <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }} onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-400)', border: 'none' }} onClick={() => handleClaimAction(claim.id, 'APPROVED')}>✓ Approve</button>
                <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--color-danger-400)', border: 'none' }} onClick={() => handleClaimAction(claim.id, 'REJECTED')}>✕ Reject</button>
              </div>}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8 }}>Delete "{deleteConfirm.name}"?</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deletePlan(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Create Plan */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>New Benefit Plan</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreatePlan}>
          <div><label className="input-label">Plan Name *</label><input className="input-field" name="name" required placeholder="Dental Insurance" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Type</label><select className="input-field" name="type"><option value="HEALTH">Health</option><option value="LIFE">Life</option><option value="ACCIDENT">Accident</option><option value="WELLNESS">Wellness</option><option value="DEVELOPMENT">Development</option><option value="FOOD">Food</option></select></div>
            <div><label className="input-label">Provider</label><input className="input-field" name="provider" placeholder="Star Health" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Coverage</label><input className="input-field" name="coverage" placeholder="5L per family" /></div>
            <div><label className="input-label">Premium (₹/mo)</label><input className="input-field" name="premium" type="number" placeholder="0" /></div>
          </div>
          <div><label className="input-label">Description</label><textarea className="input-field" name="desc" rows={2} placeholder="Plan details..." /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Plan</button></div>
        </form>
      </div></div>}

      {/* Submit Claim */}
      {showClaim && <div className="modal-overlay" onClick={() => setShowClaim(false)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Submit Claim</h2><button onClick={() => setShowClaim(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreateClaim}>
          <div><label className="input-label">Employee *</label><input className="input-field" name="employee" required placeholder="Sneha Reddy" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Plan</label><select className="input-field" name="plan">{plans.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
            <div><label className="input-label">Claim Type</label><select className="input-field" name="claimType"><option value="MEDICAL">Medical</option><option value="DENTAL">Dental</option><option value="OPTICAL">Optical</option><option value="COURSE">Course</option><option value="OTHER">Other</option></select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Amount (₹) *</label><input className="input-field" name="amount" type="number" required /></div>
            <div><label className="input-label">Date</label><input className="input-field" name="date" type="date" /></div>
          </div>
          <div><label className="input-label">Notes</label><textarea className="input-field" name="notes" rows={2} placeholder="Claim details..." /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowClaim(false)}>Cancel</button><button type="submit" className="btn btn-primary">Submit Claim</button></div>
        </form>
      </div></div>}

      {/* Plan Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><span style={{ fontSize: 28 }}>{showDetail.icon}</span><div><h2>{showDetail.name}</h2><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showDetail.type} · {showDetail.provider}</p></div></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {[{ l: 'Name', f: 'name', v: showDetail.name }, { l: 'Provider', f: 'provider', v: showDetail.provider }, { l: 'Coverage', f: 'coverage', v: showDetail.coverage }, { l: 'Premium', f: 'premium', v: showDetail.premium > 0 ? `₹${showDetail.premium}/mo` : 'Free', t: 'number' }, { l: 'Type', f: 'type', v: showDetail.type }, { l: 'Enrolled', f: 'enrolled', v: `${showDetail.enrolled}/${showDetail.eligible}`, t: 'number' }].map(item => (
              <div key={item.l}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>{editing ? <input className="input-field" type={item.t || 'text'} style={{ height: 30, marginTop: 2 }} value={editData[item.f] || ''} onChange={e => setEditData({ ...editData, [item.f]: item.t === 'number' ? parseInt(e.target.value) || 0 : e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{item.v}</div>}</div>
            ))}
          </div>
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Description</div>{editing ? <textarea className="input-field" rows={2} value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>{showDetail.description || 'No description'}</p>}</div>
        </div>
      </div></div>}

      {/* Claim Detail */}
      {showClaimDetail && <div className="modal-overlay" onClick={() => setShowClaimDetail(null)}><div className="modal-content" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Claim Details</h2><button onClick={() => setShowClaimDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {[['Employee', showClaimDetail.employee], ['Plan', showClaimDetail.plan], ['Type', showClaimDetail.type], ['Amount', `₹${showClaimDetail.amount.toLocaleString()}`], ['Date', new Date(showClaimDetail.date).toLocaleDateString('en-IN')], ['Documents', `${showClaimDetail.docs}`]].map(([l, v]) => (
              <div key={l as string}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{l}</div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{v}</div></div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
              <button key={s} onClick={() => handleClaimAction(showClaimDetail.id, s)} style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600, background: showClaimDetail.status === s ? (s === 'APPROVED' ? 'rgba(16,185,129,0.12)' : s === 'REJECTED' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.12)') : 'var(--bg-tertiary)', color: showClaimDetail.status === s ? statusClr(s) : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{s}</button>
            ))}
          </div>
          {showClaimDetail.notes && <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>{showClaimDetail.notes}</p>}
        </div>
      </div></div>}
    </div>
  );
}

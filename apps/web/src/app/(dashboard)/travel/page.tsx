'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'requests' | 'policy' | 'summary';
const statusConfig: Record<string, { bg: string; color: string }> = { APPROVED: { bg: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-400)' }, PENDING: { bg: 'rgba(245,158,11,0.12)', color: 'var(--color-warning-400)' }, DRAFT: { bg: 'rgba(100,116,139,0.12)', color: 'var(--text-tertiary)' }, REJECTED: { bg: 'rgba(239,68,68,0.12)', color: 'var(--color-danger-400)' }, COMPLETED: { bg: 'rgba(59,130,246,0.12)', color: 'var(--color-primary-400)' } };

export default function TravelPage() {
  const [tab, setTab] = useState<Tab>('requests');
  const [trips, setTrips] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  useEffect(() => {
    fetch('/api/travel').then(r => r.json()).then(d => setTrips(d.data || [])).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(d => setEmployees(d.employees || [])).catch(() => {});
  }, []);

  const norm = (t: any) => ({ ...t, employee: t.employee ? `${t.employee.firstName} ${t.employee.lastName}` : (t.employeeName || 'Unknown'), destination: t.destination || t.toCity || '', purpose: t.purpose || t.reason || '', dates: t.fromDate ? `${new Date(t.fromDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – ${new Date(t.toDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}` : (t.dates || ''), budget: t.estimatedBudget || t.budget || 0, advance: t.advanceAmount || t.advance || 0 });

  const travelPolicies = [{ category: 'Flights', tier1: 'Business Class', tier2: 'Economy + Extra', tier3: 'Economy', icon: '✈️' }, { category: 'Hotels', tier1: '5-Star / ₹8K/night', tier2: '4-Star / ₹5K/night', tier3: '3-Star / ₹3K/night', icon: '🏨' }, { category: 'Meals', tier1: '₹2,500/day', tier2: '₹1,500/day', tier3: '₹1,000/day', icon: '🍽️' }, { category: 'Transport', tier1: 'Cab / Self-drive', tier2: 'Cab / Rideshare', tier3: 'Public + Rideshare', icon: '🚕' }];

  const fm = (n: number) => `₹${(n / 1000).toFixed(0)}K`;
  const normed = trips.map(norm);
  const totalBudget = normed.reduce((s, t) => s + (t.budget || 0), 0);
  const totalAdvance = normed.reduce((s, t) => s + (t.advance || 0), 0);

  const handleCreate = async (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; const r = await fetch('/api/travel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: (f.elements.namedItem('employeeId') as HTMLSelectElement).value, destination: (f.elements.namedItem('destination') as HTMLInputElement).value, purpose: (f.elements.namedItem('purpose') as HTMLInputElement).value, fromDate: (f.elements.namedItem('fromDate') as HTMLInputElement).value, toDate: (f.elements.namedItem('toDate') as HTMLInputElement).value, estimatedBudget: parseInt((f.elements.namedItem('budget') as HTMLInputElement).value) || 0 }) }); if (r.ok) { const trip = await r.json(); setTrips([trip, ...trips]); setShowCreate(false); toast('Travel request created!', 'success'); } else toast('Failed', 'error'); };
  const saveEdits = async () => { const r = await fetch('/api/travel', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showDetail.id, status: editData.status }) }); if (r.ok) { const updated = await r.json(); setTrips(trips.map(t => t.id === updated.id ? updated : t)); setShowDetail(updated); setEditing(false); toast('Updated!', 'success'); } };
  const deleteTrip = (id: string) => { setTrips(trips.filter(t => t.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Request deleted', 'success'); };
  const changeStatus = (id: string, status: string) => { setTrips(trips.map(t => t.id === id ? { ...t, status } : t)); if (showDetail?.id === id) setShowDetail({ ...showDetail, status }); toast(`Status → ${status}`, 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Travel Management</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Travel requests, policy tiers, advances, and pre-approval</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Travel Request</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'This Month', v: `${trips.length} trips`, c: 'var(--color-primary-400)' }, { l: 'Pending', v: trips.filter(t => t.status === 'PENDING').length, c: 'var(--color-warning-400)' }, { l: 'Total Budget', v: fm(totalBudget), c: '#a78bfa' }, { l: 'Advances Paid', v: fm(totalAdvance), c: 'var(--color-accent-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'requests' as Tab, l: 'Requests' }, { k: 'policy' as Tab, l: 'Travel Policy' }, { k: 'summary' as Tab, l: 'Spend Summary' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'requests' && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {normed.map(trip => { const sc = statusConfig[trip.status] || statusConfig['DRAFT']; return (
          <div key={trip.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }} onClick={() => { setShowDetail(trip); setEditData(trip); setEditing(false); }}>
            <div style={{ fontSize: 24 }}>✈️</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 2 }}>{trip.destination}</h3>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 2 }}>{trip.purpose}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>👤 {trip.employee} · 📅 {trip.dates} · {trip.days} days</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>{fm(trip.budget)}</div>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: sc.bg, color: sc.color }}>{trip.status}</span>
              {trip.advance > 0 && <div style={{ fontSize: 10, color: 'var(--color-accent-400)', marginTop: 2 }}>Advance: {fm(trip.advance)}</div>}
            </div>
          </div>
        ); })}
      </div>}

      {tab === 'policy' && <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 0, background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', fontWeight: 600, fontSize: 'var(--text-sm)' }}></div>
          <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', fontWeight: 600, fontSize: 'var(--text-xs)', textAlign: 'center' }}>🥇 Tier 1 (CXO/VP)</div>
          <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', fontWeight: 600, fontSize: 'var(--text-xs)', textAlign: 'center' }}>🥈 Tier 2 (Manager)</div>
          <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', fontWeight: 600, fontSize: 'var(--text-xs)', textAlign: 'center' }}>🥉 Tier 3 (Staff)</div>
          {travelPolicies.map(p => (<>
            <div key={p.category} style={{ padding: 'var(--space-3)', borderTop: '1px solid var(--border-secondary)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{p.icon} {p.category}</div>
            <div style={{ padding: 'var(--space-3)', borderTop: '1px solid var(--border-secondary)', fontSize: 'var(--text-xs)', textAlign: 'center', color: 'var(--text-secondary)' }}>{p.tier1}</div>
            <div style={{ padding: 'var(--space-3)', borderTop: '1px solid var(--border-secondary)', fontSize: 'var(--text-xs)', textAlign: 'center', color: 'var(--text-secondary)' }}>{p.tier2}</div>
            <div style={{ padding: 'var(--space-3)', borderTop: '1px solid var(--border-secondary)', fontSize: 'var(--text-xs)', textAlign: 'center', color: 'var(--text-secondary)' }}>{p.tier3}</div>
          </>))}
        </div>
      </div>}

      {tab === 'summary' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ label: 'Q1 Total Spend', value: '₹2.8L', sub: '8 trips' }, { label: 'Q2 Budget', value: '₹4.0L', sub: 'Allocated' }, { label: 'Avg Cost/Trip', value: fm(Math.round(totalBudget / Math.max(trips.length, 1))), sub: 'All departments' }, { label: 'Top Destination', value: 'Mumbai', sub: '4 trips' }].map((s, i) => (
          <div key={i} className="stat-card" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: '4px 0' }}>{s.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.sub}</div>
          </div>
        ))}
      </div>}

      {/* Delete */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Delete this travel request?</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteTrip(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Create */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>New Travel Request</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Employee *</label><select className="input-field" name="employeeId" required><option value="">Select employee...</option>{employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>)}</select></div>
          <div><label className="input-label">Destination *</label><input className="input-field" name="destination" required placeholder="City A → City B" /></div>
          <div><label className="input-label">Purpose *</label><input className="input-field" name="purpose" required placeholder="Client meeting, conference, etc." /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">From Date *</label><input className="input-field" name="fromDate" type="date" required /></div>
            <div><label className="input-label">To Date *</label><input className="input-field" name="toDate" type="date" required /></div>
            <div><label className="input-label">Budget (₹)</label><input className="input-field" name="budget" type="number" placeholder="0" /></div>
          </div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Submit Request</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✈️ {showDetail.destination}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].map(s => { const sc = statusConfig[s] || statusConfig.DRAFT; return <button key={s} onClick={() => changeStatus(showDetail.id, s)} style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 9, fontWeight: 600, background: showDetail.status === s ? sc.bg : 'var(--bg-tertiary)', color: showDetail.status === s ? sc.color : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{s}</button>; })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            {[{ l: 'Employee', f: 'employee' }, { l: 'Destination', f: 'destination' }, { l: 'Purpose', f: 'purpose' }, { l: 'Dates', f: 'dates' }, { l: 'Days', f: 'days', t: 'number' }, { l: 'Budget (₹)', f: 'budget', v: fm(showDetail.budget), t: 'number' }, { l: 'Advance (₹)', f: 'advance', v: showDetail.advance > 0 ? fm(showDetail.advance) : '—', t: 'number' }, { l: 'Status', f: 'status', v: showDetail.status }].map(item => (
              <div key={item.l}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>{editing ? <input className="input-field" type={item.t || 'text'} style={{ height: 30, marginTop: 2 }} value={editData[item.f] ?? ''} onChange={e => setEditData({ ...editData, [item.f]: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{item.v || showDetail[item.f]}</div>}</div>
            ))}
          </div>
          {showDetail.budget > 0 && <div style={{ padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 4 }}><span>Advance vs Budget</span><span style={{ fontWeight: 600 }}>{fm(showDetail.advance)} / {fm(showDetail.budget)}</span></div>
            <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.min((showDetail.advance / showDetail.budget) * 100, 100)}%`, background: 'var(--color-accent-500)', borderRadius: 9999 }} /></div>
          </div>}
        </div>
      </div></div>}
    </div>
  );
}

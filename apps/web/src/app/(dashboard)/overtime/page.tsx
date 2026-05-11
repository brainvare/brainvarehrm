'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'requests' | 'rules' | 'analytics';

export default function OvertimePage() {
  const [tab, setTab] = useState<Tab>('requests');
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED'>('all');
  const [requests, setRequests] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  useEffect(() => {
    fetch('/api/overtime').then(r => r.json()).then(d => setRequests(d.data || [])).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(d => setEmployees(d.employees || [])).catch(() => {});
  }, []);

  const norm = (r: any) => ({ ...r, employee: r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : (r.employeeName || 'Unknown'), dept: r.employee?.department || r.dept || '' });

  const otRules = [
    { type: 'WEEKDAY', rate: '1.5x', desc: 'Regular overtime beyond 8 hrs', maxHrs: 4, color: 'var(--color-primary-400)' },
    { type: 'WEEKEND', rate: '2.0x', desc: 'Saturday/Sunday work', maxHrs: 8, color: '#a78bfa' },
    { type: 'HOLIDAY', rate: '3.0x', desc: 'Public/company holiday work', maxHrs: 12, color: 'var(--color-danger-400)' },
  ];
  const monthlyData = [{ month: 'Jan', hours: 42, cost: 38000 }, { month: 'Feb', hours: 35, cost: 31500 }, { month: 'Mar', hours: 55, cost: 52000 }, { month: 'Apr', hours: 19.5, cost: 18500 }];

  const totalHours = requests.reduce((s, r) => s + (r.hours || 0), 0);
  const normed = requests.map(norm);
  const filtered = filter === 'all' ? normed : normed.filter(r => r.status === filter);
  const maxBar = Math.max(...monthlyData.map(m => m.hours));
  const typeClr = (t: string) => t === 'WEEKEND' ? '#a78bfa' : t === 'HOLIDAY' ? 'var(--color-danger-400)' : 'var(--color-primary-400)';

  const handleCreate = async (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; const rateMap: Record<string, number> = { WEEKDAY: 1.5, WEEKEND: 2.0, HOLIDAY: 3.0 }; const type = (f.elements.namedItem('type') as HTMLSelectElement).value; const r = await fetch('/api/overtime', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: (f.elements.namedItem('employeeId') as HTMLSelectElement).value, date: (f.elements.namedItem('date') as HTMLInputElement).value, hours: parseFloat((f.elements.namedItem('hours') as HTMLInputElement).value), rate: rateMap[type] || 1.5, reason: (f.elements.namedItem('reason') as HTMLTextAreaElement).value }) }); if (r.ok) { const entry = await r.json(); setRequests([entry, ...requests]); setShowCreate(false); toast('OT request logged!', 'success'); } else toast('Failed', 'error'); };
  const handleAction = async (id: string, status: string) => { const r = await fetch('/api/overtime', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status, approvedBy: status === 'APPROVED' ? 'Manager' : null }) }); if (r.ok) { const updated = await r.json(); setRequests(requests.map(req => req.id === id ? updated : req)); if (showDetail?.id === id) setShowDetail(updated); toast(`OT ${status.toLowerCase()}`, 'success'); } };
  const saveEdits = async () => { const r = await fetch('/api/overtime', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showDetail.id, status: editData.status }) }); if (r.ok) { const updated = await r.json(); setRequests(requests.map(req => req.id === updated.id ? updated : req)); setShowDetail(updated); setEditing(false); toast('Updated!', 'success'); } };
  const deleteOT = (id: string) => { setRequests(requests.filter(r => r.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('OT record removed', 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Overtime Tracking</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{totalHours}h this month · {requests.filter(r => r.status === 'PENDING').length} pending</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Log Overtime</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'This Month', v: `${totalHours}h`, c: 'var(--color-primary-400)' }, { l: 'Pending', v: requests.filter(r => r.status === 'PENDING').length, c: 'var(--color-warning-400)' }, { l: 'Approved', v: requests.filter(r => r.status === 'APPROVED').length, c: 'var(--color-accent-400)' }, { l: 'Est. Cost', v: '₹18.5K', c: '#a78bfa' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'requests' as Tab, l: 'OT Requests' }, { k: 'rules' as Tab, l: 'Rate Rules' }, { k: 'analytics' as Tab, l: 'Analytics' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'requests' && <>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {['all', 'PENDING', 'APPROVED'].map(f => (
            <button key={f} onClick={() => setFilter(f as any)} style={{ padding: '4px 12px', fontSize: 'var(--text-xs)', fontWeight: 600, borderRadius: 9999, background: filter === f ? 'var(--color-primary-500)' : 'var(--bg-tertiary)', color: filter === f ? 'white' : 'var(--text-muted)', border: 'none', cursor: 'pointer' }}>{f === 'all' ? 'All' : f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filtered.map(req => (
            <div key={req.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer' }} onClick={() => { setShowDetail(req); setEditData(req); setEditing(false); }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className="avatar avatar-sm">{String(req.employee || '?').split(' ').map((n: string) => n[0]).join('')}</div>
                  <div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{req.employee}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{req.dept} · 📅 {new Date(req.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>{req.hours}h</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, color: typeClr(req.type), background: typeClr(req.type) + '15' }}>{req.type} ({req.rate}x)</span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: req.status === 'APPROVED' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: req.status === 'APPROVED' ? 'var(--color-accent-400)' : 'var(--color-warning-400)' }}>{req.status}</span>
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 4, marginLeft: 44 }}>{req.reason}</p>
              {req.status === 'PENDING' && <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', marginLeft: 44 }} onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-400)', border: 'none' }} onClick={() => handleAction(req.id, 'APPROVED')}>✓ Approve</button>
                <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--color-danger-400)', border: 'none' }} onClick={() => handleAction(req.id, 'REJECTED')}>✕ Reject</button>
              </div>}
            </div>
          ))}
        </div>
      </>}

      {tab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {otRules.map(rule => (
            <div key={rule.type} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', borderLeft: `4px solid ${rule.color}` }}>
              <div style={{ flex: 1 }}><h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{rule.type}</h3><p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{rule.desc}</p></div>
              <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: rule.color }}>{rule.rate}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Max {rule.maxHrs}h/day</span>
            </div>
          ))}
          <div style={{ padding: 'var(--space-3)', background: 'rgba(59,130,246,0.06)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>💡 OT rates multiply the employee's hourly base salary. Configure in Master Setup → Pay Heads.</div>
        </div>
      )}

      {tab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Monthly OT Hours</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)', height: 140 }}>
              {monthlyData.map(m => (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 600 }}>{m.hours}h</span>
                  <div style={{ width: '100%', height: `${(m.hours / maxBar) * 100}%`, background: 'var(--color-primary-500)', borderRadius: 'var(--radius-sm)', minHeight: 8 }} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{m.month}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Cost Breakdown</h3>
            {monthlyData.map(m => (
              <div key={m.month} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-secondary)', fontSize: 'var(--text-sm)' }}>
                <span>{m.month} 2026</span><span style={{ fontWeight: 600 }}>₹{(m.cost / 1000).toFixed(1)}K</span><span style={{ color: 'var(--text-muted)' }}>{m.hours}h</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-primary-400)' }}>
              <span>YTD Total</span><span>₹{(monthlyData.reduce((s, m) => s + m.cost, 0) / 1000).toFixed(0)}K</span><span>{monthlyData.reduce((s, m) => s + m.hours, 0)}h</span>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Delete OT record for {deleteConfirm.employee}?</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteOT(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Create OT */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Log Overtime</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Employee *</label><select className="input-field" name="employeeId" required><option value="">Select employee...</option>{employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>)}</select></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Date *</label><input className="input-field" name="date" type="date" required /></div>
            <div><label className="input-label">Hours *</label><input className="input-field" name="hours" type="number" step="0.5" required placeholder="3" /></div>
            <div><label className="input-label">Type</label><select className="input-field" name="type"><option value="WEEKDAY">Weekday (1.5x)</option><option value="WEEKEND">Weekend (2.0x)</option><option value="HOLIDAY">Holiday (3.0x)</option></select></div>
          </div>
          <div><label className="input-label">Reason *</label><textarea className="input-field" name="reason" rows={2} required placeholder="Why overtime was needed..." /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Submit</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><h2>OT: {showDetail.employee}</h2><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showDetail.dept} · {new Date(showDetail.date || Date.now()).toLocaleDateString('en-IN')}</p></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
              <button key={s} onClick={() => handleAction(showDetail.id, s)} style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600, background: showDetail.status === s ? (s === 'APPROVED' ? 'rgba(16,185,129,0.12)' : s === 'REJECTED' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.12)') : 'var(--bg-tertiary)', color: showDetail.status === s ? (s === 'APPROVED' ? 'var(--color-accent-400)' : s === 'REJECTED' ? 'var(--color-danger-400)' : 'var(--color-warning-400)') : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{s}</button>
            ))}
          </div>
          <div style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-primary-400)' }}>{showDetail.hours}h</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{showDetail.type} · {showDetail.rate}x rate</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            {[{ l: 'Employee', f: 'employee' }, { l: 'Department', f: 'dept' }, { l: 'Date', f: 'date', t: 'date' }, { l: 'Hours', f: 'hours', t: 'number' }, { l: 'Type', f: 'type' }, { l: 'Rate', f: 'rate', t: 'number' }].map(item => (
              <div key={item.l}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>{editing ? <input className="input-field" type={item.t || 'text'} style={{ height: 30, marginTop: 2 }} value={editData[item.f] || ''} onChange={e => setEditData({ ...editData, [item.f]: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{showDetail[item.f]}</div>}</div>
            ))}
          </div>
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Reason</div>{editing ? <textarea className="input-field" rows={2} value={editData.reason || ''} onChange={e => setEditData({ ...editData, reason: e.target.value })} /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>{showDetail.reason}</p>}</div>
        </div>
      </div></div>}
    </div>
  );
}

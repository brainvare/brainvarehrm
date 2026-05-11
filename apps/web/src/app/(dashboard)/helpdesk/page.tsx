'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

const priorityColors: Record<string, string> = { HIGH: 'var(--color-danger-400)', MEDIUM: 'var(--color-warning-400)', LOW: 'var(--color-accent-400)' };
const statusLabels: Record<string, { label: string; bg: string; color: string }> = { OPEN: { label: 'Open', bg: 'rgba(59,130,246,0.12)', color: 'var(--color-primary-400)' }, IN_PROGRESS: { label: 'In Progress', bg: 'rgba(245,158,11,0.12)', color: 'var(--color-warning-400)' }, RESOLVED: { label: 'Resolved', bg: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-400)' }, CLOSED: { label: 'Closed', bg: 'var(--bg-tertiary)', color: 'var(--text-muted)' } };

export default function HelpdeskPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetch('/api/helpdesk').then(r => r.json()).then(d => setTickets(d.data || [])).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(d => setEmployees(d.employees || [])).catch(() => {});
  }, []);

  const norm = (t: any) => ({ ...t, subject: t.title || t.subject, createdBy: t.raisedBy ? `${t.raisedBy.firstName} ${t.raisedBy.lastName}` : (t.createdBy || 'Unknown'), replies: t.replies || [] });

  const categories = ['All', 'IT Support', 'HR', 'Payroll', 'Facilities'];
  const filtered = tickets.map(norm).filter(t => { if (filter !== 'All' && t.category !== filter) return false; if (statusFilter !== 'ALL' && t.status !== statusFilter) return false; return true; });
  const stats = { open: tickets.filter(t => t.status === 'OPEN').length, inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length, resolved: tickets.filter(t => t.status === 'RESOLVED').length, closed: tickets.filter(t => t.status === 'CLOSED').length };

  const handleCreate = async (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; const raisedById = (f.elements.namedItem('raisedById') as HTMLSelectElement).value; const r = await fetch('/api/helpdesk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: (f.elements.namedItem('subject') as HTMLInputElement).value, description: (f.elements.namedItem('desc') as HTMLTextAreaElement).value, category: (f.elements.namedItem('category') as HTMLSelectElement).value, priority: (f.elements.namedItem('priority') as HTMLSelectElement).value, raisedById }) }); if (r.ok) { const t = await r.json(); setTickets([t, ...tickets]); setShowCreate(false); toast('Ticket created!', 'success'); } else toast('Failed', 'error'); };
  const changeStatus = async (id: string, status: string) => { const r = await fetch('/api/helpdesk', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); if (r.ok) { const updated = await r.json(); setTickets(tickets.map(t => t.id === id ? updated : t)); if (showDetail?.id === id) setShowDetail(updated); toast(`Status → ${statusLabels[status]?.label || status}`, 'success'); } };
  const saveEdits = async () => { const r = await fetch('/api/helpdesk', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showDetail.id, status: editData.status, assignedToName: editData.assignedTo }) }); if (r.ok) { const updated = await r.json(); setTickets(tickets.map(t => t.id === updated.id ? updated : t)); setShowDetail(updated); setEditing(false); toast('Updated!', 'success'); } };
  const deleteTicket = (id: string) => { setTickets(tickets.filter(t => t.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Ticket deleted', 'success'); };
  const addReply = (id: string) => { if (!replyText.trim()) return; setTickets(tickets.map(t => t.id === id ? { ...t, replies: [...(t.replies || []), replyText] } : t)); if (showDetail?.id === id) setShowDetail({ ...showDetail, replies: [...(showDetail.replies || []), replyText] }); setReplyText(''); toast('Reply sent!', 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Helpdesk</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Submit and track support requests</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Ticket</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Open', v: stats.open, c: 'var(--color-primary-400)' }, { l: 'In Progress', v: stats.inProgress, c: 'var(--color-warning-400)' }, { l: 'Resolved', v: stats.resolved, c: 'var(--color-accent-400)' }, { l: 'Closed', v: stats.closed, c: 'var(--text-muted)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {categories.map(c => <button key={c} onClick={() => setFilter(c)} style={{ padding: '4px 12px', fontSize: 'var(--text-xs)', borderRadius: 9999, border: '1px solid', borderColor: filter === c ? 'var(--color-primary-500)' : 'var(--border-primary)', background: filter === c ? 'rgba(59,130,246,0.08)' : 'transparent', color: filter === c ? 'var(--color-primary-400)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: filter === c ? 600 : 400 }}>{c}</button>)}
        </div>
        <select className="input-field" style={{ width: 140, height: 32 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="ALL">All Status</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select>
      </div>

      {/* Ticket List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {filtered.map(ticket => { const sl = statusLabels[ticket.status]; return (
          <div key={ticket.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer', borderLeft: `4px solid ${priorityColors[ticket.priority]}` }} onClick={() => { setShowDetail(ticket); setEditData(ticket); setEditing(false); }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 2 }}><span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>{ticket.id}</span><span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{ticket.subject}</span></div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{ticket.category} · {ticket.createdBy} · {new Date(ticket.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: sl.bg, color: sl.color }}>{sl.label}</span><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>💬 {ticket.replies.length}</span></div>
            </div>
          </div>
        ); })}
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-2)' }}>🎫</div>No tickets found</div>}
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Delete ticket {deleteConfirm.id}?</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteTicket(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Create Ticket */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>New Ticket</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Raised By *</label><select className="input-field" name="raisedById" required><option value="">Select employee...</option>{employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>)}</select></div>
          <div><label className="input-label">Subject *</label><input className="input-field" name="subject" required placeholder="Brief description of your issue" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Category</label><select className="input-field" name="category"><option>IT Support</option><option>HR</option><option>Payroll</option><option>Facilities</option></select></div>
            <div><label className="input-label">Priority</label><select className="input-field" name="priority"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
          </div>
          <div><label className="input-label">Description</label><textarea className="input-field" name="desc" rows={4} placeholder="Provide details..." /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Ticket</button></div>
        </form>
      </div></div>}

      {/* Ticket Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{showDetail.id}</span><h2 style={{ margin: 0 }}>{showDetail.subject}</h2></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Status pipeline */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => { const sl = statusLabels[s]; return <button key={s} onClick={() => changeStatus(showDetail.id, s)} style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 10, fontWeight: 600, background: showDetail.status === s ? sl.bg : 'var(--bg-tertiary)', color: showDetail.status === s ? sl.color : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{sl.label}</button>; })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            {[{ l: 'Category', f: 'category' }, { l: 'Priority', f: 'priority' }, { l: 'Assigned To', f: 'assignedTo' }, { l: 'Created By', f: 'createdBy' }, { l: 'Created', f: 'createdAt', v: new Date(showDetail.createdAt).toLocaleDateString('en-IN') }].map(item => (
              <div key={item.l}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>{editing ? <input className="input-field" style={{ height: 30, marginTop: 2 }} value={editData[item.f] || ''} onChange={e => setEditData({ ...editData, [item.f]: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2, color: item.l === 'Priority' ? priorityColors[showDetail.priority] : undefined }}>{item.v || showDetail[item.f]}</div>}</div>
            ))}
          </div>
          {/* Replies */}
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Activity ({showDetail.replies.length})</div>
            {showDetail.replies.map((r: string, i: number) => <div key={i} style={{ padding: '8px var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}>{r}</div>)}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <input className="input-field" placeholder="Add a reply..." value={replyText} onChange={e => setReplyText(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-primary btn-sm" onClick={() => addReply(showDetail.id)}>Reply</button>
            </div>
          </div>
        </div>
      </div></div>}
    </div>
  );
}

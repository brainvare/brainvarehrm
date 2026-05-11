'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'surveys' | 'enps' | 'feedback';

export default function SurveysPage() {
  const [tab, setTab] = useState<Tab>('surveys');
  const [surveys, setSurveys] = useState<any[]>([]);
  const [feedback, setFeedback] = useState([
    { id: '1', category: 'SUGGESTION', preview: 'It would be great to have flexible work hours on Fridays...', status: 'NEW', date: '2026-04-18' },
    { id: '2', category: 'GRIEVANCE', preview: 'The air conditioning in the 3rd floor meeting rooms has been...', status: 'IN_PROGRESS', date: '2026-04-15' },
    { id: '3', category: 'GENERAL', preview: 'Really appreciate the new wellness program! The yoga sessions...', status: 'REVIEWED', date: '2026-04-12' },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [showFeedbackDetail, setShowFeedbackDetail] = useState<any>(null);
  const [feedbackCategory, setFeedbackCategory] = useState('SUGGESTION');
  const [feedbackText, setFeedbackText] = useState('');

  const enps = { score: 42, promoters: 5, passives: 3, detractors: 2, trend: [35, 38, 40, 42] };
  const typeClr = (t: string) => t === 'PULSE' ? 'var(--color-primary-400)' : t === 'ENGAGEMENT' ? '#a78bfa' : t === 'ENPS' ? 'var(--color-accent-400)' : 'var(--color-warning-400)';
  const statusClr = (s: string) => s === 'ACTIVE' || s === 'REVIEWED' ? 'var(--color-accent-400)' : s === 'DRAFT' || s === 'NEW' ? 'var(--color-primary-400)' : s === 'IN_PROGRESS' ? 'var(--color-warning-400)' : 'var(--text-muted)';

  useEffect(() => {
    fetch('/api/surveys').then(r => r.json()).then(d => setSurveys(d.data || [])).catch(() => {});
  }, []);

  const handleCreate = async (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; const r = await fetch('/api/surveys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: (f.elements.namedItem('title') as HTMLInputElement).value, type: (f.elements.namedItem('type') as HTMLSelectElement).value, endsAt: (f.elements.namedItem('endsAt') as HTMLInputElement).value, isAnonymous: true }) }); if (r.ok) { const s = await r.json(); setSurveys([s, ...surveys]); setShowCreate(false); toast('Survey created!', 'success'); } else toast('Failed', 'error'); };
  const saveEdits = async () => { const r = await fetch('/api/surveys', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showDetail.id, status: editData.status }) }); if (r.ok) { const updated = await r.json(); setSurveys(surveys.map(s => s.id === updated.id ? updated : s)); setShowDetail(updated); setEditing(false); toast('Updated!', 'success'); } };
  const deleteSurvey = (id: string) => { setSurveys(surveys.filter(s => s.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Survey deleted', 'success'); };
  const changeStatus = async (id: string, status: string) => { const r = await fetch('/api/surveys', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) }); if (r.ok) { const updated = await r.json(); setSurveys(surveys.map(s => s.id === id ? updated : s)); if (showDetail?.id === id) setShowDetail(updated); toast(`Status → ${status}`, 'success'); } };
  const handleFeedback = () => { if (!feedbackText.trim()) return; setFeedback([{ id: Date.now().toString(), category: feedbackCategory, preview: feedbackText, status: 'NEW', date: new Date().toISOString().split('T')[0] }, ...feedback]); setFeedbackText(''); toast('Feedback submitted anonymously!', 'success'); };
  const updateFeedbackStatus = (id: string, status: string) => { setFeedback(feedback.map(f => f.id === id ? { ...f, status } : f)); if (showFeedbackDetail?.id === id) setShowFeedbackDetail({ ...showFeedbackDetail, status }); toast(`Updated → ${status}`, 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Surveys & Feedback</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{surveys.length} surveys · {feedback.filter(f => f.status === 'NEW').length} new feedback</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Survey</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Active', v: surveys.filter(s => s.status === 'ACTIVE').length, c: 'var(--color-accent-400)' }, { l: 'eNPS', v: enps.score, c: 'var(--color-primary-400)' }, { l: 'Response Rate', v: `${Math.round(surveys.filter(s => s.status !== 'DRAFT').reduce((a, s) => a + (s.responses / s.total), 0) / Math.max(surveys.filter(s => s.status !== 'DRAFT').length, 1) * 100)}%`, c: '#a78bfa' }, { l: 'Feedback', v: feedback.length, c: 'var(--color-warning-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'surveys' as Tab, l: 'Surveys' }, { k: 'enps' as Tab, l: 'eNPS' }, { k: 'feedback' as Tab, l: `Feedback (${feedback.filter(f => f.status === 'NEW').length})` }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'surveys' && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {surveys.map(s => { const pct = s.total > 0 ? Math.round((s.responses / s.total) * 100) : 0; return (
          <div key={s.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer' }} onClick={() => { setShowDetail(s); setEditData(s); setEditing(false); }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: typeClr(s.type) + '15', color: typeClr(s.type) }}>{s.type}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: s.status === 'ACTIVE' ? 'rgba(16,185,129,0.12)' : s.status === 'DRAFT' ? 'rgba(245,158,11,0.12)' : 'rgba(100,116,139,0.12)', color: statusClr(s.status) }}>{s.status}</span>
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{s.isAnonymous ? '🔒 Anonymous' : '👤 Named'} · Ends {new Date(s.endsAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
            </div>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>{s.title}</h3>
            <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden', marginBottom: 4 }}><div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--color-accent-400)' : 'var(--color-primary-400)', borderRadius: 9999 }} /></div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.responses}/{s.total} responses ({pct}%)</div>
          </div>
        ); })}
      </div>}

      {tab === 'enps' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="stat-card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: enps.score > 30 ? 'var(--color-accent-400)' : 'var(--color-warning-400)' }}>{enps.score}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>eNPS Score</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
            <div><div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-accent-400)' }}>{enps.promoters}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Promoters</div></div>
            <div><div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-warning-400)' }}>{enps.passives}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Passives</div></div>
            <div><div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-danger-400)' }}>{enps.detractors}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Detractors</div></div>
          </div>
        </div>
        <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📈 Quarterly Trend</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)', height: 120 }}>
            {enps.trend.map((v, i) => <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 600 }}>{v}</span>
              <div style={{ width: '100%', height: `${(v / 100) * 100}%`, background: 'var(--color-primary-500)', borderRadius: 'var(--radius-sm)', minHeight: 8 }} />
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Q{i + 1}</span>
            </div>)}
          </div>
        </div>
      </div>}

      {tab === 'feedback' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>💬 Submit Anonymous Feedback</h3>
          <select className="input-field" value={feedbackCategory} onChange={e => setFeedbackCategory(e.target.value)} style={{ marginBottom: 'var(--space-3)' }}><option value="SUGGESTION">Suggestion</option><option value="GRIEVANCE">Grievance</option><option value="GENERAL">General</option><option value="WHISTLEBLOWER">Whistleblower</option></select>
          <textarea className="input-field" value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Your feedback is completely anonymous..." rows={4} style={{ marginBottom: 'var(--space-3)' }} />
          <button className="btn btn-primary" disabled={!feedbackText.trim()} onClick={handleFeedback}>Submit Anonymously</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Recent Feedback (Admin)</h3>
          {feedback.map(f => (
            <div key={f.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', cursor: 'pointer' }} onClick={() => setShowFeedbackDetail(f)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: f.category === 'GRIEVANCE' ? 'var(--color-danger-400)' : 'var(--color-primary-400)' }}>{f.category}</span>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 9999, background: f.status === 'NEW' ? 'rgba(59,130,246,0.12)' : f.status === 'REVIEWED' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: statusClr(f.status) }}>{f.status.replace('_', ' ')}</span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>{f.preview}</p>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(f.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
            </div>
          ))}
        </div>
      </div>}

      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Delete "{deleteConfirm.title}"?</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteSurvey(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Create Survey */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Create Survey</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Title *</label><input className="input-field" name="title" required placeholder="Monthly Pulse Check" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Type</label><select className="input-field" name="type"><option value="PULSE">Pulse</option><option value="ENGAGEMENT">Engagement</option><option value="ENPS">eNPS</option><option value="ONBOARDING">Onboarding</option><option value="EXIT">Exit</option></select></div>
            <div><label className="input-label">End Date</label><input className="input-field" name="endsAt" type="date" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Target Responses</label><input className="input-field" name="total" type="number" defaultValue={10} /></div>
            <div><label className="input-label">Questions</label><input className="input-field" name="questions" type="number" defaultValue={5} /></div>
          </div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
        </form>
      </div></div>}

      {/* Survey Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{showDetail.title}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['DRAFT', 'ACTIVE', 'CLOSED'].map(s => <button key={s} onClick={() => changeStatus(showDetail.id, s)} style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600, background: showDetail.status === s ? (s === 'ACTIVE' ? 'rgba(16,185,129,0.12)' : s === 'CLOSED' ? 'rgba(100,116,139,0.12)' : 'rgba(245,158,11,0.12)') : 'var(--bg-tertiary)', color: showDetail.status === s ? statusClr(s) : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{s}</button>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            {[{ l: 'Title', f: 'title' }, { l: 'Type', f: 'type' }, { l: 'End Date', f: 'endsAt', t: 'date' }, { l: 'Questions', f: 'questions', t: 'number' }, { l: 'Responses', f: 'responses', v: `${showDetail.responses}/${showDetail.total}`, t: 'number' }, { l: 'Target', f: 'total', t: 'number' }].map(item => (
              <div key={item.l}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>{editing ? <input className="input-field" type={item.t || 'text'} style={{ height: 30, marginTop: 2 }} value={editData[item.f] || ''} onChange={e => setEditData({ ...editData, [item.f]: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{item.v || showDetail[item.f]}</div>}</div>
            ))}
          </div>
        </div>
      </div></div>}

      {/* Feedback Detail */}
      {showFeedbackDetail && <div className="modal-overlay" onClick={() => setShowFeedbackDetail(null)}><div className="modal-content" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Feedback</h2><button onClick={() => setShowFeedbackDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: showFeedbackDetail.category === 'GRIEVANCE' ? 'var(--color-danger-400)' : 'var(--color-primary-400)' }}>{showFeedbackDetail.category}</span>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', lineHeight: 1.5 }}>{showFeedbackDetail.preview}</p>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['NEW', 'IN_PROGRESS', 'REVIEWED'].map(s => <button key={s} onClick={() => updateFeedbackStatus(showFeedbackDetail.id, s)} style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 10, fontWeight: 600, background: showFeedbackDetail.status === s ? (s === 'REVIEWED' ? 'rgba(16,185,129,0.12)' : s === 'IN_PROGRESS' ? 'rgba(245,158,11,0.12)' : 'rgba(59,130,246,0.12)') : 'var(--bg-tertiary)', color: showFeedbackDetail.status === s ? statusClr(s) : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{s.replace('_', ' ')}</button>)}
          </div>
        </div>
      </div></div>}
    </div>
  );
}

'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'feed' | 'events' | 'directory';
const typeColors: Record<string, string> = { ANNOUNCEMENT: 'var(--color-primary-400)', CELEBRATION: '#f472b6', UPDATE: 'var(--color-accent-400)', POLL: 'var(--color-warning-400)', MILESTONE: '#a78bfa' };
const typeIcons: Record<string, string> = { ANNOUNCEMENT: '📢', CELEBRATION: '🎉', UPDATE: '📝', POLL: '📊', MILESTONE: '🏆' };

export default function SocialPage() {
  const [tab, setTab] = useState<Tab>('feed');
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState([
    { id: '1', title: 'Friday Team Lunch', type: 'TEAM_OUTING', date: '2026-04-25', time: '12:30 PM', location: 'TBD', rsvps: 12, maxAttendees: 20, rsvped: false },
    { id: '2', title: 'Monthly Town Hall', type: 'TOWN_HALL', date: '2026-04-30', time: '4:00 PM', location: 'Virtual — Google Meet', rsvps: 28, maxAttendees: 0, rsvped: false },
    { id: '3', title: 'Yoga & Wellness Session', type: 'WORKSHOP', date: '2026-05-03', time: '7:30 AM', location: 'Office Terrace', rsvps: 8, maxAttendees: 15, rsvped: false },
  ]);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('UPDATE');
  const [showDetail, setShowDetail] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState<any>(null);

  const people = [
    { name: 'Sneha Reddy', dept: 'Engineering', role: 'Lead Engineer', avatar: 'SR', status: 'online' },
    { name: 'Karan Malhotra', dept: 'Engineering', role: 'Senior Developer', avatar: 'KM', status: 'online' },
    { name: 'Priya Patel', dept: 'HR', role: 'HR Manager', avatar: 'PP', status: 'online' },
    { name: 'Amit Kumar', dept: 'Marketing', role: 'Marketing Lead', avatar: 'AK', status: 'away' },
    { name: 'Rahul Sharma', dept: 'Engineering', role: 'Full Stack Dev', avatar: 'RS', status: 'online' },
    { name: 'Arjun Desai', dept: 'Backend', role: 'Backend Engineer', avatar: 'AD', status: 'offline' },
    { name: 'Meera Nair', dept: 'Design', role: 'UI/UX Designer', avatar: 'MN', status: 'online' },
    { name: 'Ananya Iyer', dept: 'Finance', role: 'Finance Executive', avatar: 'AI', status: 'away' },
  ];

  useEffect(() => {
    fetch('/api/social').then(r => r.json()).then(d => setPosts((d.data || []).map((p: any) => ({ ...p, author: p.authorName || p.author || 'Unknown', authorAvatar: (p.authorName || 'AU').split(' ').map((n: string) => n[0]).join('').slice(0, 2), comments: p.comments || [], time: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : 'Unknown' })))).catch(() => {});
  }, []);

  const handlePost = async () => { if (!newPost.trim()) return; const r = await fetch('/api/social', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: newPost, type: postType, authorName: 'You' }) }); if (r.ok) { const post = await r.json(); setPosts([{ ...post, author: post.authorName, authorAvatar: 'AU', comments: [], time: 'Just now' }, ...posts]); setNewPost(''); toast('Posted!', 'success'); } };
  const handleLike = async (id: string) => { const r = await fetch('/api/social', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); if (r.ok) { const updated = await r.json(); setPosts(posts.map(p => p.id === id ? { ...p, likes: updated.likes } : p)); if (showDetail?.id === id) setShowDetail({ ...showDetail, likes: updated.likes }); } };
  const handleComment = (id: string) => { if (!commentText.trim()) return; setPosts(posts.map(p => p.id === id ? { ...p, comments: [...p.comments, commentText] } : p)); if (showDetail?.id === id) setShowDetail({ ...showDetail, comments: [...showDetail.comments, commentText] }); setCommentText(''); };
  const deletePost = (id: string) => { setPosts(posts.filter(p => p.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Post deleted', 'success'); };
  const togglePin = (id: string) => { setPosts(posts.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p)); toast('Pin toggled', 'success'); };
  const handleRsvp = (id: string) => { setEvents(events.map(e => e.id === id ? { ...e, rsvps: e.rsvped ? e.rsvps - 1 : e.rsvps + 1, rsvped: !e.rsvped } : e)); if (showEventDetail?.id === id) setShowEventDetail({ ...showEventDetail, rsvped: !showEventDetail.rsvped, rsvps: showEventDetail.rsvped ? showEventDetail.rsvps - 1 : showEventDetail.rsvps + 1 }); toast(events.find(e => e.id === id)?.rsvped ? 'RSVP cancelled' : 'RSVP confirmed! 🎉', 'success'); };
  const handleCreateEvent = (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; setEvents([...events, { id: Date.now().toString(), title: (f.elements.namedItem('title') as HTMLInputElement).value, type: (f.elements.namedItem('type') as HTMLSelectElement).value, date: (f.elements.namedItem('date') as HTMLInputElement).value, time: (f.elements.namedItem('time') as HTMLInputElement).value, location: (f.elements.namedItem('location') as HTMLInputElement).value, rsvps: 0, maxAttendees: parseInt((f.elements.namedItem('max') as HTMLInputElement).value) || 0, rsvped: false }]); setShowCreateEvent(false); toast('Event created!', 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Social Feed</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Company announcements, celebrations, and conversations</p></div>
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'feed' as Tab, l: '📣 Feed' }, { k: 'events' as Tab, l: `📅 Events (${events.length})` }, { k: 'directory' as Tab, l: '👥 Directory' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'feed' && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {/* Composer */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
            <div className="avatar avatar-sm">AU</div>
            <div style={{ flex: 1 }}>
              <textarea className="input-field" placeholder="Share an update, announcement, or celebration..." value={newPost} onChange={e => setNewPost(e.target.value)} rows={2} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {Object.entries(typeIcons).map(([k, icon]) => <button key={k} onClick={() => setPostType(k)} style={{ padding: '2px 8px', fontSize: 10, borderRadius: 4, border: '1px solid', borderColor: postType === k ? typeColors[k] : 'var(--border-secondary)', background: postType === k ? typeColors[k] + '15' : 'transparent', color: postType === k ? typeColors[k] : 'var(--text-muted)', cursor: 'pointer' }}>{icon} {k.slice(0, 4)}</button>)}
                </div>
                <button className="btn btn-primary btn-sm" disabled={!newPost.trim()} onClick={handlePost}>Post</button>
              </div>
            </div>
          </div>
        </div>
        {posts.map(post => (
          <div key={post.id} style={{ background: 'var(--bg-card)', border: `1px solid ${post.isPinned ? 'var(--color-primary-400)' : 'var(--border-primary)'}`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer' }} onClick={() => setShowDetail(post)}>
            {post.isPinned && <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-primary-400)', marginBottom: 4 }}>📌 Pinned</div>}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <div className="avatar avatar-sm" style={{ background: `linear-gradient(135deg, ${typeColors[post.type] || '#3b82f6'}, #8b5cf6)` }}>{post.authorAvatar}</div>
              <div style={{ flex: 1 }}><span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{post.author}</span><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{post.time} · {typeIcons[post.type]} {post.type}</div></div>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', whiteSpace: 'pre-line', lineHeight: 1.5, marginBottom: 'var(--space-2)' }}>{post.content}</p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)' }} onClick={e => e.stopPropagation()}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => handleLike(post.id)}>❤️ {post.likes}</button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowDetail(post)}>💬 {post.comments.length}</button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => togglePin(post.id)}>{post.isPinned ? '📌' : '📍'}</button>
            </div>
          </div>
        ))}
      </div>}

      {tab === 'events' && <div>
        <button className="btn btn-primary" style={{ marginBottom: 'var(--space-3)' }} onClick={() => setShowCreateEvent(true)}>+ Create Event</button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-3)' }}>
          {events.map(event => (
            <div key={event.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', cursor: 'pointer' }} onClick={() => setShowEventDetail(event)}>
              <div style={{ textAlign: 'center', padding: 'var(--space-2)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', minWidth: 50 }}>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800 }}>{new Date(event.date).getDate()}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{new Date(event.date).toLocaleDateString('en-IN', { month: 'short' })}</div>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 4 }}>{event.title}</h3>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>🕐 {event.time} · 📍 {event.location} · 👥 {event.rsvps}{event.maxAttendees ? `/${event.maxAttendees}` : ''}</div>
              </div>
              <button className={`btn btn-sm ${event.rsvped ? 'btn-ghost' : 'btn-primary'}`} onClick={e => { e.stopPropagation(); handleRsvp(event.id); }}>{event.rsvped ? '✅ Going' : 'RSVP'}</button>
            </div>
          ))}
        </div>
      </div>}

      {tab === 'directory' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
        {people.map((p, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center' }}>
            <div className="avatar" style={{ margin: '0 auto var(--space-2)', position: 'relative' }}>{p.avatar}<span style={{ width: 8, height: 8, borderRadius: '50%', background: p.status === 'online' ? '#10b981' : p.status === 'away' ? '#f59e0b' : '#94a3b8', position: 'absolute', bottom: 0, right: 0, border: '2px solid var(--bg-card)' }} /></div>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{p.name}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.role} · {p.dept}</div>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-2)' }} onClick={() => toast('Chat opening...', 'info')}>💬 Message</button>
          </div>
        ))}
      </div>}

      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Delete this post?</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deletePost(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Post Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><div className="avatar avatar-sm" style={{ background: `linear-gradient(135deg, ${typeColors[showDetail.type] || '#3b82f6'}, #8b5cf6)` }}>{showDetail.authorAvatar}</div><div><strong>{showDetail.author}</strong><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{showDetail.time} · {showDetail.type}</div></div></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm btn-ghost" onClick={() => togglePin(showDetail.id)}>{showDetail.isPinned ? '📌 Unpin' : '📍 Pin'}</button>
            <button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button>
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{showDetail.content}</p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}><button className="btn btn-sm" onClick={() => handleLike(showDetail.id)}>❤️ {showDetail.likes}</button></div>
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Comments ({showDetail.comments.length})</div>
            {showDetail.comments.map((c: string, i: number) => <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-secondary)', fontSize: 'var(--text-sm)' }}>{c}</div>)}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}><input className="input-field" placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} style={{ flex: 1 }} /><button className="btn btn-primary btn-sm" onClick={() => handleComment(showDetail.id)}>Post</button></div>
          </div>
        </div>
      </div></div>}

      {/* Create Event */}
      {showCreateEvent && <div className="modal-overlay" onClick={() => setShowCreateEvent(false)}><div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Create Event</h2><button onClick={() => setShowCreateEvent(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreateEvent}>
          <div><label className="input-label">Title *</label><input className="input-field" name="title" required placeholder="Team Lunch" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Type</label><select className="input-field" name="type"><option value="TEAM_OUTING">Team Outing</option><option value="TOWN_HALL">Town Hall</option><option value="WORKSHOP">Workshop</option><option value="CELEBRATION">Celebration</option></select></div>
            <div><label className="input-label">Max Attendees</label><input className="input-field" name="max" type="number" placeholder="0 = unlimited" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Date *</label><input className="input-field" name="date" type="date" required /></div>
            <div><label className="input-label">Time</label><input className="input-field" name="time" placeholder="4:00 PM" /></div>
          </div>
          <div><label className="input-label">Location</label><input className="input-field" name="location" placeholder="Office Terrace" /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreateEvent(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
        </form>
      </div></div>}

      {/* Event Detail */}
      {showEventDetail && <div className="modal-overlay" onClick={() => setShowEventDetail(null)}><div className="modal-content" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{showEventDetail.title}</h2><button onClick={() => setShowEventDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{new Date(showEventDetail.date).getDate()}</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{new Date(showEventDetail.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {[['Type', showEventDetail.type.replace('_', ' ')], ['Time', showEventDetail.time], ['Location', showEventDetail.location], ['Attending', `${showEventDetail.rsvps}${showEventDetail.maxAttendees ? `/${showEventDetail.maxAttendees}` : ''}`]].map(([l, v]) => (
              <div key={l as string}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{l}</div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{v}</div></div>
            ))}
          </div>
          <button className={`btn ${showEventDetail.rsvped ? 'btn-ghost' : 'btn-primary'}`} onClick={() => handleRsvp(showEventDetail.id)}>{showEventDetail.rsvped ? '✅ Going — Cancel RSVP' : 'RSVP Now'}</button>
        </div>
      </div></div>}
    </div>
  );
}

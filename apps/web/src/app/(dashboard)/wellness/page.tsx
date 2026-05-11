'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'dashboard' | 'challenges' | 'mood';
const moods = [{ value: 1, emoji: '😢', label: 'Very Bad' }, { value: 2, emoji: '😕', label: 'Bad' }, { value: 3, emoji: '😐', label: 'Okay' }, { value: 4, emoji: '🙂', label: 'Good' }, { value: 5, emoji: '😄', label: 'Great' }];

export default function WellnessPage() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [moodHistory] = useState([
    { date: 'Mon', mood: 4, note: '' }, { date: 'Tue', mood: 5, note: 'Great day!' }, { date: 'Wed', mood: 3, note: '' },
    { date: 'Thu', mood: 4, note: '' }, { date: 'Fri', mood: 4, note: '' }, { date: 'Today', mood: null as number | null, note: '' },
  ]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [showChallengeDetail, setShowChallengeDetail] = useState<any>(null);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [logValue, setLogValue] = useState('');

  const teamAvgMood = Math.round(moodHistory.filter(d => d.mood).reduce((s, d) => s + (d.mood || 0), 0) / Math.max(moodHistory.filter(d => d.mood).length, 1) * 10) / 10;

  useEffect(() => {
    fetch('/api/wellness').then(r => r.json()).then(d => setChallenges(d.data || [])).catch(() => {});
  }, []);

  const logMood = () => {
    setSelectedMood(null); setMoodNote(''); toast(`Mood logged! +5 XP 🎉`, 'success');
  };

  const toggleJoin = (id: string) => {
    setChallenges(challenges.map(c => c.id === id ? { ...c, isJoined: !c.isJoined, participants: c.isJoined ? c.participants - 1 : c.participants + 1 } : c));
    if (showChallengeDetail?.id === id) setShowChallengeDetail({ ...showChallengeDetail, isJoined: !showChallengeDetail.isJoined });
    toast(challenges.find(c => c.id === id)?.isJoined ? 'Left challenge' : 'Joined challenge! 🏆', 'success');
  };

  const logProgress = (id: string) => {
    const val = parseInt(logValue) || 0; if (!val) return;
    setChallenges(challenges.map(c => c.id === id ? { ...c, totalProgress: c.totalProgress + val } : c));
    if (showChallengeDetail?.id === id) setShowChallengeDetail({ ...showChallengeDetail, totalProgress: showChallengeDetail.totalProgress + val });
    setLogValue(''); toast(`Logged ${val}! +2 XP`, 'success');
  };

  const createChallenge = (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; setChallenges([...challenges, { id: Date.now().toString(), title: (f.elements.namedItem('title') as HTMLInputElement).value, type: (f.elements.namedItem('type') as HTMLSelectElement).value, icon: '🏆', target: parseInt((f.elements.namedItem('target') as HTMLInputElement).value), unit: (f.elements.namedItem('unit') as HTMLInputElement).value, duration: parseInt((f.elements.namedItem('duration') as HTMLInputElement).value), progress: 0, totalProgress: 0, totalTarget: parseInt((f.elements.namedItem('target') as HTMLInputElement).value) * parseInt((f.elements.namedItem('duration') as HTMLInputElement).value), participants: 1, xpReward: 30, isJoined: true, endsAt: '2026-06-01' }]); setShowCreateChallenge(false); toast('Challenge created! 🏆', 'success'); };

  const tips = [{ icon: '🧠', cat: 'Mental', tip: 'Take a 5-minute break every hour to reduce eye strain.' }, { icon: '🏃', cat: 'Physical', tip: 'Use a standing desk for at least 2 hours a day.' }, { icon: '🥗', cat: 'Nutrition', tip: 'Keep healthy snacks at your desk — almonds, fruits, green tea.' }, { icon: '👥', cat: 'Social', tip: 'Have lunch with a colleague from a different team weekly.' }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Wellness Hub</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Take care of your mind, body, and work-life balance</p></div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'dashboard' as Tab, l: '🏠 Dashboard' }, { k: 'challenges' as Tab, l: '🏆 Challenges' }, { k: 'mood' as Tab, l: '😊 Mood Tracker' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'dashboard' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        {/* Mood Check-in */}
        <div className="stat-card" style={{ padding: 'var(--space-5)', gridColumn: '1/-1' }}>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>How are you feeling today?</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-3)' }}>
            {moods.map(m => <button key={m.value} onClick={() => setSelectedMood(m.value)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '2px solid', borderColor: selectedMood === m.value ? 'var(--color-primary-400)' : 'var(--border-secondary)', background: selectedMood === m.value ? 'rgba(59,130,246,0.08)' : 'transparent', cursor: 'pointer' }}><span style={{ fontSize: 28 }}>{m.emoji}</span><span style={{ fontSize: 10, color: selectedMood === m.value ? 'var(--color-primary-400)' : 'var(--text-muted)' }}>{m.label}</span></button>)}
          </div>
          {selectedMood && <div style={{ display: 'flex', gap: 'var(--space-2)', maxWidth: 400, margin: '0 auto' }}><input className="input-field" placeholder="Any notes? (optional)" value={moodNote} onChange={e => setMoodNote(e.target.value)} style={{ flex: 1 }} /><button className="btn btn-primary" onClick={logMood}>Log Mood (+5 XP)</button></div>}
        </div>
        {/* Team Mood */}
        <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>📊 Team Mood</h3>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}><span style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>{teamAvgMood}</span><span style={{ fontSize: 'var(--text-xl)', marginLeft: 8 }}>{moods[Math.round(teamAvgMood) - 1]?.emoji}</span></div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>{moodHistory.map((d, i) => <div key={i} style={{ textAlign: 'center' }}><div style={{ fontSize: 18 }}>{d.mood ? moods[d.mood - 1]?.emoji : '—'}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.date}</div></div>)}</div>
        </div>
        {/* Tips */}
        <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>💡 Daily Tips</h3>
          {tips.map((tip, i) => <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}><span>{tip.icon}</span><div><span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-primary-400)' }}>{tip.cat}</span><p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>{tip.tip}</p></div></div>)}
        </div>
      </div>}

      {tab === 'challenges' && <div>
        <button className="btn btn-primary" style={{ marginBottom: 'var(--space-3)' }} onClick={() => setShowCreateChallenge(true)}>+ Create Challenge</button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
          {challenges.map(c => { const pct = Math.round((c.totalProgress / c.totalTarget) * 100); return (
            <div key={c.id} style={{ background: 'var(--bg-card)', border: `1px solid ${c.isJoined ? 'var(--color-primary-400)' : 'var(--border-primary)'}`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer' }} onClick={() => setShowChallengeDetail(c)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}><span style={{ fontSize: 24 }}>{c.icon}</span><span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-warning-400)' }}>+{c.xpReward} XP</span></div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 4 }}>{c.title}</h3>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>{c.type} · {c.duration} days · {c.target.toLocaleString()} {c.unit}/day</div>
              <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden', marginBottom: 4 }}><div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct >= 100 ? 'var(--color-accent-400)' : 'var(--color-primary-400)', borderRadius: 9999 }} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}><span>👥 {c.participants} joined</span><span>{pct}%</span></div>
              <button className={`btn btn-sm ${c.isJoined ? '' : 'btn-primary'}`} style={{ width: '100%' }} onClick={e => { e.stopPropagation(); toggleJoin(c.id); }}>{c.isJoined ? '✅ Joined' : 'Join Challenge'}</button>
            </div>
          ); })}
        </div>
      </div>}

      {tab === 'mood' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>📈 Your Mood This Week</h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-3)', height: 120 }}>{moodHistory.map((d, i) => <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>{d.mood && <><span style={{ fontSize: 14 }}>{moods[d.mood - 1]?.emoji}</span><div style={{ width: '100%', height: `${(d.mood / 5) * 100}%`, background: 'var(--color-primary-500)', borderRadius: 'var(--radius-sm)', minHeight: 8 }} /></>}<span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.date}</span></div>)}</div>
        </div>
        <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
          <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>🔍 Insights</h2>
          {[`📊 Average mood: ${teamAvgMood} (${moods[Math.round(teamAvgMood) - 1]?.label})`, '📈 Trend: Improving ↑', `🔥 Logging streak: ${moodHistory.filter(d => d.mood).length} days`, '💡 Wednesdays dip — try a walk after lunch!'].map((s, i) => <div key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: '6px 0', borderBottom: '1px solid var(--border-secondary)' }}>{s}</div>)}
        </div>
      </div>}

      {/* Challenge Detail */}
      {showChallengeDetail && <div className="modal-overlay" onClick={() => setShowChallengeDetail(null)}><div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><span style={{ fontSize: 24 }}>{showChallengeDetail.icon}</span><h2>{showChallengeDetail.title}</h2></div><button onClick={() => setShowChallengeDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-primary-400)' }}>{Math.round((showChallengeDetail.totalProgress / showChallengeDetail.totalTarget) * 100)}%</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{showChallengeDetail.totalProgress.toLocaleString()} / {showChallengeDetail.totalTarget.toLocaleString()} {showChallengeDetail.unit}</div>
            <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 9999, overflow: 'hidden', marginTop: 8 }}><div style={{ height: '100%', width: `${Math.min((showChallengeDetail.totalProgress / showChallengeDetail.totalTarget) * 100, 100)}%`, background: 'var(--color-accent-500)', borderRadius: 9999 }} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            {[['Target', `${showChallengeDetail.target} ${showChallengeDetail.unit}/day`], ['Duration', `${showChallengeDetail.duration} days`], ['XP Reward', `+${showChallengeDetail.xpReward}`], ['Participants', showChallengeDetail.participants], ['Ends', new Date(showChallengeDetail.endsAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })], ['Progress', `${showChallengeDetail.progress}/${showChallengeDetail.duration}d`]].map(([l, v]) => (
              <div key={l as string}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{l}</div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{v}</div></div>
            ))}
          </div>
          {showChallengeDetail.isJoined && <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <input className="input-field" type="number" placeholder={`Log ${showChallengeDetail.unit}...`} value={logValue} onChange={e => setLogValue(e.target.value)} style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={() => logProgress(showChallengeDetail.id)}>Log</button>
          </div>}
          <button className={`btn ${showChallengeDetail.isJoined ? 'btn-ghost' : 'btn-primary'}`} onClick={() => toggleJoin(showChallengeDetail.id)}>{showChallengeDetail.isJoined ? '❌ Leave Challenge' : '🏆 Join Challenge'}</button>
        </div>
      </div></div>}

      {/* Create Challenge */}
      {showCreateChallenge && <div className="modal-overlay" onClick={() => setShowCreateChallenge(false)}><div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Create Challenge</h2><button onClick={() => setShowCreateChallenge(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }} onSubmit={createChallenge}>
          <div><label className="input-label">Title *</label><input className="input-field" name="title" required placeholder="10K Steps Challenge" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Type</label><select className="input-field" name="type"><option value="STEPS">Steps</option><option value="MEDITATION">Meditation</option><option value="HYDRATION">Hydration</option><option value="EXERCISE">Exercise</option></select></div>
            <div><label className="input-label">Duration (days)</label><input className="input-field" name="duration" type="number" defaultValue={30} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Daily Target</label><input className="input-field" name="target" type="number" defaultValue={10000} /></div>
            <div><label className="input-label">Unit</label><input className="input-field" name="unit" defaultValue="steps" /></div>
          </div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreateChallenge(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
        </form>
      </div></div>}
    </div>
  );
}

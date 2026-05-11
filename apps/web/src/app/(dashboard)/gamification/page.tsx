'use client';
import toast from '@/lib/toast';

import { useState, useEffect } from 'react';
import styles from './gamification.module.css';

const mockLevel = { level: 12, title: 'Champion', totalXp: 2680, nextLevelXp: 3000, streakDays: 15, longestStreak: 42 };

const mockBadges = [
  { id: '1', name: 'Streak Master', icon: '🔥', category: 'ATTENDANCE', description: '30-day perfect attendance', earned: true, earnedAt: '2026-03-15', xp: 100 },
  { id: '2', name: 'Goal Crusher', icon: '🎯', category: 'PERFORMANCE', description: 'Completed all quarterly goals', earned: true, earnedAt: '2026-03-20', xp: 50 },
  { id: '3', name: 'Knowledge Seeker', icon: '📚', category: 'LEARNING', description: 'Completed 10 courses', earned: true, earnedAt: '2026-02-28', xp: 50 },
  { id: '4', name: 'Team Player', icon: '🤝', category: 'SOCIAL', description: 'Gave 50 peer recognitions', earned: false, progress: 32, target: 50, xp: 75 },
  { id: '5', name: 'Wellness Warrior', icon: '💪', category: 'WELLNESS', description: '5 wellness challenges completed', earned: false, progress: 3, target: 5, xp: 50 },
  { id: '6', name: 'Talent Scout', icon: '🌟', category: 'REFERRAL', description: '3 successful referral hires', earned: false, progress: 1, target: 3, xp: 200 },
  { id: '7', name: 'Quick Starter', icon: '🚀', category: 'ONBOARDING', description: 'All onboarding tasks in 3 days', earned: true, earnedAt: '2025-06-05', xp: 50 },
  { id: '8', name: 'First Blood', icon: '⚡', category: 'CUSTOM', description: 'First task completed', earned: true, earnedAt: '2025-06-03', xp: 10 },
  { id: '9', name: 'Social Butterfly', icon: '🦋', category: 'SOCIAL', description: 'Posted 20 times in feed', earned: false, progress: 8, target: 20, xp: 30 },
  { id: '10', name: 'Early Bird', icon: '🐦', category: 'ATTENDANCE', description: 'Clock in before 9 AM for 20 days', earned: true, earnedAt: '2026-01-30', xp: 40 },
  { id: '11', name: 'Mentor', icon: '🧑‍🏫', category: 'SOCIAL', description: 'Mentored 3 new joiners', earned: false, progress: 1, target: 3, xp: 100 },
  { id: '12', name: 'Survey Star', icon: '📊', category: 'CUSTOM', description: 'Completed 10 pulse surveys', earned: true, earnedAt: '2026-04-01', xp: 25 },
];

const mockLeaderboard = [
  { rank: 1, name: 'Sneha Reddy', department: 'Engineering', xp: 4200, level: 16, avatar: 'SR', change: 0 },
  { rank: 2, name: 'Karan Malhotra', department: 'Engineering', xp: 3850, level: 15, avatar: 'KM', change: 1 },
  { rank: 3, name: 'Priya Patel', department: 'HR', xp: 3600, level: 14, avatar: 'PP', change: -1 },
  { rank: 4, name: 'Amit Kumar', department: 'Marketing', xp: 3200, level: 13, avatar: 'AK', change: 2 },
  { rank: 5, name: 'Rahul Sharma', department: 'Engineering', xp: 2680, level: 12, avatar: 'RS', change: 0 },
  { rank: 6, name: 'Ananya Iyer', department: 'Finance', xp: 2400, level: 11, avatar: 'AI', change: -2 },
  { rank: 7, name: 'Arjun Desai', department: 'Backend', xp: 2100, level: 10, avatar: 'AD', change: 1 },
  { rank: 8, name: 'Meera Nair', department: 'Design', xp: 1900, level: 9, avatar: 'MN', change: -1 },
];

const mockQuests = [
  { id: '1', title: 'Perfect Attendance Week', description: 'Clock in on time every day this week', type: 'WEEKLY', category: 'ATTENDANCE', xpReward: 25, current: 4, target: 5, icon: '⏰' },
  { id: '2', title: 'Give 3 Recognitions', description: 'Appreciate your teammates today', type: 'DAILY', category: 'SOCIAL', xpReward: 10, current: 1, target: 3, icon: '🌟' },
  { id: '3', title: 'Complete Compliance Training', description: 'Finish the POSH awareness module', type: 'ONE_TIME', category: 'LEARNING', xpReward: 20, current: 0, target: 1, icon: '📚' },
  { id: '4', title: 'Log Your Mood', description: 'Check in with your daily mood tracker', type: 'DAILY', category: 'WELLNESS', xpReward: 5, current: 1, target: 1, icon: '😊' },
  { id: '5', title: 'Walk 10K Steps', description: 'Hit your daily step goal', type: 'DAILY', category: 'WELLNESS', xpReward: 8, current: 6500, target: 10000, icon: '🚶' },
  { id: '6', title: 'Monthly Goal Review', description: 'Update progress on all your OKRs', type: 'MONTHLY', category: 'PERFORMANCE', xpReward: 30, current: 2, target: 5, icon: '🎯' },
];

const mockRewards = [
  { id: '1', name: 'Extra Day Off', category: 'LEAVE', points: 500, icon: '🏖️', available: true },
  { id: '2', name: 'Amazon Gift Card ₹500', category: 'GIFT_CARD', points: 300, icon: '🎁', available: true },
  { id: '3', name: 'Company Swag Box', category: 'MERCHANDISE', points: 200, icon: '👕', available: true },
  { id: '4', name: 'Learning Budget ₹2000', category: 'LEARNING', points: 400, icon: '📖', available: true },
  { id: '5', name: 'Team Lunch Voucher', category: 'EXPERIENCE', points: 350, icon: '🍕', available: true },
  { id: '6', name: 'Premium Headphones', category: 'MERCHANDISE', points: 800, icon: '🎧', available: false },
];

const mockXpHistory = [
  { date: 'Today', items: [
    { description: 'Clock-in on time', xp: 5, source: 'ATTENDANCE' },
    { description: 'Gave recognition to Priya', xp: 3, source: 'SOCIAL' },
    { description: 'Completed pulse survey', xp: 5, source: 'SURVEY' },
  ]},
  { date: 'Yesterday', items: [
    { description: 'Clock-in on time', xp: 5, source: 'ATTENDANCE' },
    { description: 'Course: React 19 — module 5', xp: 10, source: 'TRAINING' },
  ]},
  { date: 'Apr 17', items: [
    { description: 'Clock-in on time', xp: 5, source: 'ATTENDANCE' },
    { description: 'Weekly streak bonus', xp: 25, source: 'ATTENDANCE' },
    { description: 'Gave recognition to Karan', xp: 3, source: 'SOCIAL' },
    { description: 'Received recognition from Sneha', xp: 5, source: 'SOCIAL' },
  ]},
];

const catColors: Record<string, string> = {
  ATTENDANCE: 'var(--color-primary-400)', PERFORMANCE: 'var(--color-accent-400)', LEARNING: '#a78bfa',
  SOCIAL: '#f472b6', WELLNESS: '#34d399', REFERRAL: 'var(--color-warning-400)', ONBOARDING: '#38bdf8', CUSTOM: 'var(--text-tertiary)',
};
const sourceColors: Record<string, string> = {
  ATTENDANCE: 'var(--color-primary-400)', TRAINING: '#a78bfa', SOCIAL: '#f472b6', SURVEY: '#38bdf8',
  GOAL: 'var(--color-accent-400)', WELLNESS: '#34d399', REFERRAL: 'var(--color-warning-400)', BADGE: 'var(--color-warning-400)',
};

export default function GamificationPage() {
  const [tab, setTab] = useState<'overview' | 'badges' | 'leaderboard' | 'quests' | 'rewards'>('overview');
  const [lbPeriod, setLbPeriod] = useState('MONTHLY');
  const [badgeFilter, setBadgeFilter] = useState('ALL');
  const [level, setLevel] = useState<any>(mockLevel);
  const [badges, setBadges] = useState<any[]>(mockBadges);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/gamification').then(r => r.json()).then(d => {
      if (d.user) setLevel({ level: d.user.level, title: 'Rising Star', totalXp: d.user.xp, nextLevelXp: d.user.level * 1000, streakDays: d.user.streak, longestStreak: d.user.streak });
      if (d.badges?.length) setBadges(d.badges.map((b: any) => ({ ...b, xp: b.xpReward || 0 })));
      if (d.leaderboard?.length) setLeaderboard(d.leaderboard);
    }).catch(() => {});
  }, []);

  const earnedBadges = badges.filter(b => b.earned);
  const inProgressBadges = badges.filter(b => !b.earned);
  const xpProgress = ((level.totalXp % 1000) / 1000) * 100;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>🎮 Gamification Hub</h1>
          <p className={styles.pageSubtitle}>Earn XP, unlock badges, climb the leaderboard, and redeem rewards</p>
        </div>
      </div>

      {/* Level Card */}
      <div className={styles.levelCard}>
        <div className={styles.levelLeft}>
          <div className={styles.levelBadge}>
            <span className={styles.levelNum}>{mockLevel.level}</span>
          </div>
          <div className={styles.levelInfo}>
            <span className={styles.levelTitle}>{mockLevel.title}</span>
            <div className={styles.xpBar}>
              <div className={styles.xpFill} style={{ width: `${xpProgress}%` }} />
            </div>
            <span className={styles.xpText}>{mockLevel.totalXp.toLocaleString()} / {mockLevel.nextLevelXp.toLocaleString()} XP</span>
          </div>
        </div>
        <div className={styles.streakSection}>
          <div className={styles.streakItem}>
            <span className={styles.streakIcon}>🔥</span>
            <span className={styles.streakNum}>{mockLevel.streakDays}</span>
            <span className={styles.streakLabel}>Day Streak</span>
          </div>
          <div className={styles.streakDivider} />
          <div className={styles.streakItem}>
            <span className={styles.streakIcon}>🏆</span>
            <span className={styles.streakNum}>{mockLevel.longestStreak}</span>
            <span className={styles.streakLabel}>Best Streak</span>
          </div>
          <div className={styles.streakDivider} />
          <div className={styles.streakItem}>
            <span className={styles.streakIcon}>⭐</span>
            <span className={styles.streakNum}>{earnedBadges.length}</span>
            <span className={styles.streakLabel}>Badges</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {[
          { key: 'overview', label: '📊 Overview', },
          { key: 'badges', label: '🏅 Badges' },
          { key: 'leaderboard', label: '🏆 Leaderboard' },
          { key: 'quests', label: '⚔️ Quests' },
          { key: 'rewards', label: '🎁 Rewards' },
        ].map(t => (
          <button key={t.key} className={styles.tab} data-active={tab === t.key} onClick={() => setTab(t.key as any)}>{t.label}</button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className={styles.overviewGrid}>
          {/* Active Quests */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>⚔️ Active Quests</h2>
            <div className={styles.questMini}>
              {mockQuests.slice(0, 3).map(q => (
                <div key={q.id} className={styles.questMiniItem}>
                  <span className={styles.questMiniIcon}>{q.icon}</span>
                  <div className={styles.questMiniContent}>
                    <span className={styles.questMiniTitle}>{q.title}</span>
                    <div className={styles.questMiniBar}>
                      <div className={styles.questMiniFill} style={{ width: `${(q.current / q.target) * 100}%` }} />
                    </div>
                  </div>
                  <span className={styles.questMiniXp}>+{q.xpReward} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Badges */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🏅 Recent Badges</h2>
            <div className={styles.recentBadges}>
              {earnedBadges.slice(0, 4).map(b => (
                <div key={b.id} className={styles.badgeMini}>
                  <span className={styles.badgeMiniIcon}>{b.icon}</span>
                  <span className={styles.badgeMiniName}>{b.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* XP History */}
          <div className={styles.card} style={{ gridColumn: 'span 2' }}>
            <h2 className={styles.cardTitle}>📈 XP Activity</h2>
            <div className={styles.xpHistory}>
              {mockXpHistory.map((group, gi) => (
                <div key={gi} className={styles.xpGroup}>
                  <span className={styles.xpGroupDate}>{group.date}</span>
                  {group.items.map((item, ii) => (
                    <div key={ii} className={styles.xpItem}>
                      <span className={styles.xpItemDot} style={{ background: sourceColors[item.source] }} />
                      <span className={styles.xpItemDesc}>{item.description}</span>
                      <span className={styles.xpItemVal} style={{ color: sourceColors[item.source] }}>+{item.xp} XP</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Top Leaderboard Preview */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🏆 Top Performers</h2>
            <div className={styles.lbPreview}>
              {(leaderboard.length ? leaderboard : mockLeaderboard).slice(0, 5).map((p: any) => (
                <div key={p.rank} className={styles.lbPreviewItem} data-highlight={p.name === 'Rahul Sharma'}>
                  <span className={styles.lbPreviewRank}>{p.rank <= 3 ? ['🥇','🥈','🥉'][p.rank - 1] : `#${p.rank}`}</span>
                  <div className={styles.lbPreviewAvatar}>{p.avatar}</div>
                  <span className={styles.lbPreviewName}>{p.name}</span>
                  <span className={styles.lbPreviewXp}>{p.xp.toLocaleString()} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rewards Preview */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>🎁 Popular Rewards</h2>
            <div className={styles.rewardPreview}>
              {mockRewards.slice(0, 3).map(r => (
                <div key={r.id} className={styles.rewardPreviewItem}>
                  <span className={styles.rewardPreviewIcon}>{r.icon}</span>
                  <span className={styles.rewardPreviewName}>{r.name}</span>
                  <span className={styles.rewardPreviewPts}>{r.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {tab === 'badges' && (
        <>
          <div className={styles.filterRow}>
            {['ALL', 'EARNED', 'IN_PROGRESS'].map(f => (
              <button key={f} className={styles.catBtn} data-active={badgeFilter === f} onClick={() => setBadgeFilter(f)}>
                {f === 'ALL' ? 'All' : f === 'EARNED' ? `Earned (${earnedBadges.length})` : `In Progress (${inProgressBadges.length})`}
              </button>
            ))}
          </div>
          <div className={styles.badgeGrid}>
            {mockBadges
              .filter(b => badgeFilter === 'ALL' || (badgeFilter === 'EARNED' ? b.earned : !b.earned))
              .map((badge, i) => (
              <div key={badge.id} className={styles.badgeCard} data-earned={badge.earned} style={{ animationDelay: `${i * 40}ms` }}>
                <div className={styles.badgeIconLg}>{badge.icon}</div>
                <h3 className={styles.badgeName}>{badge.name}</h3>
                <span className={styles.badgeCat} style={{ color: catColors[badge.category] }}>{badge.category}</span>
                <p className={styles.badgeDesc}>{badge.description}</p>
                {badge.earned ? (
                  <span className={styles.badgeEarned}>✅ Earned · +{badge.xp} XP</span>
                ) : (
                  <div className={styles.badgeProgress}>
                    <div className={styles.progressTrack}>
                      <div className={styles.progressFill} style={{ width: `${((badge as any).progress / (badge as any).target) * 100}%` }} />
                    </div>
                    <span>{(badge as any).progress}/{(badge as any).target}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Leaderboard Tab */}
      {tab === 'leaderboard' && (
        <>
          <div className={styles.filterRow}>
            {['WEEKLY', 'MONTHLY', 'QUARTERLY', 'ALL_TIME'].map(p => (
              <button key={p} className={styles.catBtn} data-active={lbPeriod === p} onClick={() => setLbPeriod(p)}>
                {p.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className={styles.podium}>
            {(leaderboard.length ? leaderboard : mockLeaderboard).slice(0, 3).map((p: any, i: number) => (
              <div key={p.rank} className={styles.podiumItem} data-position={i + 1}>
                <div className={styles.podiumAvatar}>{p.avatar}</div>
                <span className={styles.podiumMedal}>{['🥇','🥈','🥉'][i]}</span>
                <span className={styles.podiumName}>{p.name}</span>
                <span className={styles.podiumXp}>{p.xp.toLocaleString()} XP</span>
                <span className={styles.podiumLevel}>Lv.{p.level}</span>
              </div>
            ))}
          </div>
          <div className={styles.lbTable}>
            {(leaderboard.length ? leaderboard : mockLeaderboard).map((p: any, i: number) => (
              <div key={p.rank} className={styles.lbRow} data-highlight={p.name === 'Rahul Sharma'} style={{ animationDelay: `${i * 40}ms` }}>
                <span className={styles.lbRank}>{p.rank}</span>
                <div className={styles.lbAvatar}>{p.avatar}</div>
                <div className={styles.lbInfo}>
                  <span className={styles.lbName}>{p.name}</span>
                  <span className={styles.lbDept}>{p.department} · Level {p.level}</span>
                </div>
                <span className={styles.lbXp}>{p.xp.toLocaleString()} XP</span>
                <span className={styles.lbChange} data-direction={p.change > 0 ? 'up' : p.change < 0 ? 'down' : 'same'}>
                  {p.change > 0 ? `↑${p.change}` : p.change < 0 ? `↓${Math.abs(p.change)}` : '—'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Quests Tab */}
      {tab === 'quests' && (
        <div className={styles.questGrid}>
          {mockQuests.map((quest, i) => {
            const pct = Math.min((quest.current / quest.target) * 100, 100);
            const isDone = pct >= 100;
            return (
              <div key={quest.id} className={styles.questCard} data-done={isDone} style={{ animationDelay: `${i * 50}ms` }}>
                <div className={styles.questHeader}>
                  <span className={styles.questIcon}>{quest.icon}</span>
                  <span className={styles.questType} data-type={quest.type}>{quest.type}</span>
                </div>
                <h3 className={styles.questTitle}>{quest.title}</h3>
                <p className={styles.questDesc}>{quest.description}</p>
                <div className={styles.questProgressBar}>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${pct}%`, background: isDone ? 'var(--color-accent-400)' : 'var(--color-primary-400)' }} />
                  </div>
                  <span>{quest.current >= 1000 ? `${(quest.current/1000).toFixed(1)}k` : quest.current}/{quest.target >= 1000 ? `${(quest.target/1000).toFixed(0)}k` : quest.target}</span>
                </div>
                <div className={styles.questFooter}>
                  <span className={styles.questXpReward}>🏆 +{quest.xpReward} XP</span>
                  {isDone && <span className={styles.questComplete}>✅ Complete!</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rewards Tab */}
      {tab === 'rewards' && (
        <>
          <div className={styles.rewardBalance}>
            <span className={styles.rewardBalLabel}>Your Balance</span>
            <span className={styles.rewardBalVal}>{mockLevel.totalXp.toLocaleString()} pts</span>
          </div>
          <div className={styles.rewardGrid}>
            {mockRewards.map((reward, i) => (
              <div key={reward.id} className={styles.rewardCard} data-available={reward.available} style={{ animationDelay: `${i * 50}ms` }}>
                <span className={styles.rewardIcon}>{reward.icon}</span>
                <h3 className={styles.rewardName}>{reward.name}</h3>
                <span className={styles.rewardCat}>{reward.category.replace('_', ' ')}</span>
                <span className={styles.rewardCost}>{reward.points} points</span>
                <button className={styles.rewardBtn} disabled={!reward.available || mockLevel.totalXp < reward.points} onClick={() => toast("Action completed", "success")}>
                  {!reward.available ? 'Out of Stock' : mockLevel.totalXp < reward.points ? 'Not Enough Points' : 'Redeem'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

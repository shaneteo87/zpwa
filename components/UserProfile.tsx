
import React from 'react';
import { KarmaEntry, KarmaType, RankTier, UserData, Language } from '../types';
import { translations } from '../translations';

interface UserProfileProps {
  entries: KarmaEntry[];
  totalScore: number;
  onClose: () => void;
  userData: UserData;
  onEdit: () => void;
  onLogout: () => void;
  lang: Language;
}

const RANKS: RankTier[] = [
  { name: 'Wandering Shadow', minScore: -Infinity, icon: 'fa-ghost', color: 'text-slate-500' },
  { name: 'Seeking Balance', minScore: -50, icon: 'fa-scale-unbalanced', color: 'text-blue-400' },
  { name: 'Awakened Soul', minScore: 50, icon: 'fa-eye', color: 'text-emerald-400' },
  { name: 'Radiant Guardian', minScore: 250, icon: 'fa-shield-halved', color: 'text-amber-400' },
  { name: 'Transcendent Entity', minScore: 750, icon: 'fa-crown', color: 'text-purple-400' },
];

const UserProfile: React.FC<UserProfileProps> = ({ entries, totalScore, userData, onEdit, onLogout, lang }) => {
  const t = translations[lang] || translations['en'];
  const currentRank = [...RANKS].reverse().find(r => totalScore >= r.minScore) || RANKS[0];
  const nextRank = RANKS[RANKS.indexOf(currentRank) + 1];

  const stats = {
    merits: entries.filter(e => e.type === KarmaType.MERIT).length,
    misfortunes: entries.filter(e => e.type === KarmaType.BAD_LUCK).length,
    avgImpact: entries.length > 0 ? (totalScore / entries.length).toFixed(1) : 0,
    totalCount: entries.length
  };

  const progress = nextRank 
    ? Math.max(0, Math.min(100, ((totalScore - currentRank.minScore) / (nextRank.minScore - currentRank.minScore)) * 100))
    : 100;

  return (
    <div className="w-full animate-entry pb-20">
      <div className="w-full max-w-md mx-auto space-y-6">
        
        {/* Lifetime Stats & Rank */}
        <div className="glass rounded-[2.5rem] p-8 border border-white/10 overflow-hidden relative">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className={`w-20 h-20 rounded-full border-2 border-white/10 flex items-center justify-center text-3xl shadow-2xl ${currentRank.color}`}>
                <i className={`fas ${currentRank.icon} animate-rotate-slow`}></i>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-cinzel font-bold text-white leading-tight">
                {userData.nameEn} {userData.nameCn && <span className="block text-lg opacity-60 font-medium">{userData.nameCn}</span>}
              </h2>
              <p className={`text-[10px] font-cinzel font-bold uppercase tracking-[0.2em] ${currentRank.color}`}>{currentRank.name}</p>
            </div>

            <div className="w-full space-y-2 mb-6">
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div className={`h-full transition-all duration-1000 bg-gradient-to-r from-emerald-500 via-purple-500 to-rose-500`} style={{ width: `${progress}%` }}></div>
              </div>
              <div className="flex justify-between text-[8px] text-slate-600 font-mono tracking-widest uppercase">
                <span>{t.ascension} {progress.toFixed(0)}%</span>
                <span className="text-slate-400">{t.lifetimeResonance}: {totalScore}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-1">Lifetime Merits</span>
                <span className="text-sm font-bold text-emerald-400">{stats.merits}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-1">Lifetime Shadows</span>
                <span className="text-sm font-bold text-rose-400">{stats.misfortunes}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="block text-[8px] uppercase tracking-widest text-slate-500 mb-1">Total Logs</span>
                <span className="text-sm font-bold text-purple-400">{stats.totalCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vessel Initialization Parameters */}
        <div className="glass rounded-[2rem] p-6 border border-white/10">
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-[10px] font-cinzel font-bold text-slate-400 uppercase tracking-[0.2em]">{t.profileTitle}</h3>
            <div className="flex gap-4">
              <button onClick={onEdit} className="text-[9px] text-purple-400 font-bold uppercase tracking-widest hover:underline">
                 {t.recalibrate}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
            <div className="p-4 bg-slate-950/40 border-r border-b border-white/5">
              <span className="block text-[8px] uppercase tracking-widest text-slate-600 mb-1">{t.gender}</span>
              <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">{userData.gender}</span>
            </div>
            <div className="p-4 bg-slate-950/40 border-b border-white/5">
              <span className="block text-[8px] uppercase tracking-widest text-slate-600 mb-1">{t.location}</span>
              <span className="text-xs text-slate-300 font-bold truncate block tracking-wider">{userData.location}</span>
            </div>
            <div className="p-4 bg-slate-950/40 border-r border-white/5">
              <span className="block text-[8px] uppercase tracking-widest text-slate-600 mb-1">{t.dob}</span>
              <span className="text-xs text-slate-300 font-bold tracking-wider">{new Date(userData.dob).toLocaleDateString()}</span>
            </div>
            <div className="p-4 bg-slate-950/40">
              <span className="block text-[8px] uppercase tracking-widest text-slate-600 mb-1">{t.tob}</span>
              <span className="text-xs text-slate-300 font-bold tracking-wider">{userData.isTobUnknown ? 'UNKNOWN' : userData.tob}</span>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/5">
            <span className="block text-[8px] uppercase tracking-widest text-slate-600 mb-1">{t.mobile}</span>
            <span className="text-xs text-slate-300 font-bold tracking-widest">{userData.mobile}</span>
          </div>
        </div>

        {/* Logout Section - Moved higher and more robustly clickable */}
        <div className="p-4 bg-rose-500/5 rounded-[2rem] border border-rose-500/20">
          <button 
            onClick={() => {
              if (window.confirm(`${t.logout}?`)) {
                onLogout();
              }
            }}
            className="w-full py-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-rose-500/20 active:scale-[0.98] transition-all"
          >
            <i className="fas fa-power-off text-sm"></i>
            {t.logout}
          </button>
          <p className="text-center text-[8px] text-rose-900/40 uppercase mt-4 tracking-tighter">This will disconnect your physical identity from this vessel.</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

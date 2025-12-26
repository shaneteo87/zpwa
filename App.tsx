import React, { useState, useEffect, useMemo } from 'react';
import { KarmaType, KarmaEntry, UserData, Language } from './types';
import { analyzeKarma, consultOracle } from './services/geminiService';
import { translations } from './translations';
import ActionDialog from './components/ActionDialog';
import KarmaVisualizer from './components/KarmaVisualizer';
import UserProfile from './components/UserProfile';
import Onboarding from './components/Onboarding';

const LANGUAGES: { code: Language; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'th', name: 'ไทย' },
  { code: 'ko', name: '한국어' },
  { code: 'ja', name: '日本語' },
  { code: 'es', name: 'Español' }
];

type Tab = 'home' | 'service' | 'ask' | 'notifs' | 'profile';
type ManifestSubView = 'hub' | 'fate' | 'rituals' | 'deeds' | 'merch';

const App: React.FC = () => {
  const [entries, setEntries] = useState<KarmaEntry[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('zidous_lang') as Language) || 'en');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [manifestView, setManifestView] = useState<ManifestSubView>('hub');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeType, setActiveType] = useState<KarmaType>(KarmaType.MERIT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalScore, setTotalScore] = useState(0); 
  const [dailyScore, setDailyScore] = useState(0); 
  const [showDailyPrompt, setShowDailyPrompt] = useState(false);

  // Oracle Chat State
  const [oracleQuery, setOracleQuery] = useState('');
  const [oracleResponse, setOracleResponse] = useState<string | null>(null);
  const [isOracleConsulting, setIsOracleConsulting] = useState(false);

  const t = translations[lang] || translations['en'];

  useEffect(() => {
    localStorage.setItem('zidous_lang', lang);
  }, [lang]);

  // Initial Load
  useEffect(() => {
    const savedEntries = localStorage.getItem('karma_entries');
    const savedUser = localStorage.getItem('karma_user_vessel');
    if (savedEntries) {
      try { setEntries(JSON.parse(savedEntries)); } catch (e) { console.error(e); }
    }
    if (savedUser) {
      try { setUserData(JSON.parse(savedUser)); } catch (e) { console.error(e); }
    }

    const lastPromptDate = localStorage.getItem('last_prompt_date');
    if (lastPromptDate !== new Date().toDateString()) setShowDailyPrompt(true);
  }, []);

  // Sync entries and calculate scores
  useEffect(() => {
    localStorage.setItem('karma_entries', JSON.stringify(entries));
    const lifetime = entries.reduce((acc, curr) => acc + curr.scoreImpact, 0);
    setTotalScore(lifetime);
    const today = new Date().toDateString();
    const daily = entries
      .filter(e => new Date(e.timestamp).toDateString() === today)
      .reduce((acc, curr) => acc + curr.scoreImpact, 0);
    setDailyScore(daily);
  }, [entries]);

  // Sync userData to localStorage
  useEffect(() => {
    if (userData) {
      localStorage.setItem('karma_user_vessel', JSON.stringify(userData));
    } else {
      localStorage.removeItem('karma_user_vessel');
    }
  }, [userData]);

  const handleSubmitEntry = async (text: string) => {
    setIsSubmitting(true);
    try {
      const result = await analyzeKarma(activeType, text, lang);
      const newEntry: KarmaEntry = {
        id: crypto.randomUUID(),
        type: activeType,
        description: text,
        timestamp: Date.now(),
        aiFeedback: result.feedback,
        scoreImpact: result.scoreImpact,
        symbol: result.symbol
      };
      setEntries(prev => [...prev, newEntry]);
      setDialogOpen(false);
      setShowDailyPrompt(false);
      localStorage.setItem('last_prompt_date', new Date().toDateString());
    } catch (error) {
      alert("Error linking to the cosmic engine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConsultOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleQuery.trim() || isOracleConsulting) return;
    setIsOracleConsulting(true);
    setOracleResponse(null);
    try {
      const resp = await consultOracle(oracleQuery, lang);
      setOracleResponse(resp);
    } finally {
      setIsOracleConsulting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('karma_user_vessel');
    setUserData(null);
    setActiveTab('home');
  };

  const streakInfo = useMemo(() => {
    let streak = 0;
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].type === KarmaType.MERIT) streak++;
      else break;
    }
    if (streak < 2) return null;
    return { streak, label: streak >= 10 ? 'TRANSCENDENT' : 'RESONANT', color: 'text-emerald-400' };
  }, [entries]);

  const navTabs = [
    { id: 'home', icon: 'fa-house', label: t.navHome, color: 'bg-purple-500' },
    { id: 'service', icon: 'fa-wand-sparkles', label: t.navService, color: 'bg-amber-500' },
    { id: 'ask', icon: 'fa-crystal-ball', label: t.navAsk, color: 'bg-emerald-500' },
    { id: 'notifs', icon: 'fa-bell', label: t.navNotifs, color: 'bg-blue-500' },
    { id: 'profile', icon: 'fa-user-astronaut', label: t.navProfile, color: 'bg-rose-500' }
  ];

  // Force Onboarding if no userData
  if (!userData) {
    return (
      <div className="relative">
        <div className="fixed top-6 right-6 z-[100]">
          <button onClick={() => setLangMenuOpen(!langMenuOpen)} className="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <i className="fas fa-globe"></i>
          </button>
          {langMenuOpen && (
            <div className="absolute top-12 right-0 glass rounded-2xl p-2 w-40 border border-white/10 shadow-2xl animate-entry">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => { setLang(l.code); setLangMenuOpen(false); }} className={`w-full text-left p-2 rounded-xl text-xs font-bold transition-all ${lang === l.code ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  {l.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <Onboarding lang={lang} onComplete={setUserData} />
      </div>
    );
  }

  const renderManifestContent = () => {
    switch (manifestView) {
      case 'hub':
        return (
          <div className="grid grid-cols-1 gap-4 animate-entry">
            <button onClick={() => setManifestView('fate')} className="relative overflow-hidden group p-6 glass rounded-3xl border border-white/10 text-left transition-all hover:border-amber-500/50">
               <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-all text-amber-400"><i className="fas fa-fingerprint text-4xl"></i></div>
               <span className="block text-[8px] font-bold text-amber-500 uppercase tracking-widest mb-1">{t.svcFree}</span>
               <h3 className="text-xl font-cinzel font-bold text-white mb-1">{t.svcFate}</h3>
               <p className="text-[10px] text-slate-500 font-medium max-w-[200px]">Zi Wei Dou Shu Analysis. Base your path on the constellations.</p>
            </button>
            <button onClick={() => setManifestView('rituals')} className="relative overflow-hidden group p-6 glass rounded-3xl border border-white/10 text-left transition-all hover:border-purple-500/50">
               <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-all text-purple-400"><i className="fas fa-bolt text-4xl"></i></div>
               <span className="block text-[8px] font-bold text-purple-500 uppercase tracking-widest mb-1">{t.svcPremium}</span>
               <h3 className="text-xl font-cinzel font-bold text-white mb-1">{t.svcRitual}</h3>
               <p className="text-[10px] text-slate-500 font-medium max-w-[200px]">Wealth, Health & Rizz manifestations. Energy shifts only.</p>
            </button>
            <button onClick={() => setManifestView('deeds')} className="relative overflow-hidden group p-6 glass rounded-3xl border border-white/10 text-left transition-all hover:border-emerald-500/50">
               <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-all text-emerald-400"><i className="fas fa-seedling text-4xl"></i></div>
               <span className="block text-[8px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Impact</span>
               <h3 className="text-xl font-cinzel font-bold text-white mb-1">{t.svcDeed}</h3>
               <p className="text-[10px] text-slate-500 font-medium max-w-[200px]">Karma farming through real-world benevolence acts.</p>
            </button>
            <button onClick={() => setManifestView('merch')} className="relative overflow-hidden group p-6 glass rounded-3xl border border-white/10 text-left transition-all hover:border-rose-500/50">
               <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-all text-rose-400"><i className="fas fa-gem text-4xl"></i></div>
               <span className="block text-[8px] font-bold text-rose-500 uppercase tracking-widest mb-1">Drip</span>
               <h3 className="text-xl font-cinzel font-bold text-white mb-1">{t.svcMerch}</h3>
               <p className="text-[10px] text-slate-500 font-medium max-w-[200px]">Lucky charms & aura-protecting talismans.</p>
            </button>
          </div>
        );
      case 'fate':
        return (
          <div className="animate-entry space-y-6">
            <button onClick={() => setManifestView('hub')} className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2"><i className="fas fa-arrow-left"></i> {t.backToHub}</button>
            <div className="p-8 glass rounded-3xl border border-amber-500/20 text-center">
              <i className="fas fa-yin-yang text-4xl text-amber-500 mb-4 animate-spin-slow"></i>
              <h2 className="text-2xl font-cinzel font-bold text-white mb-2">{t.svcFate}</h2>
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 text-left mb-6">
                 <p className="text-xs text-amber-200/80 leading-relaxed mb-4">Reading your Zi Wei Dou Shu birth vessel data...</p>
                 <div className="space-y-2 opacity-50 pointer-events-none">
                    <div className="flex justify-between text-[10px] uppercase border-b border-white/5 pb-2"><span>Self Palace</span> <span className="text-amber-400">Locked</span></div>
                    <div className="flex justify-between text-[10px] uppercase border-b border-white/5 pb-2"><span>Wealth Palace</span> <span className="text-amber-400">Locked</span></div>
                    <div className="flex justify-between text-[10px] uppercase border-b border-white/5 pb-2"><span>Aura Level</span> <span className="text-amber-400">Locked</span></div>
                 </div>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Report synthesis takes time. Check back at the next moon cycle.</p>
            </div>
          </div>
        );
      case 'rituals':
        return (
          <div className="animate-entry space-y-6">
            <button onClick={() => setManifestView('hub')} className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2"><i className="fas fa-arrow-left"></i> {t.backToHub}</button>
            <h2 className="text-xl font-cinzel font-bold text-white px-2">Vibe Alignment</h2>
            <div className="space-y-4">
              {[
                { name: 'Wealth Blessing', desc: 'Unlock abundance flow into your current cycle.', cost: 'Premium', icon: 'fa-coins', color: 'text-amber-400' },
                { name: 'Health Shield', desc: 'Sync physical vessel with ethereal vigor.', cost: 'Premium', icon: 'fa-heart-pulse', color: 'text-emerald-400' },
                { name: 'Romance Rizz', desc: 'Align attraction frequency with fate.', cost: 'Premium', icon: 'fa-fire-heart', color: 'text-rose-400' }
              ].map(r => (
                <div key={r.name} className="p-5 glass rounded-2xl border border-white/5 flex justify-between items-center group">
                  <div className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${r.color}`}><i className={`fas ${r.icon} text-lg`}></i></div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{r.name}</h4>
                      <p className="text-[10px] text-slate-500">{r.desc}</p>
                    </div>
                  </div>
                  <button className="text-[9px] font-bold bg-white/10 px-3 py-1.5 rounded-lg">{r.cost}</button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'deeds':
        return (
          <div className="animate-entry space-y-6">
            <button onClick={() => setManifestView('hub')} className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2"><i className="fas fa-arrow-left"></i> {t.backToHub}</button>
            <h2 className="text-xl font-cinzel font-bold text-white px-2">Karma Farming</h2>
            <div className="space-y-4">
              {[
                { name: 'Fish Release + Feeding', desc: 'Return life to the flow of the universe.', impact: '+50 Resonance', icon: 'fa-fish', color: 'text-blue-400' },
                { name: 'Stray Soul Nourishment', desc: 'Feeding & sheltering strays in your sector.', impact: '+35 Resonance', icon: 'fa-cat', color: 'text-amber-400' },
                { name: 'Final Rest (Coffin)', desc: 'Purchase coffins for the homeless deceased.', impact: '+150 Resonance', icon: 'fa-box', color: 'text-slate-400' }
              ].map(d => (
                <div key={d.name} className="p-5 glass rounded-2xl border border-white/5 flex justify-between items-center group">
                  <div className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${d.color}`}><i className={`fas ${d.icon} text-lg`}></i></div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{d.name}</h4>
                      <p className="text-[10px] text-slate-500">{d.desc}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400">{d.impact}</span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'merch':
        return (
          <div className="animate-entry space-y-6">
            <button onClick={() => setManifestView('hub')} className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2"><i className="fas fa-arrow-left"></i> {t.backToHub}</button>
            <h2 className="text-xl font-cinzel font-bold text-white px-2">Aura Wear Showcase</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Fate Guard Amulet', price: 'Showcase', icon: 'fa-eye', color: 'text-blue-500' },
                { name: 'Resonance Bead', price: 'Showcase', icon: 'fa-circle-dot', color: 'text-purple-500' },
                { name: 'Jade Manifest', price: 'Showcase', icon: 'fa-leaf', color: 'text-emerald-500' },
                { name: 'Solar Seal', price: 'Showcase', icon: 'fa-sun', color: 'text-amber-500' }
              ].map(m => (
                <div key={m.name} className="p-4 glass rounded-3xl border border-white/5 flex flex-col items-center text-center group transition-all hover:scale-105">
                   <div className={`w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 ${m.color}`}><i className={`fas ${m.icon} text-2xl`}></i></div>
                   <h4 className="text-[11px] font-bold text-white mb-1">{m.name}</h4>
                   <span className="text-[8px] font-mono text-slate-600">{m.price}</span>
                   <button className="mt-4 w-full py-2 bg-white/5 rounded-xl text-[8px] uppercase font-bold tracking-widest">View Detail</button>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="w-full animate-entry">
            {showDailyPrompt && (
              <div className="w-full mb-8 relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-purple-500/20 to-rose-500/20 rounded-3xl blur opacity-75"></div>
                <div className="relative glass rounded-3xl p-6 border border-white/10 flex flex-col items-center text-center">
                  <div className="mb-2 text-purple-400 text-lg"><i className="fas fa-star-and-crescent"></i></div>
                  <p className="text-sm text-slate-200 italic font-medium px-4">Recalibrating for the new sun. Stay positive, Manifest light.</p>
                </div>
              </div>
            )}
            <div className="relative mb-12 w-64 h-64 flex flex-col items-center justify-center mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-slate-800/50"></div>
              <div className="text-center z-10">
                <span className="text-slate-500 block text-[10px] uppercase font-cinzel tracking-widest mb-1">{t.resonance}</span>
                <span className={`text-6xl font-cinzel font-bold ${dailyScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {dailyScore > 0 ? '+' : ''}{dailyScore}
                </span>
                {streakInfo && (
                  <div className="mt-4 flex flex-col items-center">
                    <span className={`${streakInfo.color} font-bold text-[10px] uppercase tracking-widest`}>{streakInfo.streak}x {streakInfo.label}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mb-10">
              <button onClick={() => { setActiveType(KarmaType.MERIT); setDialogOpen(true); }} className="group relative overflow-hidden rounded-3xl p-6 bg-emerald-950/20 border border-emerald-500/30 hover:border-emerald-500 transition-all duration-500 shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-10"><i className="fas fa-sun text-4xl text-emerald-400"></i></div>
                <span className="relative z-10 block text-xl font-cinzel font-bold text-emerald-400 mb-1 text-left">{t.merit}</span>
                <span className="relative z-10 block text-[9px] text-emerald-500/70 font-bold tracking-widest uppercase text-left">{t.meritDesc}</span>
              </button>
              <button onClick={() => { setActiveType(KarmaType.BAD_LUCK); setDialogOpen(true); }} className="group relative overflow-hidden rounded-3xl p-6 bg-rose-950/20 border border-rose-500/30 hover:border-rose-500 transition-all duration-500 shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-10"><i className="fas fa-moon text-4xl text-rose-400"></i></div>
                <span className="relative z-10 block text-xl font-cinzel font-bold text-rose-400 mb-1 text-left">{t.badLuck}</span>
                <span className="relative z-10 block text-[9px] text-rose-500/70 font-bold tracking-widest uppercase text-left">{t.badLuckDesc}</span>
              </button>
            </div>
            <KarmaVisualizer entries={entries} />
            <div className="w-full mt-10 space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-lg font-cinzel text-slate-300">{t.historyTitle}</h3>
                <button onClick={() => { if(confirm(t.clearPast + "?")) setEntries([]); }} className="text-[9px] uppercase tracking-widest text-slate-600 hover:text-slate-400">{t.clearPast}</button>
              </div>
              {[...entries].reverse().filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).slice(0, 5).map((entry) => (
                <div key={entry.id} className={`p-4 rounded-3xl glass border-l-4 ${entry.type === KarmaType.MERIT ? 'border-l-emerald-500' : 'border-l-rose-500'} animate-entry`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-3">
                      <span className="text-xl">{entry.symbol}</span>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">{entry.description}</h4>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${entry.scoreImpact >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{entry.scoreImpact > 0 ? '+' : ''}{entry.scoreImpact}</span>
                  </div>
                </div>
              ))}
              {entries.filter(e => new Date(e.timestamp).toDateString() === new Date().toDateString()).length === 0 && (
                <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest py-8 italic">No records yet for this rotation.</p>
              )}
            </div>
          </div>
        );
      case 'service':
        return <div className="w-full pt-4">{renderManifestContent()}</div>;
      case 'ask':
        return (
          <div className="w-full animate-entry flex flex-col pt-4 space-y-6">
            <div className="text-center py-6">
              <i className="fas fa-crystal-ball text-5xl text-emerald-400/50 mb-4 animate-pulse"></i>
              <h2 className="text-2xl font-cinzel font-bold text-white">{t.navAsk}</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Direct Soul Communion</p>
            </div>
            <div className="flex-1 glass rounded-[2rem] border border-white/10 p-6 flex flex-col h-[50vh]">
              <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-hide">
                {oracleResponse && (
                  <div className="animate-entry flex flex-col items-center text-center space-y-3 p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                    <span className="text-emerald-400/30 text-[8px] font-mono uppercase tracking-[0.3em]">Oracle Transcription</span>
                    <p className="text-sm text-slate-200 italic leading-relaxed">"{oracleResponse}"</p>
                  </div>
                )}
                {!oracleResponse && !isOracleConsulting && (
                  <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <i className="fas fa-comment-dots text-4xl mb-3"></i>
                    <p className="text-xs uppercase tracking-widest">Awaiting Inquiry...</p>
                  </div>
                )}
                {isOracleConsulting && (
                  <div className="h-full flex flex-col items-center justify-center animate-pulse">
                    <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Synchronizing with Aether...</p>
                  </div>
                )}
              </div>
              <form onSubmit={handleConsultOracle} className="relative">
                <input 
                  type="text" 
                  value={oracleQuery}
                  onChange={(e) => setOracleQuery(e.target.value)}
                  placeholder="Ask about your path..."
                  className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 pr-14 text-sm focus:outline-none focus:border-emerald-500/50 transition-all text-white placeholder-slate-600"
                />
                <button 
                  type="submit" 
                  disabled={isOracleConsulting || !oracleQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all active:scale-90"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
        );
      case 'notifs':
        return (
          <div className="w-full animate-entry pt-10 space-y-4">
            <h2 className="text-xl font-cinzel text-slate-300 px-2">Cosmic Alerts</h2>
            <div className="space-y-3">
              {[
                { title: 'New Cycle Initiated', time: '1h ago', desc: 'The cosmic ledger has reset for your locale.', icon: 'fa-circle-notch', color: 'text-blue-400' },
                { title: 'Fate Reading Ready?', time: '2h ago', desc: 'Your destiny decode is entering final synthesis phase.', icon: 'fa-fingerprint', color: 'text-amber-400' },
                { title: 'Resonance Streak', time: '5h ago', desc: 'Achievement: Daily Vibe is notably High.', icon: 'fa-bolt-lightning', color: 'text-emerald-400' }
              ].map((n, i) => (
                <div key={i} className="p-4 glass rounded-2xl border border-white/5 flex gap-4 hover:border-white/10 transition-colors">
                  <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${n.color}`}>
                    <i className={`fas ${n.icon} text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{n.title}</h4>
                      <span className="text-[8px] text-slate-600 uppercase">{n.time}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'profile':
        return (
          <UserProfile 
            lang={lang} 
            userData={userData} 
            entries={entries} 
            totalScore={totalScore} 
            onClose={() => setActiveTab('home')} 
            onEdit={handleLogout} 
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 pb-32 max-w-2xl mx-auto overflow-x-hidden">
      <header className="w-full flex justify-between items-center mt-4 mb-10">
        <div className="relative">
          <button onClick={() => setLangMenuOpen(!langMenuOpen)} className="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <i className="fas fa-globe"></i>
          </button>
          {langMenuOpen && (
            <div className="absolute top-12 right-0 glass rounded-2xl p-2 w-40 border border-white/10 shadow-2xl animate-entry z-[100]">
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => { setLang(l.code); setLangMenuOpen(false); }} className={`w-full text-left p-2 rounded-xl text-xs font-bold transition-all ${lang === l.code ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                  {l.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-cinzel font-bold mb-0.5 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-purple-400 to-rose-400">
            {t.appTitle}
          </h1>
          <p className="text-[9px] text-slate-500 uppercase tracking-[0.4em] font-bold opacity-70">{t.appSubtitle}</p>
        </div>
        <div className="w-10"></div>
      </header>
      <main className="w-full flex-1">
        {renderContent()}
      </main>
      <nav className="fixed bottom-6 left-6 right-6 z-[90] max-w-md mx-auto">
        <div className="glass rounded-[2.5rem] p-3 border border-white/10 shadow-2xl flex justify-between items-center relative overflow-hidden saturate-150">
          <div 
            className={`nav-aura ${navTabs.find(t => t.id === activeTab)?.color}`}
            style={{ 
              left: `calc(${navTabs.findIndex(t => t.id === activeTab) * 20}% + 10%)`,
              transform: 'translateX(-50%)'
            }}
          ></div>
          {navTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as Tab); if (tab.id === 'service') setManifestView('hub'); }}
              className={`flex flex-col items-center justify-center py-1 flex-1 transition-all duration-300 relative z-10 ${activeTab === tab.id ? 'text-white scale-110' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <div className={`text-xl mb-1 ${activeTab === tab.id ? 'animate-nav-pop' : ''}`}>
                <i className={`fas ${tab.icon}`}></i>
              </div>
              <span className={`text-[7px] uppercase tracking-widest font-bold font-cinzel transition-all duration-300 ${activeTab === tab.id ? 'opacity-100 translate-y-0' : 'opacity-40 -translate-y-1'}`}>
                {tab.label}
              </span>
              {activeTab === tab.id && <div className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.8)] bg-white`}></div>}
            </button>
          ))}
        </div>
      </nav>
      <ActionDialog 
        lang={lang} 
        type={activeType} 
        isOpen={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        onSubmit={handleSubmitEntry} 
        isSubmitting={isSubmitting} 
      />
      <footer className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none z-10"></footer>
    </div>
  );
};

export default App;
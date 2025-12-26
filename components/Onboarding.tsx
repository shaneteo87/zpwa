import React, { useState } from 'react';
import { UserData, Language } from '../types';
import { translations } from '../translations';

interface OnboardingProps {
  onComplete: (data: UserData) => void;
  lang: Language;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, lang }) => {
  const t = translations[lang];
  const [formData, setFormData] = useState<Partial<UserData>>({
    gender: 'Male',
    isTobUnknown: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nameEn && formData.dob && formData.mobile && formData.location) {
      onComplete(formData as UserData);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg glass rounded-[3rem] p-10 border border-white/10 relative overflow-hidden animate-entry">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-600/20 blur-[100px] rounded-full"></div>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-white mb-2">{t.onboardingTitle}</h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em]">{t.onboardingSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-slate-500 ml-2">{t.nameEn}</label>
              <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all" value={formData.nameEn || ''} onChange={e => setFormData({...formData, nameEn: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-slate-500 ml-2">{t.nameCn} <span className="opacity-40">(Opt)</span></label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all" value={formData.nameCn || ''} onChange={e => setFormData({...formData, nameCn: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-slate-500 ml-2">{t.gender}</label>
              <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
                {(['Male', 'Female'] as const).map(g => (
                  <button key={g} type="button" onClick={() => setFormData({...formData, gender: g})} className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all ${formData.gender === g ? 'bg-white/10 text-white' : 'text-slate-600'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-slate-500 ml-2">{t.location}</label>
              <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all" value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-slate-500 ml-2">{t.dob}</label>
              <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all [color-scheme:dark]" value={formData.dob || ''} onChange={e => setFormData({...formData, dob: e.target.value})} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[9px] uppercase tracking-widest text-slate-500">{t.tob}</label>
                <button type="button" onClick={() => setFormData({...formData, isTobUnknown: !formData.isTobUnknown})} className={`text-[8px] uppercase tracking-tighter ${formData.isTobUnknown ? 'text-purple-400 font-bold' : 'text-slate-600'}`}>
                  {t.tobUnknown}
                </button>
              </div>
              <input disabled={formData.isTobUnknown} type="time" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all [color-scheme:dark] disabled:opacity-30" value={formData.tob || ''} onChange={e => setFormData({...formData, tob: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-widest text-slate-500 ml-2">{t.mobile}</label>
            <input required type="tel" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all" value={formData.mobile || ''} onChange={e => setFormData({...formData, mobile: e.target.value})} />
          </div>

          <button type="submit" className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-emerald-600 text-white font-cinzel font-bold tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-purple-500/20">
            {t.synthesize}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
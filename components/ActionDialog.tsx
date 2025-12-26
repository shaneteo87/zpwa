import React, { useState, useEffect } from 'react';
import { KarmaType, Language } from '../types';
import { translations } from '../translations';

interface ActionDialogProps {
  type: KarmaType;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string) => void;
  isSubmitting: boolean;
  lang: Language;
}

const ActionDialog: React.FC<ActionDialogProps> = ({ type, isOpen, onClose, onSubmit, isSubmitting, lang }) => {
  const t = translations[lang];
  const [text, setText] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSuccessState, setIsSuccessState] = useState(false);
  const [isReadyToType, setIsReadyToType] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsTransitioning(false);
      setIsSuccessState(false);
      setIsReadyToType(false);
      setText('');
      if (type === KarmaType.MERIT) {
        setTimeout(() => setIsReadyToType(true), 1600);
      } else {
        setIsReadyToType(true);
      }
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const isMerit = type === KarmaType.MERIT;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      setIsTransitioning(true);
      setTimeout(() => {
        setIsSuccessState(true);
        setTimeout(() => {
          onSubmit(text);
        }, isMerit ? 2200 : 1800);
      }, 800);
    }
  };

  const Roller = () => (
    <div className="scroll-edge">
      <div className="scroll-cap -ml-3"></div>
      <div className="scroll-cap -mr-3"></div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl transition-all duration-500">
      {isSuccessState && (
        <div className="w-full flex flex-col items-center animate-success-holo space-y-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
             <div className={`absolute inset-0 ${isMerit ? 'bg-amber-500/20' : 'bg-emerald-500/20'} blur-3xl rounded-full animate-pulse`}></div>
             <div className={`relative z-10 ${isMerit ? 'text-amber-300' : 'text-emerald-400'} text-8xl`}>
               <i className={`fas ${isMerit ? 'fa-dharmachakra animate-rotate-slow' : 'fa-check-double'} drop-shadow-[0_0_30px_rgba(255,191,0,0.8)]`}></i>
             </div>
          </div>
          <div className="text-center font-mono space-y-3">
            <h3 className={`text-3xl font-bold ${isMerit ? 'text-amber-200' : 'text-emerald-400'} tracking-widest font-cinzel`}>
              {isMerit ? t.meritRecorded : t.purgeSuccess}
            </h3>
          </div>
          <div className={`${isMerit ? 'text-amber-500/40' : 'text-emerald-500/40'} font-mono text-[9px] animate-pulse tracking-widest`}>
            {isMerit ? '[ ASCENDING ]' : '[ RELEASED ]'}
          </div>
        </div>
      )}

      {!isSuccessState && isMerit && (
        <div className={`w-full max-w-md ${isTransitioning ? 'animate-ascend' : ''} relative flex flex-col`}>
          <Roller />
          <div className={`parchment relative overflow-hidden flex flex-col animate-scroll-open`}>
            <div className={`p-8 px-10 flex flex-col h-full animate-fade-content`}>
              <h2 className="text-3xl font-cinzel mb-2 text-center text-[#5d4037] font-bold tracking-tight">{t.meritTitle}</h2>
              <div className="w-16 h-px bg-[#8d6e63]/30 mx-auto mb-6"></div>
              <p className="text-[#795548] text-center mb-8 text-xs italic font-medium leading-relaxed">"{t.meritQuote}"</p>
              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <textarea autoFocus={isReadyToType} disabled={isTransitioning || !isReadyToType} className="w-full h-40 p-4 bg-transparent border-b-2 border-[#d7ccc8] text-[#3e2723] placeholder-[#a1887f] focus:outline-none focus:border-[#8d6e63] transition-all duration-300 resize-none font-medium text-lg leading-relaxed" placeholder={t.meritPlaceholder} value={text} onChange={(e) => setText(e.target.value)} />
                <div className="flex gap-4 items-center">
                  <button type="button" onClick={onClose} className="flex-1 py-3 text-xs font-cinzel uppercase tracking-widest text-[#795548]">Return</button>
                  <button type="submit" disabled={isSubmitting || !text.trim()} className="flex-1 flex items-center justify-center">
                    <div className="wax-seal-btn w-20 h-20 flex items-center justify-center group">
                       <div className="wax-seal-inner">
                         <span className="text-[10px] font-cinzel font-bold text-white/90 uppercase tracking-tighter text-center leading-none">SEAL</span>
                       </div>
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>
          <Roller />
        </div>
      )}

      {!isSuccessState && !isMerit && (
        <div className={`w-full max-w-md ${isTransitioning ? 'animate-incinerate' : 'animate-entry'}`}>
          <div className="tech-terminal rounded-lg border-2 border-rose-500/30 p-1">
            <div className="bg-[#0a0a0c] p-6 relative overflow-hidden rounded">
              <div className="scanline"></div>
              <h2 className="text-2xl font-mono font-bold mb-1 text-rose-500 flex items-center gap-2">
                <i className="fas fa-fire-alt text-sm"></i>{t.badLuckTitle}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                <textarea autoFocus disabled={isTransitioning} className="relative w-full h-36 p-4 bg-black/80 border border-rose-900/50 rounded-lg font-mono text-sm text-rose-100 placeholder-rose-900 focus:outline-none focus:border-rose-500/50 transition-all resize-none shadow-inner" placeholder={t.badLuckPlaceholder} value={text} onChange={(e) => setText(e.target.value)} />
                <div className="flex gap-4 font-mono">
                  <button type="button" onClick={onClose} className="flex-1 py-3 text-[10px] uppercase border border-white/5 text-slate-500">ABORT</button>
                  <button type="submit" disabled={isSubmitting || !text.trim()} className="flex-1 py-3 rounded-md font-bold text-xs tracking-widest bg-rose-950 border border-rose-500/50 text-rose-400 hover:bg-rose-900 transition-all">EXECUTE</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionDialog;
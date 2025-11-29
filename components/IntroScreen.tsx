import React, { useState } from 'react';
import { Mascot } from './Mascot';
import { Sun, ArrowRight, Sparkles, Calculator } from 'lucide-react';
import { playSound } from '../services/soundService';

interface IntroScreenProps {
  languages: { code: string; flag: string; name: string }[];
  onLanguageSelect: (langCode: string) => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({ languages, onLanguageSelect }) => {
  const [step, setStep] = useState<'welcome' | 'select'>('welcome');

  const handleStart = () => {
    playSound('select');
    setStep('select');
  };

  const handleSelect = (code: string) => {
    playSound('complete');
    onLanguageSelect(code);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-navy flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-500">
      {/* Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-ocean/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-gold/10 rounded-full blur-[80px]" />

      <div className="relative z-10 w-full max-w-2xl px-6 flex flex-col items-center text-center">
        
        {step === 'welcome' && (
          <div className="flex flex-col items-center animate-in slide-in-from-bottom-10 duration-700">
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full" />
              <Mascot emotion="salute" size={200} onClick={() => playSound('select')} />
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white mb-2 tracking-tighter flex items-center gap-3">
              <Sun className="w-10 h-10 md:w-16 md:h-16 text-gold animate-[spin_12s_linear_infinite]" />
              Daylingo
            </h1>
            <p className="text-slate-light text-xl md:text-2xl font-bold mb-12 max-w-md">
              Aprende idiomas con la ayuda de la Inteligencia Artificial.
            </p>

            <button 
              onClick={handleStart}
              className="group relative bg-gold hover:bg-gold-light text-navy-dark font-black text-xl py-5 px-12 rounded-2xl shadow-[0_8px_0_rgb(180,140,0)] active:shadow-none active:translate-y-2 transition-all duration-150 flex items-center gap-3"
            >
              EMPEZAR AHORA
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {step === 'select' && (
          <div className="w-full flex flex-col items-center animate-in zoom-in-90 duration-500">
            <h2 className="text-3xl font-bold text-white mb-2">¿Qué quieres aprender?</h2>
            <p className="text-slate-light mb-8">Elige tu primer curso para comenzar la aventura.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className="flex flex-col items-center p-4 bg-white/10 hover:bg-white/20 border-2 border-transparent hover:border-ocean rounded-2xl transition-all group active:scale-95"
                >
                  <div className="mb-3 text-4xl shadow-sm transform group-hover:scale-110 transition-transform flex items-center justify-center h-14 w-14">
                    {lang.code === 'Chess' ? '♟️' : lang.code === 'Math' ? (
                       <div className="w-10 h-10 bg-navy rounded-lg flex items-center justify-center shadow-md">
                         <Calculator className="w-6 h-6 text-gold" strokeWidth={2.5} />
                       </div>
                    ) : (
                       <img 
                         src={`https://flagcdn.com/w80/${lang.flag}.png`} 
                         className="w-14 h-10 object-cover rounded-lg shadow-md" 
                         alt={lang.name}
                       />
                    )}
                  </div>
                  <span className="font-bold text-white text-lg">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-12 text-slate-light/40 text-sm font-bold flex items-center gap-2">
           <Sparkles className="w-4 h-4" /> Powered by Gemini AI
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { UserState } from '../types';
import { Volume2, Play, Trash2, Search } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';
import { Button } from './Button';

interface SoundLibraryProps {
  user: UserState;
}

export const SoundLibrary: React.FC<SoundLibraryProps> = ({ user }) => {
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const playAudio = async (text: string) => {
    if (!text) return;
    try {
      setIsPlaying(text);
      setIsGenerating(true);
      const audioData = await generateSpeech(text);
      setIsGenerating(false);
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audio.onended = () => setIsPlaying(null);
      await audio.play();
    } catch (e) {
      console.error(e);
      setIsGenerating(false);
      setIsPlaying(null);
    }
  };

  const uniqueWeakWords: string[] = Array.from(new Set(user.weakWords));

  return (
    <div className="p-4 w-full max-w-md mx-auto h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
       <div className="bg-white p-6 rounded-3xl border-2 border-slate-light/20 shadow-sm mb-6 text-center">
          <Volume2 className="w-12 h-12 text-ocean mx-auto mb-2" />
          <h2 className="text-2xl font-black text-navy">Laboratorio de Sonidos</h2>
          <p className="text-slate text-sm">Escribe cualquier cosa o repasa tus errores.</p>
          
          <div className="mt-6 flex gap-2">
             <input 
               value={customText}
               onChange={(e) => setCustomText(e.target.value)}
               placeholder="Escribe algo..."
               className="flex-1 bg-slate-lighter/50 border-2 border-slate-light/20 rounded-xl px-4 py-3 font-medium text-navy focus:border-ocean outline-none"
             />
             <button 
               onClick={() => playAudio(customText)}
               disabled={!customText || isGenerating}
               className="bg-ocean hover:bg-ocean-dark text-white p-3 rounded-xl shadow-md active:scale-95 transition-all"
             >
                <Play className={`w-6 h-6 ${isPlaying === customText ? 'animate-pulse' : ''} fill-current`} />
             </button>
          </div>
       </div>

       <h3 className="font-bold text-slate uppercase text-xs tracking-widest mb-4 ml-2">Tus Palabras Difíciles</h3>
       
       {uniqueWeakWords.length === 0 ? (
           <div className="flex-1 flex flex-col items-center justify-center text-slate-light opacity-50 pb-20">
               <Search className="w-16 h-16 mb-4" />
               <p className="font-bold">No tienes errores registrados.</p>
               <p className="text-sm">¡Sigue practicando!</p>
           </div>
       ) : (
           <div className="flex-1 overflow-y-auto pb-32 space-y-2">
               {uniqueWeakWords.map((word) => (
                   <div key={word} className="bg-white border-2 border-slate-light/20 p-4 rounded-xl flex items-center justify-between group hover:border-ocean transition-colors">
                       <span className="font-bold text-lg text-navy">{word}</span>
                       <button 
                         onClick={() => playAudio(word)}
                         className="w-10 h-10 bg-slate-lighter rounded-full flex items-center justify-center text-navy hover:bg-ocean hover:text-white transition-colors"
                       >
                           <Volume2 className={`w-5 h-5 ${isPlaying === word ? 'animate-pulse' : ''}`} />
                       </button>
                   </div>
               ))}
           </div>
       )}
    </div>
  );
};
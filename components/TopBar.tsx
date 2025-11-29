import React from 'react';
import { Heart, Flame, Gem, Sun, Calculator } from 'lucide-react';
import { UserState, AvatarConfig } from '../types';
import { HumanAvatar } from './HumanAvatar';

interface TopBarProps {
  user: UserState;
  onLanguageClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ user, onLanguageClick }) => {
  const getFlagCode = (lang: string) => {
    switch(lang.toLowerCase()) {
      case 'english': return 'us';
      case 'spanish': return 'es';
      case 'french': return 'fr';
      case 'german': return 'de';
      case 'italian': return 'it';
      case 'japanese': return 'jp';
      case 'chinese': return 'cn';
      case 'russian': return 'ru';
      case 'portuguese': return 'br';
      case 'korean': return 'kr';
      case 'dutch': return 'nl';
      case 'swedish': return 'se';
      case 'turkish': return 'tr';
      case 'hindi': return 'in';
      case 'polish': return 'pl';
      case 'arabic': return 'sa';
      case 'chess': return 'chess';
      case 'ajedrez': return 'chess';
      case 'math': return 'math';
      case 'matemáticas': return 'math';
      default: return 'us';
    }
  };

  const flagCode = getFlagCode(user.currentLanguage);

  const renderAvatar = () => {
     if (typeof user.avatar === 'object' && (user.avatar as any).type === 'human') {
        return <HumanAvatar config={user.avatar as AvatarConfig} className="w-full h-full" />;
     }
     return user.avatar;
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex items-center justify-between p-3 sm:p-4 bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b-2 border-slate-light/20 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 transition-transform hover:scale-105 cursor-pointer">
         <div className="bg-navy p-2 rounded-xl shadow-[0_4px_0_#0F1829]">
            <Sun className="w-6 h-6 text-gold fill-current animate-[spin_12s_linear_infinite]" />
         </div>
         <span className="hidden sm:block text-2xl font-black text-navy tracking-tighter drop-shadow-sm">Daylingo</span>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3 flex-1 sm:flex-none justify-end">
        <div 
          onClick={(e) => { e.stopPropagation(); onLanguageClick?.(); }}
          className="group relative flex items-center gap-2 cursor-pointer bg-white hover:bg-slate-50 p-1.5 pr-3 rounded-2xl border-2 border-slate-light/20 hover:border-slate-light transition-all shadow-[0_2px_0_#e2e8f0] active:translate-y-[2px] active:shadow-none"
        >
           {flagCode === 'chess' ? (
              <div className="w-8 h-6 bg-navy rounded-lg flex items-center justify-center shadow-inner"><span className="text-sm">♟️</span></div>
           ) : flagCode === 'math' ? (
              <div className="w-8 h-6 bg-navy rounded-lg flex items-center justify-center shadow-inner"><Calculator className="w-4 h-4 text-gold" /></div>
           ) : (
              <img src={`https://flagcdn.com/w40/${flagCode}.png`} className="w-8 h-6 rounded-lg object-cover shadow-sm" alt={user.currentLanguage} />
           )}
           <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-ocean rounded-full border-2 border-white"></div>
        </div>

        <div className="hidden sm:flex items-center gap-2 font-black text-orange-500 bg-white px-3 py-1.5 rounded-2xl border-2 border-orange-100 shadow-[0_2px_0_#ffedd5]">
          <Flame className="w-5 h-5 fill-current animate-pulse" />
          <span>{user.streak}</span>
        </div>

        <div className="flex items-center gap-2 font-black text-ocean bg-white px-3 py-1.5 rounded-2xl border-2 border-cyan-100 shadow-[0_2px_0_#cffafe]">
          <Gem className="w-5 h-5 fill-current" />
          <span>{user.gems}</span>
        </div>

        <div className="flex items-center gap-2 font-black text-danger bg-white px-3 py-1.5 rounded-2xl border-2 border-red-100 shadow-[0_2px_0_#fee2e2]">
          <Heart className="w-5 h-5 fill-current" />
          <span>{user.hearts}</span>
        </div>
        
        {/* User Avatar */}
        <div className="w-10 h-10 rounded-xl bg-slate-lighter flex items-center justify-center border-2 border-white shadow-md overflow-hidden hover:scale-110 transition-transform cursor-pointer">
            {renderAvatar()}
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { UserState, LanguageProgress, AvatarConfig } from '../types';
import { Trophy, Target, Newspaper, CheckCircle, Lock } from 'lucide-react';
import { Button } from './Button';
import { HumanAvatar } from './HumanAvatar';

interface MissionsSectionProps {
  user: UserState;
}

type MissionTab = 'challenges' | 'divisions' | 'news';

export const MissionsSection: React.FC<MissionsSectionProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<MissionTab>('challenges');
  const totalXP = (Object.values(user.progress) as LanguageProgress[]).reduce((a,b)=>a+b.xp,0);

  const renderAvatar = (avatar: string | AvatarConfig) => {
      if (typeof avatar === 'object' && avatar.type === 'human') {
          return <HumanAvatar config={avatar} className="w-8 h-8" />;
      }
      return <span className="text-2xl">{avatar as string}</span>;
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto animate-in slide-in-from-right-4 duration-300">
      
      {/* Tab Switcher */}
      <div className="flex p-4 gap-2 bg-white sticky top-0 z-10">
         <button 
           onClick={() => setActiveTab('challenges')}
           className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${activeTab === 'challenges' ? 'bg-navy text-white' : 'bg-slate-lighter text-slate'}`}
         >
           Desafíos
         </button>
         <button 
           onClick={() => setActiveTab('divisions')}
           className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${activeTab === 'divisions' ? 'bg-navy text-white' : 'bg-slate-lighter text-slate'}`}
         >
           Divisiones
         </button>
         <button 
           onClick={() => setActiveTab('news')}
           className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${activeTab === 'news' ? 'bg-navy text-white' : 'bg-slate-lighter text-slate'}`}
         >
           Novedades
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {activeTab === 'challenges' && (
           <div className="space-y-4">
              <div className="bg-gradient-to-r from-ocean to-ocean-dark rounded-2xl p-6 text-white mb-6 shadow-lg">
                 <h2 className="text-2xl font-black uppercase italic">Misiones Diarias</h2>
                 <p className="opacity-90 font-medium">Completa tareas para ganar gemas.</p>
              </div>

              {/* Mock Daily Challenges */}
              {[
                { id: 1, title: "Gana 20 XP", reward: 10, current: Math.min(20, user.progress[user.currentLanguage]?.xp || 0), target: 20 },
                { id: 2, title: "Completa 1 Lección", reward: 5, current: user.streak > 0 ? 1 : 0, target: 1 },
                { id: 3, title: "Habla con Gemi", reward: 15, current: 0, target: 1 },
              ].map((challenge) => {
                 const progress = (challenge.current / challenge.target) * 100;
                 const isDone = progress >= 100;

                 return (
                   <div key={challenge.id} className="bg-white border-2 border-slate-light/20 rounded-2xl p-4 flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-gold' : 'bg-slate-lighter'}`}>
                         {isDone ? <CheckCircle className="w-6 h-6 text-white" /> : <Target className="w-6 h-6 text-slate" />}
                      </div>
                      <div className="flex-1">
                         <h3 className="font-bold text-navy">{challenge.title}</h3>
                         <div className="w-full bg-slate-lighter h-3 rounded-full mt-2 overflow-hidden">
                            <div className="bg-gold h-full transition-all" style={{ width: `${progress}%` }}></div>
                         </div>
                      </div>
                      <div className="flex flex-col items-center justify-center">
                          <span className="text-xs font-black text-ocean">GEMAS</span>
                          <span className="font-black text-navy text-lg">+{challenge.reward}</span>
                      </div>
                   </div>
                 );
              })}
           </div>
        )}

        {activeTab === 'divisions' && (
           <div className="text-center space-y-4">
               <div className="bg-navy p-6 rounded-2xl mb-4 text-white">
                  <Trophy className="w-16 h-16 text-gold mx-auto mb-2" />
                  <h2 className="text-2xl font-black">{user.league}</h2>
                  <p className="text-slate-light text-sm">Compite con otros estudiantes</p>
               </div>
               
               <div className="bg-white border-2 border-slate-light/20 rounded-2xl overflow-hidden">
                   {[
                     { rank: 1, name: "Maria L.", xp: 1250, avatar: "👩‍🚀" },
                     { rank: 2, name: "David K.", xp: 1100, avatar: "🥷" },
                     { rank: 3, name: user.name, xp: totalXP, avatar: user.avatar, isUser: true },
                     { rank: 4, name: "Sarah J.", xp: 850, avatar: "🧛‍♀️" },
                     { rank: 5, name: "Tom B.", xp: 720, avatar: "🧟" },
                   ].sort((a,b) => b.xp - a.xp).map((player, idx) => (
                      <div key={idx} className={`flex items-center p-4 border-b border-slate-light/10 ${player.isUser ? 'bg-ocean/10' : ''}`}>
                          <span className={`font-bold w-8 ${idx < 3 ? 'text-gold' : 'text-slate'}`}>#{idx + 1}</span>
                          <div className="mr-3 w-8 h-8 flex items-center justify-center">{renderAvatar(player.avatar)}</div>
                          <span className={`flex-1 text-left font-bold ${player.isUser ? 'text-ocean' : 'text-navy'}`}>{player.name}</span>
                          <span className="font-mono font-bold text-slate">{player.xp} XP</span>
                      </div>
                   ))}
               </div>
           </div>
        )}

        {activeTab === 'news' && (
            <div className="space-y-4">
               <div className="bg-white border-2 border-slate-light/20 rounded-2xl overflow-hidden">
                   <div className="h-32 bg-ocean flex items-center justify-center">
                       <Newspaper className="w-16 h-16 text-white/50" />
                   </div>
                   <div className="p-6">
                       <span className="text-xs font-bold text-ocean bg-ocean/10 px-2 py-1 rounded-md">NOVEDAD</span>
                       <h3 className="text-xl font-bold text-navy mt-2">¡Llegó el Modo Matemáticas!</h3>
                       <p className="text-slate mt-2 text-sm">Ahora puedes aprender desde aritmética básica hasta cálculo con la ayuda de Capitán Gemi.</p>
                       <Button fullWidth className="mt-4" variant="secondary">PROBAR AHORA</Button>
                   </div>
               </div>
               
               <div className="bg-white border-2 border-slate-light/20 rounded-2xl overflow-hidden opacity-75">
                   <div className="p-6 flex gap-4">
                       <div className="bg-gold/20 p-4 rounded-xl">
                          <Lock className="w-8 h-8 text-gold-dark" />
                       </div>
                       <div>
                           <h3 className="font-bold text-navy">Próximamente: Modo Historia</h3>
                           <p className="text-slate text-sm mt-1">Vive aventuras interactivas y toma decisiones.</p>
                       </div>
                   </div>
               </div>
            </div>
        )}
      </div>
    </div>
  );
};
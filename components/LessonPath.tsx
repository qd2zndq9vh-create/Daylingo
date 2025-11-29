import React, { useState } from 'react';
import { Star, Lock, Check, Book, FastForward, Cloud } from 'lucide-react';
import { Lesson } from '../types';
import { Button } from './Button';

interface LessonPathProps {
  lessons: Lesson[];
  onLessonSelect: (lesson: Lesson) => void;
  onJumpToSection: (lesson: Lesson) => void;
}

export const LessonPath: React.FC<LessonPathProps> = ({ lessons, onLessonSelect, onJumpToSection }) => {
  const [shakingId, setShakingId] = useState<string | null>(null);

  const handleNodeClick = (lesson: Lesson) => {
    if (lesson.locked) {
      setShakingId(lesson.id);
      setTimeout(() => setShakingId(null), 500); 
      return;
    }
    onLessonSelect(lesson);
  };

  const SECTION_SIZE = 5; 

  return (
    <div className="flex flex-col items-center py-8 gap-2 pb-48 w-full overflow-hidden relative min-h-screen">
      
      {/* Background Decorations - Making it look like a world */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <Cloud className="absolute top-20 left-[10%] text-white/40 w-24 h-24 animate-float" />
         <Cloud className="absolute top-60 right-[15%] text-white/60 w-16 h-16 animate-float" style={{ animationDelay: '2s' }} />
         <Cloud className="absolute top-[500px] left-[5%] text-white/30 w-32 h-32 animate-float" style={{ animationDelay: '4s' }} />
         <div className="absolute top-[300px] right-[10%] w-4 h-4 bg-yellow-200/50 rounded-full blur-sm" />
         <div className="absolute top-[600px] left-[20%] w-6 h-6 bg-blue-200/50 rounded-full blur-sm" />
      </div>

      <div className="relative w-full max-w-sm flex flex-col items-center z-10">
        {lessons.map((lesson, index) => {
          const amplitude = 75; 
          const frequency = 0.6; 
          const verticalGap = 110; 
          
          const xOffset = Math.sin(index * frequency) * amplitude;
          const nextXOffset = Math.sin((index + 1) * frequency) * amplitude;
          
          // DEFAULT: Locked (Slate)
          let statusColor = "bg-slate-200";
          let Icon = Lock;
          let iconColor = "text-slate-400";
          let shadowColor = "border-slate-300";
          let ringColor = "";
          let isActive = false;

          const isCurrent = !lesson.completed && !lesson.locked;
          const isCompleted = lesson.completed;

          if (isCompleted) {
            // COMPLETED: Gold
            statusColor = "bg-gradient-to-b from-gold to-gold-dark";
            Icon = Check;
            iconColor = "text-yellow-900";
            shadowColor = "border-[#b8860b]";
          } else if (isCurrent) {
            // ACTIVE: Navy Gradient
            statusColor = "bg-gradient-to-b from-navy-light to-navy";
            Icon = Star;
            iconColor = "text-white";
            shadowColor = "border-navy-dark";
            ringColor = "ring-[10px] ring-navy/10";
            isActive = true;
          }

          const showSectionHeader = index % SECTION_SIZE === 0;
          const sectionNumber = Math.floor(index / SECTION_SIZE) + 1;
          const sections = ["Fundamentos", "Comunicación", "Vida Diaria", "Viajes", "Gramática", "Maestría", "Fluidez", "Experto"];
          const sectionTitle = sections[sectionNumber - 1] || "Práctica";

          return (
            <React.Fragment key={lesson.id}>
              {showSectionHeader && (
                <div className="w-full px-4 mb-12 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 z-10">
                    <div className="border-t-2 border-slate-300/50 pt-8 flex flex-col gap-4">
                         <div className="flex items-center justify-center gap-2">
                             <div className="h-[2px] w-8 bg-slate-300"></div>
                             <h3 className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs text-center">SECCIÓN {sectionNumber}</h3>
                             <div className="h-[2px] w-8 bg-slate-300"></div>
                         </div>
                         
                         <div className="bg-white rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between shadow-[0_8px_0_#e2e8f0] border-2 border-slate-100 gap-4 transform transition-transform hover:scale-[1.02]">
                             <div className="text-center sm:text-left">
                                 <h2 className="font-black text-2xl text-navy tracking-tight">{sectionTitle}</h2>
                                 <p className="text-slate font-bold text-sm">Domina este nivel para avanzar</p>
                             </div>
                             
                             {lesson.locked ? (
                               <Button 
                                  variant="secondary" 
                                  className="py-3 px-4 text-xs flex items-center gap-2 whitespace-nowrap shadow-sm"
                                  onClick={() => onJumpToSection(lesson)}
                               >
                                  <FastForward className="w-4 h-4" />
                                  SALTAR
                               </Button>
                             ) : (
                               <div className="bg-navy p-3 rounded-2xl shadow-lg rotate-3">
                                   <Book className="text-gold w-8 h-8" />
                               </div>
                             )}
                         </div>
                    </div>
                </div>
              )}

              <div 
                className="relative flex flex-col items-center z-10"
                style={{ 
                  transform: `translateX(${xOffset}px)`,
                  marginBottom: index === lessons.length - 1 ? 0 : `${verticalGap - 80}px` 
                }}
              >
                {/* Connector Line - Thicker and smoother */}
                {index < lessons.length - 1 && (
                  <svg 
                    className="absolute top-10 pointer-events-none overflow-visible -z-10"
                    style={{ 
                      left: '50%',
                      width: '200px', 
                      height: `${verticalGap}px`,
                      transform: `translateX(-50%)`
                    }}
                  >
                    <path 
                      d={`M 100 10 C 100 50, ${100 + (nextXOffset - xOffset)} 40, ${100 + (nextXOffset - xOffset)} ${verticalGap}`}
                      fill="none" 
                      stroke="#cbd5e1" 
                      strokeWidth="12" 
                      strokeLinecap="round"
                      className="opacity-60"
                    />
                  </svg>
                )}

                <div className="relative group">
                  {/* Floating Start Bubble */}
                  {isActive && (
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-navy font-extrabold px-6 py-3 rounded-2xl border-2 border-slate-100 shadow-[0_8px_20px_rgba(27,42,74,0.15)] animate-bounce z-30 whitespace-nowrap cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => handleNodeClick(lesson)}>
                          EMPEZAR
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-slate-100"></div>
                      </div>
                  )}

                  <button
                    onClick={() => handleNodeClick(lesson)}
                    className={`
                      w-20 h-20 rounded-full flex items-center justify-center 
                      border-b-[8px] transition-all duration-150 relative
                      ${statusColor} ${shadowColor} ${ringColor}
                      ${shakingId === lesson.id ? 'animate-shake' : ''}
                      active:border-b-0 active:translate-y-2 active:shadow-inner
                      shadow-xl
                    `}
                  >
                    <Icon className={`w-9 h-9 ${iconColor} fill-current drop-shadow-sm`} strokeWidth={3} />
                    
                    {/* Crown for completed levels */}
                    {isCompleted && (
                      <div className="absolute -right-1 -top-1 animate-in zoom-in spin-in duration-300">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border-2 border-slate-100 shadow-md">
                           <Star className="w-5 h-5 text-gold fill-current" />
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </React.Fragment>
          );
        })}
        
        <div className="mt-16 flex flex-col items-center opacity-60 mb-10 scale-90" style={{ transform: `translateX(${Math.sin(lessons.length * 0.6) * 75}px)` }}>
             <div className="w-24 h-24 rounded-full bg-slate-200 border-4 border-slate-300 border-dashed flex items-center justify-center">
                <Lock className="w-10 h-10 text-slate-400" />
             </div>
             <p className="font-bold text-slate-400 mt-4 tracking-widest uppercase">Próximamente</p>
        </div>
      </div>
    </div>
  );
};
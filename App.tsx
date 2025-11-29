import React, { useState, useMemo, useEffect } from 'react';
import { generateLessonContent } from './services/geminiService';
import { playSound } from './services/soundService';
import { Lesson, Exercise, UserState } from './types';
import { TopBar } from './components/TopBar';
import { LessonPath } from './components/LessonPath';
import { LessonSession } from './components/LessonSession';
import { LiveTalk } from './components/LiveTalk';
import { Button } from './components/Button';
import { IntroScreen } from './components/IntroScreen';
import { Mascot } from './components/Mascot';
import { ProfileSection } from './components/ProfileSection';
import { MissionsSection } from './components/MissionsSection';
import { SoundLibrary } from './components/SoundLibrary';
import { Loader2, Home, Mic, Heart, Clock, FastForward, Gem, Dumbbell, Target, User, X, Calculator } from 'lucide-react';

const INITIAL_USER: UserState = {
  name: 'Estudiante',
  avatar: '🤠',
  hearts: 5,
  streak: 0,
  gems: 100,
  currentLanguage: 'English', 
  sourceLanguage: 'Spanish',
  progress: {},
  weakWords: [],
  lastLessonDate: '',
  league: 'Bronce',
  completedDailyChallenges: []
};

const LANGUAGES = [
  { code: 'English', flag: 'us', name: 'Inglés' },
  { code: 'French', flag: 'fr', name: 'Francés' },
  { code: 'Italian', flag: 'it', name: 'Italiano' },
  { code: 'German', flag: 'de', name: 'Alemán' },
  { code: 'Japanese', flag: 'jp', name: 'Japonés' },
  { code: 'Chinese', flag: 'cn', name: 'Chino' },
  { code: 'Russian', flag: 'ru', name: 'Ruso' },
  { code: 'Portuguese', flag: 'br', name: 'Portugués' },
  { code: 'Korean', flag: 'kr', name: 'Coreano' },
  { code: 'Dutch', flag: 'nl', name: 'Holandés' },
  { code: 'Swedish', flag: 'se', name: 'Sueco' },
  { code: 'Turkish', flag: 'tr', name: 'Turco' },
  { code: 'Hindi', flag: 'in', name: 'Hindi' },
  { code: 'Polish', flag: 'pl', name: 'Polaco' },
  { code: 'Arabic', flag: 'sa', name: 'Árabe' },
  { code: 'Chess', flag: 'chess', name: 'Ajedrez' },
  { code: 'Math', flag: 'math', name: 'Matemáticas' },
];

const HEART_REFILL_TIME = 10 * 60 * 1000; 

const generateCurriculum = (langName: string): Lesson[] => {
  if (langName === 'Ajedrez') {
    const chessSections = [
      { title: "Intro", topics: ["El Tablero", "El Peón", "La Torre", "El Alfil", "La Dama"] },
      { title: "Fundamentos", topics: ["El Rey", "El Caballo", "Jaque", "Capturas", "Valor de Piezas"] },
      { title: "Reglas Esp.", topics: ["Enroque", "Peón al Paso", "Coronación", "Tablas", "Ahogado"] },
      { title: "Táctica I", topics: ["Clavada", "Ataque Doble", "Jaque Mate Pastor", "Desviación", "Rayos X"] },
      { title: "Aperturas", topics: ["Centro", "Apertura Italiana", "Defensa Siciliana", "Gambito de Dama", "Desarrollo"] },
      { title: "Estrategia", topics: ["Espacio", "Tiempo", "Estructura de Peones", "Columna Abierta", "Puesto Avanzado"] },
      { title: "Finales", topics: ["Rey y Peón", "Mate de Escalera", "Mate de Torre", "Oposición", "Regla del Cuadrado"] },
      { title: "Maestría", topics: ["Sacrificios", "Profilaxis", "Zugzwang", "Ataque al Rey", "Cálculo"] }
    ];
    let lessonId = 1;
    const lessons: Lesson[] = [];
    chessSections.forEach((section) => {
      section.topics.forEach((topic) => {
        lessons.push({ id: lessonId.toString(), title: `Nivel ${lessonId}`, topic: `${topic}`, description: `Domina: ${topic}`, color: 'navy', completed: false, locked: true });
        lessonId++;
      });
    });
    return lessons;
  }
  if (langName === 'Matemáticas') {
    const mathSections = [
      { title: "Números", topics: ["Contar 1-10", "Sumas Simples (1 dígito)", "Restas Básicas", "Mayor y Menor", "Decenas"] },
      { title: "Aritmética", topics: ["Sumas de 2 dígitos", "Restas llevando", "Multiplicación Básica", "Tablas del 1-5", "División Simple"] },
      { title: "Lógica", topics: ["Series Numéricas", "Números Pares/Impares", "Estimación", "Orden de Operaciones", "Problemas Verbales"] },
      { title: "Fracciones", topics: ["Concepto de Fracción", "Medios y Cuartos", "Decimales Básicos", "Dinero", "Porcentajes Simples"] },
      { title: "Geometría", topics: ["Figuras 2D", "Lados y Vértices", "Perímetro", "Área Básica", "Ángulos"] },
      { title: "Álgebra", topics: ["Variables (x)", "Ecuaciones Lineales", "Desigualdades", "Gráficas Simples", "Factorización"] },
      { title: "Avanzado", topics: ["Potencias", "Raíces Cuadradas", "Notación Científica", "Teorema de Pitágoras", "Trigonometría Básica"] },
      { title: "Cálculo", topics: ["Funciones", "Límites Intro", "Concepto Derivada", "Pendiente", "Aplicaciones"] }
    ];
    let lessonId = 1;
    const lessons: Lesson[] = [];
    mathSections.forEach((section) => {
      section.topics.forEach((topic) => {
        lessons.push({ id: lessonId.toString(), title: `Nivel ${lessonId}`, topic: `${topic}`, description: `Aprende: ${topic}`, color: 'navy', completed: false, locked: true });
        lessonId++;
      });
    });
    return lessons;
  }
  const sections = [
    { title: "Intro", topics: ["Lo Básico 1", "Saludos", "Lo Básico 2", "Gente", "Frases Comunes"] },
    { title: "Fundamentos", topics: ["Comida", "Animales", "Plurales", "Posesivos", "Ropa"] },
    { title: "Comunicación", topics: ["Preguntas", "Tiempo Presente", "Colores", "Conjunciones", "Preposiciones"] },
    { title: "Vida Diaria", topics: ["La Hora", "Familia", "Hogar", "Tamaños", "Rutina"] },
    { title: "Viajes", topics: ["Lugares", "Direcciones", "Transporte", "Hotel", "Naturaleza"] },
    { title: "Gramática", topics: ["Adverbios", "Pasado Simple", "Infinitivo", "Pronombres", "Objetos Abstractos"] },
    { title: "Social", topics: ["Sentimientos", "Salud", "Política", "Deportes", "Arte"] },
    { title: "Avanzado", topics: ["Futuro", "Condicional", "Negocios", "Tecnología", "Verbos Modales"] }
  ];
  let lessonId = 1;
  const lessons: Lesson[] = [];
  sections.forEach((section, secIdx) => {
    section.topics.forEach((topic) => {
      lessons.push({ id: lessonId.toString(), title: `Unidad ${lessonId}`, topic: `${topic} (${langName})`, description: `Aprende: ${topic.toLowerCase()}`, color: 'navy', completed: false, locked: true });
      lessonId++;
    });
  });
  return lessons;
};

const COURSE_CONTENT: Record<string, Lesson[]> = {};
LANGUAGES.forEach(l => {
  COURSE_CONTENT[l.code] = generateCurriculum(l.name);
});

type Tab = 'learn' | 'review' | 'talk' | 'missions' | 'profile';

function App() {
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => !!localStorage.getItem('daylingo_onboarded'));
  
  // Robust state initialization with error handling for corrupted localStorage
  const [user, setUser] = useState<UserState>(() => {
    try {
      const savedUser = localStorage.getItem('daylingo_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // Deep merge with initial user to ensure all fields (like weakWords) exist
        return {
          ...INITIAL_USER,
          ...parsed,
          progress: parsed.progress || INITIAL_USER.progress,
          weakWords: parsed.weakWords || INITIAL_USER.weakWords
        };
      }
    } catch (e) {
      console.error("Failed to load user state from storage, resetting.", e);
    }
    return INITIAL_USER;
  });

  const [activeTab, setActiveTab] = useState<Tab>('learn');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showNoHeartsModal, setShowNoHeartsModal] = useState(false);
  
  const currentLessons = useMemo(() => {
    const rawLessons = COURSE_CONTENT[user.currentLanguage] || generateCurriculum(LANGUAGES.find(l => l.code === user.currentLanguage)?.name || user.currentLanguage);
    const progress = user.progress[user.currentLanguage] || { completedLessonIds: [], currentUnit: 1 };
    return rawLessons.map(lesson => ({
      ...lesson,
      completed: progress.completedLessonIds.includes(lesson.id),
      locked: !progress.completedLessonIds.includes(lesson.id) && lesson.id !== progress.currentUnit.toString() && parseInt(lesson.id) > progress.currentUnit
    }));
  }, [user.currentLanguage, user.progress]);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeSession, setActiveSession] = useState<Lesson | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonResult, setLessonResult] = useState<{ xp: number, accuracy: number, earnedHeart: boolean } | null>(null);
  const [jumpTargetLesson, setJumpTargetLesson] = useState<Lesson | null>(null);

  // Review Sub-state
  const [reviewMode, setReviewMode] = useState<'practice' | 'sounds'>('practice');

  // Persistence Effect
  useEffect(() => {
    try {
      localStorage.setItem('daylingo_user', JSON.stringify(user));
    } catch (e) {
      console.error("Failed to save user progress", e);
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUser(prev => {
        if (prev.hearts >= 5) return { ...prev, nextHeartRefillAt: undefined };
        if (!prev.nextHeartRefillAt) return { ...prev, nextHeartRefillAt: Date.now() + HEART_REFILL_TIME };
        if (Date.now() >= prev.nextHeartRefillAt) {
           const newHearts = prev.hearts + 1;
           return { ...prev, hearts: newHearts, nextHeartRefillAt: newHearts < 5 ? Date.now() + HEART_REFILL_TIME : undefined };
        }
        return prev;
      });
    }, 1000); 
    return () => clearInterval(interval);
  }, []);

  const handleStartSession = async (lesson: Lesson | null, isPractice: boolean = false, isJumpTest: boolean = false) => {
    playSound('select');
    if (!isPractice && !isJumpTest && user.hearts <= 0) {
        setShowNoHeartsModal(true);
        setSelectedLesson(null);
        setJumpTargetLesson(null);
        return;
    }
    if (isJumpTest) {
      if (user.gems < 50) { alert("No tienes suficientes gemas."); return; }
      setUser(prev => ({ ...prev, gems: prev.gems - 50 }));
    }

    setLoading(true);
    setError(null);
    try {
      let topic = "";
      if (isPractice) topic = "Review basic vocabulary";
      else if (isJumpTest) topic = `EXAMEN DE NIVEL: ${lesson?.topic || "General"}. Mix advanced and basic questions.`;
      else topic = lesson?.topic || "Basics";

      const newExercises = await generateLessonContent(
        topic, user.currentLanguage, user.sourceLanguage, isJumpTest ? "B1" : "A1", user.weakWords
      );
      setExercises(newExercises);
      if (isJumpTest) {
         setActiveSession({ id: `jump-${lesson?.id}`, title: 'Examen de Salto', topic: lesson?.topic || '', description: 'Demuestra tu nivel', color: 'gold', completed: false, locked: false });
      } else {
         setActiveSession(lesson || { id: 'practice', title: 'Práctica', topic: 'General', description: '', color: 'navy', completed: false, locked: false });
      }
      setSelectedLesson(null);
      setJumpTargetLesson(null);
    } catch (err) {
      console.error(err);
      setError("Error de conexión con la IA.");
      if (isJumpTest) setUser(prev => ({ ...prev, gems: prev.gems + 50 }));
    } finally {
      setLoading(false);
    }
  };

  const handleSessionComplete = (correctCount: number, mistakes: string[]) => {
    const accuracy = Math.round((correctCount / exercises.length) * 100);
    const xpGained = correctCount * 10 + (accuracy === 100 ? 5 : 0);
    const isPractice = activeSession?.id === 'practice';
    const isJumpSession = activeSession?.id.startsWith('jump-');
    const earnedHeart = isPractice && accuracy >= 80 && user.hearts < 5; 

    if (xpGained > 0) playSound('complete');
    if (earnedHeart) setTimeout(() => playSound('heartGain'), 500);

    setUser(prev => {
        const lang = prev.currentLanguage;
        const currProgress = prev.progress[lang] || { xp: 0, completedLessonIds: [], currentUnit: 1 };
        let newCompletedIds = [...currProgress.completedLessonIds];
        let newCurrentUnit = currProgress.currentUnit;
        
        if (activeSession) {
            if (isJumpSession && accuracy >= 80) {
                const targetId = parseInt(activeSession.id.replace('jump-', ''));
                if (!isNaN(targetId)) {
                   for (let i = 1; i <= targetId; i++) if (!newCompletedIds.includes(i.toString())) newCompletedIds.push(i.toString());
                   newCurrentUnit = Math.max(newCurrentUnit, targetId + 1);
                }
            } else if (!isPractice && !isJumpSession) {
                if (!newCompletedIds.includes(activeSession.id)) newCompletedIds.push(activeSession.id);
                if (parseInt(activeSession.id) >= newCurrentUnit) newCurrentUnit = parseInt(activeSession.id) + 1;
            }
        }
        
        const today = new Date().toISOString().split('T')[0];
        let newStreak = prev.streak;
        if (prev.lastLessonDate !== today) {
            const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
            if (prev.lastLessonDate === yesterday.toISOString().split('T')[0] || prev.streak === 0) newStreak += 1;
            else if (prev.lastLessonDate < yesterday.toISOString().split('T')[0]) newStreak = 1; 
        }

        return {
            ...prev,
            hearts: earnedHeart ? Math.min(5, prev.hearts + 1) : prev.hearts,
            nextHeartRefillAt: earnedHeart && prev.hearts + 1 === 5 ? undefined : prev.nextHeartRefillAt,
            gems: prev.gems + Math.floor(correctCount / 2),
            streak: newStreak,
            lastLessonDate: today,
            weakWords: [...prev.weakWords, ...mistakes],
            progress: { ...prev.progress, [lang]: { xp: currProgress.xp + xpGained, completedLessonIds: newCompletedIds, currentUnit: newCurrentUnit } }
        };
    });
    setLessonResult({ xp: xpGained, accuracy, earnedHeart });
    setActiveSession(null);
    setExercises([]);
  };

  const handleHeartLost = () => {
      playSound('heartLost');
      setUser(p => {
          const newHearts = Math.max(0, p.hearts - 1);
          return {...p, hearts: newHearts, nextHeartRefillAt: newHearts < 5 && !p.nextHeartRefillAt ? Date.now() + HEART_REFILL_TIME : p.nextHeartRefillAt};
      });
  };

  const handleUpdateProfile = (name: string, avatar: string | any) => {
    setUser(prev => ({ ...prev, name, avatar }));
  };

  const getTimeToNextHeart = () => {
      if (!user.nextHeartRefillAt) return "";
      const diff = Math.max(0, user.nextHeartRefillAt - Date.now());
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!hasOnboarded) return <IntroScreen languages={LANGUAGES} onLanguageSelect={(code) => { setUser(p => ({...p, currentLanguage: code})); setHasOnboarded(true); localStorage.setItem('daylingo_onboarded', 'true'); }} />;

  if (activeSession && exercises.length > 0) {
    const isMath = user.currentLanguage === 'Math' || user.currentLanguage === 'Matemáticas';
    return (
      <LessonSession 
        exercises={exercises}
        onComplete={handleSessionComplete}
        onExit={() => { setActiveSession(null); setExercises([]); }}
        onHeartLost={handleHeartLost}
        userHearts={user.hearts}
        isMathSession={isMath}
      />
    );
  }

  if (loading) return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy text-white gap-6">
        <Loader2 className="w-16 h-16 animate-spin text-ocean" />
        <div className="text-center space-y-2"><h2 className="text-2xl font-bold">Generando Lección...</h2><p className="text-slate-light font-medium">Capitán Gemi está preparando tu misión.</p></div>
      </div>
  );

  if (lessonResult) return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-navy p-6 text-center animate-in fade-in duration-500">
        <div className="mb-8 relative"><div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full" /><Mascot emotion="celebrate" size={180} /></div>
        <h1 className="text-4xl font-extrabold text-gold mb-8 uppercase tracking-widest">¡Misión Cumplida!</h1>
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
          <div className="bg-white/10 p-6 rounded-2xl border-b-4 border-white/20 flex flex-col items-center"><span className="text-gold font-bold uppercase text-xs mb-1">XP Total</span><div className="flex items-center gap-2"><span className="text-4xl font-black text-white">{lessonResult.xp}</span></div></div>
          <div className="bg-ocean p-6 rounded-2xl border-b-4 border-ocean-dark flex flex-col items-center"><span className="text-white/80 font-bold uppercase text-xs mb-1">Precisión</span><div className="flex items-center gap-2"><span className="text-4xl font-black text-white">{lessonResult.accuracy}%</span></div></div>
        </div>
        {lessonResult.earnedHeart && <div className="bg-danger/20 p-4 rounded-xl border border-danger/50 mb-8 flex items-center gap-4 animate-bounce"><Heart className="w-10 h-10 text-danger fill-current" /><div className="text-left"><div className="font-bold text-white text-lg">¡Vida Recuperada!</div></div></div>}
        <Button onClick={() => setLessonResult(null)} className="w-full max-w-sm" variant="primary">CONTINUAR</Button>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-lighter/30 pb-28 relative select-none">
      <div>
         <TopBar user={user} onLanguageClick={() => { playSound('select'); setShowLanguageSelector(true); }} />
         {user.hearts < 5 && <div className="bg-navy text-white text-xs text-center py-1 font-bold tracking-wide">Próximo corazón en: {getTimeToNextHeart()}</div>}
      </div>

      {showNoHeartsModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4 animate-in fade-in">
           <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
               <Heart className="w-20 h-20 text-danger fill-current mx-auto mb-4 animate-pulse" />
               <h3 className="text-2xl font-bold text-navy mb-2">¡Sin Corazones!</h3>
               <p className="text-slate mb-6">Próximo en: {getTimeToNextHeart()}</p>
               <Button variant="secondary" fullWidth onClick={() => { setShowNoHeartsModal(false); handleStartSession(null, true); }}>ENTRENAR (+1 ❤️)</Button>
               <Button variant="ghost" fullWidth onClick={() => setShowNoHeartsModal(false)} className="mt-2">ESPERAR</Button>
           </div>
        </div>
      )}

      {jumpTargetLesson && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/80 backdrop-blur-sm p-4 animate-in zoom-in-95">
           <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center">
               <button onClick={() => setJumpTargetLesson(null)} className="absolute top-4 right-4 text-slate"><X className="w-5 h-5" /></button>
               <FastForward className="w-16 h-16 text-ocean fill-current mx-auto mb-4" />
               <h3 className="text-2xl font-bold text-navy mb-2">¡Atajo de Sección!</h3>
               <div className="flex items-center justify-center gap-2 mb-8 bg-slate-lighter/50 p-3 rounded-xl"><span className="font-bold text-navy">Costo:</span><Gem className="w-5 h-5 text-ocean" /><span className="font-black text-xl">50</span></div>
               <Button fullWidth variant={user.gems >= 50 ? "primary" : "locked"} disabled={user.gems < 50} onClick={() => handleStartSession(jumpTargetLesson, false, true)}>PAGAR Y SALTAR</Button>
           </div>
        </div>
      )}

      {showLanguageSelector && (
        <div className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm flex justify-center pt-20" onClick={() => setShowLanguageSelector(false)}>
           <div className="bg-white w-full max-w-sm rounded-xl p-4 shadow-xl m-4 overflow-y-auto max-h-[80vh]" onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-slate mb-4 uppercase text-sm">Mis Cursos</h3>
              <div className="grid grid-cols-1 gap-2">
                 {LANGUAGES.map(lang => (
                    <button key={lang.code} onClick={() => { playSound('select'); setUser(p => ({...p, currentLanguage: lang.code})); setShowLanguageSelector(false); }} className={`flex items-center p-3 rounded-xl border-2 hover:bg-slate-lighter ${user.currentLanguage === lang.code ? 'border-ocean bg-ocean/10' : 'border-slate-light/20'}`}>
                       <div className="text-2xl mr-4">{lang.code === 'Chess' ? '♟️' : lang.code === 'Math' ? <div className="bg-navy p-1 rounded-md"><Calculator className="w-6 h-6 text-gold" /></div> : <img src={`https://flagcdn.com/w40/${lang.flag}.png`} className="w-8 rounded-sm" />}</div>
                       <span className="font-bold text-navy">{lang.name}</span>
                    </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      <main className="max-w-md mx-auto min-h-[80vh] pb-32">
        {activeTab === 'learn' && (
           <div className="animate-in slide-in-from-right-4 duration-300">
             {error && <div className="mx-4 mt-4 p-4 bg-danger/10 border border-danger text-danger rounded-xl text-center font-bold">{error}</div>}
             <LessonPath lessons={currentLessons} onLessonSelect={setSelectedLesson} onJumpToSection={setJumpTargetLesson} />
           </div>
        )}
        
        {activeTab === 'review' && (
           <div className="flex flex-col h-full animate-in slide-in-from-right-4">
              <div className="p-4 grid grid-cols-2 gap-2">
                  <button onClick={() => setReviewMode('practice')} className={`p-4 rounded-2xl font-bold border-2 ${reviewMode === 'practice' ? 'bg-navy text-white border-navy' : 'bg-white text-slate border-slate-light/20'}`}>Práctica</button>
                  <button onClick={() => setReviewMode('sounds')} className={`p-4 rounded-2xl font-bold border-2 ${reviewMode === 'sounds' ? 'bg-navy text-white border-navy' : 'bg-white text-slate border-slate-light/20'}`}>Sonidos</button>
              </div>
              {reviewMode === 'practice' ? (
                 <div className="flex flex-col items-center justify-center py-10 text-center p-6">
                    <Dumbbell className="w-24 h-24 text-navy mb-4" />
                    <h2 className="text-2xl font-bold text-navy mb-2">Entrenamiento</h2>
                    <p className="text-slate mb-8 max-w-xs">Repasa tus errores y recupera corazones.</p>
                    <Button className="w-full max-w-xs" onClick={() => handleStartSession(null, true)}>EMPEZAR (+1 ❤️)</Button>
                 </div>
              ) : (
                 <SoundLibrary user={user} />
              )}
           </div>
        )}

        {activeTab === 'talk' && <div className="animate-in slide-in-from-right-4 duration-300 h-full p-4"><LiveTalk user={user} /></div>}
        {activeTab === 'missions' && <MissionsSection user={user} />}
        {activeTab === 'profile' && <ProfileSection user={user} onUpdateProfile={handleUpdateProfile} />}
      </main>

      {selectedLesson && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-navy/60 backdrop-blur-sm" onClick={() => setSelectedLesson(null)} />
          <div className="bg-white w-full max-w-md p-6 rounded-t-3xl sm:rounded-3xl z-10 animate-in slide-in-from-bottom duration-300 relative pb-10 sm:pb-6 shadow-2xl">
             <button onClick={() => setSelectedLesson(null)} className="absolute top-4 right-4 text-slate"><X className="w-5 h-5" /></button>
             <h2 className="text-2xl font-bold text-center text-navy mb-2">{selectedLesson.title}</h2>
             <p className="text-center text-slate mb-8 text-lg">{selectedLesson.description}</p>
             <Button onClick={() => handleStartSession(selectedLesson)} fullWidth className="text-lg py-4">{selectedLesson.completed ? 'REPASAR' : 'EMPEZAR'}</Button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 w-full bg-white/95 backdrop-blur-lg border-t border-slate-light/20 px-1 py-1 flex justify-around items-center z-50 max-w-4xl left-0 right-0 mx-auto h-[80px] pb-4 sm:pb-2 shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
         <NavButton active={activeTab === 'learn'} onClick={() => {playSound('select'); setActiveTab('learn')}} icon={Home} label="Aprender" />
         <NavButton active={activeTab === 'review'} onClick={() => {playSound('select'); setActiveTab('review')}} icon={Dumbbell} label="Repaso" />
         <NavButton active={activeTab === 'talk'} onClick={() => {playSound('select'); setActiveTab('talk')}} icon={Mic} label="Hablar" />
         <NavButton active={activeTab === 'missions'} onClick={() => {playSound('select'); setActiveTab('missions')}} icon={Target} label="Misiones" />
         <NavButton active={activeTab === 'profile'} onClick={() => {playSound('select'); setActiveTab('profile')}} icon={User} label="Perfil" />
      </nav>
    </div>
  );
}

const NavButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
    <button onClick={onClick} className="flex-1 flex flex-col items-center justify-center gap-1 h-full touch-manipulation active:scale-90 transition-transform duration-100 group">
        <div className={`relative p-1 rounded-full transition-colors ${active ? 'bg-ocean/10 text-ocean' : 'text-slate-light group-hover:text-slate'}`}>
            <Icon className={`w-6 h-6 ${active ? 'fill-current' : ''}`} strokeWidth={2.5} />
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wide transition-colors ${active ? 'text-ocean' : 'text-slate-light'}`}>{label}</span>
    </button>
);

export default App;
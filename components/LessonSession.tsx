import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, CheckCircle, XCircle, Volume2, AlertTriangle, ArrowUp, Mic, Square, Loader2, Sparkles, Keyboard, LayoutGrid, Delete, MicOff, Heart } from 'lucide-react';
import { Exercise, ExerciseType, MascotEmotion } from '../types';
import { Button } from './Button';
import { ProgressBar } from './ProgressBar';
import { Mascot } from './Mascot';
import { generateSpeech, evaluatePronunciation } from '../services/geminiService';
import { playSound } from '../services/soundService';

interface LessonSessionProps {
  exercises: Exercise[];
  onComplete: (score: number, mistakes: string[]) => void;
  onExit: () => void;
  onHeartLost: () => void;
  userHearts: number;
  isMathSession?: boolean;
}

export const LessonSession: React.FC<LessonSessionProps> = ({ 
  exercises, 
  onComplete, 
  onExit,
  onHeartLost,
  userHearts,
  isMathSession = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textInput, setTextInput] = useState(''); 
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Ref to track the currently playing audio object to allow interruption
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Added type to matchingPairs state to know which language to speak
  const [matchingPairs, setMatchingPairs] = useState<{
      id: string, 
      text: string, 
      matchId: number, 
      type: 'source'|'target', 
      state: 'default'|'selected'|'matched'|'error'
  }[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect' | 'skipped'>('idle');
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [mascotEmotion, setMascotEmotion] = useState<MascotEmotion>('idle');
  const [showTip, setShowTip] = useState(false);
  const [activeMascotSpeech, setActiveMascotSpeech] = useState<string | undefined>(undefined);

  const currentExercise = exercises[currentIndex];
  const isLast = currentIndex === exercises.length - 1;
  const progress = ((currentIndex) / exercises.length) * 100;

  useEffect(() => {
    setSelectedOption(null);
    setTextInput('');
    setStatus('idle');
    setPronunciationFeedback(null);
    setIsRecording(false);
    setIsProcessingAudio(false);
    setSelectedWords([]);
    setMascotEmotion('idle');
    
    // Determine what the mascot should say and if the tip bubble is shown
    let speechText = currentExercise.tip;
    setShowTip(!!currentExercise.tip);
    
    // Default to Word Bank unless no options provided
    if (currentExercise.options && currentExercise.options.length > 0) {
      setIsKeyboardMode(false);
      if (currentExercise.type !== ExerciseType.MULTIPLE_CHOICE) {
        setAvailableWords([...currentExercise.options]); 
      }
    } else {
      // If no options for translation, force keyboard
      if (currentExercise.type === ExerciseType.TRANSLATE_TO_TARGET || 
          currentExercise.type === ExerciseType.TRANSLATE_TO_SOURCE ||
          currentExercise.type === ExerciseType.LISTENING) {
          setIsKeyboardMode(true);
      }
    }
    
    if (currentExercise.type === ExerciseType.MATCHING && currentExercise.pairs) {
      const cards = currentExercise.pairs.flatMap((p, i) => [
        { id: `src-${i}`, text: p.source, matchId: i, type: 'source' as const },
        { id: `tgt-${i}`, text: p.target, matchId: i, type: 'target' as const }
      ]);
      const shuffled = cards.sort(() => Math.random() - 0.5).map(c => ({
        ...c,
        state: 'default' as const
      }));
      setMatchingPairs(shuffled);
      setSelectedMatchId(null);
      setMascotEmotion('happy');
      speechText = speechText ? `¡Nuevas Palabras! ${speechText}` : "¡Nuevas Palabras!";
    }

    setActiveMascotSpeech(speechText);

  }, [currentExercise]);

  const renderTextWithChessPieces = (text: string) => {
    if (text.match(/^[♔♕♖♗♘♙]$/)) {
        return <span className="text-6xl text-gold drop-shadow-md filter">{text}</span>;
    }
    if (text.match(/^[♚♛♜♝♞♟]$/)) {
        return <span className="text-6xl text-navy drop-shadow-sm">{text}</span>;
    }
    return <span>{text}</span>;
  };

  const playAudio = useCallback(async (text: string) => {
    if (!text) return;
    if (text.length === 1 && text.match(/[♔♕♖♗♘♙♚♛♜♝♞♟]/)) return;
    
    if (isMathSession && text.match(/^[\d\s+\-*/=x.]+$/)) return;

    try {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }

      setIsPlayingAudio(true);
      
      const audioData = await generateSpeech(text);
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      currentAudioRef.current = audio;

      audio.onended = () => {
         setIsPlayingAudio(false);
         currentAudioRef.current = null;
      };
      
      await audio.play();
    } catch (e) {
      console.error("Audio playback failed", e);
      setIsPlayingAudio(false);
    }
  }, [isMathSession]);

  useEffect(() => {
    const shouldAutoPlay = 
      currentExercise.type === ExerciseType.LISTENING || 
      currentExercise.type === ExerciseType.MULTIPLE_CHOICE ||
      currentExercise.type === ExerciseType.TRANSLATE_TO_TARGET ||
      currentExercise.type === ExerciseType.TRANSLATE_TO_SOURCE; 
    
    if (shouldAutoPlay && currentExercise.question) {
        const timer = setTimeout(() => {
             playAudio(currentExercise.question);
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [currentExercise, playAudio]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.start();
      setIsRecording(true);
      setMascotEmotion('thinking');
    } catch (err) {
      alert("No se pudo acceder al micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessingAudio(true);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
           const base64String = (reader.result as string).split(',')[1];
           try {
             const result = await evaluatePronunciation(base64String, audioBlob.type, currentExercise.question);
             setPronunciationFeedback(result.feedback);
             if (result.isCorrect) {
                setStatus('correct');
                setCorrectCount(prev => prev + 1);
                setMascotEmotion('celebrate');
                playSound('correct');
             } else {
                setStatus('incorrect');
                onHeartLost();
                setMascotEmotion('sad');
                playSound('incorrect');
             }
           } catch (err) {
             setPronunciationFeedback("Error de conexión. Inténtalo de nuevo.");
             setStatus('idle'); 
           } finally {
             setIsProcessingAudio(false);
           }
        };
      };
    }
  };

  const handleSkipSpeaking = () => {
    setStatus('skipped');
    setMascotEmotion('happy'); 
    setCorrectCount(prev => prev + 1); 
  };

  const handleMatchingClick = (id: string) => {
    if (status !== 'idle') return;
    playSound('select');

    const card = matchingPairs.find(p => p.id === id);
    if (card) {
        playAudio(card.text);
    }

    if (selectedMatchId === id) {
        setMatchingPairs(prev => prev.map(p => p.id === id ? { ...p, state: 'default' } : p));
        setSelectedMatchId(null);
        return;
    }
    if (!selectedMatchId) {
        setSelectedMatchId(id);
        setMatchingPairs(prev => prev.map(p => p.id === id ? { ...p, state: 'selected' } : p));
        return;
    }
    const card1 = matchingPairs.find(p => p.id === selectedMatchId);
    const card2 = matchingPairs.find(p => p.id === id);
    if (card1 && card2) {
        if (card1.matchId === card2.matchId && card1.id !== card2.id) {
            setMatchingPairs(prev => prev.map(p => 
                (p.id === card1.id || p.id === card2.id) ? { ...p, state: 'matched' } : p
            ));
            setSelectedMatchId(null);
            setMascotEmotion('happy');
            setTimeout(() => setMascotEmotion('idle'), 1000);
            playSound('correct');
            
            const remaining = matchingPairs.filter(p => p.state !== 'matched' && p.id !== card1.id && p.id !== card2.id);
            if (remaining.length === 0) {
                setStatus('correct');
                setCorrectCount(prev => prev + 1);
            }
        } else {
            setMatchingPairs(prev => prev.map(p => 
                (p.id === card1.id || p.id === card2.id) ? { ...p, state: 'error' } : p
            ));
            setMascotEmotion('sad');
            playSound('incorrect');
            setTimeout(() => {
                 setMatchingPairs(prev => prev.map(p => 
                    (p.state === 'error') ? { ...p, state: 'default' } : p
                ));
                setSelectedMatchId(null);
                setMascotEmotion('idle');
            }, 800);
        }
    }
  };

  const handleWordClick = (word: string, fromBank: boolean) => {
    if (status !== 'idle') return;
    playSound('select');
    playAudio(word);

    if (fromBank) {
      setAvailableWords(prev => prev.filter(w => w !== word));
      setSelectedWords(prev => [...prev, word]);
    } else {
      setSelectedWords(prev => prev.filter(w => w !== word));
      setAvailableWords(prev => [...prev, word]);
    }
  };

  const handleMathInput = (val: string) => {
      if (status !== 'idle') return;
      playSound('select');
      if (val === 'backspace') {
          setTextInput(prev => prev.slice(0, -1));
      } else {
          setTextInput(prev => prev + val);
      }
  };

  const handleCheck = useCallback(() => {
    if (status !== 'idle') return;
    if (currentExercise.type === ExerciseType.PRONUNCIATION || currentExercise.type === ExerciseType.MATCHING) return;

    let isCorrect = false;
    const normalize = (s: string) => s.toLowerCase().replace(/[.,!?;¿¡]/g, '').trim().replace(/\s+/g, ' ');

    if (currentExercise.type === ExerciseType.MULTIPLE_CHOICE) {
      isCorrect = selectedOption === currentExercise.correctAnswer;
    } else {
      const userAnswer = (isKeyboardMode || isMathSession) ? textInput : selectedWords.join(' ');
      const normUser = normalize(userAnswer);
      const normCorrect = normalize(currentExercise.correctAnswer);
      isCorrect = normUser === normCorrect;
    }

    if (isCorrect) {
      setStatus('correct');
      setCorrectCount(prev => prev + 1);
      setMascotEmotion('salute'); 
      playSound('correct');
    } else {
      setStatus('incorrect');
      setMascotEmotion('sad');
      const mistakeConcept = currentExercise.type === ExerciseType.MULTIPLE_CHOICE 
          ? currentExercise.question 
          : currentExercise.correctAnswer;
      setMistakes(prev => [...prev, mistakeConcept]);
      onHeartLost();
      playSound('incorrect');
    }
  }, [status, currentExercise, selectedOption, textInput, selectedWords, onHeartLost, isKeyboardMode, isMathSession]);

  const handleNext = useCallback(() => {
    playSound('select');
    if (userHearts <= 0) { onExit(); return; }
    if (isLast) {
      onComplete(correctCount + (status === 'correct' ? 1 : 0), mistakes);
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [userHearts, isLast, onComplete, correctCount, status, onExit, mistakes]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (status === 'idle') {
           if (currentExercise.type === ExerciseType.PRONUNCIATION) {
             if (isRecording) stopRecording();
           } else if (currentExercise.type !== ExerciseType.MATCHING) {
             const hasAnswer = selectedOption || textInput.trim() || selectedWords.length > 0;
             if (hasAnswer) handleCheck();
           }
        } else {
           handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, handleCheck, handleNext, isRecording, currentExercise.type, selectedOption, textInput, selectedWords]);

  const renderMathKeypad = () => (
      <div className="w-full max-w-xs mx-auto grid grid-cols-3 gap-3 mt-8">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map(num => (
              <button
                 key={num}
                 onClick={() => handleMathInput(num.toString())}
                 className="bg-white text-navy font-black text-2xl py-4 rounded-2xl shadow-sm border-2 border-slate-200 border-b-4 active:border-b-2 active:translate-y-1 transition-all"
              >
                  {num}
              </button>
          ))}
          <button
              onClick={() => handleMathInput('backspace')}
              className="bg-slate-50 text-navy font-bold text-xl py-4 rounded-2xl shadow-sm border-2 border-slate-200 border-b-4 active:border-b-2 active:translate-y-1 transition-all flex items-center justify-center"
          >
              <Delete className="w-6 h-6" />
          </button>
      </div>
  );

  const renderContent = () => {
    switch (currentExercise.type) {
      case ExerciseType.MATCHING:
        return (
            <div className="flex flex-col items-center w-full mt-6">
                <div className="flex items-center gap-2 mb-4 text-ocean font-black uppercase tracking-wider animate-pulse">
                    <Sparkles className="w-5 h-5" />
                    <span>¡Nuevas Palabras!</span>
                    <Sparkles className="w-5 h-5" />
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                    {matchingPairs.map((card) => (
                        <button
                            key={card.id}
                            onClick={() => handleMatchingClick(card.id)}
                            disabled={card.state === 'matched'}
                            className={`
                                h-24 sm:h-28 rounded-3xl border-2 border-b-[6px] flex items-center justify-center text-lg sm:text-xl font-bold transition-all p-3 text-center text-black shadow-sm
                                ${card.state === 'default' ? 'bg-white border-slate-200 hover:bg-slate-50' : ''}
                                ${card.state === 'selected' ? 'bg-ocean/10 border-ocean text-ocean translate-y-1 border-b-2' : ''}
                                ${card.state === 'matched' ? 'bg-navy/5 border-navy/20 text-navy/40 scale-95 opacity-60 shadow-none border-b-2' : ''}
                                ${card.state === 'error' ? 'bg-danger/10 border-danger text-danger animate-shake' : ''}
                            `}
                        >
                            {renderTextWithChessPieces(card.text)}
                        </button>
                    ))}
                </div>
            </div>
        );

      case ExerciseType.MULTIPLE_CHOICE:
        const safeOptions = currentExercise.options && currentExercise.options.length > 0 
            ? currentExercise.options 
            : [currentExercise.correctAnswer]; 
        return (
          <div className="flex flex-col gap-4 w-full max-w-xl mt-8">
            {safeOptions.map((opt, idx) => (
              <div 
                key={idx}
                onClick={() => {
                   if (status === 'idle') {
                      playSound('select');
                      setSelectedOption(opt);
                      playAudio(opt); 
                   }
                }}
                className={`
                  p-5 rounded-2xl border-2 border-b-[5px] cursor-pointer text-xl font-bold transition-all active:scale-[0.98] shadow-sm flex items-center
                  ${selectedOption === opt 
                    ? 'bg-ocean/10 border-ocean text-ocean' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }
                  ${status !== 'idle' && opt === currentExercise.correctAnswer ? 'bg-navy/10 border-navy text-navy' : ''}
                  ${status !== 'idle' && selectedOption === opt && opt !== currentExercise.correctAnswer ? 'bg-danger/10 border-danger text-danger' : ''}
                `}
              >
                 <div className="flex-1">
                    {renderTextWithChessPieces(opt)}
                 </div>
                 {selectedOption === opt && <div className="w-6 h-6 bg-ocean rounded-full border-4 border-ocean/30"></div>}
              </div>
            ))}
          </div>
        );
      
      case ExerciseType.PRONUNCIATION:
        return (
          <div className="w-full max-w-2xl mt-8 flex flex-col items-center">
             <div className="text-xl font-medium text-slate-400 mb-8 uppercase tracking-widest">Haz clic y habla</div>
             <div className="relative">
                 {isRecording && <div className="absolute inset-0 rounded-full bg-ocean/30 animate-ping"></div>}
                 <button 
                   onClick={isRecording ? stopRecording : startRecording}
                   disabled={isProcessingAudio || status !== 'idle'}
                   className={`
                     relative w-36 h-36 rounded-full flex items-center justify-center transition-all shadow-xl
                     ${isRecording ? 'bg-danger' : 'bg-ocean hover:bg-ocean-dark'}
                     {(isProcessingAudio || status !== 'idle') ? 'opacity-50 cursor-not-allowed' : 'active:scale-95 border-b-[8px] border-black/10 active:border-b-0 active:translate-y-2'}
                   `}
                 >
                    {isProcessingAudio ? <Loader2 className="w-14 h-14 text-white animate-spin" /> : isRecording ? <Square className="w-12 h-12 text-white fill-current" /> : <Mic className="w-14 h-14 text-white" />}
                 </button>
             </div>
             
             {status === 'idle' && !isRecording && !isProcessingAudio && (
                 <button 
                    onClick={handleSkipSpeaking}
                    className="mt-10 text-slate font-bold uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-slate-100 px-6 py-3 rounded-xl transition-colors"
                 >
                    <MicOff className="w-4 h-4" /> No puedo hablar ahora
                 </button>
             )}

             {pronunciationFeedback && (
                 <div className="mt-8 p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 text-center animate-in slide-in-from-bottom-2 fade-in max-w-sm">
                     <span className="font-black text-navy block mb-1">EVALUACIÓN</span>
                     <span className="text-slate-600 font-medium">{pronunciationFeedback}</span>
                 </div>
             )}
          </div>
        );

      case ExerciseType.TRANSLATE_TO_TARGET:
      case ExerciseType.TRANSLATE_TO_SOURCE:
      case ExerciseType.LISTENING:
        const canToggle = !isMathSession && currentExercise.options && currentExercise.options.length > 0;
        
        return (
          <div className="w-full max-w-2xl mt-8 flex flex-col items-start">
             {canToggle && (
               <button 
                 onClick={() => {
                   setIsKeyboardMode(!isKeyboardMode);
                   setTextInput('');
                   setSelectedWords([]);
                   setAvailableWords([...(currentExercise.options || [])]);
                   playSound('select');
                 }}
                 disabled={status !== 'idle'}
                 className="self-end mb-4 text-slate-400 font-black text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors border-2 border-transparent hover:border-slate-100"
               >
                 {isKeyboardMode ? <><LayoutGrid className="w-4 h-4"/> Usar Palabras</> : <><Keyboard className="w-4 h-4"/> Usar Teclado</>}
               </button>
             )}

             {isMathSession ? (
                 <>
                    <div className="w-full bg-[#1e293b] rounded-3xl p-8 mb-4 text-center border-b-[8px] border-[#0f172a] shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/5 opacity-50 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
                        <span className="text-white font-mono text-5xl tracking-widest relative z-10 font-bold">{textInput || "?"}</span>
                    </div>
                    {renderMathKeypad()}
                 </>
             ) : isKeyboardMode ? (
                 <textarea
                   value={textInput}
                   onChange={(e) => setTextInput(e.target.value)}
                   disabled={status !== 'idle'}
                   placeholder="Escribe tu respuesta aquí..."
                   className="w-full min-h-[160px] bg-slate-50 rounded-3xl border-2 border-slate-200 p-6 text-2xl text-navy font-bold focus:ring-4 focus:ring-ocean/20 focus:border-ocean outline-none resize-none shadow-inner transition-all"
                   autoFocus
                 />
             ) : (
                 <>
                   <div className="w-full min-h-[140px] bg-slate-50 rounded-3xl border-2 border-slate-200 mb-8 p-6 flex flex-wrap gap-2 items-start content-start transition-all shadow-inner">
                      {selectedWords.map((word, i) => (
                         <button
                           key={`selected-${i}`}
                           onClick={() => handleWordClick(word, false)}
                           className="bg-white border-2 border-slate-200 border-b-4 active:border-b-2 px-5 py-3 rounded-2xl text-lg font-bold text-navy shadow-sm animate-in zoom-in-90 duration-200 hover:bg-slate-50"
                         >
                           {renderTextWithChessPieces(word)}
                         </button>
                      ))}
                   </div>
                   <div className="flex flex-wrap gap-2 justify-center w-full border-t-2 border-slate-100 pt-8">
                      {availableWords.map((word, i) => (
                          <button 
                              key={`available-${i}`}
                              onClick={() => handleWordClick(word, true)}
                              disabled={status !== 'idle'}
                              className="bg-white border-2 border-slate-200 border-b-4 active:border-b-2 px-5 py-3 rounded-2xl text-lg font-bold text-navy shadow-sm hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-50"
                          >
                              {renderTextWithChessPieces(word)}
                          </button>
                      ))}
                   </div>
                 </>
             )}
          </div>
        );
    }
  };

  const instructionText = () => {
      if (isMathSession) return "Resuelve:";
      switch(currentExercise.type) {
          case ExerciseType.MATCHING: return "Empareja los pares";
          case ExerciseType.TRANSLATE_TO_TARGET: return "Traduce esta oración";
          case ExerciseType.TRANSLATE_TO_SOURCE: return "Traduce esto al español";
          case ExerciseType.MULTIPLE_CHOICE: return "Selecciona el significado correcto";
          case ExerciseType.LISTENING: return "Escucha y escribe lo que oyes";
          case ExerciseType.PRONUNCIATION: return "Pronuncia esta oración";
          default: return "";
      }
  };

  const showHeader = currentExercise.type !== ExerciseType.MATCHING && !isMathSession;
  const isMathQuestion = isMathSession && currentExercise.type !== ExerciseType.MATCHING && currentExercise.type !== ExerciseType.MULTIPLE_CHOICE;

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white relative">
      {showQuitConfirm && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-navy/60 backdrop-blur-md p-4 animate-in fade-in">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border-4 border-slate-100">
               <h3 className="text-2xl font-black text-navy mb-2 text-center">¿Salir de la lección?</h3>
               <p className="text-slate-500 text-center mb-8 font-medium">Perderás todo tu progreso actual.</p>
               <div className="flex flex-col gap-3">
                   <Button variant="primary" fullWidth onClick={() => setShowQuitConfirm(false)}>SEGUIR JUGANDO</Button>
                   <Button variant="danger" fullWidth onClick={onExit}>SALIR</Button>
               </div>
           </div>
        </div>
      )}

      <div className="px-6 py-6 flex items-center gap-6">
        <button onClick={() => setShowQuitConfirm(true)} className="hover:bg-slate-100 p-2 rounded-full transition-colors"><X className="text-slate-400 w-6 h-6" strokeWidth={3} /></button>
        <ProgressBar percentage={progress} />
        <div className="flex items-center text-danger font-black"><Heart className="w-6 h-6 fill-current mr-2 animate-pulse" /><span className="text-xl">{userHearts}</span></div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-40 flex flex-col items-center w-full relative pt-2">
        
        <div className="w-full max-w-2xl flex justify-end relative h-0">
             <div className="absolute top-2 right-0 z-20 flex items-start gap-4">
                 {showTip && currentExercise.tip && (
                     <div className="bg-white p-4 rounded-2xl rounded-tr-none border-2 border-slate-200 shadow-lg max-w-[200px] text-sm font-bold text-navy animate-in zoom-in duration-300 bubble">
                         {currentExercise.tip}
                     </div>
                 )}
                 <Mascot 
                    emotion={mascotEmotion} 
                    size={110} 
                    onClick={() => setMascotEmotion('salute')}
                    say={activeMascotSpeech}
                 />
             </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-navy text-left w-full max-w-2xl mt-8 mb-8 z-10 leading-tight">
          {instructionText()}
        </h2>

        {isMathQuestion && (
            <div className="w-full max-w-2xl mb-8 p-10 bg-[#2d3b2d] rounded-3xl border-[8px] border-[#8a6b4e] shadow-2xl text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
                <span className="relative text-white font-mono text-6xl font-bold tracking-wider drop-shadow-md">
                    {currentExercise.question}
                </span>
            </div>
        )}

        {showHeader && (
            <div className="flex items-start gap-4 w-full max-w-2xl mb-8 z-10">
                {currentExercise.type !== ExerciseType.LISTENING && (
                    <button 
                        onClick={() => playAudio(currentExercise.question)}
                        className="mt-2 w-14 h-14 bg-ocean rounded-2xl flex-shrink-0 flex items-center justify-center shadow-[0_4px_0_#2b8fa3] active:translate-y-1 active:shadow-none transition-all hover:bg-ocean-dark cursor-pointer border-2 border-white"
                    >
                        <Volume2 className={`w-7 h-7 text-white ${isPlayingAudio ? 'animate-pulse' : ''}`} strokeWidth={3} />
                    </button>
                )}
                {currentExercise.type !== ExerciseType.LISTENING && (
                    <div 
                        onClick={() => playAudio(currentExercise.question)}
                        className="text-xl sm:text-2xl text-navy leading-normal font-medium bubble p-5 rounded-3xl border-2 border-slate-200 relative ml-4 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm bg-white"
                    >
                        {renderTextWithChessPieces(currentExercise.question)}
                    </div>
                )}
                {currentExercise.type === ExerciseType.LISTENING && (
                    <button 
                        onClick={() => playAudio(currentExercise.question)}
                        className="w-40 h-40 bg-ocean rounded-[2rem] mx-auto flex flex-col items-center justify-center shadow-[0_8px_0_#2b8fa3] active:translate-y-2 active:shadow-none transition-all mb-8 hover:bg-ocean-dark cursor-pointer border-4 border-white"
                    >
                        <Volume2 className={`w-20 h-20 text-white mb-2 ${isPlayingAudio ? 'animate-pulse' : ''}`} strokeWidth={2.5} />
                        <span className="text-white font-black text-sm uppercase tracking-widest">Escuchar</span>
                    </button>
                )}
            </div>
        )}
        
        {renderContent()}
      </div>

      <div className={`fixed bottom-0 w-full max-w-4xl mx-auto border-t-2 p-6 pb-8 transition-all duration-300 z-50 ${status === 'correct' || status === 'skipped' ? 'bg-[#d7ffb8] border-transparent' : status === 'incorrect' ? 'bg-[#ffdfe0] border-transparent' : 'bg-white border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]'}`}>
        <div className="flex justify-between items-center max-w-2xl mx-auto gap-4">
            {status === 'correct' && (
                <div className="flex items-center gap-4 text-green-700 font-black text-2xl animate-in slide-in-from-bottom-2">
                    <div className="bg-white rounded-full p-2 shadow-sm"><CheckCircle className="w-8 h-8 fill-green-500 text-white" /></div>
                    <div className="flex flex-col">
                        <span>¡Excelente!</span>
                        {status === 'skipped' && <span className="text-sm font-medium opacity-80">Lección saltada</span>}
                    </div>
                </div>
            )}
            {status === 'skipped' && (
               <div className="flex items-center gap-4 text-slate-500 font-bold text-lg">
                   <span>Saltado.</span>
               </div>
            )}
            {status === 'incorrect' && (
                <div className="flex items-center gap-4 text-red-700 animate-in slide-in-from-bottom-2 w-full">
                     <div className="bg-white rounded-full p-2 shadow-sm shrink-0"><XCircle className="w-8 h-8 fill-red-500 text-white" /></div>
                     <div className="flex flex-col min-w-0">
                        <span className="font-black text-xl mb-1">Respuesta correcta:</span>
                        <span className="text-base font-medium truncate leading-tight">{renderTextWithChessPieces(currentExercise.correctAnswer || "Emparejar")}</span>
                    </div>
                </div>
            )}
            
            {/* Spacer */}
            {(status === 'correct' || status === 'incorrect') && <div className="flex-1"></div>}

            <div className={`${(status === 'correct' || status === 'incorrect') ? '' : 'w-full flex justify-end'}`}>
              {status === 'idle' ? (
                  currentExercise.type === ExerciseType.PRONUNCIATION ? (
                    <Button variant="locked" className="px-10 min-w-[150px]" disabled={true}>
                       {isRecording ? 'ESCUCHANDO...' : 'HABLA AHORA'}
                    </Button>
                  ) : currentExercise.type === ExerciseType.MATCHING ? (
                      <Button variant="locked" fullWidth className="w-full sm:w-auto px-12" disabled={true}>
                         SELECCIONA PARES
                      </Button>
                  ) : (
                    <Button 
                      onClick={handleCheck} 
                      className="w-full sm:w-auto px-12"
                      fullWidth
                      disabled={
                        !selectedOption && 
                        (!isKeyboardMode || !textInput.trim()) && 
                        (isKeyboardMode || selectedWords.length === 0) &&
                        (isMathSession ? !textInput : false)
                      }
                    >
                        COMPROBAR
                    </Button>
                  )
              ) : (
                  <Button onClick={handleNext} variant={status === 'correct' || status === 'skipped' ? 'primary' : 'danger'} className="w-full sm:w-auto px-12">CONTINUAR</Button>
              )}
            </div>
        </div>
      </div>
    </div>
  );
};
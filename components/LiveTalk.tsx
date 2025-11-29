import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, ArrowUp, Loader2 } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import { ChatMessage, UserState, MascotEmotion } from '../types';
import { Mascot } from './Mascot';

interface LiveTalkProps {
  user: UserState;
}

export const LiveTalk: React.FC<LiveTalkProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'model', text: `¡Hola! Soy Capitán Gemi. Hablemos en ${user.currentLanguage}.` }
  ]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mascotEmotion, setMascotEmotion] = useState<MascotEmotion>('idle');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
      alert("Error accediendo al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
           const base64String = (reader.result as string).split(',')[1];
           const tempId = Date.now().toString();
           setMessages(prev => [...prev, { id: tempId, role: 'user', text: "🎤 (Audio enviado)" }]);
           try {
             setMascotEmotion('thinking');
             const { text, audioData } = await chatWithAI(
                messages, 
                user.currentLanguage, 
                user.sourceLanguage,
                { type: 'audio', data: base64String, mimeType: audioBlob.type }
             );
             setMessages(prev => [
                ...prev, 
                { id: Date.now().toString(), role: 'model', text: text, audioUrl: `data:audio/mp3;base64,${audioData}` }
             ]);
             const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
             setMascotEmotion('talking');
             audio.play();
             audio.onended = () => setMascotEmotion('idle');
           } catch (err) {
             setMascotEmotion('sad');
           } finally {
             setIsProcessing(false);
           }
        };
      };
    }
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText("");
    setIsProcessing(true);
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { id: tempId, role: 'user', text: textToSend }]);
    try {
        setMascotEmotion('thinking');
        const { text, audioData } = await chatWithAI(
           messages, 
           user.currentLanguage, 
           user.sourceLanguage,
           { type: 'text', text: textToSend }
        );
        setMessages(prev => [
           ...prev, 
           { id: Date.now().toString(), role: 'model', text: text, audioUrl: `data:audio/mp3;base64,${audioData}` }
        ]);
        const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
        setMascotEmotion('talking');
        audio.play();
        audio.onended = () => setMascotEmotion('idle');
    } catch (err) {
        setMascotEmotion('sad');
    } finally {
        setIsProcessing(false);
    }
  };

  const playMessageAudio = (url?: string) => {
    if (url) {
        const audio = new Audio(url);
        setMascotEmotion('talking');
        audio.play();
        audio.onended = () => setMascotEmotion('idle');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] w-full max-w-lg mx-auto bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-light/20 relative">
      <div className="h-48 bg-navy flex items-center justify-center relative shrink-0">
         <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ocean to-transparent"></div>
         <Mascot emotion={mascotEmotion} size={140} onClick={() => setMascotEmotion('salute')} />
         <div className="absolute top-4 right-4 bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-sm border border-white/20">
            En línea
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-lighter/20" ref={scrollRef}>
         {messages.map((msg) => (
             <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div 
                   className={`
                      max-w-[80%] p-3 rounded-2xl text-sm sm:text-base cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2 font-medium shadow-sm
                      ${msg.role === 'user' ? 'bg-ocean text-white rounded-br-none' : 'bg-white border border-slate-light/30 text-navy rounded-bl-none'}
                   `}
                   onClick={() => msg.role === 'model' && playMessageAudio(msg.audioUrl)}
                 >
                    {msg.text}
                    {msg.role === 'model' && <Volume2 className="w-4 h-4 inline opacity-50 flex-shrink-0" />}
                 </div>
             </div>
         ))}
         {isProcessing && (
             <div className="flex justify-start">
                 <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-light/30 flex items-center gap-2">
                     <span className="text-slate text-xs font-bold">ESCRIBIENDO</span>
                     <Loader2 className="w-4 h-4 animate-spin text-navy" />
                 </div>
             </div>
         )}
      </div>

      <div className="p-3 bg-white border-t border-slate-light/20 flex items-center gap-2 pb-6 sm:pb-4">
         <input 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Escribe un mensaje..."
            disabled={isProcessing || isRecording}
            onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            className="flex-1 bg-slate-lighter/50 border-0 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-navy outline-none transition-all placeholder-slate font-bold text-black"
         />
         
         {inputText.trim() ? (
             <button 
                onClick={handleSendText}
                disabled={isProcessing}
                className="w-12 h-12 bg-ocean hover:bg-ocean-dark rounded-xl flex items-center justify-center transition-colors shadow-md active:scale-95"
             >
                 <ArrowUp className="w-6 h-6 text-white" strokeWidth={3} />
             </button>
         ) : (
             <button
               onMouseDown={startRecording}
               onMouseUp={stopRecording}
               disabled={isProcessing}
               className={`
                  w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95
                  ${isRecording ? 'bg-danger animate-pulse' : 'bg-navy hover:bg-navy-light'}
               `}
             >
                {isProcessing ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : isRecording ? <Square className="w-5 h-5 text-white fill-current" /> : <Mic className="w-6 h-6 text-white" />}
             </button>
         )}
      </div>
    </div>
  );
};
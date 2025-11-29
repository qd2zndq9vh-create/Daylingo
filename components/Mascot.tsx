import React, { useEffect, useRef, useState } from 'react';
import { MascotEmotion } from '../types';
import { generateSpeech } from '../services/geminiService';

interface MascotProps {
  emotion: MascotEmotion;
  size?: number;
  className?: string;
  onClick?: () => void;
  say?: string; // New prop: Text for the mascot to speak
}

export const Mascot: React.FC<MascotProps> = ({ emotion, size = 120, className = '', onClick, say }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenText = useRef<string | null>(null);

  // Handle Speech Generation and Playback
  useEffect(() => {
    let isActive = true;

    const speak = async () => {
      // If no text, or same text already spoken/speaking, do nothing
      if (!say || say === lastSpokenText.current) return;
      
      try {
        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }

        lastSpokenText.current = say;
        setIsSpeaking(true);

        const audioData = await generateSpeech(say);
        
        if (!isActive) return;

        const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
        audioRef.current = audio;
        
        audio.onended = () => {
          if (isActive) setIsSpeaking(false);
        };

        await audio.play();
      } catch (error) {
        console.error("Mascot speech error:", error);
        if (isActive) setIsSpeaking(false);
      }
    };

    if (say) {
      speak();
    } else {
      setIsSpeaking(false);
      lastSpokenText.current = null;
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }

    return () => {
      isActive = false;
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [say]);

  // Determine final emotion (Speaking overrides idle/happy etc for mouth movement)
  const currentEmotion = isSpeaking ? 'talking' : emotion;

  // Styles for dynamic classes
  const styles = {
    idle: "animate-[bounce_3s_infinite]",
    happy: "animate-[bounce_0.5s_infinite]",
    // Sympathetic pulsing for 'sad' (mistake)
    sad: "animate-[pulse_3s_infinite]", 
    talking: "animate-[bounce_1s_infinite]", 
    thinking: "animate-pulse",
    surprised: "scale-110",
    salute: "animate-salute",
    // Energetic pumping for celebration
    celebrate: "animate-pump origin-bottom",
  };

  const eyeShape = currentEmotion === 'happy' || currentEmotion === 'celebrate' ? 'scale-y-50' 
                 : currentEmotion === 'sad' ? 'rotate-12 translate-y-1' // Worried eyes
                 : '';
                 
  const mouthShape = currentEmotion === 'happy' ? 'h-6 w-12 rounded-b-full' 
                  : currentEmotion === 'celebrate' ? 'h-8 w-12 rounded-full border-4 border-ocean bg-navy' // Big open mouth
                  : currentEmotion === 'sad' ? 'h-3 w-8 rounded-[4px] mt-4 rotate-3' // Small worried mouth
                  : currentEmotion === 'talking' ? 'h-6 w-10 rounded-full animate-[ping_1s_infinite_reverse]'
                  : 'h-2 w-8 rounded-full';

  // Arm Rotations
  // Celebrate: Arms up in V shape, waving
  // Sad: Arms bent inward (sympathetic/worried)
  const leftArmClass = currentEmotion === 'happy' ? '-rotate-45 origin-top-right translate-y-[-5px]' 
                     : currentEmotion === 'celebrate' ? '-rotate-[130deg] origin-top-right translate-x-[-10px] translate-y-[10px] animate-wave-left'
                     : currentEmotion === 'salute' ? 'rotate-0'
                     : currentEmotion === 'sad' ? 'rotate-[30deg] origin-top-right translate-x-[5px]'
                     : '';

  const rightArmClass = currentEmotion === 'happy' ? 'rotate-45 origin-top-left translate-y-[-5px]' 
                      : currentEmotion === 'celebrate' ? 'rotate-[130deg] origin-top-left translate-x-[10px] translate-y-[10px] animate-wave-right'
                      : currentEmotion === 'salute' ? '-rotate-[120deg] origin-top-left translate-x-[-10px]'
                      : currentEmotion === 'sad' ? '-rotate-[30deg] origin-top-left translate-x-[-5px]'
                      : '';

  return (
    <div 
      className={`relative select-none transition-all duration-300 ${styles[currentEmotion]} ${className}`} 
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl overflow-visible">
        {/* Confetti for Celebrate */}
        {currentEmotion === 'celebrate' && (
           <g className="animate-pulse">
              <circle cx="20" cy="20" r="5" fill="#ffd700" className="animate-[ping_1s_infinite]" />
              <circle cx="180" cy="30" r="5" fill="#4cc9f0" className="animate-[ping_1.5s_infinite]" />
              <circle cx="10" cy="100" r="4" fill="#ef476f" className="animate-[ping_1.2s_infinite]" />
              <circle cx="190" cy="90" r="6" fill="#ffd700" className="animate-[ping_0.8s_infinite]" />
              <rect x="50" y="0" width="6" height="6" fill="#4cc9f0" transform="rotate(45)" />
              <rect x="150" y="10" width="6" height="6" fill="#ef476f" transform="rotate(15)" />
           </g>
        )}

        {/* Legs - Dark Navy */}
        <path d="M 60 160 L 60 190 A 10 10 0 0 0 80 190 L 80 160 Z" fill="#0a192f" />
        <path d="M 120 160 L 120 190 A 10 10 0 0 0 140 190 L 140 160 Z" fill="#0a192f" />

        {/* Body - Navy Blue Robot Shape */}
        <rect x="40" y="40" width="120" height="120" rx="30" fill="#112240" stroke="#0a192f" strokeWidth="4" />
        
        {/* Chest Plate - Lighter Navy */}
        <rect x="60" y="100" width="80" height="50" rx="10" fill="#233554" />
        
        {/* Anchor Insignia (Gold) */}
        <path d="M 100 110 L 100 135 M 90 125 A 10 10 0 0 0 110 125" stroke="#ffd700" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="100" cy="108" r="3" fill="#ffd700" />

        {/* Screen/Face Area - Dark Screen */}
        <rect x="50" y="50" width="100" height="40" rx="10" fill="#0a192f" />

        {/* Eyes (Digital Blue) */}
        <g className={`transition-transform duration-300 origin-center ${eyeShape}`}>
           <circle cx="75" cy="70" r="8" fill="#4cc9f0" className={currentEmotion === 'sad' ? 'opacity-80' : 'animate-pulse'} />
           <circle cx="125" cy="70" r="8" fill="#4cc9f0" className={currentEmotion === 'sad' ? 'opacity-80' : 'animate-pulse'} />
           {currentEmotion === 'sad' && (
              // Eyebrows for sad/sympathetic face
              <>
                 <path d="M 65 60 L 85 65" stroke="#4cc9f0" strokeWidth="2" strokeLinecap="round" />
                 <path d="M 115 65 L 135 60" stroke="#4cc9f0" strokeWidth="2" strokeLinecap="round" />
              </>
           )}
        </g>

        {/* Mouth (Digital Line) */}
        <foreignObject x="50" y="150" width="100" height="40">
           <div className="w-full h-full flex items-center justify-center">
              <div className={`bg-ocean ${mouthShape} transition-all duration-200 shadow-[0_0_10px_#4cc9f0]`}></div>
           </div>
        </foreignObject>

        {/* Robot Antenna */}
        <line x1="100" y1="40" x2="100" y2="20" stroke="#0a192f" strokeWidth="4" />
        <circle cx="100" cy="15" r="8" fill="#ffd700" className={currentEmotion === 'thinking' ? 'animate-ping' : ''} />

        {/* Arms */}
        <rect x="20" y="80" width="20" height="60" rx="10" fill="#112240" className={`transition-transform duration-300 ${leftArmClass}`} />
        <rect x="160" y="80" width="20" height="60" rx="10" fill="#112240" className={`transition-transform duration-300 ${rightArmClass}`} />

      </svg>
      
      {/* Speech Bubble */}
      {currentEmotion === 'thinking' && (
        <div className="absolute -top-4 -right-8 text-4xl animate-bounce">
            💭
        </div>
      )}
      
      {/* Sweat drop for sad/sympathetic */}
      {currentEmotion === 'sad' && (
          <div className="absolute top-10 right-10 text-2xl animate-bounce text-ocean opacity-80">
              💧
          </div>
      )}
    </div>
  );
};
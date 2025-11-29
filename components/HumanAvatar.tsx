import React from 'react';
import { AvatarConfig } from '../types';

interface HumanAvatarProps {
  config: AvatarConfig;
  className?: string;
  showBackground?: boolean;
}

export const HumanAvatar: React.FC<HumanAvatarProps> = ({ config, className = '', showBackground = true }) => {
  const { 
    backgroundColor, skinColor, hairColor, hairStyle, 
    clothingColor, clothingStyle, glasses, beard, 
    eyeType, mouthType 
  } = config;

  // --- RENDERING HELPERS ---

  const renderBackground = () => {
    if (!showBackground) return null;
    return <rect x="0" y="0" width="100" height="100" fill={backgroundColor} />;
  };

  const renderBody = () => {
    return (
      <g transform="translate(0, 60)">
        {/* Neck Shadow */}
        <ellipse cx="50" cy="5" rx="14" ry="6" fill="rgba(0,0,0,0.1)" />
        
        {/* CLOTHING STYLES */}
        {clothingStyle === 'tshirt' && (
           <path d="M 18 2 C 18 -5, 82 -5, 82 2 C 90 20, 85 40, 85 40 L 15 40 C 15 40, 10 20, 18 2" fill={clothingColor} />
        )}
        
        {clothingStyle === 'tanktop' && (
           <g>
             <path d="M 22 2 C 22 -5, 78 -5, 78 2 C 85 20, 82 40, 82 40 L 18 40 C 18 40, 15 20, 22 2" fill={clothingColor} />
             <path d="M 30 0 L 30 15 A 20 20 0 0 0 70 15 L 70 0" fill={skinColor} />
           </g>
        )}

        {clothingStyle === 'hoodie' && (
           <g>
             <path d="M 15 0 C 15 -8, 85 -8, 85 0 C 92 20, 88 40, 88 40 L 12 40 C 12 40, 8 20, 15 0" fill={clothingColor} />
             <path d="M 50 40 L 50 15" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
             <circle cx="50" cy="15" r="2" fill="rgba(0,0,0,0.2)" />
             <path d="M 35 10 Q 50 25, 65 10" stroke="rgba(0,0,0,0.15)" strokeWidth="2" fill="none" />
           </g>
        )}

        {clothingStyle === 'sweater' && (
           <g>
             <path d="M 15 2 C 15 -5, 85 -5, 85 2 C 92 25, 88 40, 88 40 L 12 40 C 12 40, 8 25, 15 2" fill={clothingColor} />
             {/* Texture lines */}
             <path d="M 20 10 L 80 10 M 18 20 L 82 20 M 16 30 L 84 30" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
           </g>
        )}

        {clothingStyle === 'formal' && (
           <g>
             <path d="M 18 0 C 18 -2, 82 -2, 82 0 C 88 35, 85 40, 85 40 L 15 40 C 15 40, 12 35, 18 0" fill={clothingColor} />
             <path d="M 50 0 L 50 40" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
             {/* Collar */}
             <path d="M 50 8 L 35 0 M 50 8 L 65 0" stroke="white" strokeWidth="3" />
             <path d="M 50 15 L 50 40" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
           </g>
        )}

        {clothingStyle === 'suit' && (
           <g>
             <path d="M 15 0 C 15 -2, 85 -2, 85 0 C 90 35, 88 40, 88 40 L 12 40 C 12 40, 10 35, 15 0" fill={clothingColor} />
             <path d="M 50 0 L 50 40" stroke="white" strokeWidth="8" /> 
             <path d="M 50 0 L 50 40" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
             <path d="M 50 12 L 35 0 M 50 12 L 65 0" stroke={clothingColor} strokeWidth="6" />
             <path d="M 50 5 L 42 15 L 50 25 L 58 15 Z" fill="#d00000" /> {/* Tie */}
           </g>
        )}

        {clothingStyle === 'dress' && (
           <g>
             <path d="M 25 0 C 25 -5, 75 -5, 75 0 C 85 35, 95 40, 95 40 L 5 40 C 5 40, 15 35, 25 0" fill={clothingColor} />
             <path d="M 25 0 Q 50 15, 75 0" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1" />
           </g>
        )}

        {clothingStyle === 'overalls' && (
            <g>
               <path d="M 18 5 C 18 0, 82 0, 82 5 C 90 25, 88 40, 88 40 L 12 40 C 12 40, 10 25, 18 5" fill="white" /> {/* Undershirt */}
               <path d="M 25 40 L 25 15 L 75 15 L 75 40" fill={clothingColor} />
               <rect x="25" y="0" width="8" height="20" fill={clothingColor} />
               <rect x="67" y="0" width="8" height="20" fill={clothingColor} />
               <circle cx="29" cy="15" r="2" fill="gold" />
               <circle cx="71" cy="15" r="2" fill="gold" />
            </g>
        )}

        {clothingStyle === 'superhero' && (
           <g>
              <path d="M 5 5 L 95 5 L 85 40 L 15 40 Z" fill="#ef476f" /> {/* Cape */}
              <path d="M 20 0 C 20 -5, 80 -5, 80 0 C 85 30, 82 40, 82 40 L 18 40 C 18 40, 15 30, 20 0" fill={clothingColor} />
              <path d="M 50 12 L 58 25 L 42 25 Z" fill="#ffd700" />
           </g>
        )}
      </g>
    );
  };

  const renderHead = () => (
    <g transform="translate(50, 42)">
       {/* Neck */}
       <path d="M -15 25 L 15 25 L 15 35 L -15 35 Z" fill={skinColor} />
       
       {/* Head Shape - slightly squarer/rounder hybrid */}
       <path d="M -26 -24 C -26 -44, 26 -44, 26 -24 C 26 12, 22 26, 0 26 C -22 26, -26 12, -26 -24" fill={skinColor} />
       
       {/* Chin Shadow */}
       <path d="M -10 26 Q 0 28, 10 26" stroke="rgba(0,0,0,0.1)" strokeWidth="2" fill="none" strokeLinecap="round" />

       {/* Ears */}
       <path d="M -26 -5 Q -32 -5, -26 5" fill={skinColor} />
       <path d="M 26 -5 Q 32 -5, 26 5" fill={skinColor} />
    </g>
  );

  const renderHairBack = () => {
    return (
      <g transform="translate(50, 42)">
           {hairStyle === 'long' && <path d="M -30 -20 C -35 -45, 35 -45, 30 -20 C 35 30, 40 40, 40 50 L -40 50 C -40 40, -35 30, -30 -20" fill={hairColor} />}
           {hairStyle === 'bob' && <path d="M -28 -20 C -32 -45, 32 -45, 28 -20 C 28 20, 32 25, 32 25 L -32 25 C -32 25, -28 20, -28 -20" fill={hairColor} />}
           {hairStyle === 'afro' && <circle cx="0" cy="-15" r="38" fill={hairColor} />}
           {hairStyle === 'ponytail' && (
              <g>
                 <circle cx="-25" cy="0" r="10" fill={hairColor} />
                 <path d="M -25 0 Q -40 20, -30 40" stroke={hairColor} strokeWidth="12" strokeLinecap="round" fill="none"/>
              </g>
           )}
           {hairStyle === 'braids' && (
              <g>
                 <path d="M -28 10 Q -35 30, -30 50" stroke={hairColor} strokeWidth="8" strokeLinecap="round" strokeDasharray="1 4" fill="none"/>
                 <path d="M 28 10 Q 35 30, 30 50" stroke={hairColor} strokeWidth="8" strokeLinecap="round" strokeDasharray="1 4" fill="none"/>
              </g>
           )}
      </g>
    );
  };

  const renderHairFront = () => {
    return (
      <g transform="translate(50, 42)">
         {/* Hair Highlights */}
         <defs>
            <radialGradient id="hairShine" cx="50%" cy="0%" r="50%" fx="50%" fy="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
         </defs>

         {hairStyle === 'short' && (
             <path d="M -26 -24 C -26 -48, 26 -48, 26 -24 C 26 -20, 26 -10, 15 -28 C 0 -18, -15 -28, -26 -24" fill={hairColor} />
         )}
         
         {hairStyle === 'spiky' && (
             <path d="M -26 -24 L -20 -50 L -10 -35 L 0 -55 L 10 -35 L 20 -50 L 26 -24 Z" fill={hairColor} />
         )}
         
         {hairStyle === 'curly' && (
             <g fill={hairColor}>
                 <circle cx="-20" cy="-35" r="8" />
                 <circle cx="-5" cy="-40" r="9" />
                 <circle cx="10" cy="-38" r="8" />
                 <circle cx="22" cy="-30" r="7" />
                 <circle cx="28" cy="-15" r="6" />
                 <circle cx="-28" cy="-15" r="6" />
             </g>
         )}

         {hairStyle === 'punk' && <path d="M -5 -35 L 0 -60 L 5 -35 C 12 -35, 24 -24, 26 -24 L -26 -24 C -24 -24, -12 -35, -5 -35" fill={hairColor} />}
         
         {hairStyle === 'buns' && (
           <>
             <circle cx="-28" cy="-32" r="10" fill={hairColor} />
             <circle cx="28" cy="-32" r="10" fill={hairColor} />
             <path d="M -26 -24 C -26 -45, 26 -45, 26 -24 L -26 -24" fill={hairColor} />
           </>
         )}
         
         {(hairStyle === 'long' || hairStyle === 'bob' || hairStyle === 'ponytail' || hairStyle === 'braids') && (
            <path d="M -26 -24 C -26 -45, 26 -45, 26 -24 L 20 -24 C 20 -28, 0 -34, -20 -24 Z" fill={hairColor} />
         )}
         
         {hairStyle === 'afro' && (
            <path d="M -26 -24 C -26 -40, 26 -40, 26 -24 L -26 -24" fill={hairColor} />
         )}

         {/* Shine overlay */}
         {hairStyle !== 'bald' && <ellipse cx="0" cy="-35" rx="20" ry="10" fill="url(#hairShine)" />}
      </g>
    );
  };

  const renderFeatures = () => (
    <g transform="translate(50, 42)">
       {/* Eyes Group */}
       <g fill="#1a1a1a">
          {eyeType === 'default' && (
             <>
               <ellipse cx="-10" cy="-2" rx="3.5" ry="4.5" />
               <ellipse cx="10" cy="-2" rx="3.5" ry="4.5" />
               <circle cx="-9" cy="-3" r="1.2" fill="white" />
               <circle cx="11" cy="-3" r="1.2" fill="white" />
             </>
          )}
          {eyeType === 'happy' && (
             <g stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round">
                <path d="M -15 -2 Q -10 -8, -5 -2" />
                <path d="M 5 -2 Q 10 -8, 15 -2" />
             </g>
          )}
          {eyeType === 'wink' && (
             <>
               <ellipse cx="-10" cy="-2" rx="3.5" ry="4.5" />
               <path d="M 5 -2 Q 10 -8, 15 -2" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
             </>
          )}
          {eyeType === 'sleepy' && (
              <g stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round">
                 <path d="M -15 -2 L -5 -2" />
                 <path d="M 5 -2 L 15 -2" />
              </g>
          )}
          {eyeType === 'wide' && (
             <>
               <circle cx="-10" cy="-2" r="4.5" />
               <circle cx="10" cy="-2" r="4.5" />
               <circle cx="-10" cy="-2" r="2" fill="white" />
               <circle cx="10" cy="-2" r="2" fill="white" />
             </>
          )}
          {eyeType === 'lashes' && (
             <g>
               <ellipse cx="-10" cy="-2" rx="3.5" ry="4.5" />
               <ellipse cx="10" cy="-2" rx="3.5" ry="4.5" />
               <path d="M -14 -4 L -16 -7 M -10 -6 L -10 -9 M -6 -4 L -4 -7" stroke="#1a1a1a" strokeWidth="1.5" />
               <path d="M 14 -4 L 16 -7 M 10 -6 L 10 -9 M 6 -4 L 4 -7" stroke="#1a1a1a" strokeWidth="1.5" />
             </g>
          )}
          {eyeType === 'angry' && (
             <g>
               <path d="M -14 -6 L -5 -2" stroke="#1a1a1a" strokeWidth="2" />
               <path d="M 14 -6 L 5 -2" stroke="#1a1a1a" strokeWidth="2" />
               <circle cx="-10" cy="-1" r="3" />
               <circle cx="10" cy="-1" r="3" />
             </g>
          )}
       </g>

       {/* Beard */}
       {beard && (
          <path d="M -14 10 Q 0 24, 14 10 L 14 2 Q 0 12, -14 2 Z" fill={hairColor} />
       )}

       {/* Mouth */}
       <g transform="translate(0, 12)">
           {mouthType === 'smile' && (
              <path d="M -7 0 Q 0 7, 7 0" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
           )}
           {mouthType === 'neutral' && (
              <line x1="-5" y1="0" x2="5" y2="0" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" />
           )}
           {mouthType === 'open' && (
              <ellipse cx="0" cy="0" rx="4" ry="5" fill="#5c2a2a" />
           )}
           {mouthType === 'frown' && (
              <path d="M -7 4 Q 0 -3, 7 4" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
           )}
           {mouthType === 'tongue' && (
              <g>
                <path d="M -7 0 Q 0 7, 7 0" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M -3 3 Q 0 8, 3 3" fill="#ff5d8f" />
              </g>
           )}
           {mouthType === 'teeth' && (
               <rect x="-6" y="-3" width="12" height="6" rx="2" fill="white" stroke="#1a1a1a" strokeWidth="1.5" />
           )}
           {mouthType === 'smirk' && (
               <path d="M -7 0 Q 0 2, 7 -2" stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
           )}
       </g>

       {/* Glasses / Accessories */}
       {glasses === 'round' && (
          <g stroke="#1a1a1a" strokeWidth="2" fill="rgba(255,255,255,0.4)">
             <circle cx="-10" cy="-2" r="6" />
             <circle cx="10" cy="-2" r="6" />
             <line x1="-4" y1="-2" x2="4" y2="-2" />
          </g>
       )}
       {glasses === 'square' && (
          <g stroke="#1a1a1a" strokeWidth="2" fill="rgba(255,255,255,0.4)">
             <rect x="-16" y="-7" width="12" height="10" rx="2" />
             <rect x="4" y="-7" width="12" height="10" rx="2" />
             <line x1="-4" y1="-2" x2="4" y2="-2" />
          </g>
       )}
       {glasses === 'catEye' && (
          <g stroke="#1a1a1a" strokeWidth="2" fill="rgba(200,0,0,0.1)">
             <path d="M -4 -2 L -16 -2 Q -18 -8, -6 -2 Z" />
             <path d="M 4 -2 L 16 -2 Q 18 -8, 6 -2 Z" />
             <line x1="-4" y1="-2" x2="4" y2="-2" />
          </g>
       )}
       {glasses === 'sunglasses' && (
          <g fill="#1a1a1a">
             <path d="M -17 -6 L -3 -6 L -5 5 L -15 5 Z" />
             <path d="M 3 -6 L 17 -6 L 15 5 L 5 5 Z" />
             <line x1="-3" y1="-5" x2="3" y2="-5" stroke="#1a1a1a" strokeWidth="2.5" />
          </g>
       )}
       {glasses === 'mask' && (
           <g>
              <rect x="-20" y="0" width="40" height="24" rx="5" fill="#ffffff" stroke="#e0e0e0" strokeWidth="1" />
              <line x1="-20" y1="5" x2="-25" y2="0" stroke="#e0e0e0" strokeWidth="1" />
              <line x1="20" y1="5" x2="25" y2="0" stroke="#e0e0e0" strokeWidth="1" />
           </g>
       )}
       {glasses === 'eyepatch' && (
           <g>
              <path d="M -16 -8 L 0 -2" stroke="#1a1a1a" strokeWidth="1.5" />
              <circle cx="-10" cy="-2" r="6" fill="#1a1a1a" />
           </g>
       )}
    </g>
  );

  return (
    <div className={`overflow-hidden ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {renderBackground()}
        {renderHairBack()}
        {renderBody()}
        {renderHead()}
        {renderFeatures()}
        {renderHairFront()}
      </svg>
    </div>
  );
};
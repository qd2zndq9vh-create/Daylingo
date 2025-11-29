import React, { useState } from 'react';
import { UserState, LanguageProgress, AvatarConfig } from '../types';
import { Button } from './Button';
import { Edit2, Save, Calendar, Zap, Shield, Sparkles, Shuffle, Check } from 'lucide-react';
import { HumanAvatar } from './HumanAvatar';

interface ProfileSectionProps {
  user: UserState;
  onUpdateProfile: (name: string, avatar: string | AvatarConfig) => void;
}

// --- DATA ---
const BG_COLORS = ['#4cc9f0', '#ef476f', '#ffd700', '#06d6a0', '#118ab2', '#7209b7', '#f72585', '#2b2d42', '#8d99ae'];
const SKIN_COLORS = ['#f8d9ce', '#f0c0b4', '#e0ac69', '#8d5524', '#3b2219', '#ffcc99', '#7e4d36', '#49372a', '#ffad60'];
const HAIR_COLORS = ['#090806', '#4a3b32', '#a56b46', '#e6cea8', '#b55239', '#e84e4e', '#88ccff', '#dddddd', '#2c6e49', '#ff006e'];
const CLOTHING_COLORS = ['#1B2A4A', '#4cc9f0', '#ffd700', '#ef476f', '#06d6a0', '#118ab2', '#333333', '#ffffff', '#ff9f1c', '#9d4edd'];

const DEFAULT_AVATAR: AvatarConfig = {
  type: 'human',
  backgroundColor: '#4cc9f0',
  skinColor: '#f0c0b4',
  hairStyle: 'short',
  hairColor: '#4a3b32',
  clothingStyle: 'tshirt',
  clothingColor: '#1B2A4A',
  glasses: 'none',
  beard: false,
  eyeType: 'default',
  mouthType: 'smile'
};

const OPTIONS = {
  hairStyle: ['short', 'long', 'bob', 'punk', 'afro', 'buns', 'bald', 'curly', 'spiky', 'braids', 'ponytail'],
  clothingStyle: ['tshirt', 'hoodie', 'formal', 'dress', 'superhero', 'tanktop', 'suit', 'overalls', 'sweater'],
  eyeType: ['default', 'happy', 'wink', 'sleepy', 'wide', 'lashes', 'angry'],
  mouthType: ['smile', 'neutral', 'open', 'tongue', 'frown', 'teeth', 'smirk'],
  glasses: ['none', 'round', 'square', 'sunglasses', 'catEye', 'mask', 'eyepatch']
};

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  
  const [tempAvatar, setTempAvatar] = useState<AvatarConfig>(() => {
    if (typeof user.avatar === 'object') return user.avatar as AvatarConfig;
    return DEFAULT_AVATAR;
  });

  const [activeCategory, setActiveCategory] = useState<'skin'|'hair'|'face'|'style'>('skin');

  const updateAvatar = (key: keyof AvatarConfig, value: any) => {
    setTempAvatar(prev => ({ ...prev, [key]: value }));
  };

  const randomizeAvatar = () => {
    const randomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    setTempAvatar({
      type: 'human',
      backgroundColor: randomItem(BG_COLORS),
      skinColor: randomItem(SKIN_COLORS),
      hairStyle: randomItem(OPTIONS.hairStyle),
      hairColor: randomItem(HAIR_COLORS),
      clothingStyle: randomItem(OPTIONS.clothingStyle),
      clothingColor: randomItem(CLOTHING_COLORS),
      glasses: Math.random() > 0.7 ? randomItem(OPTIONS.glasses) : 'none',
      beard: Math.random() > 0.8,
      eyeType: randomItem(OPTIONS.eyeType),
      mouthType: randomItem(OPTIONS.mouthType)
    });
  };

  const handleSave = () => {
    onUpdateProfile(tempName, tempAvatar);
    setIsEditing(false);
  };

  const totalXP = (Object.values(user.progress) as LanguageProgress[]).reduce((acc, curr) => acc + curr.xp, 0);

  // --- EDITOR SUB-COMPONENTS ---
  
  const ColorPicker = ({ colors, selected, onChange }: { colors: string[], selected: string, onChange: (c: string) => void }) => (
    <div className="flex gap-3 overflow-x-auto pb-4 px-1 custom-scrollbar">
       {colors.map(c => (
         <button 
           key={c} 
           onClick={() => onChange(c)} 
           className={`w-10 h-10 rounded-full shrink-0 border-4 transition-all ${selected === c ? 'border-navy scale-110 shadow-md' : 'border-transparent hover:scale-105 shadow-sm'}`} 
           style={{ backgroundColor: c }} 
         />
       ))}
    </div>
  );

  const GridSelector = ({ items, current, onSelect, renderItem }: { items: string[], current: any, onSelect: (i: any) => void, renderItem: (i: any) => React.ReactNode }) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
       {items.map(item => (
         <button
           key={item}
           onClick={() => onSelect(item)}
           className={`aspect-square rounded-2xl border-2 flex items-center justify-center transition-all bg-white overflow-hidden relative ${current === item ? 'border-ocean bg-ocean/10 shadow-inner' : 'border-slate-light/20 hover:border-slate-light hover:shadow-sm'}`}
         >
            {renderItem(item)}
         </button>
       ))}
    </div>
  );

  const renderContent = () => {
     switch(activeCategory) {
        case 'skin':
           return (
             <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate uppercase text-xs mb-2">Tono de Piel</h3>
                  <ColorPicker colors={SKIN_COLORS} selected={tempAvatar.skinColor} onChange={(c) => updateAvatar('skinColor', c)} />
                </div>
                <div>
                  <h3 className="font-bold text-slate uppercase text-xs mb-2">Color de Fondo</h3>
                  <ColorPicker colors={BG_COLORS} selected={tempAvatar.backgroundColor} onChange={(c) => updateAvatar('backgroundColor', c)} />
                </div>
             </div>
           );
        case 'hair':
           return (
             <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate uppercase text-xs mb-2">Color de Pelo</h3>
                  <ColorPicker colors={HAIR_COLORS} selected={tempAvatar.hairColor} onChange={(c) => updateAvatar('hairColor', c)} />
                </div>
                <div>
                  <h3 className="font-bold text-slate uppercase text-xs mb-2">Estilo</h3>
                  <GridSelector 
                     items={OPTIONS.hairStyle} 
                     current={tempAvatar.hairStyle} 
                     onSelect={(s) => updateAvatar('hairStyle', s)}
                     renderItem={(s) => <HumanAvatar config={{...tempAvatar, hairStyle: s, backgroundColor: 'transparent'}} showBackground={false} className="w-16 h-16" />} 
                  />
                </div>
             </div>
           );
        case 'face':
           return (
             <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate uppercase text-xs mb-2">Ojos</h3>
                  <GridSelector 
                     items={OPTIONS.eyeType} 
                     current={tempAvatar.eyeType} 
                     onSelect={(s) => updateAvatar('eyeType', s)}
                     renderItem={(s) => <HumanAvatar config={{...tempAvatar, eyeType: s, glasses: 'none', backgroundColor: 'transparent'}} showBackground={false} className="w-16 h-16 scale-150 origin-bottom" />} 
                  />
                </div>
                <div>
                  <h3 className="font-bold text-slate uppercase text-xs mb-2">Boca</h3>
                  <GridSelector 
                     items={OPTIONS.mouthType} 
                     current={tempAvatar.mouthType} 
                     onSelect={(s) => updateAvatar('mouthType', s)}
                     renderItem={(s) => <HumanAvatar config={{...tempAvatar, mouthType: s, backgroundColor: 'transparent'}} showBackground={false} className="w-16 h-16 scale-150 origin-top" />} 
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-slate-light/20 shadow-sm">
                    <span className="font-bold text-navy">Barba / Vello Facial</span>
                    <button onClick={() => updateAvatar('beard', !tempAvatar.beard)} className={`w-14 h-8 rounded-full transition-colors relative ${tempAvatar.beard ? 'bg-ocean' : 'bg-slate-light'}`}>
                        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${tempAvatar.beard ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
             </div>
           );
        case 'style':
           return (
             <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-slate uppercase text-xs mb-2">Color Ropa</h3>
                  <ColorPicker colors={CLOTHING_COLORS} selected={tempAvatar.clothingColor} onChange={(c) => updateAvatar('clothingColor', c)} />
                </div>
                <div>
                   <h3 className="font-bold text-slate uppercase text-xs mb-2">Atuendo</h3>
                   <GridSelector 
                      items={OPTIONS.clothingStyle} 
                      current={tempAvatar.clothingStyle} 
                      onSelect={(s) => updateAvatar('clothingStyle', s)}
                      renderItem={(s) => <HumanAvatar config={{...tempAvatar, clothingStyle: s, backgroundColor: 'transparent'}} showBackground={false} className="w-16 h-16" />} 
                   />
                </div>
                <div>
                  <h3 className="font-bold text-slate uppercase text-xs mb-2">Accesorios</h3>
                  <GridSelector 
                     items={OPTIONS.glasses} 
                     current={tempAvatar.glasses} 
                     onSelect={(s) => updateAvatar('glasses', s)}
                     renderItem={(s) => <HumanAvatar config={{...tempAvatar, glasses: s, backgroundColor: 'transparent'}} showBackground={false} className="w-16 h-16 scale-150 origin-bottom" />} 
                  />
                </div>
             </div>
           );
        default: return null;
     }
  };

  const CategoryTab = ({ id, label, active }: { id: typeof activeCategory, label: string, active: boolean }) => (
    <button 
      onClick={() => setActiveCategory(id)}
      className={`flex-1 py-3 text-xs sm:text-sm font-black uppercase tracking-wide border-b-4 transition-colors ${active ? 'border-ocean text-ocean bg-ocean/5' : 'border-transparent text-slate hover:bg-slate-lighter'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto animate-in slide-in-from-right-4 duration-300 pb-24">
      
      {!isEditing ? (
        // --- VIEW MODE ---
        <div className="p-6 flex flex-col items-center">
            <div className="w-full bg-white rounded-3xl shadow-lg border-b-4 border-slate-light/20 p-6 flex flex-col items-center relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-32 bg-navy opacity-5" />
                <div className="absolute top-0 right-0 w-20 h-20 bg-ocean opacity-10 rounded-bl-full" />
                
                <div className="w-40 h-40 rounded-3xl overflow-hidden mb-4 shadow-xl border-4 border-white transform hover:scale-105 transition-transform cursor-pointer relative z-10" onClick={() => setIsEditing(true)}>
                    {typeof user.avatar === 'object' ? (
                        <HumanAvatar config={user.avatar as AvatarConfig} className="w-full h-full" />
                    ) : (
                        <div className="w-full h-full bg-ocean flex items-center justify-center text-6xl">{user.avatar}</div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-sm">
                        <Edit2 className="w-4 h-4 text-navy" />
                    </div>
                </div>

                <h2 className="text-3xl font-black text-navy mb-1 tracking-tight">{user.name}</h2>
                <p className="text-slate font-bold uppercase text-xs tracking-widest mb-6 bg-slate-lighter px-3 py-1 rounded-full">Estudiante desde 2024</p>

                <div className="w-full grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-lighter/30 p-3 rounded-2xl border border-slate-light/20 flex flex-col items-center">
                        <Zap className="w-6 h-6 text-gold mb-1 fill-current" />
                        <span className="font-black text-navy text-2xl">{totalXP}</span>
                        <span className="text-xs font-bold text-slate uppercase">XP Total</span>
                    </div>
                    <div className="bg-slate-lighter/30 p-3 rounded-2xl border border-slate-light/20 flex flex-col items-center">
                        <Calendar className="w-6 h-6 text-ocean mb-1 fill-current" />
                        <span className="font-black text-navy text-2xl">{user.streak}</span>
                        <span className="text-xs font-bold text-slate uppercase">Racha</span>
                    </div>
                    <div className="col-span-2 bg-gradient-to-r from-navy to-navy-light p-4 rounded-2xl border-b-4 border-navy-dark flex items-center justify-between px-6 shadow-md text-white">
                         <div className="flex flex-col">
                             <span className="text-xs font-bold opacity-80 uppercase">División Actual</span>
                             <span className="font-black text-2xl tracking-wide">{user.league}</span>
                         </div>
                         <Shield className="w-10 h-10 text-gold fill-current" />
                    </div>
                </div>

                <Button fullWidth onClick={() => setIsEditing(true)}>
                    EDITAR PERFIL
                </Button>
            </div>
        </div>
      ) : (
        // --- EDIT MODE ---
        <div className="flex flex-col h-full bg-white">
            {/* Top Preview Area */}
            <div className="bg-slate-lighter/30 p-6 flex flex-col items-center justify-center border-b border-slate-light/20 shrink-0">
                <div className="w-48 h-48 rounded-3xl shadow-xl overflow-hidden border-4 border-white mb-6">
                    <HumanAvatar config={tempAvatar} className="w-full h-full" />
                </div>
                <div className="flex gap-3 w-full max-w-xs">
                    <button onClick={randomizeAvatar} className="p-3.5 rounded-2xl bg-white border-b-4 border-slate-light/20 text-ocean hover:bg-ocean/5 transition-colors shadow-sm active:border-b-0 active:translate-y-1">
                        <Shuffle className="w-6 h-6" />
                    </button>
                    <input 
                       value={tempName}
                       onChange={(e) => setTempName(e.target.value)}
                       className="flex-1 bg-white border-2 border-slate-light/20 rounded-2xl px-4 font-black text-navy text-center focus:border-ocean outline-none text-lg shadow-inner"
                       placeholder="Nombre"
                    />
                </div>
            </div>

            {/* Categories */}
            <div className="flex border-b border-slate-light/20 bg-white shadow-sm z-10">
                <CategoryTab id="skin" label="Cuerpo" active={activeCategory === 'skin'} />
                <CategoryTab id="hair" label="Pelo" active={activeCategory === 'hair'} />
                <CategoryTab id="face" label="Cara" active={activeCategory === 'face'} />
                <CategoryTab id="style" label="Ropa" active={activeCategory === 'style'} />
            </div>

            {/* Options Grid */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-lighter/10">
                {renderContent()}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-light/20 bg-white flex gap-3 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-20">
                <Button variant="ghost" fullWidth onClick={() => setIsEditing(false)}>CANCELAR</Button>
                <Button variant="primary" fullWidth onClick={handleSave}><Check className="w-5 h-5 mr-2" /> GUARDAR</Button>
            </div>
        </div>
      )}
    </div>
  );
};
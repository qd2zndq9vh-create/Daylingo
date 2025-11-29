export enum ExerciseType {
  TRANSLATE_TO_TARGET = 'TRANSLATE_TO_TARGET',
  TRANSLATE_TO_SOURCE = 'TRANSLATE_TO_SOURCE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  LISTENING = 'LISTENING',
  PRONUNCIATION = 'PRONUNCIATION',
  MATCHING = 'MATCHING',
  CHESS_PUZZLE = 'CHESS_PUZZLE'
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  correctAnswer: string;
  options?: string[]; 
  pairs?: { source: string; target: string }[];
  audioData?: string; 
  tip?: string;
  fen?: string; // For Chess
  correctMove?: string; // For Chess
}

export interface Lesson {
  id: string;
  title: string;
  topic: string;
  description: string;
  color: string;
  completed: boolean;
  locked: boolean;
}

export interface LanguageProgress {
  xp: number;
  completedLessonIds: string[];
  currentUnit: number;
}

export interface AvatarConfig {
  type: 'human';
  backgroundColor: string;
  skinColor: string;
  hairStyle: 'short' | 'long' | 'bob' | 'punk' | 'bald' | 'afro' | 'buns' | 'curly' | 'spiky' | 'braids' | 'ponytail';
  hairColor: string;
  clothingStyle: 'tshirt' | 'hoodie' | 'formal' | 'dress' | 'superhero' | 'tanktop' | 'suit' | 'overalls' | 'sweater';
  clothingColor: string;
  glasses: 'none' | 'round' | 'square' | 'sunglasses' | 'catEye' | 'mask' | 'eyepatch';
  beard: boolean;
  eyeType: 'default' | 'happy' | 'wink' | 'sleepy' | 'wide' | 'lashes' | 'angry';
  mouthType: 'smile' | 'neutral' | 'open' | 'tongue' | 'frown' | 'teeth' | 'smirk';
}

export interface UserState {
  // Profile
  name: string;
  avatar: string | AvatarConfig; // Can be an emoji string OR a config object
  
  // Economy
  hearts: number;
  streak: number;
  gems: number;
  
  // Learning
  currentLanguage: string; 
  sourceLanguage: string; 
  progress: Record<string, LanguageProgress>; 
  weakWords: string[]; 
  lastLessonDate: string; 
  nextHeartRefillAt?: number;
  
  // Meta
  league: 'Bronce' | 'Plata' | 'Oro' | 'Diamante';
  completedDailyChallenges: number[]; // IDs of challenges completed today
}

export interface LessonResponse {
  exercises: {
    type: string;
    question: string;
    correctAnswer: string;
    options: string[];
    pairs?: { source: string; target: string }[];
    tip?: string;
    fen?: string;
    correctMove?: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  audioUrl?: string;
  imageUrl?: string;
}

export type MascotEmotion = 'idle' | 'happy' | 'sad' | 'talking' | 'thinking' | 'surprised' | 'salute' | 'celebrate';
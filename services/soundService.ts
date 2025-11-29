
export type SoundType = 'correct' | 'incorrect' | 'complete' | 'heartLost' | 'heartGain' | 'select';

const SOUND_URLS: Record<SoundType, string> = {
  correct: 'https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3',
  incorrect: 'https://codeskulptor-demos.commondatastorage.googleapis.com/ui/miss.ogg', // Softer error sound
  complete: 'https://codeskulptor-demos.commondatastorage.googleapis.com/ui/intro.ogg', // Victory jingle
  heartLost: 'https://codeskulptor-demos.commondatastorage.googleapis.com/ui/beep_error.mp3',
  heartGain: 'https://codeskulptor-demos.commondatastorage.googleapis.com/ui/coin_pickup.mp3',
  select: 'https://codeskulptor-demos.commondatastorage.googleapis.com/ui/button_click.mp3'
};

export const playSound = (type: SoundType) => {
  try {
    const audio = new Audio(SOUND_URLS[type]);
    audio.volume = 0.4; // Keep it subtle
    audio.play().catch(e => {
      // User hasn't interacted with document yet, or audio blocked
      console.warn("Audio play blocked", e);
    });
  } catch (e) {
    console.error("Audio error", e);
  }
};

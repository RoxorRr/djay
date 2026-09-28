export type Language = 'en' | 'sk';

export type DeckId = 'DECK A' | 'DECK B';

export type DJPersonaType = 'hype_mc' | 'radio_smooth' | 'techno_shaman' | 'sarcastic_host';

export type PartySituationType =
  | 'cake'
  | 'spill'
  | 'hype'
  | 'dance_battle'
  | 'toast'
  | 'closing'
  | 'lost_item'
  | 'shot_time'
  | 'custom';

export interface CuePoint {
  id: number;
  time: number; // in seconds
  color: string;
}

export interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre: string;
  bpm: number;
  key?: string;
  year?: string;
  duration: number; // in seconds
  facts: string[];
  djIntro: string;
  djOutro?: string;
  audioUrl: string;
  fileName?: string;
  isDemo?: boolean;
}

export interface PartyCommentaryResult {
  speechText: string;
  crowdAction: string;
  soundFx: string;
  vibeEmoji?: string;
}

export interface VoiceSettings {
  provider: 'auto' | 'speechify' | 'gemini_tts' | 'browser';
  speechifyApiKey: string;
  speechifyVoice: string;
  geminiVoice: 'Puck' | 'Kore' | 'Fenrir' | 'Zephyr';
  duckingAmount: number; // 0 to 1 (e.g. 0.8 means drop volume by 80%)
  speechRate: number; // 0.8 - 1.2
}

export interface SoundFxDefinition {
  id: string;
  name: string;
  nameSk: string;
  icon: string;
  color: string;
}

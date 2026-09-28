import {
  TrackMetadata,
  Language,
  DJPersonaType,
  PartySituationType,
  PartyCommentaryResult,
  VoiceSettings,
} from '../types';
import { audioEngine } from './audioEngine';

export interface IdentifyTrackParams {
  filename: string;
  hintTitle?: string;
  hintArtist?: string;
  language: Language;
  vibe?: string;
}

export async function identifyTrack(params: IdentifyTrackParams): Promise<Partial<TrackMetadata>> {
  try {
    const res = await fetch('/api/track/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Track identification fallback:', err);
    // Sensible fallback if backend unavailable
    const cleanName = params.filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const parts = cleanName.split(' - ');
    const artist = parts.length > 1 ? parts[0].trim() : 'Unknown Artist';
    const title = parts.length > 1 ? parts[1].trim() : cleanName;

    const isSk = params.language === 'sk';

    return {
      title,
      artist,
      genre: 'Party Anthem',
      bpm: 128,
      key: '8A / Am',
      year: '2025',
      facts: isSk
        ? [
            'Skladba bola nahraná na mobilný DJ pult s automatickou detekciou tempa.',
            'Energický rytmus s ideálnym klubovým tempom 128 BPM na rozprúdenie párty.',
            'Skvelý prechodový track na prepojenie s druhým mobilom.',
          ]
        : [
            'Loaded directly from mobile storage with dynamic tempo analysis.',
            'Features punchy 128 BPM dance-floor energy to elevate the party vibe.',
            'Optimized for single-deck performance and cross-phone handovers.',
          ],
      djIntro: isSk
        ? `Pozor všetci na parkete! Odpaľujeme pecku ${title} od ${artist}! Ruky hore!`
        : `Alright party people, turn it up loud for ${title} by ${artist}! Let's go!`,
      djOutro: isSk
        ? `To bola pecka ${title}! Pripravte sa na ďalší drop z druhého mobilu!`
        : `That was ${title}! Getting ready to hand over the beat to Deck B!`,
    };
  }
}

export interface PartyCommentaryParams {
  situation: PartySituationType;
  customNote?: string;
  persona: DJPersonaType;
  currentTrack: { title: string; artist: string };
  language: Language;
  deckName: string;
}

export async function generatePartyCommentary(
  params: PartyCommentaryParams
): Promise<PartyCommentaryResult> {
  try {
    const res = await fetch('/api/party/commentary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Party commentary fallback:', err);
    const isSk = params.language === 'sk';

    const fallbacks: Record<PartySituationType, { speech: string; action: string; sfx: string }> = {
      cake: {
        speech: isSk
          ? 'Pozor pozóóór, prichádza torta! Všetci ruky hore pre nášho oslávenca, dnes večer to tu oslávime vo veľkom štýle!'
          : 'Attention party people! The birthday cake has arrived! Put your hands up and let’s make some noise for the birthday legend!',
        action: isSk ? 'Spievať & Tlieskať!' : 'Cheer & Sing!',
        sfx: 'airhorn',
      },
      spill: {
        speech: isSk
          ? 'Pozor na parkete, niekto tam nechtiac vylial drink! Dávajte si pozor na nohy, servítky už letia, ale párty nezastavujeme!'
          : 'Watch your step on the dance floor, team! We got a spilled drink in sector one. Keep dancing, watch your footing, napkins inbound!',
        action: isSk ? 'Pozor na nohy!' : 'Watch the floor!',
        sfx: 'scratch',
      },
      hype: {
        speech: isSk
          ? 'Kde je energia, Bratislava? Chcem vidieť všetky ruky vo vzduchu, nikto nesedí pri stole, poďme na parket!'
          : 'Wait a minute, we are not letting this room cool down! Everybody off the couches and right onto the dance floor now!',
        action: isSk ? 'Všetci na parket!' : 'Hands in the air!',
        sfx: 'siren',
      },
      dance_battle: {
        speech: isSk
          ? 'Otvoril sa kruh v strede miestnosti! Máme tu tanečný súboj večera, poďte okolo a vyhecujte ich potleskom!'
          : 'Clear the circle, clear the circle! We have a dance battle popping off right now! Make some room and cheer them on!',
        action: isSk ? 'Utvoriť kruh & hecovať!' : 'Hype the dancers!',
        sfx: 'airhorn',
      },
      toast: {
        speech: isSk
          ? 'Dámy a páni, poháre do vzduchu! Pripíjame na skvelých ľudí, úžasnú atmosféru a noc, na ktorú nezabudneme!'
          : 'Ladies and gentlemen, raise your glasses high! A toast to the host, good friends, and an unforgettable night!',
        action: isSk ? 'Poháre hore!' : 'Glasses up!',
        sfx: 'laser',
      },
      closing: {
        speech: isSk
          ? 'Posledné skladby dnešnej noci! Dajte do toho všetku zostávajúcu energiu, toto je naša záverečná jazda!'
          : 'We are in the final countdown tonight! Leave everything on the dance floor for the last tracks of the night!',
        action: isSk ? 'Záverečný hype!' : 'Last call energy!',
        sfx: 'rewind',
      },
      lost_item: {
        speech: isSk
          ? 'Rýchle hlásenie z DJ pultu: niekto stratil telefón! Ak ti chýba vrecku, príď si poň k pultu!'
          : 'Quick announcement from the DJ booth: someone dropped a phone! If your pocket feels empty, claim it at the booth!',
        action: isSk ? 'Skontrolovať vrecká' : 'Check your pockets',
        sfx: 'scratch',
      },
      shot_time: {
        speech: isSk
          ? 'Barman hlási kolo panákov! Zbehnite sa na bar, pripíjame a pokračujeme v párty!'
          : 'Shots are poured at the bar! Grab your crew, take your drink, and get ready for the next drop!',
        action: isSk ? 'Kolo panákov!' : 'Take your shot!',
        sfx: 'airhorn',
      },
      custom: {
        speech: isSk
          ? `Pozor všetci na párty: ${params.customNote || 'Dnes to tu žije na maximum!'} Ruky hore!`
          : `Listen up party people: ${params.customNote || 'The energy tonight is through the roof!'} Let's go!`,
        action: isSk ? 'Pozor na hlásenie!' : 'Listen up!',
        sfx: 'airhorn',
      },
    };

    const fb = fallbacks[params.situation] || fallbacks.hype;
    return {
      speechText: fb.speech,
      crowdAction: fb.action,
      soundFx: fb.sfx,
      vibeEmoji: '🎉',
    };
  }
}

export async function speakSpeech(
  text: string,
  language: Language,
  settings: VoiceSettings,
  onStart?: () => void,
  onEnd?: () => void
): Promise<void> {
  if (onStart) onStart();

  // If user explicitly configured browser speech
  if (settings.provider === 'browser') {
    audioEngine.speakWithBrowser(text, language, onEnd);
    return;
  }

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        language,
        voice: settings.speechifyApiKey ? settings.speechifyVoice : settings.geminiVoice,
        speechifyApiKey: settings.speechifyApiKey,
      }),
    });

    if (!res.ok) {
      throw new Error(`TTS server error ${res.status}`);
    }

    const data = await res.json();

    if (data.audioBase64) {
      await audioEngine.playTtsAudio(
        data.audioBase64,
        data.mimeType || 'audio/pcm;rate=24000',
        data.sampleRate || 24000
      );
      if (onEnd) onEnd();
    } else {
      // Fallback to browser speech synthesis
      audioEngine.speakWithBrowser(text, language, onEnd);
    }
  } catch (err) {
    console.warn('TTS fetch failed, falling back to browser speech synthesis:', err);
    audioEngine.speakWithBrowser(text, language, onEnd);
  }
}

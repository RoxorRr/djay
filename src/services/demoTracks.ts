import { TrackMetadata } from '../types';

/**
 * Creates high-energy demo party music loops synthesized via Web Audio into downloadable/playable WAV Blobs,
 * guaranteeing instantaneous offline playback without external server asset dependencies.
 */
function createSynthPartyLoop(bpm: number, style: 'house' | 'eurodance' | 'disco'): string {
  const sampleRate = 44100;
  const duration = 15; // 15-second seamless party loop
  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = new Float32Array(totalSamples);
  const beatSec = 60 / bpm;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    const beatTime = t % beatSec;
    const beatIndex = Math.floor(t / beatSec);
    let sample = 0;

    // 1. Four-on-the-floor Kick Drum
    if (beatTime < 0.2) {
      const kickFreq = 140 * Math.exp(-beatTime * 32);
      const kickEnv = Math.exp(-beatTime * 14);
      sample += Math.sin(2 * Math.PI * kickFreq * beatTime) * kickEnv * 0.75;
    }

    // 2. Offbeat Hi-Hat
    const offbeatTime = (t + beatSec / 2) % beatSec;
    if (offbeatTime < 0.1) {
      const noise = Math.random() * 2 - 1;
      const hatEnv = Math.exp(-offbeatTime * 40);
      sample += noise * hatEnv * 0.2;
    }

    // 3. Clap on beats 2 and 4
    if (beatIndex % 2 === 1 && beatTime < 0.15) {
      const clapNoise = (Math.random() * 2 - 1) * Math.exp(-beatTime * 25);
      sample += clapNoise * 0.35;
    }

    // 4. Bassline
    const bassNotes = style === 'eurodance' ? [65.4, 73.4, 82.4, 55.0] : [55.0, 65.4, 73.4, 49.0];
    const bassFreq = bassNotes[(Math.floor(t / (beatSec * 4))) % bassNotes.length];
    const sixteenth = (t % (beatSec / 4)) / (beatSec / 4);
    const bassEnv = Math.exp(-sixteenth * 8);
    const bassWave = Math.sin(2 * Math.PI * bassFreq * t) + 0.4 * Math.sin(4 * Math.PI * bassFreq * t);
    sample += bassWave * bassEnv * 0.3;

    // 5. Synth Stabs / Chords
    if (beatIndex % 4 === 0 || beatIndex % 4 === 2.5) {
      const chordT = t % (beatSec * 2);
      if (chordT < 0.3) {
        const chordEnv = Math.exp(-chordT * 6);
        const chord =
          Math.sin(2 * Math.PI * 261.63 * t) +
          Math.sin(2 * Math.PI * 329.63 * t) +
          Math.sin(2 * Math.PI * 392.0 * t);
        sample += chord * chordEnv * 0.15;
      }
    }

    // Clamp
    buffer[i] = Math.max(-1, Math.min(1, sample));
  }

  // Convert Float32Array to 16-bit PCM WAV Blob
  const wavBytes = encodeWAV(buffer, sampleRate);
  const blob = new Blob([wavBytes], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}

export function getDemoTracks(): TrackMetadata[] {
  return [
    {
      id: 'demo-1',
      title: 'Midnight Pulse',
      artist: 'Tech Pulse Collective',
      genre: 'Tech House',
      bpm: 126,
      key: '8A / Am',
      year: '2025',
      duration: 120,
      facts: [
        'Recorded with vintage Roland TR-909 kick drums layered with modular sub-bass.',
        'Became an underground Ibiza anthem during sunrise sets at DC-10.',
        'Features a hypnotic 126 BPM groove specifically engineered to build floor tension.',
      ],
      djIntro:
        'Alright party people, turn it all the way up! We are kicking things into overdrive with Midnight Pulse — feel that bass drop!',
      djOutro: 'That was Midnight Pulse! Handing over the decks for the next explosion of sound!',
      audioUrl: createSynthPartyLoop(126, 'house'),
      isDemo: true,
    },
    {
      id: 'demo-2',
      title: 'Bratislava Nights (Club Mix)',
      artist: 'DJ Dunaj & Tatry Sound',
      genre: 'Eurodance / Slavic Club',
      bpm: 128,
      key: '4A / Fm',
      year: '2024',
      duration: 120,
      facts: [
        'Kombinuje moderný eurodance syntezátor s legendárnym zvukom stredoeurópskych klubov.',
        'Tento track rozprúdil najväčšie párty na brehu Dunaja od Bratislavy až po Košice.',
        'Má dokonalé tempo 128 BPM pre okamžitý skok energie a ruky hore na parkete.',
      ],
      djIntro:
        'Pozor Bratislava a všetci na parkete! Odpaľujeme čistú energiu od DJ Dunaj — ruky hore a ideme na to!',
      djOutro: 'Bratislava Nights práve dohráva, pripravte sa na ďalší drop z druhého mobilu!',
      audioUrl: createSynthPartyLoop(128, 'eurodance'),
      isDemo: true,
    },
    {
      id: 'demo-3',
      title: 'Neon Sunset Groove',
      artist: 'Funk Deluxe',
      genre: 'Nu-Disco / Funk',
      bpm: 120,
      key: '11B / A',
      year: '2024',
      duration: 120,
      facts: [
        'Samples a rare 1979 slap bass groove recorded directly through analog tube preamps.',
        'Certified crowd favorite for bridging early cocktail vibes into prime-time dance fever.',
        '120 BPM tempo allows seamless transitions with classic pop and modern disco edits.',
      ],
      djIntro:
        'Here comes pure sunshine for the soul. Get your groove on with Funk Deluxe and Neon Sunset Groove!',
      djOutro: 'Smooth vibes by Funk Deluxe! Keeping the groove moving as we switch to Deck B!',
      audioUrl: createSynthPartyLoop(120, 'disco'),
      isDemo: true,
    },
  ];
}

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for resilient generateContent with model fallbacks
async function generateContentWithFallback(params: {
  contents: string;
  responseSchema?: any;
}) {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastErr: any = null;

  for (const model of models) {
    try {
      const config: any = {
        responseMimeType: 'application/json',
      };
      if (params.responseSchema) {
        config.responseSchema = params.responseSchema;
      }

      const res = await ai.models.generateContent({
        model,
        contents: params.contents,
        config,
      });

      if (res.text) {
        return JSON.parse(res.text);
      }
    } catch (err: any) {
      lastErr = err;
      console.warn(`Model ${model} attempt failed, trying fallback:`, err?.message || err);
    }
  }

  throw lastErr || new Error('All model generation attempts failed');
}

// Endpoint: Identify track & generate facts and DJ intro
app.post('/api/track/identify', async (req, res) => {
  const { filename = '', hintTitle = '', hintArtist = '', language = 'en', vibe = 'party' } = req.body;
  const isSk = language === 'sk';
  const langName = isSk ? 'Slovak (slovenčina)' : 'English';

  try {
    const prompt = `
You are a world-class party DJ, musicologist, and club host.
A DJ on a mobile deck just loaded a track with the filename: "${filename || 'unknown'}"
Hint Title: "${hintTitle || ''}"
Hint Artist: "${hintArtist || ''}"
Party Vibe: "${vibe}"

Tasks:
1. Identify the most likely exact Song Title and Artist from the filename or hints. If uncertain, infer from common music naming patterns or provide the cleanest title and artist name.
2. Provide estimated BPM (typically 80-160), musical key (e.g. "8A / Am", "11B / A"), genre (e.g., "Tech House", "Pop Anthem", "Nu-Disco"), and release year.
3. Provide 3 fascinating, crowd-pleasing trivia facts or backstories about this track or artist in ${langName}. Make them energetic and interesting for a party crowd.
4. Write a punchy, 2-3 sentence DJ Voice Intro in ${langName} that the DJ's virtual hype-voice (Speechify MC) will announce right before the beat drops! It should sound like an authentic radio/festival host introducing this song to get the crowd dancing.
5. Write a short 1-sentence DJ Outro transition in ${langName} signaling the handover to the next phone/deck.

Return ONLY a JSON response matching the schema.
`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING, description: 'Clean song title' },
        artist: { type: Type.STRING, description: 'Clean artist name' },
        genre: { type: Type.STRING, description: 'Genre of the track' },
        bpm: { type: Type.NUMBER, description: 'Estimated BPM' },
        key: { type: Type.STRING, description: 'Musical key' },
        year: { type: Type.STRING, description: 'Release year or era' },
        facts: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: `3 interesting facts in ${langName}`,
        },
        djIntro: {
          type: Type.STRING,
          description: `Spoken DJ announcement introducing the track in ${langName}`,
        },
        djOutro: {
          type: Type.STRING,
          description: `Spoken DJ outro transition in ${langName}`,
        },
      },
      required: ['title', 'artist', 'genre', 'bpm', 'facts', 'djIntro'],
    };

    const parsed = await generateContentWithFallback({
      contents: prompt,
      responseSchema: schema,
    });

    return res.json(parsed);
  } catch (err: any) {
    console.warn('Fallback to rule-based track identification:', err?.message || err);
    
    // Clean filename
    const clean = (filename || 'Party Banger').replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const parts = clean.split(' - ');
    const artist = parts.length > 1 ? parts[0].trim() : (hintArtist || 'Famous Artist');
    const title = parts.length > 1 ? parts[1].trim() : (hintTitle || clean);

    return res.json({
      title,
      artist,
      genre: 'Club Dance Anthem',
      bpm: 128,
      key: '8A / Am',
      year: '2024',
      facts: isSk
        ? [
            `Skladba ${title} patrí medzi overené párty hymny, ktoré okamžite plnia tanečný parket.`,
            `Umelec ${artist} je známy precíznym zvukom a energickými live vystúpeniami na festivaloch.`,
            `Tempo 128 BPM je zlatým štandardom tanečnej hudby pre dokonalú synchronizáciu a prechody.`,
          ]
        : [
            `"${title}" is a certified floor-filler known across clubs and festival mainstages.`,
            `${artist} is widely celebrated for high-energy crowd engagement and signature basslines.`,
            `The 128 BPM tempo is the golden standard for driving maximum energy and seamless mixing.`,
          ],
      djIntro: isSk
        ? `Dámy a páni, zbystrite pozornosť! Do reproduktorov práve posielame pecku ${title} od ${artist}! Ruky hore a poďme na to!`
        : `Turn up the monitors! We are dropping "${title}" by ${artist} right now! Put your hands up and feel the groove!`,
      djOutro: isSk
        ? `To bola neskutočná energia od ${artist}! Pripravte sa na ďalší drop z druhého mobilu!`
        : `Incredible vibes with "${title}"! Get ready as we hand over the beat to Deck B!`,
    });
  }
});

// Endpoint: Generate spontaneous party situation commentary
app.post('/api/party/commentary', async (req, res) => {
  try {
    const {
      situation,
      customNote = '',
      persona = 'hype_mc',
      currentTrack = { title: '', artist: '' },
      language = 'en',
      deckName = 'DECK A',
    } = req.body;

    const langName = language === 'sk' ? 'Slovak (slovenčina)' : 'English';

    const personaDescriptions: Record<string, string> = {
      hype_mc:
        'A high-octane club & festival MC with explosive energy, yelling into the mic, getting hands in the air, creating instant euphoria.',
      radio_smooth:
        'A sleek, velvety-voiced FM radio / nightclub resident DJ, cool, effortlessly stylish, witty, and smooth.',
      techno_shaman:
        'An underground Berlin/Ibiza techno selector, mysterious, deep, atmospheric, hypnotic cadence.',
      sarcastic_host:
        'A witty, playful, cheeky party host who gently roasts guests while keeping the dance floor laughing and moving.',
    };

    const personaGuide = personaDescriptions[persona] || personaDescriptions.hype_mc;

    const situationDescriptions: Record<string, string> = {
      cake: 'The birthday cake is coming out or it is someone’s birthday celebration right now!',
      spill: 'Someone spilled a drink on the dance floor! Alert the crowd with humor, tell them to watch their step, keep dancing safely while napkins arrive.',
      hype: 'The energy on the dance floor is lagging! Do an emergency vibe revival, demand everyone step up to the floor, count down to the drop!',
      dance_battle: 'An impromptu dance battle or circle has formed in the middle of the room! Call everyone around to hype the dancers!',
      toast: 'Raising glasses! Time for a collective toast to the host, good friends, and legendary memories!',
      closing: 'Last call / 3 AM anthem! Thank everyone for an unforgettable night, squeeze every drop of energy out of the remaining tracks!',
      lost_item: 'A lost phone or keys were found! Make an amusing DJ announcement so the owner claims it at the booth.',
      shot_time: 'Round of shots at the bar / kitchen! Rally the troops for a quick celebration toast!',
      custom: `Custom party event: ${customNote}`,
    };

    const situationGuide = situationDescriptions[situation] || situationDescriptions.hype;

    const prompt = `
You are the resident DJ at a lively party performing on ${deckName}.
Your Persona: ${personaGuide}
Current Situation: ${situationGuide}
${customNote ? `Additional host note: "${customNote}"` : ''}
Currently playing or queued: "${currentTrack.title || 'Party Track'}" by "${currentTrack.artist || 'The DJ'}"
Language: ${langName}

Write an authentic, punchy spoken DJ microphone speech (around 2 to 4 sentences).
${language === 'sk' ? 'Use natural Slovak party/DJ slang (e.g., "Dámy a páni!", "Ruky hore!", "Ideme na to!", "Pozor na parkete!", "Odpálime to!").' : 'Use energetic international party DJ lingo.'}

Also provide:
- A crowd prompt/action (e.g. "Ruky hore!" or "Hands up!", "Glasses in the air!")
- A recommended sound effect cue ('airhorn', 'scratch', 'laser', 'siren', 'rewind')

Return ONLY a JSON response matching the schema.
`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        speechText: {
          type: Type.STRING,
          description: `Spoken DJ party announcement in ${langName}`,
        },
        crowdAction: {
          type: Type.STRING,
          description: `Short action display for partygoers in ${langName}`,
        },
        soundFx: {
          type: Type.STRING,
          description: 'Recommended SFX cue: airhorn, scratch, laser, siren, rewind',
        },
        vibeEmoji: {
          type: Type.STRING,
          description: 'Fitting emoji for this situation',
        },
      },
      required: ['speechText', 'crowdAction', 'soundFx'],
    };

    const parsed = await generateContentWithFallback({
      contents: prompt,
      responseSchema: schema,
    });

    res.json(parsed);
  } catch (err: any) {
    console.warn('Party commentary fallback:', err?.message || err);
    const isSk = req.body.language === 'sk';
    const situation = req.body.situation;
    const customNote = req.body.customNote;

    const fallbacks: Record<string, { speech: string; action: string; sfx: string }> = {
      cake: {
        speech: isSk
          ? 'Pozor pozóóór, prichádza torta! Všetci ruky hore pre nášho oslávenca, dnes večer to tu oslávime vo veľkom štýle!'
          : 'Attention party people! The birthday cake has arrived! Put your hands up and let’s make some noise for the birthday legend!',
        action: isSk ? 'Spievať & Tlieskať!' : 'Cheer & Sing!',
        sfx: 'airhorn',
      },
      spill: {
        speech: isSk
          ? 'Pozor na parkete, niekto tam vylial drink! Dávajte si pozor na nohy, servítky už letia, ale párty nezastavujeme!'
          : 'Watch your step on the dance floor, team! We got a spilled drink in sector one. Keep dancing safely, napkins inbound!',
        action: isSk ? 'Pozor na nohy!' : 'Watch the floor!',
        sfx: 'scratch',
      },
      hype: {
        speech: isSk
          ? 'Kde je energia na parkete? Chcem vidieť všetky ruky vo vzduchu, nikto nesedí pri stole, poďme na to!'
          : 'Wait a minute, we are not letting this room cool down! Everybody off the couches and right onto the dance floor now!',
        action: isSk ? 'Všetci na parket!' : 'Hands in the air!',
        sfx: 'siren',
      },
      dance_battle: {
        speech: isSk
          ? 'Otvoril sa kruh v strede miestnosti! Máme tu tanečný súboj večera, poďte okolo a vyhecujte ich potleskom!'
          : 'Clear the circle! We have an epic dance battle popping off right now! Make some room and cheer them on!',
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
          ? 'Rýchle hlásenie z DJ pultu: niekto stratil telefón alebo kľúče! Ak ti chýbajú, príď si po ne k pultu!'
          : 'Quick announcement from the DJ booth: someone dropped a phone or keys! Claim them at the booth!',
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
          ? `Pozor všetci na párty: ${customNote || 'Dnes to tu žije na maximum!'} Ruky hore!`
          : `Listen up party people: ${customNote || 'The energy tonight is through the roof!'} Let's go!`,
        action: isSk ? 'Pozor na hlásenie!' : 'Listen up!',
        sfx: 'airhorn',
      },
    };

    const fb = fallbacks[situation] || fallbacks.hype;
    res.json({
      speechText: fb.speech,
      crowdAction: fb.action,
      soundFx: fb.sfx,
      vibeEmoji: '🎉',
    });
  }
});

// Endpoint: TTS synthesis (Speechify.io integration with fallback to Gemini Flash TTS)
app.post('/api/tts', async (req, res) => {
  try {
    const {
      text,
      language = 'en',
      voice = 'Puck', // or Speechify voice ID
      speechifyApiKey = '',
    } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const effectiveSpeechifyKey = speechifyApiKey || process.env.SPEECHIFY_API_KEY;

    // 1. If Speechify key is present, attempt Speechify.io API
    if (effectiveSpeechifyKey) {
      try {
        // Speechify API request
        const speechifyVoice = voice.toLowerCase().includes('kore') || voice.toLowerCase().includes('zephyr') ? 'george' : (voice || 'george');
        const speechifyRes = await fetch('https://api.sws.speechify.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveSpeechifyKey}`,
          },
          body: JSON.stringify({
            input: `<speak>${text}</speak>`,
            voice_id: speechifyVoice,
            audio_format: 'mp3',
          }),
        });

        if (speechifyRes.ok) {
          const buffer = await speechifyRes.arrayBuffer();
          const base64Audio = Buffer.from(buffer).toString('base64');
          return res.json({
            provider: 'speechify',
            mimeType: 'audio/mp3',
            audioBase64: base64Audio,
          });
        } else {
          console.warn('Speechify API call returned error, falling back to Gemini TTS:', await speechifyRes.text());
        }
      } catch (speechifyErr) {
        console.warn('Speechify fetch failed, falling back to Gemini TTS:', speechifyErr);
      }
    }

    // 2. Fallback to Gemini 3.8 Flash Lite TTS
    const voiceMapping: Record<string, 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr'> = {
      puck: 'Puck',
      kore: 'Kore',
      fenrir: 'Fenrir',
      zephyr: 'Zephyr',
      charon: 'Charon',
    };

    const selectedVoice = voiceMapping[voice.toLowerCase()] || 'Puck';

    const ttsResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text,
              speechMetadata: {
                style: language === 'sk' ? 'Energetic, confident Slovak party DJ host' : 'High energy, charismatic party DJ host',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: selectedVoice },
          },
        },
      },
    });

    const base64Data = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (base64Data) {
      return res.json({
        provider: 'gemini_tts',
        mimeType: 'audio/pcm;rate=24000',
        audioBase64: base64Data,
        sampleRate: 24000,
      });
    }

    // If no direct audio was generated, signal client to use browser speech synthesis
    return res.json({
      provider: 'client_speech',
      text,
      language,
    });
  } catch (err: any) {
    console.error('Error in /api/tts:', err);
    // Graceful fallback to client speech synthesis
    res.json({
      provider: 'client_speech',
      text: req.body.text,
      language: req.body.language || 'en',
    });
  }
});

// Serve frontend in dev via Vite middlewares, or static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VibeDeck AI DJ server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

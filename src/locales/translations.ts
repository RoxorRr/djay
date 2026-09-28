import { Language, PartySituationType, DJPersonaType } from '../types';

export const translations = {
  en: {
    appTitle: 'VibeDeck AI DJ',
    deckSubtitle: 'Single Deck Phone Station',
    deckLabel: 'DECK',
    deckA: 'DECK A',
    deckB: 'DECK B',
    switchDeckNotice: 'Use this phone as single deck, connect second phone for Deck B',
    
    // Header & Navigation
    languageName: 'English',
    languageToggle: '🇬🇧 EN / 🇸🇰 SK',
    dualPhoneSync: '2nd Phone Link',
    partyMcButton: 'Party MC Shoutout',
    settings: 'Settings & Voice',
    voiceEngine: 'Voice Engine',
    
    // Deck Controls
    play: 'PLAY',
    pause: 'PAUSE',
    cue: 'CUE',
    sync: 'SYNC',
    syncLocked: 'SYNC LOCKED',
    pitch: 'TEMPO / PITCH',
    resetPitch: 'RESET (0%)',
    nudgeMinus: '- NUDGE',
    nudgePlus: '+ NUDGE',
    vinylScratch: 'SCRATCH / JOG',
    slipMode: 'SLIP MODE',
    
    // Hot Cues & Loops
    hotCues: 'HOT CUES',
    cueSet: 'CUE',
    deleteCue: 'Hold to delete',
    loop: 'AUTO LOOP',
    loopIn: 'LOOP IN',
    loopOut: 'LOOP OUT',
    loopActive: 'ACTIVE',
    loopExit: 'EXIT',
    
    // Mixer & EQ
    mixer: 'MIXER & EQ',
    high: 'HIGH',
    mid: 'MID',
    low: 'LOW / BASS',
    filter: 'FILTER (LPF / HPF)',
    kill: 'KILL',
    volume: 'DECK GAIN',
    master: 'MASTER',
    duckingActive: 'MC DUCKING ACTIVE (-80%)',
    
    // Track Management
    uploadSong: 'Upload Song from Phone',
    uploadHint: 'Tap to browse MP3, WAV, M4A, FLAC or drag audio file',
    loadedTrack: 'Loaded Track',
    editTrack: 'Edit Song & Artist',
    editTrackTitle: 'Edit Track Details',
    editTrackHint: 'Correct the song title and artist/interpret so the AI can accurately verify facts, backstory, and DJ intro speech.',
    songTitleLabel: 'Song Title',
    artistLabel: 'Artist / Interpret',
    genreLabel: 'Genre',
    bpmLabel: 'BPM',
    saveAndRecheck: 'Save & Re-Check with AI',
    saveChanges: 'Save Changes Only',
    cancel: 'Cancel',
    demoTracks: 'Demo Party Bangers',
    analyzingTrack: 'AI DJ analyzing audio, identifying artist & fetching facts...',
    reanalyze: 'Re-Analyze Track',
    trackTrivia: 'Track Facts & Backstory',
    djIntroSpeech: 'DJ Voice Track Intro',
    playIntro: 'Drop Track Intro (Voice)',
    playingVoice: 'DJ Speaking...',
    stopVoice: 'Stop Voice',
    
    // Party Situations
    partySituationsTitle: 'Party Situation Commentary',
    partySituationsDesc: 'Instant AI speech to handle live party moments with crowd hype and auto-ducking!',
    selectPersona: 'DJ Persona',
    selectSituation: 'Party Situation',
    customSituationPlaceholder: 'Or describe what just happened at the party (e.g. "Martin just bought tequila shots for everyone!")...',
    generateCommentary: 'Generate & Drop Shoutout',
    generating: 'DJ Crafting Speech...',
    dropNow: 'Announce Now on Mic',
    crowdActionLabel: 'Crowd Callout',
    
    // Situations
    situations: {
      cake: '🎂 Cake Arrival / Birthday',
      spill: '🍹 Drink Spilled on Floor',
      hype: '⚡ Energy Low / Hype Revival',
      dance_battle: '💃 Dance Circle / Battle',
      toast: '🥂 Toast to Host / Friends',
      closing: '🚖 Last Call / 3AM Final Anthem',
      lost_item: '📱 Lost Phone / Keys Found',
      shot_time: '🥃 Shots Round at Bar',
      custom: '✨ Custom Party Moment',
    } as Record<PartySituationType, string>,
    
    // Personas
    personas: {
      hype_mc: '🔥 High-Energy Club MC',
      radio_smooth: '🎙️ Smooth Late-Night Radio Host',
      techno_shaman: '🖤 Underground Techno Selector',
      sarcastic_host: '😏 Witty & Cheeky Party Host',
    } as Record<DJPersonaType, string>,
    
    // Sound FX Pads
    soundFx: 'DJ FX PADS',
    airhorn: 'Airhorn',
    scratch: 'Scratch',
    laser: 'Laser Sweep',
    siren: 'Party Siren',
    subdrop: 'Sub Drop',
    rewind: 'Vinyl Rewind',
    
    // Dual Phone Sync
    syncModalTitle: 'Dual-Phone Single Deck Setup',
    syncModalDesc: 'You are using this phone for single deck mixing. To mix into Deck B, open this app on your second phone.',
    phoneRole: 'Current Phone Role',
    roomCode: 'Deck Session Sync Code',
    copyLink: 'Copy App Link for 2nd Phone',
    linkCopied: 'Link copied! Open on second phone',
    howItWorks: 'How to DJ with Two Phones:',
    tip1: '1. Connect Phone 1 to the party speakers (or DJ mixer Channel 1).',
    tip2: '2. Connect Phone 2 to DJ mixer Channel 2 (or switch Bluetooth input).',
    tip3: '3. Use the AI DJ Voice outro or transition cue to smoothly hand over to Phone 2!',
    close: 'Close',
    
    // Settings
    settingsTitle: 'Voice & DJ Settings',
    speechifyTitle: 'Speechify.io TTS Integration',
    speechifyDesc: 'Connect your Speechify API key for hyper-realistic celebrity and studio narrator voices. Or use built-in Gemini Flash voice.',
    speechifyKeyLabel: 'Speechify API Key (Optional)',
    speechifyKeyPlaceholder: 'sk_live_... or leave empty for Gemini AI Voice',
    voiceProviderLabel: 'Voice Synthesis Engine',
    voiceAuto: 'Auto (Speechify if key set, else Gemini AI Voice)',
    voiceSpeechify: 'Speechify.io API',
    voiceGemini: 'Google Gemini Flash TTS',
    voiceBrowser: 'Browser Native TTS (Offline / Zero-lag)',
    duckingLabel: 'Music Auto-Ducking Level',
    duckingHelp: 'How much the music volume lowers when the DJ voice speaks over the track.',
    saveSettings: 'Save Settings',
  },
  
  sk: {
    appTitle: 'VibeDeck AI DJ',
    deckSubtitle: 'Jednoplátová DJ Stanica do Mobilu',
    deckLabel: 'DECK',
    deckA: 'DECK A',
    deckB: 'DECK B',
    switchDeckNotice: 'Tento mobil slúži ako jeden deck. Druhý mobil použi pre Deck B',
    
    // Header & Navigation
    languageName: 'Slovenčina',
    languageToggle: '🇸🇰 SK / 🇬🇧 EN',
    dualPhoneSync: 'Prepojiť 2. Mobil',
    partyMcButton: 'Party Hláška / MC',
    settings: 'Nastavenia & Hlas',
    voiceEngine: 'Hlasový Engine',
    
    // Deck Controls
    play: 'HRAŤ',
    pause: 'PAUZA',
    cue: 'CUE',
    sync: 'SYNC',
    syncLocked: 'SYNC ZAMKNUTÝ',
    pitch: 'TEMPO / PITCH',
    resetPitch: 'RESETOVAŤ (0%)',
    nudgeMinus: '- NUDGE',
    nudgePlus: '+ NUDGE',
    vinylScratch: 'SCRATCH / JOG',
    slipMode: 'SLIP REŽIM',
    
    // Hot Cues & Loops
    hotCues: 'HOT CUE BODY',
    cueSet: 'CUE',
    deleteCue: 'Podrž pre zmazanie',
    loop: 'AUTOMATICKÁ SLUČKA',
    loopIn: 'LOOP ZAČIATOK',
    loopOut: 'LOOP KONIEC',
    loopActive: 'AKTÍVNA',
    loopExit: 'UKONČIŤ',
    
    // Mixer & EQ
    mixer: 'MIXÁŽNY PULT & EQ',
    high: 'VÝŠKY',
    mid: 'STREDY',
    low: 'BASY',
    filter: 'FILTER (LPF / HPF)',
    kill: 'VYP.',
    volume: 'HLASITOSŤ DECKU',
    master: 'MASTER VÝSTUP',
    duckingActive: 'MC DUCKING AKTÍVNY (-80%)',
    
    // Track Management
    uploadSong: 'Nahrať Skladbu z Mobilu',
    uploadHint: 'Ťukni pre výber MP3, WAV, M4A, FLAC alebo pretiahni súbor',
    loadedTrack: 'Aktuálna Skladba',
    editTrack: 'Upraviť Názov a Interpreta',
    editTrackTitle: 'Upraviť Údaje o Skladbe',
    editTrackHint: 'Oprav názov skladby a interpreta, aby AI ľahko a presne overilo zaujímavosti, fakty a hlasové DJ intro.',
    songTitleLabel: 'Názov Skladby',
    artistLabel: 'Umelec / Interpret',
    genreLabel: 'Žáner',
    bpmLabel: 'BPM',
    saveAndRecheck: 'Uložiť a Overiť cez AI',
    saveChanges: 'Iba Uložiť Zmeny',
    cancel: 'Zrušiť',
    demoTracks: 'Ukážkové Párty Pecky',
    analyzingTrack: 'AI DJ analyzuje skladbu, identifikuje umelca a hľadá zaujímavosti...',
    reanalyze: 'Znova Analyzovať',
    trackTrivia: 'Zaujímavosti a Fakty o Skladbe',
    djIntroSpeech: 'Hlasové Uvedenie Skladby (DJ Intro)',
    playIntro: 'Pustiť Hlasové Intro',
    playingVoice: 'DJ Hovorí...',
    stopVoice: 'Zastaviť Hlas',
    
    // Party Situations
    partySituationsTitle: 'Komentár k Párty Situáciám',
    partySituationsDesc: 'Okamžitý AI príhovor na nečakané párty momenty s vyhecovaním davu a automatickým stlmením hudby!',
    selectPersona: 'DJ Osobnosť / Štýl',
    selectSituation: 'Situácia na Párty',
    customSituationPlaceholder: 'Alebo opíš, čo sa práve stalo (napr. "Martin objednal všetkým panáky borovičky!")...',
    generateCommentary: 'Vytvoriť a Odpáliť Hlášku',
    generating: 'DJ Pripravuje Reč...',
    dropNow: 'Vyhlásiť Hneď do Mikrofónu',
    crowdActionLabel: 'Výzva pre Dav',
    
    // Situations
    situations: {
      cake: '🎂 Príchod Torty / Narodeniny',
      spill: '🍹 Rozliaty Drink na Parkete',
      hype: '⚡ Upadajúca Energia / Záchrana Vibe-u',
      dance_battle: '💃 Tanečný Súboj / Kruh',
      toast: '🥂 Prípitok pre Hostiteľa / Partiu',
      closing: '🚖 Posledné Kolo / 3:00 Ráno',
      lost_item: '📱 Nájdený Mobil / Kľúče',
      shot_time: '🥃 Kolo Panákov na Bare',
      custom: '✨ Vlastná Párty Situácia',
    } as Record<PartySituationType, string>,
    
    // Personas
    personas: {
      hype_mc: '🔥 Divoký Klubový Moderátor (Hype MC)',
      radio_smooth: '🎙️ Hladký Rádiový Hlas',
      techno_shaman: '🖤 Undergroundový Techno Šaman',
      sarcastic_host: '😏 Vtipný a Sarkastický Zabávač',
    } as Record<DJPersonaType, string>,
    
    // Sound FX Pads
    soundFx: 'DJ EFEKTY (PADY)',
    airhorn: 'Húkačka (Airhorn)',
    scratch: 'Scratch',
    laser: 'Laser Efekt',
    siren: 'Párty Siréna',
    subdrop: 'Sub Basy Drop',
    rewind: 'Vinyl Rewind',
    
    // Dual Phone Sync
    syncModalTitle: 'Dvojmobilový Jednoplátový Setup',
    syncModalDesc: 'Tento mobil používaš ako jeden DJ deck. Pre mixovanie do Decku B otvor túto aplikáciu na druhom mobile.',
    phoneRole: 'Rola tohto Mobilu',
    roomCode: 'Kód Spárovania Deckov',
    copyLink: 'Kopírovať Odkaz pre 2. Mobil',
    linkCopied: 'Odkaz skopírovaný! Otvor ho na druhom mobile',
    howItWorks: 'Ako Hrať s Dvoma Mobilmi:',
    tip1: '1. Pripoj Mobil 1 k párty reproduktorom (alebo kanálu 1 na mixáku).',
    tip2: '2. Pripoj Mobil 2 ku kanálu 2 (alebo prepni Bluetooth vstup pri prechode).',
    tip3: '3. Využi AI DJ Voice outro pre plynulé odovzdanie slova a beatu na Mobil 2!',
    close: 'Zavrieť',
    
    // Settings
    settingsTitle: 'Nastavenia Hlasu a DJ-ingu',
    speechifyTitle: 'Integrácia Speechify.io TTS',
    speechifyDesc: 'Pripoj svoj Speechify API kľúč pre hyperrealistické hlasy a štúdiových rozprávačov. Alebo využi vstavaný Gemini Flash hlas.',
    speechifyKeyLabel: 'Speechify API Kľúč (Voliteľné)',
    speechifyKeyPlaceholder: 'sk_live_... alebo nechaj prázdne pre Gemini AI Hlas',
    voiceProviderLabel: 'Hlasový Syntetizátor',
    voiceAuto: 'Automaticky (Speechify ak je zadaný kľúč, inak Gemini AI)',
    voiceSpeechify: 'Speechify.io API',
    voiceGemini: 'Google Gemini Flash TTS',
    voiceBrowser: 'Natívny Prehliadačový Hlas (Offline / Nulová latencia)',
    duckingLabel: 'Úroveň Stlmenia Hudby (Ducking)',
    duckingHelp: 'O koľko sa stlmí hudba na pozadí, keď hovorí virtuálny DJ moderátor.',
    saveSettings: 'Uložiť Nastavenia',
  },
};

export function getTranslation(lang: Language) {
  return translations[lang] || translations.en;
}

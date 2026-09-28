import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Language,
  DeckId,
  TrackMetadata,
  CuePoint,
  PartySituationType,
  DJPersonaType,
  PartyCommentaryResult,
  VoiceSettings,
} from './types';
import { getTranslation } from './locales/translations';
import { audioEngine } from './services/audioEngine';
import { getDemoTracks } from './services/demoTracks';
import { identifyTrack, generatePartyCommentary, speakSpeech } from './services/aiService';

import { Header } from './components/Header';
import { JogWheel } from './components/JogWheel';
import { WaveformDisplay } from './components/WaveformDisplay';
import { DeckControls } from './components/DeckControls';
import { MixerSection } from './components/MixerSection';
import { SoundFxPads } from './components/SoundFxPads';
import { TrackUploader } from './components/TrackUploader';
import { AiTriviaPanel } from './components/AiTriviaPanel';
import { PartyCommentaryModal } from './components/PartyCommentaryModal';
import { DualPhoneSyncModal } from './components/DualPhoneSyncModal';
import { SettingsModal } from './components/SettingsModal';
import { EditTrackModal } from './components/EditTrackModal';

export default function App() {
  // --- Persistent Preferences ---
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('vibedeck_lang') as Language) || 'sk'; // Default to Slovak or English
  });

  const [deckId, setDeckId] = useState<DeckId>(() => {
    return (localStorage.getItem('vibedeck_deck') as DeckId) || 'DECK A';
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('vibedeck_voice_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      provider: 'auto',
      speechifyApiKey: '',
      speechifyVoice: 'george',
      geminiVoice: 'Puck',
      duckingAmount: 0.8,
      speechRate: 1.0,
    };
  });

  // --- Track & Audio State ---
  const [demoTracks] = useState<TrackMetadata[]>(() => getDemoTracks());
  const [currentTrack, setCurrentTrack] = useState<TrackMetadata | null>(demoTracks[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(120);
  const [pitchOffset, setPitchOffset] = useState(0); // in percent
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Cue Points & Loops ---
  const [cuePoints, setCuePoints] = useState<CuePoint[]>([
    { id: 1, time: 0, color: '#10b981' },
    { id: 2, time: 15, color: '#8b5cf6' },
  ]);
  const [isLooping, setIsLooping] = useState(false);
  const [loopInTime, setLoopInTime] = useState(0);
  const [loopOutTime, setLoopOutTime] = useState(0);

  // --- Voice Commentary & Ducking ---
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isDuckingActive, setIsDuckingActive] = useState(false);

  // --- Modals ---
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isEditTrackModalOpen, setIsEditTrackModalOpen] = useState(false);

  // --- Live Toast for Party Callouts ---
  const [crowdAlert, setCrowdAlert] = useState<{ action: string; sfx: string } | null>(null);

  const t = getTranslation(language);

  // Save language
  const handleToggleLanguage = () => {
    const nextLang = language === 'en' ? 'sk' : 'en';
    setLanguage(nextLang);
    localStorage.setItem('vibedeck_lang', nextLang);
  };

  // Save deck ID
  const handleToggleDeckId = () => {
    const nextDeck = deckId === 'DECK A' ? 'DECK B' : 'DECK A';
    setDeckId(nextDeck);
    localStorage.setItem('vibedeck_deck', nextDeck);
  };

  // Save voice settings
  const handleSaveSettings = (settings: VoiceSettings) => {
    setVoiceSettings(settings);
    audioEngine.setDuckingAmount(settings.duckingAmount);
    localStorage.setItem('vibedeck_voice_settings', JSON.stringify(settings));
  };

  // Setup timeupdate and ended listeners
  useEffect(() => {
    audioEngine.onTimeUpdate((time, dur) => {
      setCurrentTime(time);
      if (dur > 0) setDuration(dur);
      setIsLooping(audioEngine.isLooping);
      setLoopInTime(audioEngine.loopInTime);
      setLoopOutTime(audioEngine.loopOutTime);
      setIsDuckingActive(audioEngine.getIsDucking());
    });

    audioEngine.onEnded(() => {
      setIsPlaying(false);
    });

    // Load initial demo track
    if (demoTracks[0]) {
      audioEngine.loadTrack(demoTracks[0].audioUrl).catch(console.error);
    }
  }, [demoTracks]);

  // Load a track
  const handleSelectTrack = async (track: TrackMetadata) => {
    setIsLoadingTrack(true);
    try {
      audioEngine.pause();
      setIsPlaying(false);
      await audioEngine.loadTrack(track.audioUrl);
      setCurrentTrack(track);
      setDuration(track.duration || 120);
      setCurrentTime(0);
      setPitchOffset(0);
      audioEngine.setPlaybackRate(1.0);
    } catch (err) {
      console.error('Error loading track:', err);
    } finally {
      setIsLoadingTrack(false);
    }
  };

  // Upload file from phone
  const handleUploadFile = async (file: File) => {
    setIsLoadingTrack(true);
    setIsAnalyzing(true);
    try {
      const audioUrl = URL.createObjectURL(file);
      audioEngine.pause();
      setIsPlaying(false);
      await audioEngine.loadTrack(audioUrl);

      // Create initial track metadata
      const initialMeta: TrackMetadata = {
        id: `upload-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        artist: 'Analyzing with AI...',
        genre: 'Dance',
        bpm: 128,
        key: '8A / Am',
        duration: audioEngine.getDuration() || 180,
        facts: [
          language === 'sk'
            ? 'AI DJ práve analyzuje nahranú skladbu z mobilu...'
            : 'AI DJ is analyzing your uploaded phone track...',
        ],
        djIntro:
          language === 'sk'
            ? 'Pripravte sa na novú skladbu priamo z telefónu!'
            : 'Get ready for this fresh track loaded straight from the phone!',
        audioUrl,
        fileName: file.name,
      };

      setCurrentTrack(initialMeta);
      setDuration(audioEngine.getDuration() || 180);
      setCurrentTime(0);

      // Query Gemini to identify song, artist, genre, facts & DJ intro in English or Slovak
      const aiResult = await identifyTrack({
        filename: file.name,
        language,
        vibe: 'party club single-deck',
      });

      const updatedTrack: TrackMetadata = {
        ...initialMeta,
        title: aiResult.title || initialMeta.title,
        artist: aiResult.artist || 'Club Artist',
        genre: aiResult.genre || 'Party Banger',
        bpm: aiResult.bpm || 128,
        key: aiResult.key || '8A',
        year: aiResult.year,
        facts: aiResult.facts || initialMeta.facts,
        djIntro: aiResult.djIntro || initialMeta.djIntro,
        djOutro: aiResult.djOutro,
      };

      setCurrentTrack(updatedTrack);
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setIsLoadingTrack(false);
      setIsAnalyzing(false);
    }
  };

  // Re-analyze current track
  const handleReanalyze = async () => {
    if (!currentTrack) return;
    setIsAnalyzing(true);
    try {
      const aiResult = await identifyTrack({
        filename: currentTrack.fileName || currentTrack.title,
        hintTitle: currentTrack.title,
        hintArtist: currentTrack.artist,
        language,
        vibe: 'high energy party club',
      });

      setCurrentTrack((prev) =>
        prev
          ? {
              ...prev,
              genre: aiResult.genre || prev.genre,
              bpm: aiResult.bpm || prev.bpm,
              key: aiResult.key || prev.key,
              facts: aiResult.facts || prev.facts,
              djIntro: aiResult.djIntro || prev.djIntro,
              djOutro: aiResult.djOutro || prev.djOutro,
            }
          : null
      );
    } catch (err) {
      console.error('Error re-analyzing:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save manual track title & artist edit, and optionally re-check with AI
  const handleSaveTrack = async (
    updated: { title: string; artist: string; genre?: string; bpm?: number },
    recheckWithAi: boolean
  ) => {
    if (!currentTrack) return;

    if (!recheckWithAi) {
      setCurrentTrack((prev) =>
        prev
          ? {
              ...prev,
              title: updated.title,
              artist: updated.artist,
              genre: updated.genre || prev.genre,
              bpm: updated.bpm || prev.bpm,
            }
          : null
      );
      return;
    }

    // Optimistically update the displayed song and artist
    setCurrentTrack((prev) =>
      prev
        ? {
            ...prev,
            title: updated.title,
            artist: updated.artist,
            genre: updated.genre || prev.genre,
            bpm: updated.bpm || prev.bpm,
          }
        : null
    );

    setIsAnalyzing(true);
    try {
      const aiResult = await identifyTrack({
        filename: currentTrack.fileName || updated.title,
        hintTitle: updated.title,
        hintArtist: updated.artist,
        language,
        vibe: 'high energy party club',
      });

      setCurrentTrack((prev) =>
        prev
          ? {
              ...prev,
              title: aiResult.title || updated.title,
              artist: aiResult.artist || updated.artist,
              genre: aiResult.genre || updated.genre || prev.genre,
              bpm: aiResult.bpm || updated.bpm || prev.bpm,
              key: aiResult.key || prev.key,
              year: aiResult.year || prev.year,
              facts: aiResult.facts || prev.facts,
              djIntro: aiResult.djIntro || prev.djIntro,
              djOutro: aiResult.djOutro || prev.djOutro,
            }
          : null
      );
    } catch (err) {
      console.error('Error re-checking with AI after edit:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Transport: Play / Pause
  const handlePlayPause = async () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      await audioEngine.play();
      setIsPlaying(true);
    }
  };

  // Transport: Cue button
  const handleCue = () => {
    if (isPlaying) {
      audioEngine.jumpToTempCue();
      setIsPlaying(false);
    } else {
      audioEngine.setTempCue();
    }
  };

  // Transport: Sync button (matches master BPM 128)
  const handleSync = () => {
    if (!currentTrack) return;
    const targetBpm = 128.0;
    const currentBase = currentTrack.bpm || 128.0;
    const offset = ((targetBpm - currentBase) / currentBase) * 100;
    const clamped = Math.max(-8, Math.min(8, offset));
    setPitchOffset(clamped);
    audioEngine.setPlaybackRate(1 + clamped / 100);
  };

  // Pitch fader change
  const handlePitchChange = (val: number) => {
    setPitchOffset(val);
    audioEngine.setPlaybackRate(1 + val / 100);
  };

  const handleResetPitch = () => {
    setPitchOffset(0);
    audioEngine.setPlaybackRate(1.0);
  };

  // Nudge
  const handleNudge = (dir: number) => {
    const momentary = pitchOffset + dir * 1.5;
    audioEngine.setPlaybackRate(1 + momentary / 100);
    setTimeout(() => {
      audioEngine.setPlaybackRate(1 + pitchOffset / 100);
    }, 250);
  };

  // Vinyl Scratch
  const handleScratch = (direction: number) => {
    audioEngine.simulateScratch(direction);
  };

  // Seek
  const handleSeek = (seconds: number) => {
    audioEngine.seek(seconds);
    setCurrentTime(seconds);
  };

  // Hot Cues
  const handleHotCuePress = (id: number) => {
    const existing = cuePoints.find((c) => c.id === id);
    if (existing) {
      audioEngine.seek(existing.time);
      if (!isPlaying) {
        audioEngine.play();
        setIsPlaying(true);
      }
    } else {
      const now = audioEngine.getCurrentTime();
      const colors = ['#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
      const newCue: CuePoint = {
        id,
        time: now,
        color: colors[id - 1] || '#10b981',
      };
      setCuePoints((prev) => [...prev.filter((c) => c.id !== id), newCue].sort((a, b) => a.id - b.id));
      audioEngine.setCue(id);
    }
  };

  const handleDeleteHotCue = (id: number) => {
    setCuePoints((prev) => prev.filter((c) => c.id !== id));
    audioEngine.deleteCue(id);
  };

  // Looping
  const handleSetAutoLoop = (beats: number) => {
    if (!currentTrack) return;
    audioEngine.setAutoLoop(beats, currentTrack.bpm);
    setIsLooping(true);
    setLoopInTime(audioEngine.loopInTime);
    setLoopOutTime(audioEngine.loopOutTime);
  };

  const handleExitLoop = () => {
    audioEngine.exitLoop();
    setIsLooping(false);
  };

  // Play Track Intro (Voice)
  const handlePlayIntro = async () => {
    if (!currentTrack?.djIntro) return;
    setIsSpeaking(true);
    try {
      await speakSpeech(
        currentTrack.djIntro,
        language,
        voiceSettings,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    } catch (err) {
      console.error('Error speaking intro:', err);
      setIsSpeaking(false);
    }
  };

  // Stop Voice Commentary
  const handleStopVoice = () => {
    audioEngine.stopAllSpeech();
    setIsSpeaking(false);
  };

  // Spontaneous Party Commentary
  const handleDropPartyCommentary = async (
    situation: PartySituationType,
    customNote: string,
    persona: DJPersonaType
  ): Promise<PartyCommentaryResult | null> => {
    if (!currentTrack) return null;

    try {
      const result = await generatePartyCommentary({
        situation,
        customNote,
        persona,
        currentTrack: { title: currentTrack.title, artist: currentTrack.artist },
        language,
        deckName: deckId,
      });

      // Show alert banner
      setCrowdAlert({ action: result.crowdAction, sfx: result.soundFx });
      setTimeout(() => setCrowdAlert(null), 8000);

      // Trigger matching sound FX cue right before the voice announces!
      if (result.soundFx) {
        audioEngine.playSynthesizedSfx(result.soundFx);
      }

      // Speak with music auto-ducking!
      speakSpeech(
        result.speechText,
        language,
        voiceSettings,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );

      return result;
    } catch (err) {
      console.error('Error dropping commentary:', err);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans pb-16">
      
      {/* Top Header */}
      <Header
        language={language}
        onToggleLanguage={handleToggleLanguage}
        deckId={deckId}
        onToggleDeckId={handleToggleDeckId}
        isDuckingActive={isDuckingActive}
        onOpenPartyModal={() => setIsPartyModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main Single Deck Station Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-5 space-y-4">
        
        {/* Dynamic Live Crowd Alert Toast (e.g. "Hands up!", "Cheer for the cake!") */}
        {crowdAlert && (
          <div className="sticky top-16 z-20 flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-xl shadow-red-950/50 animate-bounce">
            <div className="flex items-center gap-2">
              <span className="text-xl">📢</span>
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-100">
                  {language === 'sk' ? 'VÝZVA PRE PARKET' : 'DANCE FLOOR CALLOUT'}
                </div>
                <div className="text-sm font-bold tracking-wide">
                  {crowdAlert.action}
                </div>
              </div>
            </div>
            <button
              onClick={() => setCrowdAlert(null)}
              className="px-2 py-1 rounded bg-black/30 hover:bg-black/40 text-xs font-mono"
            >
              ✕
            </button>
          </div>
        )}

        {/* Section 1: Jog Wheel & Waveform (The Core Deck Interface) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          
          {/* Large Vinyl Jog Wheel */}
          <div className="lg:col-span-5 flex justify-center">
            <JogWheel
              deckId={deckId}
              isPlaying={isPlaying}
              bpm={currentTrack?.bpm || 128}
              pitchOffset={pitchOffset}
              currentTime={currentTime}
              duration={duration}
              onScratch={handleScratch}
              onNudge={handleNudge}
            />
          </div>

          {/* Waveform Scrubber & Primary Controls */}
          <div className="lg:col-span-7 space-y-3">
            <WaveformDisplay
              currentTime={currentTime}
              duration={duration}
              bpm={currentTrack?.bpm || 128}
              cuePoints={cuePoints}
              isLooping={isLooping}
              loopInTime={loopInTime}
              loopOutTime={loopOutTime}
              onSeek={handleSeek}
            />

            <DeckControls
              language={language}
              isPlaying={isPlaying}
              bpm={currentTrack?.bpm || 128}
              pitchOffset={pitchOffset}
              cuePoints={cuePoints}
              isLooping={isLooping}
              onPlayPause={handlePlayPause}
              onCue={handleCue}
              onSync={handleSync}
              onPitchChange={handlePitchChange}
              onResetPitch={handleResetPitch}
              onHotCuePress={handleHotCuePress}
              onDeleteHotCue={handleDeleteHotCue}
              onSetAutoLoop={handleSetAutoLoop}
              onExitLoop={handleExitLoop}
            />
          </div>
        </div>

        {/* Section 2: Mixer, 3-Band EQ & Sound FX Pads */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-7">
            <MixerSection language={language} />
          </div>
          <div className="md:col-span-5">
            <SoundFxPads language={language} />
          </div>
        </div>

        {/* Section 3: AI Track Trivia, Backstory & Voice Intro */}
        <AiTriviaPanel
          language={language}
          track={currentTrack}
          isSpeaking={isSpeaking}
          isAnalyzing={isAnalyzing}
          onPlayIntro={handlePlayIntro}
          onStopVoice={handleStopVoice}
          onReanalyze={handleReanalyze}
          onOpenEditModal={() => setIsEditTrackModalOpen(true)}
        />

        {/* Section 4: Track Uploader & Demo Bangers */}
        <TrackUploader
          language={language}
          currentTrack={currentTrack}
          demoTracks={demoTracks}
          isLoadingTrack={isLoadingTrack}
          onSelectTrack={handleSelectTrack}
          onUploadFile={handleUploadFile}
        />

      </main>

      {/* Modals */}
      <EditTrackModal
        isOpen={isEditTrackModalOpen}
        onClose={() => setIsEditTrackModalOpen(false)}
        language={language}
        track={currentTrack}
        isAnalyzing={isAnalyzing}
        onSaveTrack={handleSaveTrack}
      />

      <PartyCommentaryModal
        isOpen={isPartyModalOpen}
        onClose={() => setIsPartyModalOpen(false)}
        language={language}
        deckId={deckId}
        currentTrack={currentTrack}
        isSpeaking={isSpeaking}
        onDropCommentary={handleDropPartyCommentary}
        onStopVoice={handleStopVoice}
      />

      <DualPhoneSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        language={language}
        deckId={deckId}
        onToggleDeckId={handleToggleDeckId}
        currentBpm={currentTrack?.bpm ? currentTrack.bpm * (1 + pitchOffset / 100) : 128}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        language={language}
        settings={voiceSettings}
        onSaveSettings={handleSaveSettings}
      />

    </div>
  );
}

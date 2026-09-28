import React, { useState, useEffect } from 'react';
import { X, Pencil, Sparkles, Check, Music, User, Activity, Disc } from 'lucide-react';
import { TrackMetadata, Language } from '../types';
import { getTranslation } from '../locales/translations';

interface EditTrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  track: TrackMetadata | null;
  isAnalyzing: boolean;
  onSaveTrack: (
    updated: { title: string; artist: string; genre?: string; bpm?: number },
    recheckWithAi: boolean
  ) => void;
}

export const EditTrackModal: React.FC<EditTrackModalProps> = ({
  isOpen,
  onClose,
  language,
  track,
  isAnalyzing,
  onSaveTrack,
}) => {
  const t = getTranslation(language);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [bpm, setBpm] = useState<number>(128);

  useEffect(() => {
    if (track) {
      setTitle(track.title || '');
      setArtist(track.artist || '');
      setGenre(track.genre || '');
      setBpm(track.bpm || 128);
    }
  }, [track, isOpen]);

  if (!isOpen || !track) return null;

  const handleSaveAndCheckAi = () => {
    if (!title.trim()) return;
    onSaveTrack(
      {
        title: title.trim(),
        artist: artist.trim() || 'Unknown Artist',
        genre: genre.trim() || undefined,
        bpm: bpm > 0 ? bpm : 128,
      },
      true
    );
    onClose();
  };

  const handleSaveOnly = () => {
    if (!title.trim()) return;
    onSaveTrack(
      {
        title: title.trim(),
        artist: artist.trim() || 'Unknown Artist',
        genre: genre.trim() || undefined,
        bpm: bpm > 0 ? bpm : 128,
      },
      false
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-600 text-white shadow-md">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-['Chakra_Petch',sans-serif]">
                {t.editTrackTitle}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {language === 'sk'
                  ? 'Zadaj správny názov a interpreta pre presnú AI analýzu'
                  : 'Specify title and artist for accurate AI verification'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Helpful Tip */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-xs text-neutral-300">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t.editTrackHint}
          </p>
        </div>

        {/* Inputs */}
        <div className="space-y-3">
          {/* Song Title Input */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-300">
              <Music className="w-3.5 h-3.5 text-cyan-400" />
              <span>{t.songTitleLabel} *</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Levels, Titanium, Bratislava..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500 font-sans"
              autoFocus
            />
          </div>

          {/* Artist / Interpret Input */}
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-mono font-bold text-neutral-300">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.artistLabel}</span>
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. Avicii, David Guetta, Rytmus..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          {/* Secondary fields: Genre & BPM */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-mono text-neutral-400">
                {t.genreLabel}
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Tech House, Pop..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div className="space-y-1">
              <label className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>{t.bpmLabel}</span>
                <span className="text-cyan-400 font-bold">{bpm}</span>
              </label>
              <input
                type="number"
                min="60"
                max="200"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value, 10) || 128)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {/* Main Action: Save and recheck with AI */}
          <button
            onClick={handleSaveAndCheckAi}
            disabled={!title.trim() || isAnalyzing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-950 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{t.saveAndRecheck}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveOnly}
              disabled={!title.trim()}
              className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold border border-neutral-700 transition-colors"
            >
              {t.saveChanges}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white text-xs font-medium border border-neutral-700 transition-colors"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

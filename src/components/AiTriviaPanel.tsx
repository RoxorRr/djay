import React from 'react';
import { Sparkles, Mic, Volume2, Square, RefreshCw, Info, Tag } from 'lucide-react';
import { TrackMetadata, Language } from '../types';
import { getTranslation } from '../locales/translations';

interface AiTriviaPanelProps {
  language: Language;
  track: TrackMetadata | null;
  isSpeaking: boolean;
  isAnalyzing: boolean;
  onPlayIntro: () => void;
  onStopVoice: () => void;
  onReanalyze: () => void;
}

export const AiTriviaPanel: React.FC<AiTriviaPanelProps> = ({
  language,
  track,
  isSpeaking,
  isAnalyzing,
  onPlayIntro,
  onStopVoice,
  onReanalyze,
}) => {
  const t = getTranslation(language);

  if (!track) return null;

  return (
    <div className="w-full bg-neutral-900/90 rounded-xl p-4 sm:p-5 border border-neutral-800 shadow-xl space-y-4">
      
      {/* Track Title, Artist & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              {t.loadedTrack}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-['Chakra_Petch',sans-serif] text-white tracking-wide mt-0.5">
            {track.title}
          </h2>
          <div className="text-sm font-medium text-neutral-300">
            {track.artist}
          </div>
        </div>

        {/* Badges / Stats unboxed with typographic separators */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800/80">
          <span className="text-white font-bold">{track.genre || 'Dance'}</span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span className="text-cyan-400 font-bold">{track.bpm} BPM</span>
          <span aria-hidden="true" className="text-neutral-600">·</span>
          <span className="text-amber-400">{track.key || '8A'}</span>
          {track.year && (
            <>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span>{track.year}</span>
            </>
          )}
        </div>
      </div>

      {/* Spoken DJ Voice Intro Banner */}
      <div className="relative bg-gradient-to-r from-red-950/40 via-neutral-950 to-neutral-950 rounded-xl p-3.5 border border-red-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-red-400" />
            <span className="text-xs font-mono font-bold text-red-300 uppercase tracking-wide">
              {t.djIntroSpeech}
            </span>
          </div>

          {/* Intro Audio Action */}
          {isSpeaking ? (
            <button
              onClick={onStopVoice}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-red-950 cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>{t.stopVoice}</span>
            </button>
          ) : (
            <button
              onClick={onPlayIntro}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold transition-all active:scale-95 shadow-md shadow-red-950 cursor-pointer disabled:opacity-50"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{t.playIntro}</span>
            </button>
          )}
        </div>

        <p className="text-xs sm:text-sm text-neutral-200 italic font-sans leading-relaxed">
          "{track.djIntro}"
        </p>

        {isSpeaking && (
          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono text-red-400 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>{t.playingVoice} (Music Auto-Ducked)</span>
          </div>
        )}
      </div>

      {/* AI Trivia & Backstory List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-1.5 font-bold tracking-wider text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.trackTrivia}</span>
          </span>
          <button
            onClick={onReanalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? t.analyzingTrack : t.reanalyze}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {track.facts?.map((fact, index) => (
            <div
              key={index}
              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-950/70 border border-neutral-800/80 text-xs text-neutral-300 leading-relaxed"
            >
              <span className="flex items-center justify-center w-5 h-5 rounded bg-neutral-800 text-cyan-400 font-mono text-[10px] font-bold shrink-0 mt-0.5">
                {index + 1}
              </span>
              <span>{fact}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

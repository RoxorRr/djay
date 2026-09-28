import React from 'react';
import { Play, Pause, RotateCcw, Repeat } from 'lucide-react';
import { CuePoint, Language } from '../types';
import { getTranslation } from '../locales/translations';

interface DeckControlsProps {
  language: Language;
  isPlaying: boolean;
  bpm: number;
  pitchOffset: number; // percentage (-8 to +8)
  cuePoints: CuePoint[];
  isLooping: boolean;
  onPlayPause: () => void;
  onCue: () => void;
  onSync: () => void;
  onPitchChange: (val: number) => void;
  onResetPitch: () => void;
  onHotCuePress: (id: number) => void;
  onDeleteHotCue: (id: number) => void;
  onSetAutoLoop: (beats: number) => void;
  onExitLoop: () => void;
}

export const DeckControls: React.FC<DeckControlsProps> = ({
  language,
  isPlaying,
  bpm,
  pitchOffset,
  cuePoints,
  isLooping,
  onPlayPause,
  onCue,
  onSync,
  onPitchChange,
  onResetPitch,
  onHotCuePress,
  onDeleteHotCue,
  onSetAutoLoop,
  onExitLoop,
}) => {
  const t = getTranslation(language);

  const hotCueColors = ['#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
  const loopBeats = [0.25, 0.5, 1, 2, 4, 8];

  return (
    <div className="w-full bg-neutral-900/90 rounded-xl p-3 sm:p-4 border border-neutral-800 shadow-xl space-y-4">
      
      {/* Primary Transport Row: CUE, PLAY/PAUSE, SYNC & PITCH */}
      <div className="grid grid-cols-12 gap-2.5 items-stretch">
        
        {/* CUE Button */}
        <button
          onClick={onCue}
          className="col-span-3 sm:col-span-3 h-16 sm:h-20 rounded-xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-neutral-950 font-bold font-['Chakra_Petch',sans-serif] text-sm sm:text-base flex flex-col items-center justify-center shadow-lg shadow-amber-950/40 border-2 border-amber-300/40 transition-all cursor-pointer"
        >
          <span className="tracking-wider">{t.cue}</span>
          <span className="text-[10px] font-mono font-normal opacity-80">BACK</span>
        </button>

        {/* PLAY / PAUSE Button (Massive Tactile DJ Button) */}
        <button
          onClick={onPlayPause}
          className={`col-span-5 sm:col-span-5 h-16 sm:h-20 rounded-xl flex items-center justify-center gap-2 font-bold font-['Chakra_Petch',sans-serif] text-base sm:text-lg shadow-xl transition-all active:scale-95 cursor-pointer border-2 ${
            isPlaying
              ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-neutral-950 border-emerald-300/60 shadow-emerald-950/60 animate-pulse'
              : 'bg-gradient-to-b from-neutral-800 to-neutral-900 text-emerald-400 border-neutral-700 hover:border-emerald-500/50'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-6 h-6 fill-current" />
              <span>{t.pause}</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current" />
              <span>{t.play}</span>
            </>
          )}
        </button>

        {/* SYNC Button */}
        <button
          onClick={onSync}
          className="col-span-4 sm:col-span-4 h-16 sm:h-20 rounded-xl bg-gradient-to-b from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 active:scale-95 text-white font-bold font-['Chakra_Petch',sans-serif] text-xs sm:text-sm flex flex-col items-center justify-center shadow-lg shadow-cyan-950/40 border-2 border-cyan-400/40 transition-all cursor-pointer"
        >
          <span className="tracking-wider">{t.sync}</span>
          <span className="text-[10px] font-mono font-normal opacity-80">128.0 BPM</span>
        </button>
      </div>

      {/* Pitch Fader & Tempo Control */}
      <div className="bg-neutral-950/70 rounded-lg p-3 border border-neutral-800/80">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-neutral-400 flex items-center gap-1">
            <span>{t.pitch}</span>
            <span className="text-cyan-400 font-bold">
              ({pitchOffset >= 0 ? `+${pitchOffset.toFixed(1)}%` : `${pitchOffset.toFixed(1)}%`})
            </span>
          </span>
          <button
            onClick={onResetPitch}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-white px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 active:scale-95 transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t.resetPitch}</span>
          </button>
        </div>

        {/* Tactile Pitch Slider */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-neutral-400">-8%</span>
          <input
            type="range"
            min="-8"
            max="8"
            step="0.1"
            value={pitchOffset}
            onChange={(e) => onPitchChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[10px] font-mono text-neutral-400">+8%</span>
        </div>
      </div>

      {/* Hot Cue Pads (1 - 4) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="tracking-wider">{t.hotCues}</span>
          <span className="text-[10px] text-neutral-500">{t.deleteCue}</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((id) => {
            const cue = cuePoints.find((c) => c.id === id);
            const isSet = !!cue;

            return (
              <button
                key={id}
                onClick={() => onHotCuePress(id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (isSet) onDeleteHotCue(id);
                }}
                className={`h-12 rounded-lg font-mono font-bold text-xs flex flex-col items-center justify-center border transition-all active:scale-95 cursor-pointer relative overflow-hidden ${
                  isSet
                    ? 'text-white shadow-md'
                    : 'bg-neutral-800/80 text-neutral-500 border-neutral-700 hover:border-neutral-600'
                }`}
                style={
                  isSet
                    ? {
                        backgroundColor: hotCueColors[id - 1] + '33',
                        borderColor: hotCueColors[id - 1],
                        color: hotCueColors[id - 1],
                      }
                    : {}
                }
              >
                <span>CUE {id}</span>
                <span className="text-[9px] font-normal">
                  {isSet ? `${cue?.time.toFixed(1)}s` : 'EMPTY'}
                </span>

                {isSet && (
                  <span
                    className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: hotCueColors[id - 1] }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-Loop Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-1.5 tracking-wider">
            <Repeat className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.loop}</span>
          </span>
          {isLooping && (
            <button
              onClick={onExitLoop}
              className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40 hover:bg-amber-500/30"
            >
              {t.loopExit}
            </button>
          )}
        </div>

        <div className="grid grid-cols-6 gap-1.5">
          {loopBeats.map((beats) => (
            <button
              key={beats}
              onClick={() => onSetAutoLoop(beats)}
              className={`py-2 rounded font-mono text-[11px] font-bold border transition-all active:scale-95 cursor-pointer ${
                isLooping
                  ? 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-amber-400'
                  : 'bg-neutral-800/80 text-neutral-400 border-neutral-700/80 hover:text-white hover:border-neutral-600'
              }`}
            >
              {beats < 1 ? `1/${1 / beats}` : `${beats}`}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

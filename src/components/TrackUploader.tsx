import React, { useRef } from 'react';
import { UploadCloud, Music, Play, Sparkles } from 'lucide-react';
import { TrackMetadata, Language } from '../types';
import { getTranslation } from '../locales/translations';

interface TrackUploaderProps {
  language: Language;
  currentTrack: TrackMetadata | null;
  demoTracks: TrackMetadata[];
  isLoadingTrack: boolean;
  onSelectTrack: (track: TrackMetadata) => void;
  onUploadFile: (file: File) => void;
}

export const TrackUploader: React.FC<TrackUploaderProps> = ({
  language,
  currentTrack,
  demoTracks,
  isLoadingTrack,
  onSelectTrack,
  onUploadFile,
}) => {
  const t = getTranslation(language);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  return (
    <div className="w-full bg-neutral-900/90 rounded-xl p-3 sm:p-4 border border-neutral-800 shadow-xl space-y-3">
      {/* Upload Zone Button for Phone */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-neutral-950/60 hover:bg-cyan-950/20 cursor-pointer transition-all active:scale-[0.99]"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 mb-2 transition-colors">
          <UploadCloud className="w-6 h-6 animate-pulse" />
        </div>
        <div className="text-sm font-bold text-white tracking-wide text-center">
          {t.uploadSong}
        </div>
        <div className="text-xs text-neutral-400 text-center mt-0.5">
          {t.uploadHint}
        </div>
      </div>

      {/* Demo Bangers Quick Switcher */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.demoTracks}</span>
          </span>
          <span className="text-[10px] text-neutral-500">READY TO DROP</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {demoTracks.map((track) => {
            const isCurrent = currentTrack?.id === track.id;
            return (
              <button
                key={track.id}
                onClick={() => onSelectTrack(track)}
                disabled={isLoadingTrack}
                className={`p-2 rounded-lg text-left border transition-all active:scale-95 cursor-pointer flex items-center justify-between gap-2 ${
                  isCurrent
                    ? 'bg-cyan-500/20 border-cyan-500/60 text-white shadow-md'
                    : 'bg-neutral-950/70 border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                }`}
              >
                <div className="truncate flex-1">
                  <div className="font-semibold text-xs truncate">{track.title}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{track.artist}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                    {track.bpm} BPM
                  </span>
                  <span className="text-[9px] font-mono text-neutral-500 block">
                    {track.key || '8A'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

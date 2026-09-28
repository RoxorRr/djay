import React from 'react';
import { Sparkles, Radio, Zap, AlertTriangle, Disc, RefreshCw } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { Language, SoundFxDefinition } from '../types';
import { getTranslation } from '../locales/translations';

interface SoundFxPadsProps {
  language: Language;
}

export const SoundFxPads: React.FC<SoundFxPadsProps> = ({ language }) => {
  const t = getTranslation(language);

  const pads: SoundFxDefinition[] = [
    {
      id: 'airhorn',
      name: t.airhorn,
      nameSk: 'Húkačka (Airhorn)',
      icon: '📢',
      color: 'from-amber-600 to-yellow-600',
    },
    {
      id: 'scratch',
      name: t.scratch,
      nameSk: 'Scratch',
      icon: '💿',
      color: 'from-cyan-600 to-blue-600',
    },
    {
      id: 'laser',
      name: t.laser,
      nameSk: 'Laser Efekt',
      icon: '⚡',
      color: 'from-purple-600 to-indigo-600',
    },
    {
      id: 'siren',
      name: t.siren,
      nameSk: 'Párty Siréna',
      icon: '🚨',
      color: 'from-red-600 to-rose-600',
    },
    {
      id: 'subdrop',
      name: t.subdrop,
      nameSk: 'Sub Basy',
      icon: '💣',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      id: 'rewind',
      name: t.rewind,
      nameSk: 'Vinyl Rewind',
      icon: '⏪',
      color: 'from-pink-600 to-fuchsia-600',
    },
  ];

  const handleTrigger = (id: string) => {
    audioEngine.playSynthesizedSfx(id);
  };

  return (
    <div className="w-full bg-neutral-900/90 rounded-xl p-3 sm:p-4 border border-neutral-800 shadow-xl space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-neutral-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{t.soundFx}</span>
        </div>
        <span className="text-[10px] font-mono text-neutral-500">INSTANT HYPE PADS</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {pads.map((pad) => (
          <button
            key={pad.id}
            onClick={() => handleTrigger(pad.id)}
            className={`h-14 sm:h-16 rounded-xl bg-gradient-to-b ${pad.color} hover:brightness-110 active:scale-95 text-white flex flex-col items-center justify-center p-1.5 shadow-md transition-all border border-white/20 cursor-pointer`}
          >
            <span className="text-lg leading-none mb-0.5">{pad.icon}</span>
            <span className="text-[10px] font-mono font-bold truncate max-w-full text-center">
              {pad.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

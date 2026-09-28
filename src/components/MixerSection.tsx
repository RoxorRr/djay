import React, { useState, useEffect } from 'react';
import { Sliders, VolumeX, ShieldAlert } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { Language } from '../types';
import { getTranslation } from '../locales/translations';

interface MixerSectionProps {
  language: Language;
}

export const MixerSection: React.FC<MixerSectionProps> = ({ language }) => {
  const t = getTranslation(language);

  // EQ Gains in dB (-26 to +6)
  const [high, setHigh] = useState(0);
  const [mid, setMid] = useState(0);
  const [low, setLow] = useState(0);

  // Kill States
  const [killHigh, setKillHigh] = useState(false);
  const [killMid, setKillMid] = useState(false);
  const [killLow, setKillLow] = useState(false);

  // DJ Resonant Filter (-100 to +100)
  const [filter, setFilter] = useState(0);

  // Deck Volume Gain (0 to 1.2)
  const [volume, setVolume] = useState(1.0);

  // Master Gain (0 to 1.2)
  const [master, setMaster] = useState(1.0);

  // Real-time VU meter peak
  const [vuLevel, setVuLevel] = useState(0);

  // Animate VU meter
  useEffect(() => {
    let animId: number;
    const freq = new Uint8Array(32);

    const updateVu = () => {
      audioEngine.getFrequencyData(freq);
      let sum = 0;
      for (let i = 0; i < freq.length; i++) {
        sum += freq[i];
      }
      const avg = sum / (freq.length * 255);
      setVuLevel(avg * volume * master);
      animId = requestAnimationFrame(updateVu);
    };

    animId = requestAnimationFrame(updateVu);
    return () => cancelAnimationFrame(animId);
  }, [volume, master]);

  // Handle High
  const handleHighChange = (val: number) => {
    setHigh(val);
    if (!killHigh) audioEngine.setHigh(val);
  };

  const toggleKillHigh = () => {
    const next = !killHigh;
    setKillHigh(next);
    audioEngine.setHigh(next ? -40 : high);
  };

  // Handle Mid
  const handleMidChange = (val: number) => {
    setMid(val);
    if (!killMid) audioEngine.setMid(val);
  };

  const toggleKillMid = () => {
    const next = !killMid;
    setKillMid(next);
    audioEngine.setMid(next ? -40 : mid);
  };

  // Handle Low (Bass)
  const handleLowChange = (val: number) => {
    setLow(val);
    if (!killLow) audioEngine.setLow(val);
  };

  const toggleKillLow = () => {
    const next = !killLow;
    setKillLow(next);
    audioEngine.setLow(next ? -40 : low);
  };

  // Handle Filter
  const handleFilterChange = (val: number) => {
    setFilter(val);
    audioEngine.setDjFilter(val);
  };

  // Reset filter to center
  const resetFilter = () => {
    setFilter(0);
    audioEngine.setDjFilter(0);
  };

  // Handle Volume
  const handleVolumeChange = (val: number) => {
    setVolume(val);
    audioEngine.setDeckGain(val);
  };

  // Handle Master
  const handleMasterChange = (val: number) => {
    setMaster(val);
    audioEngine.setMasterGain(val);
  };

  // 12-segment LED VU meter bars
  const ledSegments = Array.from({ length: 10 }, (_, i) => {
    const threshold = (i + 1) / 10;
    const isLit = vuLevel >= threshold;
    const isRed = i >= 8;
    const isYellow = i >= 6 && i < 8;

    return {
      isLit,
      color: isRed ? 'bg-red-500' : isYellow ? 'bg-amber-400' : 'bg-emerald-400',
    };
  });

  return (
    <div className="w-full bg-neutral-900/90 rounded-xl p-3 sm:p-4 border border-neutral-800 shadow-xl space-y-4">
      {/* Header with Title and VU Meter */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold tracking-wider text-neutral-300">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>{t.mixer}</span>
        </div>

        {/* LED VU Meter Bar */}
        <div className="flex items-center gap-1 bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
          <span className="text-[9px] font-mono text-neutral-500 mr-1">VU</span>
          <div className="flex items-end gap-0.5 h-3">
            {ledSegments.map((seg, idx) => (
              <div
                key={idx}
                className={`w-1 h-2.5 rounded-xs transition-colors duration-75 ${
                  seg.isLit ? seg.color : 'bg-neutral-800'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3-Band EQ Strip: High, Mid, Low with KILL buttons */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        
        {/* HIGH */}
        <div className="bg-neutral-950/80 rounded-lg p-2 border border-neutral-800/80 flex flex-col items-center">
          <span className="text-[10px] font-mono font-bold text-neutral-400">{t.high}</span>
          <span className="text-xs font-mono text-cyan-400 my-1">{killHigh ? 'KILL' : `${high}dB`}</span>
          <input
            type="range"
            min="-24"
            max="6"
            step="1"
            value={high}
            disabled={killHigh}
            onChange={(e) => handleHighChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30"
          />
          <button
            onClick={toggleKillHigh}
            className={`mt-2 w-full py-1 text-[10px] font-mono font-bold rounded border transition-colors active:scale-95 ${
              killHigh
                ? 'bg-red-500 text-white border-red-400'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            {killHigh ? 'KILLED' : t.kill}
          </button>
        </div>

        {/* MID */}
        <div className="bg-neutral-950/80 rounded-lg p-2 border border-neutral-800/80 flex flex-col items-center">
          <span className="text-[10px] font-mono font-bold text-neutral-400">{t.mid}</span>
          <span className="text-xs font-mono text-cyan-400 my-1">{killMid ? 'KILL' : `${mid}dB`}</span>
          <input
            type="range"
            min="-24"
            max="6"
            step="1"
            value={mid}
            disabled={killMid}
            onChange={(e) => handleMidChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30"
          />
          <button
            onClick={toggleKillMid}
            className={`mt-2 w-full py-1 text-[10px] font-mono font-bold rounded border transition-colors active:scale-95 ${
              killMid
                ? 'bg-red-500 text-white border-red-400'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            {killMid ? 'KILLED' : t.kill}
          </button>
        </div>

        {/* LOW / BASS */}
        <div className="bg-neutral-950/80 rounded-lg p-2 border border-neutral-800/80 flex flex-col items-center">
          <span className="text-[10px] font-mono font-bold text-neutral-400">{t.low}</span>
          <span className="text-xs font-mono text-cyan-400 my-1">{killLow ? 'KILL' : `${low}dB`}</span>
          <input
            type="range"
            min="-24"
            max="6"
            step="1"
            value={low}
            disabled={killLow}
            onChange={(e) => handleLowChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30"
          />
          <button
            onClick={toggleKillLow}
            className={`mt-2 w-full py-1 text-[10px] font-mono font-bold rounded border transition-colors active:scale-95 ${
              killLow
                ? 'bg-red-500 text-white border-red-400'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
            }`}
          >
            {killLow ? 'BASS OFF' : t.kill}
          </button>
        </div>
      </div>

      {/* DJ Resonant Filter Sweep */}
      <div className="bg-neutral-950/80 rounded-lg p-2.5 border border-neutral-800/80 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-neutral-400 font-bold">{t.filter}</span>
          <button
            onClick={resetFilter}
            className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
          >
            {filter === 0 ? 'NEUTRAL' : `${filter > 0 ? `HPF +${filter}` : `LPF ${filter}`}`} (RESET)
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono text-neutral-500">LPF</span>
          <input
            type="range"
            min="-100"
            max="100"
            step="1"
            value={filter}
            onChange={(e) => handleFilterChange(parseInt(e.target.value))}
            className="w-full h-2 bg-neutral-800 rounded appearance-none cursor-pointer accent-amber-400"
          />
          <span className="text-[9px] font-mono text-neutral-500">HPF</span>
        </div>
      </div>

      {/* Channel Faders: Deck Gain & Master Gain */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Deck Volume */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-neutral-400">
            <span>{t.volume}</span>
            <span className="text-white font-bold">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.2"
            step="0.02"
            value={volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-neutral-800 rounded appearance-none cursor-pointer accent-emerald-400"
          />
        </div>

        {/* Master Output */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-neutral-400">
            <span>{t.master}</span>
            <span className="text-white font-bold">{Math.round(master * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.2"
            step="0.02"
            value={master}
            onChange={(e) => handleMasterChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

    </div>
  );
};

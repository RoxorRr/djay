import React, { useState } from 'react';
import { X, Smartphone, Copy, Check, Radio, ArrowRight, Share2 } from 'lucide-react';
import { Language, DeckId } from '../types';
import { getTranslation } from '../locales/translations';

interface DualPhoneSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  deckId: DeckId;
  onToggleDeckId: () => void;
  currentBpm: number;
}

export const DualPhoneSyncModal: React.FC<DualPhoneSyncModalProps> = ({
  isOpen,
  onClose,
  language,
  deckId,
  onToggleDeckId,
  currentBpm,
}) => {
  const t = getTranslation(language);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-600 text-white shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-['Chakra_Petch',sans-serif]">
                {t.syncModalTitle}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {language === 'sk' ? '2 telefóny = kompletný DJ pult' : '2 phones = full 2-deck setup'}
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

        {/* Current Phone Role Selection */}
        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>{t.phoneRole}</span>
            <span className="text-cyan-400 font-bold">ACTIVE: {deckId}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                if (deckId !== 'DECK A') onToggleDeckId();
              }}
              className={`p-2.5 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                deckId === 'DECK A'
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-md'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <span>📱 PHONE 1: DECK A</span>
            </button>

            <button
              onClick={() => {
                if (deckId !== 'DECK B') onToggleDeckId();
              }}
              className={`p-2.5 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                deckId === 'DECK B'
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-md'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <span>📱 PHONE 2: DECK B</span>
            </button>
          </div>
        </div>

        {/* Master Tempo Reference for 2nd Phone */}
        <div className="bg-neutral-950/80 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-neutral-400">REFERENCE MASTER BPM</div>
            <div className="text-xl font-bold font-['Chakra_Petch',sans-serif] text-cyan-400">
              {currentBpm.toFixed(1)} <span className="text-xs text-neutral-500">BPM</span>
            </div>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold border border-neutral-700 active:scale-95 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{t.linkCopied}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t.copyLink}</span>
              </>
            )}
          </button>
        </div>

        {/* 3 Pro Tips for Dual Phone Mixing */}
        <div className="space-y-1.5 text-xs text-neutral-300">
          <div className="font-mono font-bold text-neutral-400 text-[11px]">
            {t.howItWorks}
          </div>
          <div className="space-y-1 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80 text-[11px] leading-relaxed">
            <div>{t.tip1}</div>
            <div>{t.tip2}</div>
            <div>{t.tip3}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-colors"
        >
          {t.close}
        </button>

      </div>
    </div>
  );
};

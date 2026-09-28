import React from 'react';
import { Volume2, Smartphone, Mic, Settings as SettingsIcon, Radio } from 'lucide-react';
import { Language, DeckId } from '../types';
import { getTranslation } from '../locales/translations';

interface HeaderProps {
  language: Language;
  onToggleLanguage: () => void;
  deckId: DeckId;
  onToggleDeckId: () => void;
  isDuckingActive: boolean;
  onOpenPartyModal: () => void;
  onOpenSyncModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  deckId,
  onToggleDeckId,
  isDuckingActive,
  onOpenPartyModal,
  onOpenSyncModal,
  onOpenSettingsModal,
}) => {
  const t = getTranslation(language);

  return (
    <header className="sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-3 py-2.5 sm:px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand & Deck Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-600 text-white shadow-md shadow-red-950/40">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white font-['Chakra_Petch',sans-serif] text-base sm:text-lg leading-tight">
                VIBEDECK
              </span>
              {/* Interactive Deck Badge */}
              <button
                onClick={onToggleDeckId}
                title={t.switchDeckNotice}
                className={`text-xs px-2 py-0.5 rounded font-mono font-bold tracking-wider transition-all border ${
                  deckId === 'DECK A'
                    ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-sm shadow-cyan-950'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm shadow-amber-950'
                }`}
              >
                {deckId} ▾
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-neutral-400">
              <span>{t.deckSubtitle}</span>
              <span aria-hidden="true">·</span>
              <span className="text-neutral-500">{language === 'sk' ? '2. mobil = Deck B' : 'Phone 2 = Deck B'}</span>
            </div>
          </div>
        </div>

        {/* Live Audio Ducking Indicator */}
        {isDuckingActive && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-mono animate-pulse">
            <Volume2 className="w-3.5 h-3.5" />
            <span className="font-medium text-[11px]">{t.duckingActive}</span>
          </div>
        )}

        {/* Top Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Party MC Shoutout Button */}
          <button
            onClick={onOpenPartyModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold shadow-md shadow-red-950/30 transition-transform active:scale-95 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.partyMcButton}</span>
            <span className="xs:hidden">MC</span>
          </button>

          {/* 2nd Phone Link Button */}
          <button
            onClick={onOpenSyncModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700/60 transition-colors cursor-pointer"
            title={t.dualPhoneSync}
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{t.dualPhoneSync}</span>
          </button>

          {/* Bilingual Language Switcher (EN / SK) */}
          <button
            onClick={onToggleLanguage}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700/60 transition-colors cursor-pointer"
            title={language === 'en' ? 'Prepnúť do slovenčiny' : 'Switch to English'}
          >
            {language === 'en' ? '🇸🇰 SK' : '🇬🇧 EN'}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettingsModal}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700/60 transition-colors cursor-pointer"
            title={t.settings}
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

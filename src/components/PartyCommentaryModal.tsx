import React, { useState } from 'react';
import { X, Mic, Volume2, Sparkles, Send, Radio, AlertCircle } from 'lucide-react';
import {
  Language,
  PartySituationType,
  DJPersonaType,
  PartyCommentaryResult,
  TrackMetadata,
  DeckId,
} from '../types';
import { getTranslation } from '../locales/translations';

interface PartyCommentaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  deckId: DeckId;
  currentTrack: TrackMetadata | null;
  isSpeaking: boolean;
  onDropCommentary: (
    situation: PartySituationType,
    customNote: string,
    persona: DJPersonaType
  ) => Promise<PartyCommentaryResult | null>;
  onStopVoice: () => void;
}

export const PartyCommentaryModal: React.FC<PartyCommentaryModalProps> = ({
  isOpen,
  onClose,
  language,
  deckId,
  currentTrack,
  isSpeaking,
  onDropCommentary,
  onStopVoice,
}) => {
  const t = getTranslation(language);

  const [selectedSituation, setSelectedSituation] = useState<PartySituationType>('cake');
  const [selectedPersona, setSelectedPersona] = useState<DJPersonaType>('hype_mc');
  const [customText, setCustomText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState<PartyCommentaryResult | null>(null);

  if (!isOpen) return null;

  const situationKeys: PartySituationType[] = [
    'cake',
    'spill',
    'hype',
    'dance_battle',
    'toast',
    'closing',
    'lost_item',
    'shot_time',
    'custom',
  ];

  const personaKeys: DJPersonaType[] = [
    'hype_mc',
    'radio_smooth',
    'techno_shaman',
    'sarcastic_host',
  ];

  const handleTrigger = async () => {
    setIsGenerating(true);
    try {
      const res = await onDropCommentary(selectedSituation, customText, selectedPersona);
      if (res) {
        setLastResult(res);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-600 text-white shadow-md">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-['Chakra_Petch',sans-serif]">
                {t.partySituationsTitle}
              </h3>
              <p className="text-[11px] text-neutral-400">
                {t.partySituationsDesc}
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

        {/* DJ Persona Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-neutral-300">
            {t.selectPersona}
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {personaKeys.map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPersona(p)}
                className={`p-2 rounded-lg text-xs text-left border transition-all active:scale-95 cursor-pointer font-medium ${
                  selectedPersona === p
                    ? 'bg-red-600/20 border-red-500 text-white shadow-sm'
                    : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                }`}
              >
                {t.personas[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Party Situation Buttons */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold text-neutral-300">
            {t.selectSituation}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {situationKeys.map((sit) => (
              <button
                key={sit}
                onClick={() => setSelectedSituation(sit)}
                className={`p-2 rounded-lg text-xs text-left border transition-all active:scale-95 cursor-pointer leading-tight ${
                  selectedSituation === sit
                    ? 'bg-cyan-500/20 border-cyan-500 text-white font-semibold shadow-sm'
                    : 'bg-neutral-950/70 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-white'
                }`}
              >
                {t.situations[sit]}
              </button>
            ))}
          </div>
        </div>

        {/* Custom text input if custom or extra details */}
        <div className="space-y-1">
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={t.customSituationPlaceholder}
            rows={2}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-red-500 resize-none font-sans"
          />
        </div>

        {/* Generated Live Result Showcase */}
        {lastResult && (
          <div className="bg-neutral-950/90 rounded-xl p-3 border border-red-500/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-red-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>LAST DJ SHOUTOUT</span>
              </span>
              <span className="text-[10px] bg-red-600/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
                {t.crowdActionLabel}: {lastResult.crowdAction}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-200 italic font-sans leading-relaxed">
              "{lastResult.speechText}"
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          {isSpeaking ? (
            <button
              onClick={onStopVoice}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-950 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{t.stopVoice}</span>
            </button>
          ) : (
            <button
              onClick={handleTrigger}
              disabled={isGenerating}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-950 transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{t.generating}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>{t.generateCommentary}</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-medium border border-neutral-700 transition-colors"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};

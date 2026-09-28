import React, { useState } from 'react';
import { X, Key, Mic, Sliders, Volume2, Save, Sparkles, Check } from 'lucide-react';
import { Language, VoiceSettings } from '../types';
import { getTranslation } from '../locales/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  settings: VoiceSettings;
  onSaveSettings: (settings: VoiceSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  language,
  settings,
  onSaveSettings,
}) => {
  const t = getTranslation(language);

  const [provider, setProvider] = useState(settings.provider);
  const [speechifyApiKey, setSpeechifyApiKey] = useState(settings.speechifyApiKey);
  const [speechifyVoice, setSpeechifyVoice] = useState(settings.speechifyVoice);
  const [geminiVoice, setGeminiVoice] = useState(settings.geminiVoice);
  const [duckingAmount, setDuckingAmount] = useState(settings.duckingAmount);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      provider,
      speechifyApiKey,
      speechifyVoice,
      geminiVoice,
      duckingAmount,
      speechRate: settings.speechRate,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-800 text-cyan-400 shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white font-['Chakra_Petch',sans-serif]">
                {t.settingsTitle}
              </h3>
              <p className="text-[11px] text-neutral-400">
                Speechify.io & Voice Engine
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

        {/* Speechify Integration Section */}
        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2.5">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-neutral-200">
              {t.speechifyTitle}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 leading-relaxed">
            {t.speechifyDesc}
          </p>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-neutral-400">
              {t.speechifyKeyLabel}
            </label>
            <input
              type="password"
              value={speechifyApiKey}
              onChange={(e) => setSpeechifyApiKey(e.target.value)}
              placeholder={t.speechifyKeyPlaceholder}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-neutral-400">
              Speechify Voice ID
            </label>
            <select
              value={speechifyVoice}
              onChange={(e) => setSpeechifyVoice(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="george">George (Natural British / Radio Host)</option>
              <option value="simone">Simone (Crisp Studio Narrator)</option>
              <option value="henry">Henry (Dynamic Club MC)</option>
              <option value="oliver">Oliver (Deep Smooth Announcer)</option>
              <option value="kristy">Kristy (Energetic Hype Host)</option>
            </select>
          </div>
        </div>

        {/* Gemini AI Voice Selection */}
        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold text-neutral-200">
              Google Gemini Flash TTS Voice
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(['Puck', 'Fenrir', 'Kore', 'Zephyr'] as const).map((voice) => (
              <button
                key={voice}
                onClick={() => setGeminiVoice(voice)}
                className={`p-2 rounded-lg text-xs font-mono font-bold border transition-all ${
                  geminiVoice === voice
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {voice}
              </button>
            ))}
          </div>
        </div>

        {/* Music Auto-Ducking Settings */}
        <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-300 font-bold">{t.duckingLabel}</span>
            <span className="text-cyan-400 font-bold">{Math.round(duckingAmount * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="0.95"
            step="0.05"
            value={duckingAmount}
            onChange={(e) => setDuckingAmount(parseFloat(e.target.value))}
            className="w-full h-2 bg-neutral-800 rounded appearance-none cursor-pointer accent-cyan-400"
          />
          <p className="text-[10px] text-neutral-500">
            {t.duckingHelp}
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-950 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>SAVED!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{t.saveSettings}</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-medium border border-neutral-700"
          >
            {t.close}
          </button>
        </div>

      </div>
    </div>
  );
};

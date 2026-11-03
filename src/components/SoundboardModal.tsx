/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  playCorrectSound,
  playBuzzerSound,
  playDramaticTwistSound,
  playHeistSound,
  playJackpotChime,
  playTimerTickSound,
  playVictoryFanfare,
} from '../utils/soundEffects';
import { X, Volume2, Bell, AlertOctagon, Zap, Siren, Sparkles, Timer, Trophy, Keyboard } from 'lucide-react';

interface SoundboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SoundboardModal: React.FC<SoundboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sfxButtons = [
    {
      label: 'Correct Chime',
      icon: <Bell className="w-5 h-5 text-emerald-400" />,
      color: 'hover:border-emerald-500/50 bg-emerald-950/30',
      action: playCorrectSound,
      hotkey: 'Key C',
    },
    {
      label: 'Wrong Buzzer',
      icon: <AlertOctagon className="w-5 h-5 text-rose-400" />,
      color: 'hover:border-rose-500/50 bg-rose-950/30',
      action: playBuzzerSound,
      hotkey: 'Key W',
    },
    {
      label: 'Dramatic Twist Sting',
      icon: <Zap className="w-5 h-5 text-purple-400" />,
      color: 'hover:border-purple-500/50 bg-purple-950/30',
      action: playDramaticTwistSound,
      hotkey: 'Key T',
    },
    {
      label: 'Heist Siren Alert',
      icon: <Siren className="w-5 h-5 text-amber-400" />,
      color: 'hover:border-amber-500/50 bg-amber-950/30',
      action: playHeistSound,
      hotkey: '',
    },
    {
      label: 'Jackpot Chime',
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      color: 'hover:border-cyan-500/50 bg-cyan-950/30',
      action: playJackpotChime,
      hotkey: '',
    },
    {
      label: 'Countdown Tick',
      icon: <Timer className="w-5 h-5 text-blue-400" />,
      color: 'hover:border-blue-500/50 bg-blue-950/30',
      action: () => playTimerTickSound(true),
      hotkey: '',
    },
    {
      label: 'Victory Fanfare',
      icon: <Trophy className="w-5 h-5 text-yellow-400" />,
      color: 'hover:border-yellow-500/50 bg-yellow-950/30',
      action: playVictoryFanfare,
      hotkey: 'Key V',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-base sm:text-lg font-black text-white">
              Anchor Stage Soundboard & Hotkeys
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300"
            aria-label="Close soundboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SFX Quick Trigger Grid */}
        <div className="grid grid-cols-2 gap-3">
          {sfxButtons.map((btn, i) => (
            <button
              key={i}
              onClick={btn.action}
              className={`p-3.5 rounded-2xl border border-slate-800 ${btn.color} flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer`}
            >
              {btn.icon}
              <span className="text-xs font-bold text-slate-200">{btn.label}</span>
              {btn.hotkey && (
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {btn.hotkey}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Hotkeys reference */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Keyboard className="w-4 h-4" />
            Anchor Stage Hotkeys
          </div>
          <div className="grid grid-cols-2 gap-y-1.5 text-xs text-slate-400">
            <div><span className="font-mono text-slate-200 bg-slate-900 px-1 rounded">F</span> : Fullscreen Big Screen</div>
            <div><span className="font-mono text-slate-200 bg-slate-900 px-1 rounded">Space</span> : Timer Start / Pause</div>
            <div><span className="font-mono text-slate-200 bg-slate-900 px-1 rounded">C</span> : Correct Answer Chime</div>
            <div><span className="font-mono text-slate-200 bg-slate-900 px-1 rounded">W</span> : Wrong Buzzer</div>
            <div><span className="font-mono text-slate-200 bg-slate-900 px-1 rounded">T</span> : Twist Sting</div>
            <div><span className="font-mono text-slate-200 bg-slate-900 px-1 rounded">Esc</span> : Close Modal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

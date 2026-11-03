/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Team } from '../game/twistRules';
import { Crown, Plus, Minus, Volume2, VolumeX, Maximize2, Sparkles, SlidersHorizontal, Trophy, Zap } from 'lucide-react';
import { getIsMuted, setMuted } from '../utils/soundEffects';

interface ScoreboardProps {
  teams: Team[];
  activeTeamId: string;
  onSelectActiveTeam: (teamId: string) => void;
  onAdjustScore: (teamId: string, delta: number) => void;
  onToggleFullscreen: () => void;
  onOpenSoundboard: () => void;
  onOpenDeckModal: () => void;
  onEndGame: () => void;
  currentPackName: string;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  teams,
  activeTeamId,
  onSelectActiveTeam,
  onAdjustScore,
  onToggleFullscreen,
  onOpenSoundboard,
  onOpenDeckModal,
  onEndGame,
  currentPackName,
}) => {
  const [muted, setMutedState] = React.useState(getIsMuted());

  const handleToggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
  };

  // Find leader team
  const leader = [...teams].sort((a, b) => b.score - a.score)[0];
  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0];

  return (
    <div className="w-full bg-slate-950/95 border-b border-amber-500/30 backdrop-blur-md sticky top-0 z-30 shadow-2xl">
      {/* Upper Control Bar: Brand & Host Tools */}
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 p-[2px] shadow-md shadow-rose-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase tracking-widest font-black text-amber-400/90">
                STAGE HOST MATRIX
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                AI TWISTS ON
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-black text-white tracking-wide truncate max-w-[200px] sm:max-w-md">
              {currentPackName}
            </h1>
          </div>
        </div>

        {/* Anchor Stage Quick Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenDeckModal}
            title="Change or Edit Themes"
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Packs & Teams</span>
          </button>
          <button
            onClick={onOpenSoundboard}
            title="Stage SFX Soundboard"
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <span className="text-purple-400 text-xs">⚡</span>
            <span className="hidden sm:inline">SFX</span>
          </button>
          <button
            onClick={handleToggleMute}
            title={muted ? 'Unmute SFX' : 'Mute SFX'}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label={muted ? 'Unmute audio' : 'Mute audio'}
          >
            {muted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
          <button
            onClick={onToggleFullscreen}
            title="Toggle Big Screen Fullscreen (F)"
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            aria-label="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            onClick={onEndGame}
            title="End Game & Reveal Champions"
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Podium</span>
          </button>
        </div>
      </div>

      {/* Lower Stage Scoreboard: Full-Width Prominent Team LED HUD */}
      <div className="max-w-6xl mx-auto px-4 py-2.5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {teams.map((team) => {
            const isActive = team.id === activeTeamId;
            const isLeading = leader && leader.id === team.id && leader.score > 0;

            return (
              <div
                key={team.id}
                onClick={() => onSelectActiveTeam(team.id)}
                className={`relative flex items-center justify-between p-2.5 rounded-2xl border transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-slate-900 border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.02]'
                    : 'bg-slate-950/80 border-slate-800/90 hover:border-slate-700 opacity-90 hover:opacity-100'
                }`}
                style={{
                  boxShadow: isActive ? `0 0 20px ${team.color}40` : undefined,
                }}
              >
                {/* Active Indicator Top Tag */}
                {isActive && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.2 text-[9px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 rounded-full shadow-md flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    <span>Active Turn</span>
                  </div>
                )}

                {/* Left: Avatar + Name */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold shadow-inner shrink-0"
                    style={{ backgroundColor: `${team.color}25`, border: `2px solid ${team.color}` }}
                  >
                    <span>{team.avatarEmoji}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                        {team.name}
                      </span>
                      {isLeading && (
                        <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="currentColor" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      Table Score
                    </span>
                  </div>
                </div>

                {/* Right: Big Numeric Score + Quick +/- Tweaks */}
                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  <div className="text-right">
                    <span
                      className="text-xl sm:text-2xl font-black tabular-nums tracking-tight"
                      style={{ color: team.color }}
                    >
                      {team.score}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block -mt-1">
                      pts
                    </span>
                  </div>

                  {/* Quick operator score adjust buttons (+10 / -10) */}
                  <div
                    className="flex flex-col gap-0.5 ml-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onAdjustScore(team.id, 10)}
                      title={`Add 10 pts to ${team.name}`}
                      className="p-1 rounded bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => onAdjustScore(team.id, -10)}
                      title={`Deduct 10 pts from ${team.name}`}
                      className="p-1 rounded bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

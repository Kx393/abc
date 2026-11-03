/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Team, getLeaderboard } from '../game/twistRules';
import { playVictoryFanfare } from '../utils/soundEffects';
import { Trophy, Crown, Sparkles, RotateCcw, X, Medal } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  teams: Team[];
  onClose: () => void;
  onResetGame: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  teams,
  onClose,
  onResetGame,
}) => {
  if (!isOpen) return null;

  const leaderboard = getLeaderboard(teams);
  const winner = leaderboard[0]?.team;
  const runnerUp = leaderboard[1]?.team;
  const thirdPlace = leaderboard[2]?.team;

  useEffect(() => {
    playVictoryFanfare();

    // Double fire confetti burst
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#f59e0b', '#ec4899', '#3b82f6', '#10b981'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-2 border-amber-500/60 p-6 sm:p-8 shadow-2xl text-center space-y-6 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          aria-label="Close victory modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Celebration Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-black tracking-widest uppercase">
          <Sparkles className="w-4 h-4 text-amber-400" />
          GRAND STAGE CHAMPIONS REVEAL
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>

        {/* Champion Trophy Showcase */}
        {winner && (
          <div className="space-y-3">
            <div className="relative inline-block">
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl flex items-center justify-center text-4xl sm:text-5xl border-4 shadow-2xl"
                style={{
                  backgroundColor: `${winner.color}30`,
                  borderColor: winner.color,
                  boxShadow: `0 0 35px ${winner.color}66`,
                }}
              >
                {winner.avatarEmoji}
              </div>
              <Crown className="w-10 h-10 text-amber-400 absolute -top-4 -right-3 rotate-12 drop-shadow-lg animate-bounce" fill="currentColor" />
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-widest text-amber-400">
                1ST PLACE • GRAND CHAMPION
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
                {winner.name}
              </h2>
              <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 tabular-nums">
                {winner.score} <span className="text-sm font-bold text-slate-400">POINTS</span>
              </div>
            </div>
          </div>
        )}

        {/* 3-Step Podium */}
        <div className="flex items-end justify-center gap-3 pt-4 max-w-md mx-auto">
          {/* 2nd Place */}
          {runnerUp && (
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xl mb-1">{runnerUp.avatarEmoji}</span>
              <span className="text-xs font-bold text-slate-300 truncate max-w-[80px]">
                {runnerUp.name}
              </span>
              <span className="text-xs font-black text-slate-400 tabular-nums">
                {runnerUp.score} pts
              </span>
              <div className="w-full h-20 bg-slate-800 rounded-t-2xl border-t-2 border-slate-400 flex flex-col items-center justify-center mt-2 shadow-lg">
                <Medal className="w-6 h-6 text-slate-300" />
                <span className="text-xs font-black text-slate-300">2ND</span>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {winner && (
            <div className="flex-1 flex flex-col items-center">
              <span className="text-2xl mb-1">{winner.avatarEmoji}</span>
              <span className="text-xs font-bold text-amber-300 truncate max-w-[90px]">
                {winner.name}
              </span>
              <span className="text-xs font-black text-amber-400 tabular-nums">
                {winner.score} pts
              </span>
              <div className="w-full h-28 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-2xl border-t-2 border-amber-300 flex flex-col items-center justify-center mt-2 shadow-2xl shadow-amber-500/30">
                <Trophy className="w-8 h-8 text-slate-950" />
                <span className="text-xs font-black text-slate-950 uppercase tracking-wider">
                  1ST
                </span>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {thirdPlace && (
            <div className="flex-1 flex flex-col items-center">
              <span className="text-xl mb-1">{thirdPlace.avatarEmoji}</span>
              <span className="text-xs font-bold text-slate-300 truncate max-w-[80px]">
                {thirdPlace.name}
              </span>
              <span className="text-xs font-black text-slate-400 tabular-nums">
                {thirdPlace.score} pts
              </span>
              <div className="w-full h-16 bg-slate-800/80 rounded-t-2xl border-t-2 border-amber-800 flex flex-col items-center justify-center mt-2 shadow-md">
                <span className="text-xs font-black text-amber-700">3RD</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onResetGame}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-sm sm:text-base flex items-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again / New Game
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
          >
            Review Board
          </button>
        </div>
      </div>
    </div>
  );
};

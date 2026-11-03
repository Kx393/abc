/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { TileData, Team, TwistConfig, executeTwist, TwistExecutionResult } from '../game/twistRules';
import {
  playTimerTickSound,
  playCorrectSound,
  playBuzzerSound,
  playDramaticTwistSound,
  playHeistSound,
  playJackpotChime,
} from '../utils/soundEffects';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  Zap,
  Flame,
  AlertTriangle,
  RefreshCw,
  Award,
  Scale,
  Shield,
  ArrowRightLeft,
  Sparkles,
} from 'lucide-react';

interface TileModalProps {
  tile: TileData | null;
  teams: Team[];
  activeTeamId: string;
  onClose: () => void;
  onApplyQuestionScore: (tileId: number, teamId: string, points: number) => void;
  onApplyTwistResult: (tileId: number, result: TwistExecutionResult) => void;
  onMarkSolvedWithoutPoints: (tileId: number) => void;
}

export const TileModal: React.FC<TileModalProps> = ({
  tile,
  teams,
  activeTeamId,
  onClose,
  onApplyQuestionScore,
  onApplyTwistResult,
  onMarkSolvedWithoutPoints,
}) => {
  if (!tile) return null;

  const isTwist = tile.category === 'twist' && !!tile.twist;
  const activeTeam = teams.find((t) => t.id === activeTeamId) || teams[0];

  // 30-Second Stage Timer State
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Question Answer Reveal State
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Twist target team state (for STEAL_POINTS or SWAP_SCORES)
  const opponents = teams.filter((t) => t.id !== activeTeamId);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    opponents.length > 0 ? opponents[0].id : ''
  );
  const [twistExecutedResult, setTwistExecutedResult] = useState<TwistExecutionResult | null>(null);

  // On mount, if it's a twist, play dramatic sound effect!
  useEffect(() => {
    if (isTwist) {
      playDramaticTwistSound();
    }
  }, [isTwist]);

  // Timer Tick Interval
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            playBuzzerSound();
            return 0;
          }
          playTimerTickSound(prev <= 6);
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  const toggleTimer = () => {
    if (timeLeft === 0) {
      setTimeLeft(30);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(30);
  };

  // Execute Twist Handler
  const handleExecuteTwist = () => {
    if (!tile.twist) return;

    // Visual confetti & sound depending on twist type
    if (tile.twist.type === 'STEAL_POINTS') {
      playHeistSound();
    } else if (tile.twist.type === 'DOUBLE_SCORE' || tile.twist.type === 'JACKPOT') {
      playJackpotChime();
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
      });
    } else if (tile.twist.type === 'LOSE_POINTS') {
      playBuzzerSound();
    } else {
      playCorrectSound();
    }

    const result = executeTwist(tile.twist, activeTeamId, teams, selectedTargetId);
    setTwistExecutedResult(result);
    onApplyTwistResult(tile.id, result);
  };

  // Award Question Points
  const handleAwardPoints = (targetTeamId: string) => {
    playCorrectSound();
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.6 },
    });
    onApplyQuestionScore(tile.id, targetTeamId, tile.points);
    onClose();
  };

  const handleIncorrect = () => {
    playBuzzerSound();
    onMarkSolvedWithoutPoints(tile.id);
    onClose();
  };

  // Twist icon helper
  const renderTwistIcon = (type: string) => {
    switch (type) {
      case 'STEAL_POINTS':
        return <Zap className="w-10 h-10 text-rose-400 animate-pulse" />;
      case 'DOUBLE_SCORE':
        return <Flame className="w-10 h-10 text-amber-400 animate-bounce" />;
      case 'LOSE_POINTS':
        return <AlertTriangle className="w-10 h-10 text-red-500 animate-bounce" />;
      case 'SWAP_SCORES':
        return <RefreshCw className="w-10 h-10 text-purple-400 animate-spin" />;
      case 'JACKPOT':
        return <Award className="w-10 h-10 text-emerald-400 animate-pulse" />;
      case 'EQUALIZER':
        return <Scale className="w-10 h-10 text-cyan-400" />;
      default:
        return <Shield className="w-10 h-10 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Modal Container */}
      <div
        className={`relative w-full max-w-3xl rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all overflow-hidden ${
          isTwist
            ? 'bg-gradient-to-b from-purple-950/90 via-slate-950 to-slate-950 border-purple-500/50 shadow-purple-900/40'
            : 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-amber-500/40 shadow-amber-950/40'
        }`}
      >
        {/* Stage Lighting Sheen Background */}
        <div
          className={`absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isTwist ? 'bg-purple-500' : 'bg-amber-400'
          }`}
        />
        <div
          className={`absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 ${
            isTwist ? 'bg-rose-500' : 'bg-cyan-500'
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors z-20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ------------------- TWIST CARD VIEW ------------------- */}
        {isTwist && tile.twist ? (
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Dramatic Animated Twist Banner */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/50 shadow-lg shadow-purple-500/20">
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-purple-300">
                STAGE DRAMA • AI TWIST OF FATE
              </span>
              <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
            </div>

            {/* Glowing Centerpiece Icon & Tile Number */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-slate-900/90 border-2 border-purple-400 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                {renderTwistIcon(tile.twist.type)}
              </div>
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 text-xs font-black shadow-md">
                TILE #{tile.id}
              </span>
            </div>

            {/* Twist Headline & Description */}
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 tracking-tight">
                {tile.twist.title}
              </h2>
              <p className="text-base sm:text-xl font-bold text-amber-300 leading-relaxed">
                {tile.twist.description}
              </p>
            </div>

            {/* Target Opponent Selection (For Steal or Swap) */}
            {(tile.twist.type === 'STEAL_POINTS' || tile.twist.type === 'SWAP_SCORES') &&
              !twistExecutedResult && (
                <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-left space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                    Select Target Opponent:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {opponents.map((opp) => (
                      <button
                        key={opp.id}
                        type="button"
                        onClick={() => setSelectedTargetId(opp.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          selectedTargetId === opp.id
                            ? 'bg-purple-950/80 border-purple-400 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{opp.avatarEmoji}</span>
                          <span className="text-xs font-bold truncate max-w-[90px]">
                            {opp.name}
                          </span>
                        </div>
                        <span className="text-xs font-black tabular-nums text-amber-400">
                          {opp.score} pts
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* Twist Execution Banner / Message */}
            {twistExecutedResult ? (
              <div className="w-full max-w-lg p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 font-bold text-sm sm:text-base animate-in zoom-in-95 duration-200 shadow-xl">
                {twistExecutedResult.message}
              </div>
            ) : null}

            {/* Twist Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {!twistExecutedResult ? (
                <button
                  onClick={handleExecuteTwist}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-400 hover:to-rose-400 text-white text-base sm:text-lg font-black tracking-wide shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Zap className="w-5 h-5 fill-current" />
                  EXECUTE TWIST NOW
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold border border-slate-700 transition-colors"
                >
                  Back to Grid Matrix
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ------------------- REGULAR TRIVIA / CHALLENGE VIEW ------------------- */
          <div className="flex flex-col space-y-6">
            {/* Header: Category Badge + Points + Tile ID */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {tile.category.replace('_', ' ')}
                </span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  TILE #{tile.id}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-xl bg-slate-900 border border-amber-500/30 text-amber-400 font-black text-sm tracking-tight">
                  +{tile.points} PTS
                </div>
              </div>
            </div>

            {/* Active Team Header Bar */}
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: `${activeTeam.color}33`, color: activeTeam.color }}
                >
                  {activeTeam.avatarEmoji}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-300">
                  Table On Stage:{' '}
                  <span className="font-black text-white" style={{ color: activeTeam.color }}>
                    {activeTeam.name}
                  </span>
                </div>
              </div>

              {/* 30-Second Stage Countdown Timer HUD */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-black text-sm sm:text-base tabular-nums transition-colors ${
                    timeLeft <= 5
                      ? 'bg-rose-950 border-rose-500 text-rose-400 animate-pulse'
                      : timeLeft <= 10
                      ? 'bg-amber-950 border-amber-500 text-amber-400'
                      : 'bg-slate-900 border-slate-700 text-slate-200'
                  }`}
                >
                  <span>⏱️</span>
                  <span>{timeLeft}s</span>
                </div>
                <button
                  onClick={toggleTimer}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                  title="Reset 30s Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Question Card Content */}
            <div className="space-y-4 py-2">
              {tile.visualClue && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 text-sm font-semibold">
                  <span>Visual Prop Clue:</span>
                  <span className="text-lg">{tile.visualClue}</span>
                </div>
              )}

              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                {tile.question}
              </h2>
            </div>

            {/* Answer Reveal Accordion */}
            <div className="border border-slate-800 rounded-2xl bg-slate-900/50 p-4 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  MC / Anchor Clue & Solution
                </span>
                <button
                  onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
                  className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-amber-300 border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  {isAnswerRevealed ? 'Hide Answer' : 'Reveal Answer'}
                </button>
              </div>

              {isAnswerRevealed && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 animate-in fade-in duration-150">
                  <div className="text-base sm:text-lg font-black text-emerald-400">
                    {tile.answer}
                  </div>
                  {tile.extraNotes && (
                    <div className="text-xs text-slate-400 italic font-medium">
                      Host Note: {tile.extraNotes}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Anchor Scoring Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                onClick={handleIncorrect}
                className="px-4 py-3 rounded-2xl bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/40 text-rose-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                No Points / Time Up
              </button>

              <div className="flex items-center gap-2">
                {/* Award directly to Active Team */}
                <button
                  onClick={() => handleAwardPoints(activeTeamId)}
                  className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Award +{tile.points} to {activeTeam.name}
                </button>
              </div>
            </div>

            {/* Pass Points to Another Team Dropdown / Quick Buttons */}
            {opponents.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap">
                  Pass Question To:
                </span>
                {opponents.map((opp) => (
                  <button
                    key={opp.id}
                    onClick={() => handleAwardPoints(opp.id)}
                    className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition-colors"
                  >
                    <span>{opp.avatarEmoji}</span>
                    <span>+{tile.points} to {opp.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

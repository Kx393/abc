/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Scoreboard } from './components/Scoreboard';
import { GridBoard } from './components/GridBoard';
import { TileModal } from './components/TileModal';
import { SoundboardModal } from './components/SoundboardModal';
import { VictoryModal } from './components/VictoryModal';
import { DeckManagerModal } from './components/DeckManagerModal';
import { BOLLYWOOD_STAGE_PACK, DEFAULT_TEAMS, GamePack } from './data/defaultPacks';
import { TileData, Team, TwistExecutionResult, isGameOver } from './game/twistRules';
import {
  playCorrectSound,
  playBuzzerSound,
  playDramaticTwistSound,
  playVictoryFanfare,
} from './utils/soundEffects';
import { Zap, Volume2, Sparkles, Play, Award, RotateCcw } from 'lucide-react';

export default function App() {
  // Game State
  const [currentPack, setCurrentPack] = useState<GamePack>(BOLLYWOOD_STAGE_PACK);
  const [tiles, setTiles] = useState<TileData[]>(BOLLYWOOD_STAGE_PACK.tiles);
  const [teams, setTeams] = useState<Team[]>(DEFAULT_TEAMS);
  const [activeTeamIndex, setActiveTeamIndex] = useState<number>(0);
  const [selectedTile, setSelectedTile] = useState<TileData | null>(null);

  // Modals & Panels
  const [isSoundboardOpen, setIsSoundboardOpen] = useState<boolean>(false);
  const [isDeckModalOpen, setIsDeckModalOpen] = useState<boolean>(false);
  const [isVictoryOpen, setIsVictoryOpen] = useState<boolean>(false);

  // High-Energy Stage Toast Notification (e.g. for twists)
  const [stageToast, setStageToast] = useState<{ message: string; type: 'twist' | 'points' } | null>(
    null
  );

  // Check URL params for ?autostart=1 or direct play
  const [gameState, setGameState] = useState<'title' | 'playing' | 'gameover'>('playing');

  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Turn management: Cycle to next team
  const advanceTurn = useCallback(() => {
    setActiveTeamIndex((prev) => (prev + 1) % teams.length);
  }, [teams.length]);

  const activeTeam = teams[activeTeamIndex] || teams[0];

  // Show Toast
  const triggerStageToast = (message: string, type: 'twist' | 'points' = 'twist') => {
    setStageToast({ message, type });
    setTimeout(() => {
      setStageToast(null);
    }, 4500);
  };

  // Handle Tile Selection
  const handleTileClick = (tile: TileData) => {
    setSelectedTile(tile);
  };

  // Apply Question Score to a team
  const handleApplyQuestionScore = (tileId: number, teamId: string, points: number) => {
    setTeams((prevTeams) =>
      prevTeams.map((t) => (t.id === teamId ? { ...t, score: t.score + points } : t))
    );

    const targetTeam = teams.find((t) => t.id === teamId);
    triggerStageToast(
      `🎉 +${points} POINTS AWARDED TO ${targetTeam ? targetTeam.name.toUpperCase() : 'TEAM'}!`,
      'points'
    );

    // Mark tile as opened
    setTiles((prevTiles) =>
      prevTiles.map((t) =>
        t.id === tileId
          ? { ...t, isOpened: true, solvedByTeamId: teamId, pointsAwarded: points }
          : t
      )
    );

    advanceTurn();
  };

  // Mark solved with zero points (e.g. passed without score or time up)
  const handleMarkSolvedWithoutPoints = (tileId: number) => {
    setTiles((prevTiles) =>
      prevTiles.map((t) => (t.id === tileId ? { ...t, isOpened: true } : t))
    );
    advanceTurn();
  };

  // Apply Twist execution result
  const handleApplyTwistResult = (tileId: number, result: TwistExecutionResult) => {
    setTeams(result.updatedTeams);
    triggerStageToast(result.message, 'twist');

    setTiles((prevTiles) =>
      prevTiles.map((t) => (t.id === tileId ? { ...t, isOpened: true } : t))
    );

    advanceTurn();
  };

  // Check if all tiles opened -> auto-trigger Victory
  useEffect(() => {
    if (tiles.length > 0 && isGameOver(tiles)) {
      setTimeout(() => {
        setIsVictoryOpen(true);
        setGameState('gameover');
      }, 1000);
    }
  }, [tiles]);

  // Adjust Score (+10 or -10 directly from host header)
  const handleAdjustScore = (teamId: string, delta: number) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t))
    );
  };

  // Switch Active Team by clicking on HUD
  const handleSelectActiveTeam = (teamId: string) => {
    const idx = teams.findIndex((t) => t.id === teamId);
    if (idx !== -1) setActiveTeamIndex(idx);
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Reset Game Board
  const handleResetBoard = () => {
    setTiles(currentPack.tiles.map((t) => ({ ...t, isOpened: false, solvedByTeamId: undefined })));
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setActiveTeamIndex(0);
    setSelectedTile(null);
    setIsVictoryOpen(false);
    setGameState('playing');
    triggerStageToast('🔄 Game board reset! New stage battle begins!', 'points');
  };

  // Select new Pack
  const handleSelectPack = (pack: GamePack) => {
    setCurrentPack(pack);
    setTiles(pack.tiles.map((t) => ({ ...t, isOpened: false, solvedByTeamId: undefined })));
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setActiveTeamIndex(0);
    setSelectedTile(null);
    triggerStageToast(`Loaded "${pack.name}"!`, 'points');
  };

  // Apply custom generated tiles from AI
  const handleApplyCustomTiles = (customTiles: TileData[], packName: string) => {
    const newPack: GamePack = {
      id: `custom-${Date.now()}`,
      name: packName,
      description: 'Custom AI generated event pack with specialized trivia & twists.',
      badge: 'Custom Show',
      tiles: customTiles,
    };
    setCurrentPack(newPack);
    setTiles(customTiles);
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setActiveTeamIndex(0);
    setSelectedTile(null);
    triggerStageToast(`Loaded custom show: "${packName}"!`, 'twist');
  };

  // Keyboard Hotkeys Listener for the Anchor / Operator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input field
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        handleToggleFullscreen();
      } else if (e.key === 'c' || e.key === 'C') {
        playCorrectSound();
      } else if (e.key === 'w' || e.key === 'W') {
        playBuzzerSound();
      } else if (e.key === 't' || e.key === 'T') {
        playDramaticTwistSound();
      } else if (e.key === 'v' || e.key === 'V') {
        playVictoryFanfare();
      } else if (e.key === 'Escape') {
        setSelectedTile(null);
        setIsSoundboardOpen(false);
        setIsDeckModalOpen(false);
        setIsVictoryOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 relative overflow-x-hidden">
      {/* Background Stage Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-b from-purple-900/15 via-rose-900/10 to-transparent blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-t from-amber-900/15 via-cyan-900/10 to-transparent blur-[120px]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>

      {/* STAGE HEADER & LIVE SCOREBOARD */}
      <Scoreboard
        teams={teams}
        activeTeamId={activeTeam.id}
        onSelectActiveTeam={handleSelectActiveTeam}
        onAdjustScore={handleAdjustScore}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenSoundboard={() => setIsSoundboardOpen(true)}
        onOpenDeckModal={() => setIsDeckModalOpen(true)}
        onEndGame={() => setIsVictoryOpen(true)}
        currentPackName={currentPack.name}
      />

      {/* MAIN STAGE ARENA */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center py-2 sm:py-6">
        <GridBoard
          tiles={tiles}
          teams={teams}
          onTileClick={handleTileClick}
          activeTeam={activeTeam}
        />
      </main>

      {/* STAGE TOAST ANNOUNCEMENT */}
      {stageToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto animate-in slide-in-from-bottom-5 duration-300">
          <div
            className={`px-6 py-3.5 rounded-2xl border text-center font-black text-sm sm:text-base shadow-2xl flex items-center justify-center gap-3 ${
              stageToast.type === 'twist'
                ? 'bg-gradient-to-r from-purple-950 via-slate-900 to-rose-950 border-purple-500/80 text-purple-200 shadow-purple-900/50'
                : 'bg-slate-900 border-amber-400 text-amber-300 shadow-amber-500/20'
            }`}
          >
            <Zap className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
            <span className="leading-snug">{stageToast.message}</span>
          </div>
        </div>
      )}

      {/* FOOTER CONTROLS & EVENT HOST QUICK HINTS */}
      <footer className="w-full bg-slate-950/80 border-t border-slate-800/80 px-4 py-2 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-slate-400">LED Stage Mode Active</span>
          <span className="hidden md:inline text-slate-600">•</span>
          <span className="hidden md:inline">Hotkeys: F (Fullscreen), C (Correct), W (Buzzer), T (Twist)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDeckModalOpen(true)}
            className="hover:text-amber-400 font-bold transition-colors"
          >
            Customize Questions & Teams
          </button>
          <span>•</span>
          <button
            onClick={handleResetBoard}
            className="hover:text-rose-400 font-bold transition-colors"
          >
            Reset Board
          </button>
        </div>
      </footer>

      {/* QUESTION / TWIST MODAL */}
      {selectedTile && (
        <TileModal
          tile={selectedTile}
          teams={teams}
          activeTeamId={activeTeam.id}
          onClose={() => setSelectedTile(null)}
          onApplyQuestionScore={handleApplyQuestionScore}
          onApplyTwistResult={handleApplyTwistResult}
          onMarkSolvedWithoutPoints={handleMarkSolvedWithoutPoints}
        />
      )}

      {/* SOUNDBOARD MODAL */}
      <SoundboardModal
        isOpen={isSoundboardOpen}
        onClose={() => setIsSoundboardOpen(false)}
      />

      {/* DECK & TEAM MANAGER MODAL */}
      <DeckManagerModal
        isOpen={isDeckModalOpen}
        onClose={() => setIsDeckModalOpen(false)}
        currentPackId={currentPack.id}
        onSelectPack={handleSelectPack}
        teams={teams}
        onUpdateTeams={setTeams}
        onResetBoard={handleResetBoard}
        onApplyCustomTiles={handleApplyCustomTiles}
      />

      {/* VICTORY CHAMPIONS MODAL */}
      <VictoryModal
        isOpen={isVictoryOpen}
        teams={teams}
        onClose={() => setIsVictoryOpen(false)}
        onResetGame={handleResetBoard}
      />
    </div>
  );
}

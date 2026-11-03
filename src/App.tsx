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
import { AIControlPanel } from './components/AIControlPanel';
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
  const [isAIControlOpen, setIsAIControlOpen] = useState<boolean>(false);
  const [isHostXrayActive, setIsHostXrayActive] = useState<boolean>(false);
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
    <div className="h-dvh max-h-dvh w-full bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 relative overflow-hidden max-md:h-auto max-md:min-h-screen max-md:overflow-y-auto">
      {/* Background Stage Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-amber-500/10 via-amber-700/5 to-transparent blur-[140px]" />
        <div className="absolute bottom-[-10%] left-1/3 w-[500px] h-[400px] bg-gradient-to-t from-purple-900/15 via-indigo-950/10 to-transparent blur-[130px]" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]" />
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
        onOpenAIControl={() => setIsAIControlOpen(true)}
        onEndGame={() => setIsVictoryOpen(true)}
        currentPackName={currentPack.name}
        isHostXrayActive={isHostXrayActive}
      />

      {/* MAIN STAGE ARENA */}
      <main className="relative z-10 flex-1 min-h-0 flex flex-col justify-center items-center px-2 py-1 sm:px-4 sm:py-1.5 md:py-2 overflow-hidden">
        <GridBoard
          tiles={tiles}
          teams={teams}
          onTileClick={handleTileClick}
          activeTeam={activeTeam}
          isHostXrayActive={isHostXrayActive}
        />
      </main>

      {/* STAGE TOAST ANNOUNCEMENT */}
      {stageToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto animate-in slide-in-from-bottom-4 duration-300">
          <div
            className={`px-5 py-2.5 rounded-2xl border text-center font-semibold text-xs sm:text-sm shadow-2xl flex items-center justify-center gap-2.5 backdrop-blur-xl ${
              stageToast.type === 'twist'
                ? 'bg-purple-950/90 border-purple-400/50 text-purple-200 shadow-purple-950/50'
                : 'bg-slate-900/95 border-amber-400/50 text-amber-200 shadow-amber-950/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="leading-snug">{stageToast.message}</span>
          </div>
        </div>
      )}

      {/* FOOTER CONTROLS & EVENT HOST QUICK HINTS */}
      <footer className="w-full shrink-0 bg-slate-950/95 border-t border-white/[0.06] px-4 py-1.5 text-center text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="font-medium text-slate-300">Stage Arena Active</span>
          <span className="hidden md:inline text-slate-700">·</span>
          <span className="hidden md:inline text-slate-500 text-[11px]">
            Shortcuts: F (Fullscreen) · C (Chime) · W (Buzzer) · T (Twist)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDeckModalOpen(true)}
            className="hover:text-amber-300 text-slate-400 font-medium transition-colors cursor-pointer"
          >
            Customize Questions & Teams
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={handleResetBoard}
            className="hover:text-rose-400 text-slate-400 font-medium transition-colors cursor-pointer"
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

      {/* ANCHOR AI CONTROL PANEL */}
      <AIControlPanel
        isOpen={isAIControlOpen}
        onClose={() => setIsAIControlOpen(false)}
        tiles={tiles}
        onUpdateTiles={(updated) => setTiles(updated)}
        isHostXrayActive={isHostXrayActive}
        onToggleHostXray={() => setIsHostXrayActive((prev) => !prev)}
      />
    </div>
  );
}

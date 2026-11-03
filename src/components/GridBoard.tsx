/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TileData, Team } from '../game/twistRules';
import { playTileSelectSound } from '../utils/soundEffects';
import { Zap, CheckCircle2, Music, Film, Footprints, HelpCircle, Eye, MessageSquare, Timer } from 'lucide-react';

interface GridBoardProps {
  tiles: TileData[];
  teams: Team[];
  onTileClick: (tile: TileData) => void;
  activeTeam: Team;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'twist':
      return <Zap className="w-5 h-5 text-amber-400" />;
    case 'song':
      return <Music className="w-5 h-5 text-pink-400" />;
    case 'movie':
      return <Film className="w-5 h-5 text-purple-400" />;
    case 'hook_step':
      return <Footprints className="w-5 h-5 text-emerald-400" />;
    case 'observation':
      return <Eye className="w-5 h-5 text-cyan-400" />;
    case 'dialogue':
      return <MessageSquare className="w-5 h-5 text-amber-300" />;
    case 'rapid_fire':
      return <Timer className="w-5 h-5 text-rose-400" />;
    default:
      return <HelpCircle className="w-5 h-5 text-blue-400" />;
  }
};

export const GridBoard: React.FC<GridBoardProps> = ({
  tiles,
  teams,
  onTileClick,
  activeTeam,
}) => {
  const handleSelect = (tile: TileData) => {
    playTileSelectSound();
    onTileClick(tile);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 flex flex-col items-center">
      {/* Active Team Callout Banner */}
      <div className="mb-4 flex items-center justify-between w-full max-w-2xl px-4 py-2 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 shadow-xl">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold shadow-md"
            style={{ backgroundColor: `${activeTeam.color}33`, border: `2px solid ${activeTeam.color}` }}
          >
            {activeTeam.avatarEmoji}
          </div>
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              CURRENT TURN
            </div>
            <div className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span style={{ color: activeTeam.color }}>{activeTeam.name}</span>
              <span className="text-slate-400 font-medium text-xs">selects a tile!</span>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-amber-300/90 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>Hidden Twists Await</span>
        </div>
      </div>

      {/* 4x4 Stage Matrix */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full aspect-square max-h-[72vh] select-none">
        {tiles.map((tile) => {
          const solvedTeam = tile.solvedByTeamId
            ? teams.find((t) => t.id === tile.solvedByTeamId)
            : null;

          return (
            <button
              key={tile.id}
              onClick={() => handleSelect(tile)}
              className={`group relative rounded-2xl sm:rounded-3xl p-2 sm:p-3 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden transform active:scale-95 ${
                tile.isOpened
                  ? 'bg-slate-900/60 border border-slate-800/80 shadow-inner opacity-75 hover:opacity-100 hover:border-slate-600'
                  : 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 border-2 border-amber-500/40 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-1'
              }`}
              style={{
                boxShadow: !tile.isOpened
                  ? '0 10px 25px -5px rgba(0, 0, 0, 0.7), 0 0 15px rgba(245, 158, 11, 0.12)'
                  : undefined,
              }}
              aria-label={`Tile ${tile.id} ${tile.isOpened ? 'Opened' : 'Unopened'}`}
            >
              {/* Metallic corner rivets & stage border styling */}
              <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-slate-600/50" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-600/50" />
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-slate-600/50" />
              <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-600/50" />

              {/* Glowing animated background sheen on unopened */}
              {!tile.isOpened && (
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              )}

              {/* TILE CONTENT */}
              {!tile.isOpened ? (
                // UNOPENED: Big bold stage number
                <div className="flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-300 to-amber-600 drop-shadow-[0_4px_10px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform">
                    {tile.id}
                  </span>
                  <div className="mt-1 flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-amber-300">
                      LOCKED
                    </span>
                  </div>
                </div>
              ) : (
                // OPENED / SOLVED
                <div className="flex flex-col items-center justify-center text-center p-1">
                  <div className="mb-1.5 p-2 rounded-xl bg-slate-800/80 border border-slate-700/60">
                    {getCategoryIcon(tile.category)}
                  </div>

                  <span className="text-xs sm:text-sm font-bold text-slate-300 line-clamp-1">
                    {tile.category === 'twist' ? 'TWIST' : tile.title}
                  </span>

                  {/* Stamp of solving team or twist badge */}
                  {tile.category === 'twist' ? (
                    <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                      ⚡ TRIGGERED
                    </span>
                  ) : solvedTeam ? (
                    <div
                      className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border shadow-sm"
                      style={{
                        backgroundColor: `${solvedTeam.color}25`,
                        borderColor: solvedTeam.color,
                        color: solvedTeam.color,
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="truncate max-w-[65px]">{solvedTeam.name}</span>
                    </div>
                  ) : (
                    <span className="mt-1 text-[10px] font-semibold text-slate-500">
                      Completed
                    </span>
                  )}

                  <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                    #{tile.id}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

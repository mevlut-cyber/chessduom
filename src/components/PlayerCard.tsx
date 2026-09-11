import React from 'react';
import { Color, PieceSymbol } from 'chess.js';
import { Clock, ShieldAlert, Bot, User, Sparkles } from 'lucide-react';
import { BotDifficulty } from '../types/chess';

interface PlayerCardProps {
  name: string;
  color: Color;
  isAi: boolean;
  difficulty?: BotDifficulty;
  isCurrentTurn: boolean;
  isCheck: boolean;
  timeRemaining: number | null; // in seconds, null if unlimited
  capturedPieces: PieceSymbol[];
  materialDifference: number; // positive means this player is up in material
  isAiThinking?: boolean;
}

const PIECE_SYMBOLS: Record<PieceSymbol, { w: string; b: string }> = {
  p: { w: '♙', b: '♟' },
  n: { w: '♘', b: '♞' },
  b: { w: '♗', b: '♝' },
  r: { w: '♖', b: '♜' },
  q: { w: '♕', b: '♛' },
  k: { w: '♔', b: '♚' },
};

export const PlayerCard: React.FC<PlayerCardProps> = ({
  name,
  color,
  isAi,
  difficulty,
  isCurrentTurn,
  isCheck,
  timeRemaining,
  capturedPieces,
  materialDifference,
  isAiThinking,
}) => {
  const isWhite = color === 'w';

  // Format seconds to mm:ss
  const formatTime = (secs: number | null) => {
    if (secs === null) return '∞';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining !== null && timeRemaining <= 30;
  const isCriticalTime = timeRemaining !== null && timeRemaining <= 10;

  return (
    <div
      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all duration-300 ${
        isCurrentTurn
          ? 'bg-slate-900/90 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
          : 'bg-slate-900/50 border-slate-800/80 text-slate-400'
      }`}
    >
      {/* Left: Avatar & Info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className={`relative w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shadow-inner ${
            isWhite
              ? 'bg-gradient-to-br from-slate-100 to-slate-300 text-slate-900 border border-white/60'
              : 'bg-gradient-to-br from-slate-950 to-slate-800 text-amber-400 border border-slate-700'
          }`}
        >
          {isAi ? (
            <Bot className="w-5 h-5" />
          ) : (
            <User className="w-5 h-5" />
          )}

          {/* Online/Active indicator */}
          {isCurrentTurn && (
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          )}
        </div>

        {/* Name and State */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
              {name}
              {isWhite ? ' (Beyaz)' : ' (Siyah)'}
            </span>

            {difficulty && isAi && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {difficulty === 'easy' ? 'Acemi' : difficulty === 'medium' ? 'Usta' : 'Büyükusta'}
              </span>
            )}
          </div>

          {/* Captured Pieces & Material count */}
          <div className="flex items-center gap-1.5 mt-0.5 text-xs">
            <div className="flex items-center text-slate-400 select-none tracking-tight">
              {capturedPieces.map((p, i) => (
                <span key={i} className="text-sm -mr-0.5">
                  {PIECE_SYMBOLS[p] ? PIECE_SYMBOLS[p][isWhite ? 'b' : 'w'] : p}
                </span>
              ))}
            </div>

            {materialDifference > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
                +{materialDifference}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Turn status & Clock */}
      <div className="flex items-center gap-3">
        {/* Status badges */}
        {isCheck && isCurrentTurn && (
          <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-bold animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            ŞAH!
          </span>
        )}

        {isAiThinking && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            Düşünüyor...
          </span>
        )}

        {/* Digital Chess Clock */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono font-bold text-base sm:text-lg border transition-all ${
            timeRemaining === null
              ? 'bg-slate-800/40 border-slate-700 text-slate-400'
              : isCriticalTime && isCurrentTurn
              ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse shadow-md shadow-rose-500/30'
              : isLowTime && isCurrentTurn
              ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20'
              : isCurrentTurn
              ? 'bg-slate-800 border-amber-400/80 text-amber-300'
              : 'bg-slate-800/60 border-slate-700 text-slate-300'
          }`}
        >
          <Clock className={`w-4 h-4 ${isCriticalTime && isCurrentTurn ? 'text-rose-400 animate-spin' : 'text-slate-400'}`} />
          <span>{formatTime(timeRemaining)}</span>
        </div>
      </div>
    </div>
  );
};

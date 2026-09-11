import React from 'react';
import { Undo2, RotateCw, Flag, Handshake, Bot, Zap } from 'lucide-react';
import { GameMode, BotDifficulty, PlayerColor } from '../types/chess';

interface GameControlsProps {
  gameMode: GameMode;
  botDifficulty: BotDifficulty;
  setBotDifficulty: (diff: BotDifficulty) => void;
  playerColor: PlayerColor;
  setPlayerColor: (color: PlayerColor) => void;
  timeLimit: number | null;
  setTimeLimit: (limit: number | null) => void;
  onUndo: () => void;
  onFlipBoard: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  canUndo: boolean;
  isGameOver: boolean;
}

const TIME_OPTIONS: { label: string; value: number | null }[] = [
  { label: '1 dk (Bullet)', value: 60 },
  { label: '3 dk (Blitz)', value: 180 },
  { label: '5 dk (Blitz)', value: 300 },
  { label: '10 dk (Rapid)', value: 600 },
  { label: '15 dk (Rapid)', value: 900 },
  { label: 'Süresiz', value: null },
];

export const GameControls: React.FC<GameControlsProps> = ({
  gameMode,
  botDifficulty,
  setBotDifficulty,
  playerColor,
  setPlayerColor,
  timeLimit,
  setTimeLimit,
  onUndo,
  onFlipBoard,
  onResign,
  onOfferDraw,
  canUndo,
  isGameOver,
}) => {
  return (
    <div className="bg-slate-900/70 p-3.5 rounded-xl border border-slate-800/80 space-y-3.5">
      {/* Bot Specific Settings */}
      {gameMode === 'bot' && (
        <div className="space-y-2.5 pb-3 border-b border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Bot className="w-4 h-4" />
              Yapay Zeka Zorluğu
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {(['easy', 'medium', 'hard'] as BotDifficulty[]).map((level) => (
              <button
                key={level}
                onClick={() => setBotDifficulty(level)}
                className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  botDifficulty === level
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                {level === 'easy' ? '🟢 Acemi' : level === 'medium' ? '🟡 Usta' : '🔴 Büyükusta'}
              </button>
            ))}
          </div>

          {/* Player Color Choice for Bot mode */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-400">Rengin:</span>
            <div className="flex items-center gap-1">
              {(['white', 'random', 'black'] as PlayerColor[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setPlayerColor(c)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                    playerColor === c
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {c === 'white' ? '⚪ Beyaz' : c === 'black' ? '⚫ Siyah' : '🎲 Rastgele'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Time Control Options */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Süre Kontrolü (Saat)</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => setTimeLimit(opt.value)}
              className={`py-1 px-1.5 rounded-lg text-[11px] font-medium transition-all ${
                timeLimit === opt.value
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 font-semibold'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* In-Game Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <button
          onClick={onUndo}
          disabled={!canUndo || isGameOver}
          title="Son Hamleyi Geri Al"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>Geri Al</span>
        </button>

        <button
          onClick={onFlipBoard}
          title="Tahtayı Ters Çevir"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Çevir</span>
        </button>

        <button
          onClick={onOfferDraw}
          disabled={isGameOver}
          title="Beraberlik Teklif Et"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Handshake className="w-3.5 h-3.5 text-blue-400" />
          <span>Berabere</span>
        </button>

        <button
          onClick={onResign}
          disabled={isGameOver}
          title="Oyunu Terk Et"
          className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Flag className="w-3.5 h-3.5 text-rose-400" />
          <span>Terk Et</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Trophy, RotateCcw, Eye, Sparkles, AlertCircle } from 'lucide-react';

interface GameOverModalProps {
  winner: 'w' | 'b' | 'draw' | null;
  endReason: string | null;
  onNewGame: () => void;
  onClose: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  endReason,
  onNewGame,
  onClose,
}) => {
  if (!winner) return null;

  const isDraw = winner === 'draw';
  const winnerName = isDraw
    ? 'Oyun Berabere!'
    : winner === 'w'
    ? 'Beyaz Kazandı! 🏆'
    : 'Siyah Kazandı! 🏆';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-4">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-amber-500/20 text-center space-y-5">
        {/* Top Trophy / Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full blur opacity-60 animate-pulse"></div>
            <div className="relative w-16 h-16 rounded-full bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-amber-400 shadow-xl">
              {isDraw ? (
                <AlertCircle className="w-8 h-8 text-cyan-400" />
              ) : (
                <Trophy className="w-8 h-8 text-amber-400" />
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
            {winnerName}
          </h2>
          <p className="text-sm font-medium text-slate-300">
            {endReason || 'Oyun sona erdi.'}
          </p>
        </div>

        {/* Brand note */}
        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>ChessDuoM Arena • Harika bir maçtı!</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onNewGame}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yeni Oyun Başlat</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-sm font-medium transition"
          >
            <Eye className="w-4 h-4" />
            <span>Tahtayı İncele</span>
          </button>
        </div>
      </div>
    </div>
  );
};

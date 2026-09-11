import React from 'react';
import { Color } from 'chess.js';
import { Crown } from 'lucide-react';

interface PromotionDialogProps {
  color: Color;
  onSelect: (piece: 'q' | 'r' | 'b' | 'n') => void;
  onCancel: () => void;
}

const PROMO_OPTIONS: { type: 'q' | 'r' | 'b' | 'n'; label: string; symbol: { w: string; b: string } }[] = [
  { type: 'q', label: 'Vezir (Queen)', symbol: { w: '♕', b: '♛' } },
  { type: 'r', label: 'Kale (Rook)', symbol: { w: '♖', b: '✜' } },
  { type: 'b', label: 'Fil (Bishop)', symbol: { w: '♗', b: '♝' } },
  { type: 'n', label: 'At (Knight)', symbol: { w: '♘', b: '♞' } },
];

export const PromotionDialog: React.FC<PromotionDialogProps> = ({
  color,
  onSelect,
  onCancel,
}) => {
  const isWhite = color === 'w';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-5 max-w-sm w-full shadow-2xl shadow-amber-500/10 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-amber-400">
          <Crown className="w-6 h-6" />
          <h3 className="text-lg font-bold">Piyon Terfisi</h3>
        </div>

        <p className="text-xs text-slate-300">
          Piyonun son kareye ulaştı! Dönüştürmek istediğin taşı seç:
        </p>

        <div className="grid grid-cols-2 gap-3">
          {PROMO_OPTIONS.map((opt) => (
            <button
              key={opt.type}
              onClick={() => onSelect(opt.type)}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/80 hover:bg-amber-500/20 hover:border-amber-500/60 border border-slate-700 transition group"
            >
              <span className="text-4xl select-none group-hover:scale-110 transition transform text-amber-300">
                {opt.symbol[isWhite ? 'w' : 'b']}
              </span>
              <span className="text-xs font-semibold text-slate-200 mt-1.5 group-hover:text-amber-300">
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="text-xs text-slate-400 hover:text-slate-200 underline pt-1"
        >
          İptal Et
        </button>
      </div>
    </div>
  );
};

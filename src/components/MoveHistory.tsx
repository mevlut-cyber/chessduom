import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check, ScrollText } from 'lucide-react';
import { MoveRecord } from '../types/chess';

interface MoveHistoryProps {
  moveHistory: MoveRecord[];
  pgn: string;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ moveHistory, pgn }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Group moves into pairs (White, Black)
  const pairedMoves: { number: number; white?: MoveRecord; black?: MoveRecord }[] = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    pairedMoves.push({
      number: Math.floor(i / 2) + 1,
      white: moveHistory[i],
      black: moveHistory[i + 1],
    });
  }

  // Auto-scroll to bottom on move update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveHistory]);

  const handleCopyPgn = () => {
    if (!pgn) return;
    navigator.clipboard.writeText(pgn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-200 font-semibold text-xs sm:text-sm">
          <ScrollText className="w-4 h-4 text-amber-400" />
          <span>Hamle Geçmişi</span>
          <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
            {moveHistory.length} hamle
          </span>
        </div>

        <button
          onClick={handleCopyPgn}
          disabled={!pgn}
          title="PGN Notasyonunu Kopyala"
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700/60 transition text-xs disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Kopyalandı</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>PGN</span>
            </>
          )}
        </button>
      </div>

      {/* Table Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs sm:text-sm">
        {pairedMoves.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-xs italic">
            <span>Henüz hamle yapılmadı.</span>
            <span>İlk hamleyi beyaz yapar.</span>
          </div>
        ) : (
          pairedMoves.map((pair) => (
            <div
              key={pair.number}
              className="grid grid-cols-12 py-1 px-2 rounded hover:bg-slate-800/40 transition items-center"
            >
              <div className="col-span-2 text-slate-500 font-medium">
                {pair.number}.
              </div>
              <div className="col-span-5 text-slate-200 font-semibold flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-slate-300 mr-1"></span>
                <span>{pair.white?.san}</span>
              </div>
              <div className="col-span-5 text-amber-400/90 font-semibold flex items-center gap-1">
                {pair.black && (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-slate-700 border border-slate-500 mr-1"></span>
                    <span>{pair.black.san}</span>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

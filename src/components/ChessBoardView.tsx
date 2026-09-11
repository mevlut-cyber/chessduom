import React, { useState, useMemo } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, Square } from 'chess.js';
import { BoardTheme } from '../types/chess';

interface ChessBoardViewProps {
  chess: Chess;
  boardOrientation: 'white' | 'black';
  boardTheme: BoardTheme;
  lastMove: { from: Square; to: Square } | null;
  isCheck: boolean;
  onMakeMove: (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => boolean;
  onPawnPromotionPrompt: (from: Square, to: Square) => void;
  isInteractive: boolean;
}

export const ChessBoardView: React.FC<ChessBoardViewProps> = ({
  chess,
  boardOrientation,
  boardTheme,
  lastMove,
  isCheck,
  onMakeMove,
  onPawnPromotionPrompt,
  isInteractive,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [candidateMoves, setCandidateMoves] = useState<Square[]>([]);

  // Find king square if in check
  const kingInCheckSquare = useMemo((): Square | null => {
    if (!isCheck) return null;
    const turn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = board[r][f];
        if (p && p.type === 'k' && p.color === turn) {
          const files = 'abcdefgh';
          const ranks = '87654321';
          return `${files[f]}${ranks[r]}` as Square;
        }
      }
    }
    return null;
  }, [chess, isCheck]);

  // Color scheme configs for custom themes
  const themeColors = useMemo(() => {
    switch (boardTheme) {
      case 'gold':
        return {
          dark: '#1e2029',
          light: '#d4af37',
          border: 'border-amber-500/50',
          shadow: 'shadow-amber-500/10',
        };
      case 'classic':
        return {
          dark: '#3b7a57',
          light: '#ebebd0',
          border: 'border-emerald-700/50',
          shadow: 'shadow-emerald-950/40',
        };
      case 'slate':
      default:
        return {
          dark: '#1e293b',
          light: '#475569',
          border: 'border-slate-700/80',
          shadow: 'shadow-slate-950/60',
        };
    }
  }, [boardTheme]);

  // Compute square styles for selected, valid targets, last move and check
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, Record<string, string | number>> = {};

    // 1. Last Move Highlighting
    if (lastMove) {
      styles[lastMove.from] = {
        backgroundColor: 'rgba(234, 179, 8, 0.22)',
      };
      styles[lastMove.to] = {
        backgroundColor: 'rgba(234, 179, 8, 0.32)',
      };
    }

    // 2. Selected Square Highlight
    if (selectedSquare) {
      styles[selectedSquare] = {
        backgroundColor: 'rgba(245, 158, 11, 0.45)',
        boxShadow: 'inset 0 0 0 2px #f59e0b',
      };
    }

    // 3. Legal Candidate Move Dots and Capture Rings
    candidateMoves.forEach((sq) => {
      const pieceOnTarget = chess.get(sq);
      if (pieceOnTarget) {
        // Capture indicator: outer ring
        styles[sq] = {
          background: 'radial-gradient(circle, transparent 60%, rgba(244, 63, 94, 0.75) 62%)',
          borderRadius: '50%',
        };
      } else {
        // Move indicator: centered circular dot
        styles[sq] = {
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.7) 25%, transparent 26%)',
          borderRadius: '50%',
        };
      }
    });

    // 4. King in check pulsing red
    if (kingInCheckSquare) {
      styles[kingInCheckSquare] = {
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(225, 29, 72, 0.4) 70%, transparent 100%)',
        boxShadow: '0 0 16px rgba(239, 68, 68, 0.8)',
      };
    }

    return styles;
  }, [lastMove, selectedSquare, candidateMoves, kingInCheckSquare, chess]);

  // Check for pawn promotion
  const isPawnPromotion = (source: Square, target: Square): boolean => {
    const piece = chess.get(source);
    if (!piece || piece.type !== 'p') return false;
    if (piece.color === 'w' && target[1] === '8') return true;
    if (piece.color === 'b' && target[1] === '1') return true;
    return false;
  };

  // Drag & Drop Piece handler
  const handlePieceDrop = (sourceSquare: Square, targetSquare: Square): boolean => {
    if (!isInteractive) return false;

    // Check pawn promotion
    if (isPawnPromotion(sourceSquare, targetSquare)) {
      onPawnPromotionPrompt(sourceSquare, targetSquare);
      return false; // Wait for promotion dialog selection
    }

    const success = onMakeMove(sourceSquare, targetSquare);
    if (success) {
      setSelectedSquare(null);
      setCandidateMoves([]);
    }
    return success;
  };

  // Click to Move handler
  const handleSquareClick = (square: Square) => {
    if (!isInteractive) return;

    // If a piece was already selected and clicked target is candidate move
    if (selectedSquare) {
      if (candidateMoves.includes(square)) {
        if (isPawnPromotion(selectedSquare, square)) {
          onPawnPromotionPrompt(selectedSquare, square);
          return;
        }

        const success = onMakeMove(selectedSquare, square);
        if (success) {
          setSelectedSquare(null);
          setCandidateMoves([]);
          return;
        }
      }
    }

    // Selecting a piece
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      const moves = chess.moves({ square, verbose: true });
      setCandidateMoves(moves.map((m) => m.to as Square));
    } else {
      setSelectedSquare(null);
      setCandidateMoves([]);
    }
  };

  return (
    <div
      className={`w-full max-w-[560px] aspect-square rounded-2xl overflow-hidden border-2 ${themeColors.border} ${themeColors.shadow} shadow-2xl p-1.5 sm:p-2.5 bg-slate-900/90 relative select-none`}
    >
      <div className="w-full h-full rounded-xl overflow-hidden shadow-inner">
        <Chessboard
          position={chess.fen()}
          onPieceDrop={handlePieceDrop}
          onSquareClick={handleSquareClick}
          boardOrientation={boardOrientation}
          customDarkSquareStyle={{ backgroundColor: themeColors.dark }}
          customLightSquareStyle={{ backgroundColor: themeColors.light }}
          customSquareStyles={customSquareStyles as any}
          arePiecesDraggable={isInteractive}
          animationDuration={220}
          customBoardStyle={{
            borderRadius: '12px',
          }}
        />
      </div>
    </div>
  );
};

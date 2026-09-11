import { Chess, Move, Color } from 'chess.js';
import { BotDifficulty } from '../types/chess';

// Standard piece weights
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Positional bonuses: encouraging center control, piece development, king safety
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 25, 25, 10,  5,  5,
   0,  0,  0, 20, 20,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-20,-20, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

const BISHOP_TABLE = [
  -20,-10,-10,-10,-10,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5, 10, 10,  5,  0,-10,
  -10,  5,  5, 10, 10,  5,  5,-10,
  -10,  0, 10, 10, 10, 10,  0,-10,
  -10, 10, 10, 10, 10, 10, 10,-10,
  -10,  5,  0,  0,  0,  0,  5,-10,
  -20,-10,-10,-10,-10,-10,-10,-20,
];

const ROOK_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  5, 10, 10, 10, 10, 10, 10,  5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
 -5,  0,  0,  0,  0,  0,  0, -5,
  0,  0,  0,  5,  5,  0,  0,  0
];

const QUEEN_TABLE = [
  -20,-10,-10, -5, -5,-10,-10,-20,
  -10,  0,  0,  0,  0,  0,  0,-10,
  -10,  0,  5,  5,  5,  5,  0,-10,
   -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
  -10,  5,  5,  5,  5,  5,  0,-10,
  -10,  0,  5,  0,  0,  0,  0,-10,
  -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_MIDGAME_TABLE = [
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -30,-40,-40,-50,-50,-40,-40,-30,
  -20,-30,-30,-40,-40,-30,-30,-20,
  -10,-20,-20,-20,-20,-20,-20,-10,
   20, 20,  0,  0,  0,  0, 20, 20,
   20, 30, 10,  0,  0, 10, 30, 20
];

export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -Infinity : Infinity;
  }
  if (chess.isDraw()) return 0;

  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;

      let value = PIECE_VALUES[piece.type] || 0;
      const idx = r * 8 + f;
      const flippedIdx = (7 - r) * 8 + f;
      const posIdx = piece.color === 'w' ? flippedIdx : idx;

      if (piece.type === 'p') value += PAWN_TABLE[posIdx];
      else if (piece.type === 'n') value += KNIGHT_TABLE[posIdx];
      else if (piece.type === 'b') value += BISHOP_TABLE[posIdx];
      else if (piece.type === 'r') value += ROOK_TABLE[posIdx];
      else if (piece.type === 'q') value += QUEEN_TABLE[posIdx];
      else if (piece.type === 'k') value += KING_MIDGAME_TABLE[posIdx];

      score += piece.color === 'w' ? value : -value;
    }
  }

  // Small mobility factor
  const currentMobility = chess.moves().length;
  score += chess.turn() === 'w' ? currentMobility * 2 : -currentMobility * 2;

  return score;
}

function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = chess.moves({ verbose: true });

  // Move ordering: evaluate captures and checks first to prune branches faster
  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += 10 * (PIECE_VALUES[a.captured] || 0) - (PIECE_VALUES[a.piece] || 0);
    if (b.captured) scoreB += 10 * (PIECE_VALUES[b.captured] || 0) - (PIECE_VALUES[b.piece] || 0);
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;
    return scoreB - scoreA;
  });

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalVal = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalVal = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evalVal);
      beta = Math.min(beta, evalVal);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function calculateBotMove(chess: Chess, difficulty: BotDifficulty = 'medium'): Move | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  const currentTurn: Color = chess.turn();
  const isWhite = currentTurn === 'w';

  // 1. EASY MODE (Acemi): 65% random moves, 35% captures
  if (difficulty === 'easy') {
    const captures = moves.filter(m => m.captured);
    if (captures.length > 0 && Math.random() < 0.35) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // 2. MEDIUM MODE (Usta): Minimax Depth 2
  // 3. HARD MODE (Büyükusta): Minimax Depth 3
  const searchDepth = difficulty === 'hard' ? 3 : 2;

  // Move ordering
  moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;
    if (a.captured) scoreA += 10 * (PIECE_VALUES[a.captured] || 0) - (PIECE_VALUES[a.piece] || 0);
    if (b.captured) scoreB += 10 * (PIECE_VALUES[b.captured] || 0) - (PIECE_VALUES[b.piece] || 0);
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;
    return scoreB - scoreA;
  });

  let bestMove: Move = moves[0];
  let bestValue = isWhite ? -Infinity : Infinity;

  for (const move of moves) {
    chess.move(move);
    const score = minimax(chess, searchDepth - 1, -Infinity, Infinity, !isWhite);
    chess.undo();

    if (isWhite) {
      if (score > bestValue) {
        bestValue = score;
        bestMove = move;
      }
    } else {
      if (score < bestValue) {
        bestValue = score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

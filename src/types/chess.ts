import { Square, PieceSymbol, Color } from 'chess.js';

export type GameMode = 'bot' | 'local' | 'online';
export type BotDifficulty = 'easy' | 'medium' | 'hard';
export type PlayerColor = 'white' | 'black' | 'random';
export type BoardTheme = 'slate' | 'classic' | 'gold';

export interface MoveRecord {
  from: Square;
  to: Square;
  san: string;
  color: Color;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  moveNumber: number;
}

export interface Player {
  name: string;
  color: Color;
  avatar: string;
  isAi: boolean;
  difficulty?: BotDifficulty;
}

export interface GameState {
  fen: string;
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isThreefold: boolean;
  isInsufficient: boolean;
  isFiftyMove: boolean;
  winner: 'w' | 'b' | 'draw' | null;
  endReason: string | null;
}

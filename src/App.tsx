import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { ChessBoardView } from './components/ChessBoardView';
import { PlayerCard } from './components/PlayerCard';
import { MoveHistory } from './components/MoveHistory';
import { GameControls } from './components/GameControls';
import { PromotionDialog } from './components/PromotionDialog';
import { GameOverModal } from './components/GameOverModal';
import { RulesModal } from './components/RulesModal';
import { MultiplayerModal } from './components/MultiplayerModal';
import { calculateBotMove } from './ai/chessBot';
import { sounds } from './audio/soundEffects';
import { initSocket, getSocket } from './services/socketService';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import {
  GameMode,
  BotDifficulty,
  PlayerColor,
  BoardTheme,
  MoveRecord,
} from './types/chess';

// Piece value mapping for material difference calculation
const PIECE_WEIGHTS: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

export const App: React.FC = () => {
  // Core chess instance
  const [chess] = useState(() => new Chess());
  const [, setRenderVersion] = useState(0); // Trigger re-renders on game state changes

  // Game configuration
  const [gameMode, setGameMode] = useState<GameMode>('bot');
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const [playerColor, setPlayerColor] = useState<PlayerColor>('white');
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('slate');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Clocks / Timers
  const [timeLimit, setTimeLimit] = useState<number | null>(300); // Default 5 minutes
  const [whiteTime, setWhiteTime] = useState<number | null>(300);
  const [blackTime, setBlackTime] = useState<number | null>(300);

  // Move tracking & state
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<{ w: PieceSymbol[]; b: PieceSymbol[] }>({
    w: [],
    b: [],
  });
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Modals & Dialogs
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [winner, setWinner] = useState<'w' | 'b' | 'draw' | null>(null);
  const [endReason, setEndReason] = useState<string | null>(null);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isMultiplayerOpen, setIsMultiplayerOpen] = useState(false);

  // Multiplayer socket state
  const [socketConnected, setSocketConnected] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [onlineRole, setOnlineRole] = useState<'white' | 'black' | null>(null);
  const [opponentConnected, setOpponentConnected] = useState(false);

  const isGameOver = !!winner;
  const turn = chess.turn();
  const isCheck = chess.inCheck();

  // Determine user's actual color (resolving 'random')
  const actualUserColor: Color = useMemo(() => {
    if (gameMode !== 'bot') return 'w';
    if (playerColor === 'black') return 'b';
    return 'w';
  }, [gameMode, playerColor]);

  // Adjust board orientation when player color changes
  useEffect(() => {
    if (gameMode === 'bot') {
      setBoardOrientation(actualUserColor === 'w' ? 'white' : 'black');
    } else if (gameMode === 'online' && onlineRole) {
      setBoardOrientation(onlineRole);
    }
  }, [gameMode, actualUserColor, onlineRole]);

  // Socket.io initialization & events
  useEffect(() => {
    const socket = initSocket();
    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));

    socket.on('opponent_joined', () => {
      setOpponentConnected(true);
    });

    socket.on('opponent_move', ({ move }: { move: { from: Square; to: Square; promotion?: string } }) => {
      try {
        const res = chess.move(move);
        if (res) {
          setLastMove({ from: move.from, to: move.to });
          if (res.captured) {
            sounds.playCapture();
            setCapturedPieces((prev) => ({
              ...prev,
              [res.color === 'w' ? 'b' : 'w']: [...prev[res.color === 'w' ? 'b' : 'w'], res.captured as PieceSymbol],
            }));
          } else {
            sounds.playMove();
          }

          setMoveHistory((prev) => [
            ...prev,
            {
              from: move.from,
              to: move.to,
              san: res.san,
              color: res.color,
              piece: res.piece,
              captured: res.captured as PieceSymbol,
              moveNumber: Math.floor(prev.length / 2) + 1,
            },
          ]);

          checkGameOverConditions();
          setRenderVersion((v) => v + 1);
        }
      } catch (e) {
        console.error('Opponent move error:', e);
      }
    });

    socket.on('game_reset', () => {
      resetGame(false);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('opponent_joined');
      socket.off('opponent_move');
      socket.off('game_reset');
    };
  }, [chess]);

  // Material evaluation difference
  const materialDiff = useMemo(() => {
    let whiteScore = 0;
    let blackScore = 0;
    capturedPieces.w.forEach((p) => (whiteScore += PIECE_WEIGHTS[p]));
    capturedPieces.b.forEach((p) => (blackScore += PIECE_WEIGHTS[p]));
    return {
      w: whiteScore - blackScore,
      b: blackScore - whiteScore,
    };
  }, [capturedPieces]);

  // Check Game Over Conditions
  const checkGameOverConditions = useCallback((): boolean => {
    if (chess.isCheckmate()) {
      const winningColor = chess.turn() === 'w' ? 'b' : 'w';
      setWinner(winningColor);
      setEndReason('Şah-Mat! ' + (winningColor === 'w' ? 'Beyaz' : 'Siyah') + ' şah mat etti.');
      setShowGameOverModal(true);
      sounds.playCheckmate();
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      return true;
    }

    if (chess.isStalemate()) {
      setWinner('draw');
      setEndReason('Pat! Yapacak yasal hamle kalmadı.');
      setShowGameOverModal(true);
      return true;
    }

    if (chess.isThreefoldRepetition()) {
      setWinner('draw');
      setEndReason('Üç Konum Tekrarı Beraberliği.');
      setShowGameOverModal(true);
      return true;
    }

    if (chess.isInsufficientMaterial()) {
      setWinner('draw');
      setEndReason('Yetersiz Materyal Beraberliği.');
      setShowGameOverModal(true);
      return true;
    }

    if (chess.inCheck()) {
      sounds.playCheck();
    }

    return false;
  }, [chess]);

  // Clocks countdown timer
  useEffect(() => {
    if (isGameOver || timeLimit === null) return;

    const interval = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((prev) => {
          if (prev === null || prev <= 0) return 0;
          const next = prev - 1;
          if (next === 0) {
            setWinner('b');
            setEndReason('Beyazın süresi bitti. Siyah zamandan kazandı!');
            setShowGameOverModal(true);
            sounds.playCheckmate();
          } else if (next <= 10) {
            sounds.playTick();
          }
          return next;
        });
      } else {
        setBlackTime((prev) => {
          if (prev === null || prev <= 0) return 0;
          const next = prev - 1;
          if (next === 0) {
            setWinner('w');
            setEndReason('Siyahın süresi bitti. Beyaz zamandan kazandı!');
            setShowGameOverModal(true);
            sounds.playCheckmate();
          } else if (next <= 10) {
            sounds.playTick();
          }
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [turn, isGameOver, timeLimit]);

  // Central Move Execution Function
  const makeMove = useCallback(
    (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n'): boolean => {
      if (isGameOver) return false;

      try {
        const moveResult = chess.move({
          from,
          to,
          promotion: promotion || 'q',
        });

        if (!moveResult) return false;

        // Sounds & Captured Pieces
        if (moveResult.captured) {
          sounds.playCapture();
          setCapturedPieces((prev) => ({
            ...prev,
            [moveResult.color === 'w' ? 'b' : 'w']: [
              ...prev[moveResult.color === 'w' ? 'b' : 'w'],
              moveResult.captured as PieceSymbol,
            ],
          }));
        } else {
          sounds.playMove();
        }

        setLastMove({ from, to });

        // Update Move History
        setMoveHistory((prev) => [
          ...prev,
          {
            from,
            to,
            san: moveResult.san,
            color: moveResult.color,
            piece: moveResult.piece,
            captured: moveResult.captured as PieceSymbol,
            moveNumber: Math.floor(prev.length / 2) + 1,
          },
        ]);

        // If online mode, emit move to socket
        if (gameMode === 'online' && roomId) {
          const socket = getSocket();
          socket?.emit('make_move', {
            roomId,
            move: { from, to, promotion: promotion || 'q' },
            fen: chess.fen(),
          });
        }

        // Trigger Game Over checks
        checkGameOverConditions();
        setRenderVersion((v) => v + 1);
        return true;
      } catch (err) {
        return false;
      }
    },
    [chess, isGameOver, gameMode, roomId, checkGameOverConditions]
  );

  // AI Bot Response logic
  const isAiThinkingRef = useRef(false);
  useEffect(() => {
    const isBotTurn = gameMode === 'bot' && turn !== actualUserColor;

    if (isBotTurn && !isGameOver && !isAiThinkingRef.current) {
      isAiThinkingRef.current = true;
      setIsAiThinking(true);

      // Delay for realistic human-like feeling
      const thinkTime = botDifficulty === 'easy' ? 450 : botDifficulty === 'medium' ? 700 : 1000;
      const timer = setTimeout(() => {
        const botMove = calculateBotMove(chess, botDifficulty);
        setIsAiThinking(false);
        isAiThinkingRef.current = false;

        if (botMove) {
          makeMove(botMove.from, botMove.to, botMove.promotion as 'q' | 'r' | 'b' | 'n');
        }
      }, thinkTime);

      return () => {
        clearTimeout(timer);
        isAiThinkingRef.current = false;
        setIsAiThinking(false);
      };
    }
  }, [turn, gameMode, actualUserColor, isGameOver, botDifficulty, chess, makeMove]);

  // Reset / New Game
  const resetGame = useCallback(
    (emitSocket = true) => {
      chess.reset();
      setMoveHistory([]);
      setLastMove(null);
      setCapturedPieces({ w: [], b: [] });
      setWinner(null);
      setEndReason(null);
      setShowGameOverModal(false);
      setIsAiThinking(false);
      isAiThinkingRef.current = false;
      setWhiteTime(timeLimit);
      setBlackTime(timeLimit);
      setRenderVersion((v) => v + 1);

      if (emitSocket && gameMode === 'online' && roomId) {
        getSocket()?.emit('reset_room', { roomId });
      }

      sounds.playMove();
    },
    [chess, timeLimit, gameMode, roomId]
  );

  // Time limit changer
  const handleSetTimeLimit = (newLimit: number | null) => {
    setTimeLimit(newLimit);
    setWhiteTime(newLimit);
    setBlackTime(newLimit);
  };

  // Undo move
  const handleUndo = () => {
    if (isGameOver || moveHistory.length === 0) return;

    if (gameMode === 'bot') {
      // Undo both bot and player move
      chess.undo();
      chess.undo();
      setMoveHistory((prev) => prev.slice(0, -2));
    } else {
      // Undo single move in local mode
      chess.undo();
      setMoveHistory((prev) => prev.slice(0, -1));
    }

    const hist = chess.history({ verbose: true });
    if (hist.length > 0) {
      const last = hist[hist.length - 1];
      setLastMove({ from: last.from, to: last.to });
    } else {
      setLastMove(null);
    }

    // Recompute captured pieces
    const newCaptured: { w: PieceSymbol[]; b: PieceSymbol[] } = { w: [], b: [] };
    hist.forEach((m) => {
      if (m.captured) {
        newCaptured[m.color === 'w' ? 'b' : 'w'].push(m.captured as PieceSymbol);
      }
    });
    setCapturedPieces(newCaptured);
    setRenderVersion((v) => v + 1);
  };

  // Flip board
  const handleFlipBoard = () => {
    setBoardOrientation((cur) => (cur === 'white' ? 'black' : 'white'));
  };

  // Resign
  const handleResign = () => {
    if (isGameOver) return;
    const resigningColor = gameMode === 'bot' ? actualUserColor : turn;
    const winningColor = resigningColor === 'w' ? 'b' : 'w';
    setWinner(winningColor);
    setEndReason(
      (resigningColor === 'w' ? 'Beyaz' : 'Siyah') + ' oyunu terk etti. ' + (winningColor === 'w' ? 'Beyaz' : 'Siyah') + ' kazandı.'
    );
    setShowGameOverModal(true);
    sounds.playCheckmate();
  };

  // Offer draw
  const handleOfferDraw = () => {
    if (isGameOver) return;
    setWinner('draw');
    setEndReason('Oyuncular karşılıklı anlaşarak beraberliği kabul etti.');
    setShowGameOverModal(true);
  };

  // Promotion handling
  const handlePawnPromotionPrompt = (from: Square, to: Square) => {
    setPendingPromotion({ from, to });
  };

  const handleConfirmPromotion = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (pendingPromotion) {
      makeMove(pendingPromotion.from, pendingPromotion.to, piece);
      setPendingPromotion(null);
    }
  };

  // Multiplayer Room Handlers
  const handleCreateOnlineRoom = () => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('create_room', (res: { success: boolean; roomId: string; role: 'white' }) => {
      if (res.success) {
        setRoomId(res.roomId);
        setOnlineRole(res.role);
        setBoardOrientation('white');
        resetGame(false);
      }
    });
  };

  const handleJoinOnlineRoom = (code: string) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('join_room', { roomId: code }, (res: { success: boolean; roomId: string; role: 'black'; error?: string }) => {
      if (res.success) {
        setRoomId(res.roomId);
        setOnlineRole(res.role);
        setBoardOrientation('black');
        setOpponentConnected(true);
        resetGame(false);
        setIsMultiplayerOpen(false);
      } else {
        alert(res.error || 'Odaya katılınamadı.');
      }
    });
  };

  // Interactive guard
  const isInteractive = useMemo(() => {
    if (isGameOver) return false;
    if (gameMode === 'bot') {
      return turn === actualUserColor && !isAiThinking;
    }
    if (gameMode === 'online') {
      return onlineRole ? (turn === 'w' ? onlineRole === 'white' : onlineRole === 'black') : true;
    }
    return true;
  }, [isGameOver, gameMode, turn, actualUserColor, isAiThinking, onlineRole]);

  // Top and Bottom Players config based on board orientation
  const topPlayer = useMemo(() => {
    const isTopWhite = boardOrientation === 'black';
    const isTopAi = gameMode === 'bot' && (isTopWhite ? actualUserColor === 'b' : actualUserColor === 'w');
    const color: Color = isTopWhite ? 'w' : 'b';
    return {
      name: isTopAi
        ? 'ChessDuoM Bot'
        : gameMode === 'local'
        ? isTopWhite
          ? 'Beyaz Oyuncu'
          : 'Siyah Oyuncu'
        : isTopWhite
        ? '1. Oyuncu (Beyaz)'
        : 'Rakip (Siyah)',
      color,
      isAi: isTopAi,
      difficulty: isTopAi ? botDifficulty : undefined,
      isCurrentTurn: turn === color && !isGameOver,
      isCheck: isCheck && turn === color,
      timeRemaining: color === 'w' ? whiteTime : blackTime,
      capturedPieces: color === 'w' ? capturedPieces.w : capturedPieces.b,
      materialDifference: color === 'w' ? materialDiff.w : materialDiff.b,
    };
  }, [
    boardOrientation,
    gameMode,
    actualUserColor,
    botDifficulty,
    turn,
    isGameOver,
    isCheck,
    whiteTime,
    blackTime,
    capturedPieces,
    materialDiff,
  ]);

  const bottomPlayer = useMemo(() => {
    const isBottomWhite = boardOrientation === 'white';
    const isBottomAi = gameMode === 'bot' && (isBottomWhite ? actualUserColor === 'b' : actualUserColor === 'w');
    const color: Color = isBottomWhite ? 'w' : 'b';
    return {
      name: isBottomAi
        ? 'ChessDuoM Bot'
        : gameMode === 'local'
        ? isBottomWhite
          ? 'Beyaz Oyuncu'
          : 'Siyah Oyuncu'
        : 'Sen',
      color,
      isAi: isBottomAi,
      difficulty: isBottomAi ? botDifficulty : undefined,
      isCurrentTurn: turn === color && !isGameOver,
      isCheck: isCheck && turn === color,
      timeRemaining: color === 'w' ? whiteTime : blackTime,
      capturedPieces: color === 'w' ? capturedPieces.w : capturedPieces.b,
      materialDifference: color === 'w' ? materialDiff.w : materialDiff.b,
    };
  }, [
    boardOrientation,
    gameMode,
    actualUserColor,
    botDifficulty,
    turn,
    isGameOver,
    isCheck,
    whiteTime,
    blackTime,
    capturedPieces,
    materialDiff,
  ]);

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navbar */}
      <Navbar
        gameMode={gameMode}
        setGameMode={(mode) => {
          setGameMode(mode);
          if (mode === 'online') {
            setIsMultiplayerOpen(true);
          }
        }}
        soundEnabled={soundEnabled}
        toggleSound={() => {
          setSoundEnabled((s) => {
            const next = !s;
            sounds.enabled = next;
            return next;
          });
        }}
        boardTheme={boardTheme}
        setBoardTheme={setBoardTheme}
        onNewGame={() => resetGame(true)}
        onOpenRules={() => setIsRulesOpen(true)}
      />

      {/* Main Chess Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-5">
        {/* Left Column: Top Player, Chessboard, Bottom Player */}
        <section className="flex flex-col items-center w-full max-w-[560px] gap-2.5">
          {/* Top Player Card */}
          <PlayerCard
            name={topPlayer.name}
            color={topPlayer.color}
            isAi={topPlayer.isAi}
            difficulty={topPlayer.difficulty}
            isCurrentTurn={topPlayer.isCurrentTurn}
            isCheck={topPlayer.isCheck}
            timeRemaining={topPlayer.timeRemaining}
            capturedPieces={topPlayer.capturedPieces}
            materialDifference={topPlayer.materialDifference}
            isAiThinking={topPlayer.isAi && isAiThinking}
          />

          {/* Interactive Chessboard */}
          <ChessBoardView
            chess={chess}
            boardOrientation={boardOrientation}
            boardTheme={boardTheme}
            lastMove={lastMove}
            isCheck={isCheck}
            onMakeMove={makeMove}
            onPawnPromotionPrompt={handlePawnPromotionPrompt}
            isInteractive={isInteractive}
          />

          {/* Bottom Player Card */}
          <PlayerCard
            name={bottomPlayer.name}
            color={bottomPlayer.color}
            isAi={bottomPlayer.isAi}
            difficulty={bottomPlayer.difficulty}
            isCurrentTurn={bottomPlayer.isCurrentTurn}
            isCheck={bottomPlayer.isCheck}
            timeRemaining={bottomPlayer.timeRemaining}
            capturedPieces={bottomPlayer.capturedPieces}
            materialDifference={bottomPlayer.materialDifference}
            isAiThinking={bottomPlayer.isAi && isAiThinking}
          />
        </section>

        {/* Right Column: Game Controls, Move History, PGN & Settings */}
        <aside className="w-full max-w-[560px] lg:max-w-md flex flex-col gap-3 h-full min-h-[580px]">
          {/* Controls Panel */}
          <GameControls
            gameMode={gameMode}
            botDifficulty={botDifficulty}
            setBotDifficulty={setBotDifficulty}
            playerColor={playerColor}
            setPlayerColor={setPlayerColor}
            timeLimit={timeLimit}
            setTimeLimit={handleSetTimeLimit}
            onUndo={handleUndo}
            onFlipBoard={handleFlipBoard}
            onResign={handleResign}
            onOfferDraw={handleOfferDraw}
            canUndo={moveHistory.length > 0}
            isGameOver={isGameOver}
          />

          {/* Move History Table */}
          <div className="flex-1 min-h-[260px]">
            <MoveHistory moveHistory={moveHistory} pgn={chess.pgn()} />
          </div>
        </aside>
      </main>

      {/* Pawn Promotion Modal */}
      {pendingPromotion && (
        <PromotionDialog
          color={turn}
          onSelect={handleConfirmPromotion}
          onCancel={() => setPendingPromotion(null)}
        />
      )}

      {/* Game Over Modal */}
      {showGameOverModal && (
        <GameOverModal
          winner={winner}
          endReason={endReason}
          onNewGame={() => resetGame(true)}
          onClose={() => setShowGameOverModal(false)}
        />
      )}

      {/* Rules & Help Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* Multiplayer Room Modal */}
      <MultiplayerModal
        isOpen={isMultiplayerOpen}
        onClose={() => setIsMultiplayerOpen(false)}
        roomId={roomId}
        onCreateRoom={handleCreateOnlineRoom}
        onJoinRoom={handleJoinOnlineRoom}
        isConnected={socketConnected}
        playerRole={onlineRole}
        opponentConnected={opponentConnected}
      />

      {/* Vercel Web Analytics & Performance Insights */}
      <Analytics />
      <SpeedInsights />
    </div>
  );
};

export default App;

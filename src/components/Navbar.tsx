import React from 'react';
import { Bot, Users, Volume2, VolumeX, RotateCcw, Palette, HelpCircle, Globe2 } from 'lucide-react';
import { GameMode, BoardTheme } from '../types/chess';

interface NavbarProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  boardTheme: BoardTheme;
  setBoardTheme: (theme: BoardTheme) => void;
  onNewGame: () => void;
  onOpenRules: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  gameMode,
  setGameMode,
  soundEnabled,
  toggleSound,
  boardTheme,
  setBoardTheme,
  onNewGame,
  onOpenRules,
}) => {
  const nextTheme = () => {
    if (boardTheme === 'slate') setBoardTheme('gold');
    else if (boardTheme === 'gold') setBoardTheme('classic');
    else setBoardTheme('slate');
  };

  const themeLabel = {
    slate: 'Onyx Koyu',
    gold: 'Altın ChessDuoM',
    classic: 'Turnuva Yeşili',
  }[boardTheme];

  return (
    <header className="w-full bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 z-30">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3 select-none">
          <div className="relative group flex items-center justify-center">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 rounded-lg blur-sm group-hover:blur transition duration-300"></div>
            <img
              src="/logo.png"
              alt="ChessDuoM Logo"
              className="relative h-10 sm:h-12 w-auto object-contain rounded-md drop-shadow-md border border-amber-500/40"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-bold tracking-wider font-display bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                ChessDuoM
              </span>
              <span className="text-[10px] uppercase tracking-widest font-semibold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Modern Canlı & Yapay Zeka Satranç Arenası
            </p>
          </div>
        </div>

        {/* Center: Game Mode Selector */}
        <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setGameMode('bot')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              gameMode === 'bot'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Bot ile Oyna</span>
          </button>

          <button
            onClick={() => setGameMode('local')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              gameMode === 'local'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>İki Kişilik (Yerel)</span>
          </button>

          <button
            onClick={() => setGameMode('online')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              gameMode === 'online'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Çevrimiçi Oda</span>
          </button>
        </div>

        {/* Right: Actions & Settings */}
        <div className="flex items-center gap-2">
          {/* Board Theme Switcher */}
          <button
            onClick={nextTheme}
            title={`Tahta Teması: ${themeLabel}`}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-amber-300 border border-slate-700/60 transition text-xs"
          >
            <Palette className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">{themeLabel}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          {/* Rules/Info Button */}
          <button
            onClick={onOpenRules}
            title="Kurallar & Kısayollar"
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-amber-300 border border-slate-700/60 transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* New Game / Reset */}
          <button
            onClick={onNewGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/40 transition text-xs sm:text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yeni Oyun</span>
          </button>
        </div>
      </div>
    </header>
  );
};

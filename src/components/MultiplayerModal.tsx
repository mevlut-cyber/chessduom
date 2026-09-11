import React, { useState } from 'react';
import { X, Copy, Check, Globe2, ArrowRight, UserCheck, Loader2 } from 'lucide-react';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  onCreateRoom: () => void;
  onJoinRoom: (id: string) => void;
  isConnected: boolean;
  playerRole: 'white' | 'black' | null;
  opponentConnected: boolean;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({
  isOpen,
  onClose,
  roomId,
  onCreateRoom,
  onJoinRoom,
  isConnected,
  playerRole,
  opponentConnected,
}) => {
  const [joinInput, setJoinInput] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyRoomCode = () => {
    if (!roomId) return;
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinInput.trim()) {
      onJoinRoom(joinInput.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-base sm:text-lg">
              Çevrimiçi Çok Oyunculu (Multiplayer)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/60">
          <span className="text-slate-400">Sunucu Bağlantı Durumu:</span>
          <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {isConnected ? 'Bağlandı' : 'Sunucuya Bağlanılıyor...'}
          </span>
        </div>

        {/* Current Active Room */}
        {roomId ? (
          <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Aktif Oda Kodu:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-300 text-base">
                  {roomId}
                </span>
                <button
                  onClick={copyRoomCode}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
                  title="Kodu Kopyala"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-1 pt-1 border-t border-slate-700/60">
              <div className="flex justify-between">
                <span>Senin Rolün:</span>
                <span className="font-bold text-amber-400">
                  {playerRole === 'white' ? 'Beyaz (1. Oyuncu)' : 'Siyah (2. Oyuncu)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Rakip Durumu:</span>
                {opponentConnected ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <UserCheck className="w-3.5 h-3.5" /> Rakip Bağlandı!
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" /> Rakip Bekleniyor...
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Create Room Button */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300">Yeni bir maç başlat:</span>
              <button
                onClick={onCreateRoom}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 transition"
              >
                <span>Yeni Oda Oluştur & Kodu Al</span>
              </button>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-slate-500 text-xs uppercase">veya</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* Join Room Form */}
            <form onSubmit={handleJoin} className="space-y-2">
              <span className="text-xs font-semibold text-slate-300">Mevcut bir odaya katıl:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Oda Kodunu Gir (Örn: CD-9284)"
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={!joinInput.trim()}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 rounded-xl font-semibold text-sm border border-amber-500/30 transition"
                >
                  <span>Katıl</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition"
          >
            Pencereyi Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

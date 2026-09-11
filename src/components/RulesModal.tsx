import React from 'react';
import { X, CheckCircle2, Bot, Zap, Shield } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ChessDuoM" className="h-7 w-auto" />
            <h3 className="font-bold text-slate-100 text-base sm:text-lg">
              ChessDuoM Rehberi & Kurallar
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs sm:text-sm text-slate-300">
          {/* Section 1: How to Move */}
          <div className="space-y-1.5 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
            <h4 className="font-bold text-amber-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Nasıl Hamle Yapılır?
            </h4>
            <p className="text-slate-300 leading-relaxed">
              İki yöntemle de oynayabilirsiniz:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>Taşı tutup gitmek istediğiniz kareye <strong>sürükleyip bırakabilirsiniz</strong>.</li>
              <li>Veya önce taşa <strong>tıklayıp</strong>, ardından beliren yasal hamle noktalarından birine tıklayabilirsiniz.</li>
            </ul>
          </div>

          {/* Section 2: Game Modes */}
          <div className="space-y-2 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
            <h4 className="font-bold text-amber-400 flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Oyun Modları
            </h4>
            <div className="space-y-2 text-slate-300">
              <div>
                <strong className="text-white">🤖 Bot ile Oyna (Tek Kişilik):</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  Farklı seviyelerdeki yapay zekaya karşı oynayın:
                  <br />• <strong>Acemi (Easy):</strong> Hatalar yapar, yeni başlayanlar için idealdir.
                  <br />• <strong>Usta (Medium):</strong> Taktiksel tuzakları kaçırmaz (Minimax d2).
                  <br />• <strong>Büyükusta (Hard):</strong> Derin pozisyonel analiz (Minimax d3 + Alpha-Beta).
                </p>
              </div>
              <div>
                <strong className="text-white">👥 İki Kişilik (Yerel / Pass & Play):</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  Aynı bilgisayar veya tableti paylaşarak arkadaşınızla canlı satranç oynayın.
                </p>
              </div>
              <div>
                <strong className="text-white">🌐 Çevrimiçi Oda (Multiplayer):</strong>
                <p className="text-slate-400 text-xs mt-0.5">
                  Oda kodu oluşturup linki arkadaşınızla paylaşarak gerçek zamanlı maç yapın.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Time Controls */}
          <div className="space-y-1.5 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
            <h4 className="font-bold text-amber-400 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Süre Kontrolleri (Saat)
            </h4>
            <p className="text-slate-400">
              1 dk (Bullet), 3 dk veya 5 dk (Blitz), 10 dk veya 15 dk (Rapid) ya da Sınırsız süre seçebilirsiniz. Sıra sizdeyken saatiniz geri sayar; süre biterse kaybedersiniz!
            </p>
          </div>

          {/* Section 4: Rules & Detection */}
          <div className="space-y-1.5 bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/50">
            <h4 className="font-bold text-amber-400 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Resmi Kurallar & Tespiti
            </h4>
            <p className="text-slate-400">
              FIDE kuralları tam olarak entegredir: Rok (Kısa & Uzun), Geçerken Alma (En Passant), Piyon Terfisi, Şah-Mat, Pat, 3 Tekrar Beraberliği ve 50 Hamle Kuralı otomatik denetlenir.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition"
          >
            Anladım, Oyuna Dön
          </button>
        </div>
      </div>
    </div>
  );
};

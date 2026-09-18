import React, { useState } from 'react';
import { X, Coins, Film, Sparkles, CheckCircle2, ShieldCheck, Zap, Star } from 'lucide-react';
import { CREDIT_PACKAGES } from '../data/characters';
import { UserProfile } from '../types';

interface CreditModalProps {
  isOpen: boolean;
  user: UserProfile | null;
  onClose: () => void;
  onAdRewarded: () => void;
  onPurchasePackage: (pkgId: string, amount: number) => void;
}

export const CreditModal: React.FC<CreditModalProps> = ({
  isOpen,
  user,
  onClose,
  onAdRewarded,
  onPurchasePackage,
}) => {
  if (!isOpen) return null;

  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adProgress, setAdProgress] = useState(0);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState('');

  const handleStartWatchAd = () => {
    setIsWatchingAd(true);
    setAdProgress(0);

    const interval = setInterval(() => {
      setAdProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsWatchingAd(false);
            onAdRewarded();
          }, 400);
          return 100;
        }
        return prev + 20; // 5 steps (approx 2.5 seconds simulation)
      });
    }, 500);
  };

  const handleBuy = (pkgId: string, amount: number) => {
    setSelectedPkg(pkgId);
    onPurchasePackage(pkgId, amount);
    setPurchaseSuccess(`Pacote ativado! +${amount} créditos adicionados à sua conta.`);
    setTimeout(() => {
      setPurchaseSuccess('');
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        id="credit-modal-container"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0f141f] border border-zinc-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-zinc-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Obter Créditos</h3>
              <p className="text-xs text-zinc-400">Continue conversando sem interrupções</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Seu Saldo Atual
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-3xl font-black text-white">{user?.credits ?? 20}</span>
              <span className="text-xs text-zinc-400 font-medium">mensagens disponíveis</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold inline-block">
              {user?.plan === 'premium' ? 'Plano VIP ✨' : 'Plano Gratuito'}
            </span>
            <p className="text-[10px] text-zinc-500 mt-1">20 msgs renovadas diariamente</p>
          </div>
        </div>

        {purchaseSuccess && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{purchaseSuccess}</span>
          </div>
        )}

        {/* Section: Rewarded Ad (Free messages) */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-rose-400" />
              <span>Ganhe Créditos Grátis</span>
            </h4>
            <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              100% Gratuito
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-b from-rose-950/20 to-purple-950/20 border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h5 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Assistir a um anúncio curto</span>
                <span className="text-xs text-emerald-400 font-semibold">+5 mensagens</span>
              </h5>
              <p className="text-xs text-zinc-400 mt-0.5">
                Vídeo de patrocinador rápido para recarregar sua cota instantaneamente.
              </p>
            </div>

            <button
              id="btn-watch-ad-modal"
              onClick={handleStartWatchAd}
              disabled={isWatchingAd}
              className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-rose-950/50 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <Film className="w-3.5 h-3.5" />
              <span>{isWatchingAd ? 'Assistindo...' : 'Assistir (+5 msgs)'}</span>
            </button>
          </div>

          {/* Ad Watching Screen Overlay */}
          {isWatchingAd && (
            <div className="mt-3 p-4 rounded-2xl bg-zinc-950 border border-rose-500/30 text-center animate-fade-in">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">
                Publicidade Recompensada
              </span>
              <p className="text-xs text-zinc-300 font-medium">
                Conheça os lançamentos da temporada anime na NekoStore 🐾
              </p>
              <div className="w-full h-2 bg-zinc-900 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${adProgress}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 block">
                Liberando suas 5 mensagens em instantes ({adProgress}%)...
              </span>
            </div>
          )}
        </div>

        {/* Section: Credit Packages */}
        <div className="mt-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Pacotes de Créditos & VIP</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CREDIT_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                  pkg.popular
                    ? 'bg-gradient-to-b from-rose-950/30 to-zinc-900 border-rose-500/50 ring-1 ring-rose-500/30 shadow-lg shadow-rose-950/20'
                    : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 right-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow">
                    Mais Popular
                  </span>
                )}

                <div>
                  <span className="text-xs font-bold text-zinc-200 block">{pkg.name}</span>
                  <div className="flex items-baseline space-x-1 my-1.5">
                    <span className="text-2xl font-black text-white">{pkg.credits}</span>
                    <span className="text-[11px] text-zinc-400">créditos</span>
                  </div>
                  <span className="text-[10px] text-rose-400 font-semibold block mb-2">
                    {pkg.bonus}
                  </span>
                </div>

                <div>
                  <div className="text-sm font-extrabold text-white mb-2">{pkg.priceBRL}</div>
                  <button
                    id={`btn-buy-${pkg.id}`}
                    onClick={() => handleBuy(pkg.id, pkg.credits)}
                    className={`w-full py-2 px-2 rounded-xl text-xs font-bold text-center transition-all active:scale-95 cursor-pointer ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-md'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                    }`}
                  >
                    Obter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security / VIP perks note */}
        <div className="mt-5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Estrutura pronta para checkout seguro. Personagens adultas 18+.</span>
          </div>
          <span className="text-[10px] text-zinc-500">SSL 256-bit</span>
        </div>
      </div>
    </div>
  );
};

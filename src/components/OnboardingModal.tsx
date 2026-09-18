import React from 'react';
import { Sparkles, MessageCircle, Heart, ArrowRight, ShieldCheck } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onStart: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onStart }) => {
  if (!isOpen) return null;

  return (
    <div
      id="onboarding-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#141a29] via-[#0d121d] to-[#070a10] border border-rose-500/30 p-6 text-center shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Icon / Brand badge */}
        <div className="relative mx-auto mb-5 w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 flex items-center justify-center shadow-xl shadow-rose-500/30 ring-4 ring-white/10">
          <span className="text-4xl select-none animate-bounce">🐾</span>
        </div>

        {/* Title and Subtitle requested verbatim in requirement 16 */}
        <div className="space-y-2 relative z-10 mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personagens Virtuais 18+</span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight">
            Bem-vindo ao NekoChat AI
          </h1>

          <p className="text-sm text-zinc-300 leading-relaxed max-w-xs mx-auto">
            Converse com personagens de IA, conheça suas histórias e crie suas próprias aventuras.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-2.5 mb-6 text-left relative z-10">
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <Heart className="w-4 h-4 text-rose-400 mb-1" />
            <span className="text-xs font-bold text-white block">Romance & Roleplay</span>
            <span className="text-[10px] text-zinc-400">Personalidades únicas</span>
          </div>
          <div className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <MessageCircle className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-xs font-bold text-white block">Memória Contínua</span>
            <span className="text-[10px] text-zinc-400">Contexto preservado</span>
          </div>
        </div>

        {/* Action Button: "Começar" */}
        <button
          id="onboarding-start-btn"
          onClick={onStart}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white text-sm font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95 flex items-center justify-center space-x-2 cursor-pointer relative z-10"
        >
          <span>Começar</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-center space-x-1.5 text-[11px] text-zinc-500 relative z-10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Personagens adultos fictícios (18+)</span>
        </div>
      </div>
    </div>
  );
};

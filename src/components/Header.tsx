import React from 'react';
import { Sparkles, PlusCircle, Coins, Heart, MessageSquare } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  onOpenCredits: () => void;
  onOpenCreator: () => void;
  onGoToFavorites: () => void;
  onGoToChats: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenCredits,
  onOpenCreator,
  onGoToFavorites,
  onGoToChats,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#0b0f17]/90 backdrop-blur-md border-b border-rose-500/20 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20 ring-1 ring-white/20">
            <span className="text-xl select-none">🐾</span>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0b0f17] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-white via-rose-100 to-pink-300 bg-clip-text text-transparent">
                NekoChat
              </h1>
              <span className="text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-rose-500/30 to-purple-500/30 text-rose-300 border border-rose-500/40">
                AI
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 -mt-0.5 flex items-center gap-1 font-medium">
              <span>Personagens Virtuais 18+</span>
              <span className="w-1 h-1 rounded-full bg-zinc-600 inline-block"></span>
              <span className="text-rose-400/90 font-semibold">Anime Roleplay</span>
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Create Character Button */}
          <button
            id="header-create-character-btn"
            onClick={onOpenCreator}
            className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-700/60 transition-all active:scale-95 cursor-pointer"
            title="Criar novo personagem"
          >
            <PlusCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Criar</span>
          </button>

          {/* Credits Pill */}
          <button
            id="header-credits-pill-btn"
            onClick={onOpenCredits}
            className="flex items-center space-x-1.5 text-xs font-medium px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-950/60 to-purple-950/60 hover:from-rose-900/70 hover:to-purple-900/70 text-rose-200 border border-rose-500/30 transition-all shadow-sm shadow-rose-950/50 active:scale-95 cursor-pointer"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span className="font-bold text-white">{user?.credits ?? 20}</span>
            <span className="text-[10px] text-rose-300/80 hidden xs:inline">msgs</span>
            <span className="w-4 h-4 rounded-full bg-rose-500/30 text-rose-200 flex items-center justify-center text-[10px] font-black ml-0.5">
              +
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

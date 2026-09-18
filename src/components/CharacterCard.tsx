import React from 'react';
import { Star, MessageSquare, ShieldCheck } from 'lucide-react';
import { Character } from '../types';

interface CharacterCardProps {
  character: Character;
  affinityScore?: number;
  isFavorite?: boolean;
  onOpenChat: (character: Character) => void;
  onOpenProfile: (character: Character) => void;
  onToggleFavorite?: (characterId: string) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isFavorite = false,
  onOpenChat,
  onOpenProfile,
  onToggleFavorite,
}) => {
  const age = character.age || character.adultAge || 20;

  return (
    <div
      id={`character-card-${character.id}`}
      onClick={() => onOpenProfile(character)}
      className="group relative flex flex-col bg-gradient-to-b from-[#131926] to-[#0c1018] border border-zinc-800/80 hover:border-rose-500/50 rounded-3xl overflow-hidden shadow-lg hover:shadow-rose-950/30 transition-all duration-300 cursor-pointer active:scale-[0.99]"
    >
      {/* 2D Anime Avatar Area */}
      <div className="relative w-full aspect-square overflow-hidden bg-zinc-950">
        <img
          src={character.avatar}
          alt={character.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c1018] via-transparent to-black/30" />

        {/* Favorite Button ⭐ */}
        {onToggleFavorite && (
          <button
            id={`btn-fav-${character.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(character.id);
            }}
            className="absolute top-3 right-3 p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-black/80 transition-all active:scale-90 cursor-pointer z-10"
            title="Favoritar personagem ⭐"
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                isFavorite
                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : 'text-zinc-300 hover:text-amber-300'
              }`}
            />
          </button>
        )}

        {/* Age & 18+ Adult Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap z-10">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-zinc-100 border border-white/15 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{age} anos</span>
          </span>
        </div>

        {/* Online / Ready Indicator */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-300">Pronta para conversar</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
        <div>
          {/* Name & Age */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <h3 className="text-lg font-black text-white tracking-tight group-hover:text-rose-300 transition-colors flex items-center gap-1.5">
              <span>{character.name}</span>
              <span className="text-xs font-normal text-zinc-400">({age} anos)</span>
            </h3>
          </div>

          {/* Short Description */}
          <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed mb-2.5">
            {character.description}
          </p>

          {/* Personality Summarized */}
          <div className="flex flex-wrap gap-1">
            {character.personality.slice(0, 3).map((trait, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-800/90 text-zinc-300 border border-zinc-700/60 font-medium"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>

        {/* Button "Conversar" */}
        <div className="pt-2 border-t border-zinc-800/80">
          <button
            id={`btn-start-chat-${character.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenChat(character);
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold text-center flex items-center justify-center space-x-2 shadow-lg shadow-rose-950/40 transition-all active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Conversar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

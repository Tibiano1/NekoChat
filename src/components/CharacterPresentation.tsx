import React from 'react';
import { ArrowLeft, Star, MessageSquare, ShieldCheck, Sparkles, Heart, Compass } from 'lucide-react';
import { Character } from '../types';

interface CharacterPresentationProps {
  character: Character;
  isFavorite: boolean;
  onBackToCatalog: () => void;
  onStartChat: (character: Character) => void;
  onToggleFavorite: (characterId: string) => void;
}

export const CharacterPresentation: React.FC<CharacterPresentationProps> = ({
  character,
  isFavorite,
  onBackToCatalog,
  onStartChat,
  onToggleFavorite,
}) => {
  const age = character.age || character.adultAge || 20;
  const style = character.speakingStyle || character.speechStyle || 'Autêntica e expressiva';

  return (
    <div
      id={`character-presentation-${character.id}`}
      className="pb-28 max-w-xl mx-auto px-4 pt-2 space-y-5 animate-fade-in text-zinc-100"
    >
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between py-2">
        <button
          id="btn-back-to-catalog"
          onClick={onBackToCatalog}
          className="p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 flex items-center space-x-1.5 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao catálogo</span>
        </button>

        <button
          id="btn-fav-presentation"
          onClick={() => onToggleFavorite(character.id)}
          className="p-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 flex items-center space-x-1.5 text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          title="Favoritar personagem"
        >
          <Star
            className={`w-4 h-4 ${
              isFavorite
                ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                : 'text-zinc-400'
            }`}
          />
          <span className="text-xs">{isFavorite ? 'Favorita' : 'Favoritar'}</span>
        </button>
      </div>

      {/* Large 2D Anime Avatar Section */}
      <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-800/80 shadow-2xl">
        <img
          src={character.avatar}
          alt={character.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top filter brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-transparent to-black/20" />

        {/* Floating Badges */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-md">
                Anime 2D
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{age} anos (Adulta)</span>
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
              {character.name}
            </h1>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-emerald-300 text-xs font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online</span>
          </div>
        </div>
      </div>

      {/* Description Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#131926] to-[#0c1018] border border-zinc-800/90 shadow-lg space-y-2">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Sobre {character.name}
        </h3>
        <p className="text-sm text-zinc-200 leading-relaxed font-normal">
          {character.description}
        </p>
      </div>

      {/* Personality Section */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-md space-y-2.5">
        <div className="flex items-center space-x-2 text-rose-400">
          <Sparkles className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Personalidade
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {character.personality.map((trait, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-xl bg-zinc-800/90 text-zinc-200 text-xs font-medium border border-zinc-700/60"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Interests Section */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-md space-y-2.5">
        <div className="flex items-center space-x-2 text-purple-400">
          <Heart className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Interesses
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {character.interests.map((interest, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-xl bg-purple-950/30 text-purple-200 text-xs font-medium border border-purple-800/40"
            >
              • {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Conversation Style Section */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/70 border border-zinc-800/80 shadow-md space-y-2">
        <div className="flex items-center space-x-2 text-pink-400">
          <MessageSquare className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Estilo de Conversa
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {style}
        </p>
      </div>

      {/* Initial Greeting Preview */}
      <div className="p-4 rounded-3xl bg-zinc-950/60 border border-zinc-800/80 space-y-1.5">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
          Saudação inicial:
        </span>
        <p className="text-xs sm:text-sm text-rose-200/90 italic leading-relaxed">
          "{character.greeting}"
        </p>
      </div>

      {/* Primary Action Button: "Começar conversa" */}
      <div className="pt-2 sticky bottom-20 z-20">
        <button
          id="btn-start-chat-presentation"
          onClick={() => onStartChat(character)}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-black text-sm sm:text-base flex items-center justify-center space-x-2.5 shadow-2xl shadow-rose-950/80 transition-all active:scale-98 cursor-pointer ring-2 ring-rose-500/20"
        >
          <MessageSquare className="w-5 h-5" />
          <span>Começar conversa</span>
        </button>
      </div>
    </div>
  );
};

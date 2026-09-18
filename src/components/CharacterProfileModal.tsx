import React from 'react';
import { X, Heart, MessageSquare, Brain, Sparkles, BookOpen, ShieldCheck, Compass } from 'lucide-react';
import { Character, getAffinityTier } from '../types';

interface CharacterProfileModalProps {
  character: Character | null;
  affinityScore?: number;
  isFavorite?: boolean;
  onClose: () => void;
  onStartChat: (character: Character) => void;
  onOpenMemory?: (character: Character) => void;
  onToggleFavorite?: (characterId: string) => void;
}

export const CharacterProfileModal: React.FC<CharacterProfileModalProps> = ({
  character,
  affinityScore = 42,
  isFavorite = false,
  onClose,
  onStartChat,
  onOpenMemory,
  onToggleFavorite,
}) => {
  if (!character) return null;

  const tier = getAffinityTier(affinityScore);

  const getTierDescription = (t: string) => {
    switch (t) {
      case 'Estranhos':
        return 'Vocês ainda estão se conhecendo. Conversas frequentes quebram o gelo.';
      case 'Conhecidos':
        return 'Ela já reconhece seu nome e lembra de detalhes das suas primeiras conversas.';
      case 'Amigos':
        return 'Vocês compartilham risadas, segredos e gostam de passar o tempo juntos.';
      case 'Próximos':
        return 'Grande cumplicidade emocional, carinho mútuo e conversas sinceras.';
      case 'Melhor conexão':
        return 'Vínculo supremo e afeto incondicional! Ela prioriza você em tudo.';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        id="character-profile-modal-container"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0f141f] border border-zinc-800 rounded-3xl shadow-2xl flex flex-col text-zinc-200"
      >
        {/* Cover / Header image */}
        <div className="relative w-full h-48 sm:h-56 bg-zinc-950 overflow-hidden shrink-0">
          <img
            src={character.coverImage || character.avatar}
            alt={character.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f141f] via-black/40 to-transparent" />

          {/* Close Button */}
          <button
            id="btn-close-profile-modal"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-all active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating Favorite Button */}
          {onToggleFavorite && (
            <button
              id="btn-profile-toggle-fav"
              onClick={() => onToggleFavorite(character.id)}
              className="absolute top-3 left-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/10 transition-all active:scale-95 cursor-pointer"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite ? 'fill-rose-500 text-rose-500' : 'text-zinc-300 hover:text-rose-400'
                }`}
              />
            </button>
          )}

          {/* Avatar floating overlapping */}
          <div className="absolute -bottom-8 left-6 flex items-end space-x-4">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-[#0f141f] shadow-2xl bg-zinc-900 shrink-0">
              <img
                src={character.avatar}
                alt={character.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
              <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#0f141f]" />
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="pt-10 px-6 pb-6 flex flex-col space-y-5">
          {/* Name & Basic Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl font-black text-white tracking-tight">{character.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {character.category}
                </span>
              </div>
              <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{character.adultAge} anos • Personagem Fictícia Adulta</span>
              </p>
            </div>

            {/* Conversation count badge */}
            <div className="text-xs font-medium text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800 self-start sm:self-auto">
              💬 {((character.conversationCount || 1000) / 1000).toFixed(1)}k conversas ativas
            </div>
          </div>

          {/* Description */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-sm text-zinc-300 italic leading-relaxed">
            "{character.description}"
          </div>

          {/* Affinity / Relationship Level Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/30 via-purple-950/30 to-zinc-900/50 border border-rose-500/20 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg">❤️</span>
                <span className="text-sm font-bold text-white">Nível de Afinidade</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {tier}
                </span>
              </div>
              <span className="text-sm font-extrabold text-rose-400">{affinityScore}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${affinityScore}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 leading-normal">
              {getTierDescription(tier)}
            </p>
          </div>

          {/* Personality Traits */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Personalidade</span>
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {character.personality.map((trait, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-700/60"
                >
                  #{trait}
                </span>
              ))}
            </div>
          </div>

          {/* Speech Style & Backstory */}
          <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
            <div>
              <span className="font-bold text-zinc-200">Estilo de conversa: </span>
              <span className="text-zinc-400">{character.speechStyle}</span>
            </div>
            <div>
              <span className="font-bold text-zinc-200">História: </span>
              <span className="text-zinc-400">{character.backstory}</span>
            </div>
            <div>
              <span className="font-bold text-zinc-200">Interesses: </span>
              <span className="text-zinc-400">{character.interests.join(' • ')}</span>
            </div>
          </div>

          {/* First Greeting Preview */}
          <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800 text-xs">
            <span className="text-zinc-500 uppercase font-bold text-[10px] block mb-1">
              Saudação inicial de {character.name}:
            </span>
            <p className="text-zinc-300 italic">"{character.greeting}"</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {onOpenMemory && (
              <button
                id="btn-profile-inspect-memory"
                onClick={() => {
                  onClose();
                  onOpenMemory(character);
                }}
                className="py-3 px-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center space-x-1.5 border border-zinc-700 transition-all active:scale-95 cursor-pointer"
                title="Ver o que a IA lembra sobre você"
              >
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="hidden sm:inline">Memória</span>
              </button>
            )}

            <button
              id="btn-profile-modal-start-chat"
              onClick={() => {
                onClose();
                onStartChat(character);
              }}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-rose-950/60 transition-all active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Conversar com {character.name}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

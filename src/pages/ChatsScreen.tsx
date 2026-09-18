import React from 'react';
import { MessageSquare, Heart, Sparkles, Clock, Trash2, ShieldCheck } from 'lucide-react';
import { Conversation, Character, getAffinityTier } from '../types';

interface ChatsScreenProps {
  conversations: (Conversation & { character?: Character })[];
  onOpenChat: (character: Character) => void;
  onOpenProfile: (character: Character) => void;
  onExplore: () => void;
}

export const ChatsScreen: React.FC<ChatsScreenProps> = ({
  conversations,
  onOpenChat,
  onOpenProfile,
  onExplore,
}) => {
  return (
    <div id="chats-screen" className="pb-24 max-w-2xl mx-auto px-4 pt-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Conversas</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Seus bate-papos recentes e memórias ativas</p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
          {conversations.length} ativas
        </span>
      </div>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <div className="py-20 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800/80 p-6">
          <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-300">Nenhuma conversa iniciada ainda</p>
          <p className="text-xs text-zinc-500 mt-1">
            Escolha uma personagem na tela inicial e comece um bate-papo agora mesmo!
          </p>
          <button
            onClick={onExplore}
            className="mt-4 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold shadow-md cursor-pointer"
          >
            Explorar Personagens
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {conversations.map((conv) => {
            const char = conv.character;
            if (!char) return null;

            const tier = getAffinityTier(conv.affinityScore);

            return (
              <div
                key={conv.id}
                onClick={() => onOpenChat(char)}
                className="group p-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800/80 hover:border-rose-500/40 flex items-center justify-between gap-3.5 transition-all cursor-pointer shadow-md"
              >
                {/* Avatar with status */}
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 ring-1 ring-white/10 group-hover:ring-rose-500/40 transition-all">
                  <img
                    src={char.avatar}
                    alt={char.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-zinc-900" />
                </div>

                {/* Main conversation detail */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors truncate">
                        {char.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-400 font-medium shrink-0">
                        {char.adultAge}a
                      </span>
                      {conv.isFavorite && (
                        <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
                      )}
                    </div>

                    <span className="text-[10px] text-zinc-500 shrink-0">
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Last message preview */}
                  <p className="text-xs text-zinc-400 truncate leading-relaxed">
                    {conv.lastMessage || char.greeting}
                  </p>

                  {/* Affinity Bar row */}
                  <div className="mt-2 flex items-center space-x-2 text-[10px] text-zinc-500">
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      ❤️ {conv.affinityScore}%
                    </span>
                    <span>•</span>
                    <span className="text-zinc-400">{tier}</span>
                    <span>•</span>
                    <span className="capitalize text-zinc-400 font-medium">Modo {conv.mode}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

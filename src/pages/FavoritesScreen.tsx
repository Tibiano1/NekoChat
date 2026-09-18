import React from 'react';
import { Star, LayoutGrid } from 'lucide-react';
import { Character, UserProfile } from '../types';
import { CharacterCard } from '../components/CharacterCard';

interface FavoritesScreenProps {
  characters: Character[];
  user: UserProfile | null;
  onOpenChat: (character: Character) => void;
  onOpenProfile: (character: Character) => void;
  onToggleFavorite: (characterId: string) => void;
  onGoToCatalog: () => void;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  characters,
  user,
  onOpenChat,
  onOpenProfile,
  onToggleFavorite,
  onGoToCatalog,
}) => {
  const favoriteCharacters = characters.filter((c) =>
    user?.favorites.includes(c.id)
  );

  return (
    <div id="favorites-screen" className="pb-24 max-w-5xl mx-auto px-4 pt-4 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Star className="w-4 h-4 fill-amber-400" />
          <span>Suas Preferências</span>
        </div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Personagens Favoritas
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            {favoriteCharacters.length}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400">
          Acesso rápido às personagens que você marcou com estrela ⭐ no catálogo.
        </p>
      </div>

      {favoriteCharacters.length === 0 ? (
        <div className="py-20 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800/80 p-6">
          <Star className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-zinc-200">
            Você ainda não favoritou nenhuma personagem
          </h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Toque no ícone de estrela ⭐ nos cards do catálogo para salvar suas personagens favoritas aqui.
          </p>
          <button
            onClick={onGoToCatalog}
            className="mt-5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-bold shadow-md cursor-pointer flex items-center space-x-2 mx-auto active:scale-95 transition-all"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Ir para o Catálogo</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favoriteCharacters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              isFavorite={true}
              onOpenChat={onOpenChat}
              onOpenProfile={onOpenProfile}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

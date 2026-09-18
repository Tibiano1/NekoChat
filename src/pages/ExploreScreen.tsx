import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles } from 'lucide-react';
import { Character, UserProfile } from '../types';
import { CATEGORIES } from '../data/characters';
import { CharacterCard } from '../components/CharacterCard';

interface ExploreScreenProps {
  characters: Character[];
  user: UserProfile | null;
  onOpenChat: (character: Character) => void;
  onOpenProfile: (character: Character) => void;
  onToggleFavorite: (characterId: string) => void;
  onOpenCreator: () => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  characters,
  user,
  onOpenChat,
  onOpenProfile,
  onToggleFavorite,
  onOpenCreator,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'name'>('popular');

  const filteredCharacters = useMemo(() => {
    return characters
      .filter((c) => {
        const matchesCategory =
          selectedCategory === 'Todos' || (c.category || '').toLowerCase() === selectedCategory.toLowerCase();

        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.personality.some((p) => p.toLowerCase().includes(q)) ||
          c.description.toLowerCase().includes(q) ||
          c.interests.some((i) => i.toLowerCase().includes(q));

        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return (b.conversationCount || 0) - (a.conversationCount || 0);
        return a.name.localeCompare(b.name);
      });
  }, [characters, selectedCategory, searchQuery, sortBy]);

  return (
    <div id="explore-screen" className="pb-24 max-w-4xl mx-auto px-4 pt-3 space-y-5">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Explorar Personagens</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
            {characters.length} disponíveis
          </span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Filtre por estética, gênero e traços de personalidade
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          id="explore-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar por nome, traço (ex: extrovertida, tímida, gamer)..."
          className="w-full py-2.5 pl-10 pr-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-rose-500/50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-950/40 scale-102'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Count & Sort */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
        <span>Exibindo {filteredCharacters.length} personagens</span>
        <div className="flex items-center space-x-1.5">
          <span>Ordenar:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-zinc-300 focus:outline-none cursor-pointer"
          >
            <option value="popular">Mais Populares</option>
            <option value="name">Nome (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Characters Grid */}
      {filteredCharacters.length === 0 ? (
        <div className="py-16 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800/80 p-6">
          <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-zinc-300">Nenhum personagem com esses filtros</p>
          <p className="text-xs text-zinc-500 mt-1">
            Tente remover os filtros ou crie sua própria personagem personalizada!
          </p>
          <button
            onClick={onOpenCreator}
            className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md cursor-pointer"
          >
            + Criar Personagem
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredCharacters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              isFavorite={user?.favorites.includes(char.id)}
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

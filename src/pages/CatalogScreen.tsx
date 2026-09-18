import React, { useState } from 'react';
import { Search, Sparkles, Star, ShieldCheck } from 'lucide-react';
import { Character, UserProfile } from '../types';
import { CharacterCard } from '../components/CharacterCard';

interface CatalogScreenProps {
  characters: Character[];
  user: UserProfile | null;
  onOpenChat: (character: Character) => void;
  onOpenProfile: (character: Character) => void;
  onToggleFavorite: (characterId: string) => void;
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({
  characters,
  user,
  onOpenChat,
  onOpenProfile,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('todos');

  // Filter characters by search query and category/tags
  const filteredCharacters = characters.filter((char) => {
    const matchesSearch =
      !searchQuery.trim() ||
      char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      char.personality.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (char.tags && char.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      char.interests.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedTag === 'todos') return true;
    if (selectedTag === 'favoritas') return user?.favorites.includes(char.id);

    // Tag matching
    return (
      char.personality.some((p) => p.toLowerCase().includes(selectedTag.toLowerCase())) ||
      (char.tags && char.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase()))) ||
      (char.category || '').toLowerCase().includes(selectedTag.toLowerCase())
    );
  });

  const filterTags = [
    { id: 'todos', label: 'Todas as Personagens' },
    { id: 'favoritas', label: '⭐ Favoritas' },
    { id: 'romance', label: 'Romance' },
    { id: 'misteriosa', label: 'Misteriosa' },
    { id: 'timida', label: 'Tímida' },
    { id: 'alegre', label: 'Alegre' },
    { id: 'gamer', label: 'Gamer' },
  ];

  return (
    <div id="catalog-screen" className="pb-24 max-w-5xl mx-auto px-4 pt-4 space-y-6 animate-fade-in">
      {/* Title & Introduction */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Catálogo Oficial NekoChat AI</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Escolha sua personagem
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Explore as personagens virtuais 2D, conheça suas histórias e inicie conversas personalizadas com inteligência artificial.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          id="catalog-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar por nome, personalidade ou interesses (ex: Sakurae, tímida, gamer)..."
          className="w-full py-3 pl-10 pr-10 rounded-2xl bg-[#0f1420] border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-rose-500/50 shadow-inner"
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

      {/* Quick Category Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {filterTags.map((tag) => {
          const isSelected = selectedTag === tag.id;
          return (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(tag.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40 ring-1 ring-rose-400/40'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {tag.label}
            </button>
          );
        })}
      </div>

      {/* Responsive Character 2D Cards Grid */}
      {filteredCharacters.length === 0 ? (
        <div className="py-20 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800/80 p-6">
          <Sparkles className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-zinc-200">Nenhuma personagem encontrada</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
            Não encontramos personagens para "{searchQuery}". Tente outros termos de busca.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag('todos');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 font-semibold cursor-pointer"
          >
            Ver todas as personagens
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCharacters.map((char) => (
            <CharacterCard
              key={char.id}
              character={char}
              isFavorite={user?.favorites.includes(char.id) || false}
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

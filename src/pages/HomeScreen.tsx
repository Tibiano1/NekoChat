import React, { useState } from 'react';
import { Search, Compass, Sparkles, Flame, Plus, Heart, Film, ArrowRight, ShieldCheck } from 'lucide-react';
import { Character, UserProfile } from '../types';
import { CharacterCard } from '../components/CharacterCard';
import { AdBanner } from '../components/AdBanner';

interface HomeScreenProps {
  characters: Character[];
  user: UserProfile | null;
  onOpenChat: (character: Character) => void;
  onOpenProfile: (character: Character) => void;
  onToggleFavorite: (characterId: string) => void;
  onOpenCreator: () => void;
  onOpenExplore: () => void;
  onOpenCredits: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  characters,
  user,
  onOpenChat,
  onOpenProfile,
  onToggleFavorite,
  onOpenCreator,
  onOpenExplore,
  onOpenCredits,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered list if search query typed
  const filtered = searchQuery.trim()
    ? characters.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.personality.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase())) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  // Sections
  const popularCharacters = [...characters].sort((a, b) => (b.conversationCount || 0) - (a.conversationCount || 0));
  const newCharacters = [...characters].reverse();
  const romanceCharacters = characters.filter((c) => (c.category || '') === 'Romance');
  const adventureCharacters = characters.filter((c) => (c.category || '') === 'Aventura');
  const fantasyCharacters = characters.filter((c) => (c.category || '') === 'Fantasia');
  const animeCharacters = characters.filter((c) => (c.category || '') === 'Anime' || (c.category || '') === 'Gamer');
  const myCustomCharacters = characters.filter((c) => c.isCustom);

  return (
    <div id="home-screen" className="pb-24 max-w-4xl mx-auto px-4 pt-3 space-y-6">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          id="home-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar por nome ou personalidade (ex: Yumi, romântica, gamer)..."
          className="w-full py-2.5 pl-10 pr-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-zinc-200 placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-rose-500/50 shadow-sm"
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

      {/* If Search Active */}
      {filtered !== null ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Resultados para "{searchQuery}"</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                {filtered.length} encontrados
              </span>
            </h2>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800/80 p-6">
              <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-300">Nenhum personagem encontrado</p>
              <p className="text-xs text-zinc-500 mt-1">
                Tente outros termos ou crie você mesmo a sua personagem ideal!
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
              {filtered.map((char) => (
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
      ) : (
        <>
          {/* Hero Discovery Banner */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-950/70 via-purple-950/60 to-zinc-900 border border-rose-500/30 p-5 sm:p-6 shadow-xl">
            <div className="relative z-10 max-w-md space-y-2.5">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Conversas & Roleplay com IA Anime</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                Conecte-se com garotas de anime que lembram de tudo sobre você.
              </h2>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Entretenimento, amizade, romance e histórias interativas com personalidades vivas e memória persistente.
              </p>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  id="home-explore-btn"
                  onClick={onOpenExplore}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-rose-950/60 transition-all active:scale-95 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explorar personagens</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  id="home-create-btn"
                  onClick={onOpenCreator}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs border border-zinc-700 transition-all active:scale-95 cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-rose-400" />
                  <span>Criar Personagem</span>
                </button>
              </div>
            </div>

            {/* Subtle anime decorative watermark */}
            <div className="absolute -right-8 -bottom-10 opacity-20 pointer-events-none text-8xl select-none">
              🐾
            </div>
          </div>

          {/* Section: Meus Personagens (Custom or favorites) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">⭐</span>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                  Meus Personagens
                </h3>
              </div>
              <button
                onClick={onOpenCreator}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Criar novo</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {myCustomCharacters.length === 0 ? (
                <div
                  onClick={onOpenCreator}
                  className="col-span-full p-4 rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 hover:border-rose-500/50 flex items-center justify-center space-x-3 cursor-pointer group transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Criar sua primeira personagem de IA
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Defina aparência, história, fala e traços exclusivos
                    </span>
                  </div>
                </div>
              ) : (
                myCustomCharacters.map((char) => (
                  <CharacterCard
                    key={char.id}
                    character={char}
                    isFavorite={user?.favorites.includes(char.id)}
                    onOpenChat={onOpenChat}
                    onOpenProfile={onOpenProfile}
                    onToggleFavorite={onToggleFavorite}
                  />
                ))
              )}
            </div>
          </section>

          {/* Section: Populares */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                  Populares
                </h3>
              </div>
              <button
                onClick={onOpenExplore}
                className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Ver todas
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {popularCharacters.slice(0, 3).map((char) => (
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
          </section>

          {/* Section: Novos Personagens */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                  Novos Personagens
                </h3>
              </div>
              <button
                onClick={onOpenExplore}
                className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Ver todas
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {newCharacters.slice(0, 3).map((char) => (
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
          </section>

          {/* Ad Space Banner */}
          <AdBanner onWatchRewardedAd={onOpenCredits} variant="card" />

          {/* Section: Romance */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">💖</span>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                  Romance & Conexão
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {romanceCharacters.map((char) => (
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
          </section>

          {/* Section: Aventura */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">⚔️</span>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                  Aventura & Exploração
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {adventureCharacters.map((char) => (
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
          </section>

          {/* Section: Fantasia */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">🌌</span>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                  Fantasia & Mistério
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {fantasyCharacters.map((char) => (
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
          </section>

          {/* Section: Anime & Gamer */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">🌸</span>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                  Anime & Gamer
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {animeCharacters.map((char) => (
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
          </section>
        </>
      )}
    </div>
  );
};

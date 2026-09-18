/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Character, Conversation, UserProfile, getAffinityTier } from './types';
import {
  fetchCharacters,
  fetchConversations,
  fetchUserProfile,
  updateUserProfile,
  toggleCharacterFavorite,
  claimDailyBonus,
  purchaseCredits,
} from './services/api';

import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { CatalogScreen } from './pages/CatalogScreen';
import { FavoritesScreen } from './pages/FavoritesScreen';
import { SettingsScreen } from './pages/SettingsScreen';

import { CharacterPresentation } from './components/CharacterPresentation';
import { ChatView } from './components/ChatView';
import { CharacterProfileModal } from './components/CharacterProfileModal';
import { CharacterCreatorModal } from './components/CharacterCreatorModal';
import { CreditModal } from './components/CreditModal';
import { MemoryModal } from './components/MemoryModal';
import { OnboardingModal } from './components/OnboardingModal';

export default function App() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Navigation & Flows
  const [activeTab, setActiveTab] = useState<TabType>('catalog');
  const [activePresentationCharacter, setActivePresentationCharacter] = useState<Character | null>(null);
  const [activeChatCharacter, setActiveChatCharacter] = useState<Character | null>(null);
  const [activeProfileCharacter, setActiveProfileCharacter] = useState<Character | null>(null);
  const [activeMemoryCharacter, setActiveMemoryCharacter] = useState<Character | null>(null);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !localStorage.getItem('nekochat_onboarding_completed');
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCompleteOnboarding = () => {
    localStorage.setItem('nekochat_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [charsData, convsData, userData] = await Promise.all([
          fetchCharacters(),
          fetchConversations(),
          fetchUserProfile(),
        ]);
        setCharacters(charsData);
        setConversations(convsData);
        setUser(userData);
      } catch (err) {
        console.error('Failed to load initial NekoChat AI data:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Favorite toggle handler
  const handleToggleFavorite = async (charId: string) => {
    try {
      const res = await toggleCharacterFavorite(charId);
      setUser((prev) => (prev ? { ...prev, favorites: res.favorites } : null));
      setConversations((prev) =>
        prev.map((c) => (c.characterId === charId ? { ...c, isFavorite: res.isFavorite } : c))
      );
      showToast(res.isFavorite ? 'Adicionada aos favoritos ⭐' : 'Removida dos favoritos');
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  // Open presentation page for character (on card touch)
  const handleOpenPresentation = (char: Character) => {
    setActivePresentationCharacter(char);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open chat with character (on "Começar conversa" or direct "Conversar")
  const handleOpenChat = (char: Character) => {
    setActiveChatCharacter(char);

    // Find or create existing conversation in state
    const existing = conversations.find((c) => c.characterId === char.id);
    if (!existing) {
      const newConv: Conversation = {
        id: `conv_${char.id}`,
        userId: user?.id || 'usr_demo',
        characterId: char.id,
        affinityScore: 42,
        affinityTier: getAffinityTier(42),
        mode: 'normal',
        isFavorite: user?.favorites.includes(char.id) || false,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        lastMessage: char.greeting,
      };
      setConversations((prev) => [newConv, ...prev]);
    }
  };

  // Rewarded ad handler
  const handleAdRewarded = async () => {
    try {
      const res = await claimDailyBonus();
      setUser((prev) => (prev ? { ...prev, credits: res.credits } : null));
      showToast('🎉 Parabéns! +5 mensagens adicionadas à sua conta!');
    } catch (err) {
      console.error('Failed to claim ad reward', err);
    }
  };

  // Purchase package handler
  const handlePurchasePackage = async (pkgId: string, amount: number) => {
    try {
      const res = await purchaseCredits(pkgId, amount);
      setUser((prev) =>
        prev ? { ...prev, credits: res.credits, plan: res.plan as any } : null
      );
      showToast(`✨ Pacote ativado com sucesso! +${amount} créditos`);
    } catch (err) {
      console.error('Failed to purchase package', err);
    }
  };

  // Character created callback
  const handleCharacterCreated = (newChar: Character) => {
    setCharacters((prev) => [newChar, ...prev]);
    showToast(`✨ ${newChar.name} foi criada com sucesso!`);
    handleOpenChat(newChar);
  };

  // Update user name
  const handleUpdateUserName = async (newName: string) => {
    try {
      const updated = await updateUserProfile({ name: newName });
      setUser(updated);
      showToast('Nome atualizado com sucesso!');
    } catch (err) {
      console.error('Failed to update name', err);
    }
  };

  // Find current active conversation for ChatView
  const currentConversation = activeChatCharacter
    ? conversations.find((c) => c.characterId === activeChatCharacter.id) || {
        id: `conv_${activeChatCharacter.id}`,
        userId: user?.id || 'usr_demo',
        characterId: activeChatCharacter.id,
        affinityScore: 42,
        affinityTier: getAffinityTier(42),
        mode: 'normal' as const,
        isFavorite: user?.favorites.includes(activeChatCharacter.id) || false,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        lastMessage: activeChatCharacter.greeting,
      }
    : null;

  return (
    <div className="min-h-screen bg-[#070a10] text-zinc-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-zinc-900/95 border border-rose-500/40 text-white text-xs font-semibold shadow-2xl backdrop-blur-md animate-fade-in flex items-center space-x-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header
        user={user}
        onOpenCredits={() => setIsCreditsOpen(true)}
        onOpenCreator={() => setIsCreatorOpen(true)}
        onGoToFavorites={() => {
          setActivePresentationCharacter(null);
          setActiveTab('favorites');
        }}
        onGoToChats={() => {
          setActivePresentationCharacter(null);
          setActiveTab('catalog');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-xl animate-pulse">
              🐾
            </div>
            <p className="text-sm font-bold text-zinc-300">Carregando NekoChat AI...</p>
            <p className="text-xs text-zinc-500">Preparando suas personagens originais 2D</p>
          </div>
        ) : activePresentationCharacter ? (
          /* Presentation View: CATÁLOGO -> PERSONAGEM -> COMEÇAR CONVERSA */
          <CharacterPresentation
            character={activePresentationCharacter}
            isFavorite={user?.favorites.includes(activePresentationCharacter.id) || false}
            onBackToCatalog={() => setActivePresentationCharacter(null)}
            onStartChat={(char) => {
              setActivePresentationCharacter(null);
              handleOpenChat(char);
            }}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          /* Main Tab Views: CATÁLOGO, FAVORITOS, CONFIGURAÇÕES */
          <>
            {activeTab === 'catalog' && (
              <CatalogScreen
                characters={characters}
                user={user}
                onOpenChat={handleOpenChat}
                onOpenProfile={handleOpenPresentation}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {activeTab === 'favorites' && (
              <FavoritesScreen
                characters={characters}
                user={user}
                onOpenChat={handleOpenChat}
                onOpenProfile={handleOpenPresentation}
                onToggleFavorite={handleToggleFavorite}
                onGoToCatalog={() => setActiveTab('catalog')}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsScreen
                user={user}
                onUpdateUserName={handleUpdateUserName}
                onOpenCredits={() => setIsCreditsOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation: CATÁLOGO | FAVORITOS | CONFIGURAÇÕES */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActivePresentationCharacter(null);
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={user?.favorites.length || 0}
      />

      {/* Active Fullscreen Chat View */}
      {activeChatCharacter && currentConversation && (
        <ChatView
          character={activeChatCharacter}
          conversation={currentConversation}
          credits={user?.credits ?? 20}
          isFavorite={user?.favorites.includes(activeChatCharacter.id) || false}
          onBack={() => {
            setActiveChatCharacter(null);
            // returns to catalog without losing conversation
          }}
          onOpenProfile={() => setActiveProfileCharacter(activeChatCharacter)}
          onOpenMemory={() => setActiveMemoryCharacter(activeChatCharacter)}
          onOpenCredits={() => setIsCreditsOpen(true)}
          onToggleFavorite={handleToggleFavorite}
          onCreditsUpdated={(newCredits) =>
            setUser((prev) => (prev ? { ...prev, credits: newCredits } : null))
          }
          onAffinityUpdated={(newScore) => {
            setConversations((prev) =>
              prev.map((c) =>
                c.characterId === activeChatCharacter.id
                  ? { ...c, affinityScore: newScore }
                  : c
              )
            );
          }}
        />
      )}

      {/* Character Profile Modal (from inside Chat) */}
      <CharacterProfileModal
        character={activeProfileCharacter}
        affinityScore={
          conversations.find((c) => c.characterId === activeProfileCharacter?.id)
            ?.affinityScore || 42
        }
        isFavorite={
          Boolean(activeProfileCharacter && user?.favorites.includes(activeProfileCharacter.id))
        }
        onClose={() => setActiveProfileCharacter(null)}
        onStartChat={(char) => {
          setActiveProfileCharacter(null);
          handleOpenChat(char);
        }}
        onOpenMemory={(char) => {
          setActiveProfileCharacter(null);
          setActiveMemoryCharacter(char);
        }}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Memory Inspector Modal */}
      <MemoryModal
        character={activeMemoryCharacter}
        isOpen={Boolean(activeMemoryCharacter)}
        onClose={() => setActiveMemoryCharacter(null)}
      />

      {/* Character Creator Modal */}
      <CharacterCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onCreated={handleCharacterCreated}
      />

      {/* Credit & Monetization Modal */}
      <CreditModal
        isOpen={isCreditsOpen}
        user={user}
        onClose={() => setIsCreditsOpen(false)}
        onAdRewarded={handleAdRewarded}
        onPurchasePackage={handlePurchasePackage}
      />

      {/* Onboarding Experience for First-Time Users */}
      <OnboardingModal
        isOpen={showOnboarding}
        onStart={handleCompleteOnboarding}
      />
    </div>
  );
}

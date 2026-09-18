import {
  Character,
  Conversation,
  Message,
  UserMemory,
  UserProfile,
  RoleplayMode,
} from '../types';

export async function fetchCharacters(): Promise<Character[]> {
  const res = await fetch('/api/characters');
  if (!res.ok) throw new Error('Falha ao carregar personagens');
  return res.json();
}

export async function fetchCharacterById(id: string): Promise<Character & { affinityScore: number; affinityTier: string; isFavorite: boolean }> {
  const res = await fetch(`/api/characters/${id}`);
  if (!res.ok) throw new Error('Personagem não encontrado');
  return res.json();
}

export async function createCustomCharacter(data: Partial<Character>): Promise<Character> {
  const res = await fetch('/api/characters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Falha ao criar personagem');
  }
  return res.json();
}

export async function fetchConversations(): Promise<(Conversation & { character?: Character })[]> {
  const res = await fetch('/api/conversations');
  if (!res.ok) throw new Error('Falha ao carregar conversas');
  return res.json();
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const res = await fetch(`/api/conversations/${conversationId}/messages`);
  if (!res.ok) throw new Error('Falha ao carregar mensagens');
  return res.json();
}

export async function sendChatMessage(
  characterId: string,
  message: string,
  mode: RoleplayMode = 'normal'
): Promise<{
  message: Message;
  affinityScore: number;
  affinityTier: string;
  remainingCredits: number;
  memoriesUpdated: boolean;
}> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterId, message, mode }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Falha ao enviar mensagem');
  }
  return res.json();
}

export async function regenerateChatMessage(conversationId: string): Promise<{
  message: Message;
  affinityScore: number;
  affinityTier: string;
  remainingCredits: number;
}> {
  const res = await fetch('/api/chat/regenerate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversationId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Falha ao regenerar resposta');
  }
  return res.json();
}

export async function clearConversationMessages(conversationId: string): Promise<{ success: boolean; messages: Message[] }> {
  const res = await fetch(`/api/conversations/${conversationId}/clear`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Falha ao limpar conversa');
  return res.json();
}

export async function toggleCharacterFavorite(characterId: string): Promise<{ isFavorite: boolean; favorites: string[] }> {
  const res = await fetch(`/api/characters/${characterId}/toggle-favorite`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Falha ao atualizar favorito');
  return res.json();
}

export async function updateConversationMode(conversationId: string, mode: RoleplayMode): Promise<{ success: boolean; mode: RoleplayMode }> {
  const res = await fetch(`/api/conversations/${conversationId}/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
  if (!res.ok) throw new Error('Falha ao alterar modo');
  return res.json();
}

export async function fetchUserMemories(characterId: string): Promise<UserMemory[]> {
  const res = await fetch(`/api/memories/${characterId}`);
  if (!res.ok) throw new Error('Falha ao carregar memórias');
  return res.json();
}

export async function deleteUserMemory(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/memories/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Falha ao excluir memória');
  return res.json();
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const res = await fetch('/api/user');
  if (!res.ok) throw new Error('Falha ao carregar perfil');
  return res.json();
}

export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch('/api/user', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Falha ao atualizar perfil');
  return res.json();
}

export async function claimRewardedAd(): Promise<{ success: boolean; message: string; credits: number }> {
  const res = await fetch('/api/credits/ad-reward', {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Falha ao resgatar recompensa');
  return res.json();
}
export const claimDailyBonus = claimRewardedAd;

export async function purchaseCreditsPackage(packageId: string, amount: number): Promise<{ success: boolean; message: string; credits: number; plan?: string }> {
  const res = await fetch('/api/credits/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ packageId, amount }),
  });
  if (!res.ok) throw new Error('Falha na compra de créditos');
  return res.json();
}
export const purchaseCredits = purchaseCreditsPackage;

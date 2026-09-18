export type RoleplayMode =
  | 'normal'
  | 'romance'
  | 'aventura'
  | 'fantasia'
  | 'historia'
  | 'roleplay';

export interface Character {
  id: string;
  name: string;
  age: number; // Strictly adult (18+)
  adultAge?: number; // Alias for backward compatibility
  avatar: string;
  coverImage?: string;
  description: string;
  personality: string[];
  interests: string[];
  speakingStyle: string;
  speechStyle?: string; // Alias for backward compatibility
  greeting: string;
  systemPrompt: string;
  tags: string[];
  category?: 'Romance' | 'Aventura' | 'Fantasia' | 'Anime' | 'Gamer' | 'Mistério' | 'Comédia' | 'Sci-fi' | string;
  backstory?: string;
  conversationCount?: number;
  initialRelationship?: string;
  isCustom?: boolean;
  isPublic?: boolean;
  createdBy?: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant';
  role?: 'user' | 'assistant';
  content?: string;
  text: string;
  timestamp: string;
  roleplayChoices?: string[]; // Optional choice buttons for interactive stories
}

export interface Conversation {
  id: string;
  characterId: string;
  userId: string;
  mode: RoleplayMode;
  affinityScore: number; // 0 - 100
  affinityTier: AffinityTier;
  lastMessage?: string;
  lastMessageAt: string;
  isFavorite: boolean;
  createdAt?: string;
}

export type AffinityTier =
  | 'Estranhos'
  | 'Conhecidos'
  | 'Amigos'
  | 'Próximos'
  | 'Melhor conexão';

export function getAffinityTier(score: number): AffinityTier {
  if (score <= 20) return 'Estranhos';
  if (score <= 40) return 'Conhecidos';
  if (score <= 60) return 'Amigos';
  if (score <= 80) return 'Próximos';
  return 'Melhor conexão';
}

export interface UserMemory {
  id: string;
  userId?: string;
  characterId: string;
  category?: 'name' | 'preference' | 'interest' | 'fact' | 'relationship' | 'story_event' | string;
  key?: string;
  content: string;
  importance?: number;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  bio?: string;
  avatar: string;
  plan: 'free' | 'premium';
  credits: number;
  maxDailyCredits: number;
  messagesUsedToday?: number;
  lastDailyReset: string;
  favorites: string[];
  customCharacterIds: string[];
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceBRL: string;
  popular?: boolean;
  bonus?: string;
}

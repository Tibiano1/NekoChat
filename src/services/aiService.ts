import { Character, Message, RoleplayMode, UserMemory } from '../types';
import { sendChatMessage } from './api';

export interface SendMessageOptions {
  character: Character;
  messageText: string;
  conversationId: string;
  history?: Message[];
  memories?: UserMemory[];
  mode?: RoleplayMode;
}

export interface AIResponseResult {
  reply: string;
  remainingCredits: number;
  affinityScore?: number;
  newMemory?: UserMemory;
  choices?: string[];
  error?: string;
}

/**
 * Client-facing AI Service Layer.
 * Proxies all requests to the secure backend server where GEMINI_API_KEY is handled safely.
 */
export async function sendCharacterMessage({
  character,
  messageText,
  mode = 'normal',
}: SendMessageOptions): Promise<AIResponseResult> {
  try {
    const result = await sendChatMessage(character.id, messageText, mode);

    return {
      reply: result.message.text,
      remainingCredits: result.remainingCredits,
      affinityScore: result.affinityScore,
      choices: result.message.roleplayChoices,
    };
  } catch (err: any) {
    console.error('[aiService] Failed to send message to character:', err);
    // User-friendly error message compliant with Requirement 12
    return {
      reply: 'Não consegui responder agora. Tente novamente.',
      remainingCredits: 0,
      error: err?.message || 'Erro ao conectar ao NekoChat AI',
    };
  }
}

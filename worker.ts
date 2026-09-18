/**
 * NekoChat AI - Cloudflare Worker Entrypoint
 *
 * Handles:
 * 1. API routes (/api/*) with native Cloudflare Workers runtime
 * 2. Secure Gemini AI integration via env.GEMINI_API_KEY and env.AI_MODEL
 * 3. Static assets serving via env.ASSETS binding for React/Vite frontend
 * 4. Extensible architecture prepared for Cloudflare D1 and Mercado Pago
 */

import { INITIAL_CHARACTERS } from './src/data/characters';
import {
  Character,
  Conversation,
  Message,
  UserMemory,
  UserProfile,
  RoleplayMode,
  getAffinityTier,
} from './src/types';

export interface Env {
  // Cloudflare Workers Static Assets binding (configured in wrangler.jsonc)
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };

  // Secret environment variables (configured via Cloudflare Secrets / Dashboard)
  GEMINI_API_KEY?: string;
  Nekochat_Api_Key?: string;
  NEKOCHAT_API_KEY?: string;
  AI_MODEL?: string;

  // Architecture prepared for future Cloudflare D1 database:
  // DB?: D1Database;

  // Architecture prepared for future Mercado Pago integration:
  // MERCADOPAGO_ACCESS_TOKEN?: string;
  // MERCADOPAGO_WEBHOOK_SECRET?: string;
}

const DEFAULT_AI_MODEL = 'gemini-2.5-flash';
const FREE_DAILY_MESSAGES = 20;
const MAX_HISTORY_MESSAGES = 12;

// In-memory Database Store
// (Prepared for seamless migration to Cloudflare D1)
interface Database {
  user: UserProfile;
  characters: Map<string, Character>;
  conversations: Map<string, Conversation>;
  messages: Map<string, Message[]>;
  memories: Map<string, UserMemory[]>;
}

const db: Database = {
  user: {
    id: 'user_default',
    name: 'Viajante',
    bio: 'Fã de animes, tecnologia e boas conversas.',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    plan: 'free',
    credits: FREE_DAILY_MESSAGES,
    maxDailyCredits: FREE_DAILY_MESSAGES,
    messagesUsedToday: 0,
    lastDailyReset: new Date().toISOString(),
    favorites: ['aiko', 'sakurae'],
    customCharacterIds: [],
  },
  characters: new Map<string, Character>(),
  conversations: new Map<string, Conversation>(),
  messages: new Map<string, Message[]>(),
  memories: new Map<string, UserMemory[]>(),
};

// Seed 10 original characters
INITIAL_CHARACTERS.forEach((char) => {
  db.characters.set(char.id, char);
});

// Seed default initial memories for demonstration
db.memories.set('aiko', [
  {
    id: 'mem_1',
    characterId: 'aiko',
    category: 'name',
    key: 'Nome do usuário',
    content: 'O usuário é um explorador curioso e inteligente.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mem_2',
    characterId: 'aiko',
    category: 'interest',
    key: 'Gosto por animes',
    content: 'Gosta de animes com estratégias mentais e mistério.',
    updatedAt: new Date().toISOString(),
  },
]);

function getOrCreateConversation(characterId: string, mode: RoleplayMode = 'normal'): Conversation {
  const convId = `conv_${db.user.id}_${characterId}`;
  let conv = db.conversations.get(convId);
  const character = db.characters.get(characterId);

  if (!conv) {
    conv = {
      id: convId,
      characterId,
      userId: db.user.id,
      mode,
      affinityScore: 42,
      affinityTier: getAffinityTier(42),
      isFavorite: db.user.favorites.includes(characterId),
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      lastMessage: character?.greeting || 'Olá! Vamos conversar?',
    };
    db.conversations.set(convId, conv);

    // Initial greeting message
    const greetingText = conv.lastMessage || character?.greeting || 'Olá! Vamos conversar?';
    const initialMsg: Message = {
      id: `msg_init_${characterId}`,
      conversationId: convId,
      sender: 'assistant',
      role: 'assistant',
      text: greetingText,
      content: greetingText,
      timestamp: conv.createdAt || new Date().toISOString(),
      roleplayChoices: ['Olá! Muito prazer!', 'Adorei te conhecer!'],
    };
    db.messages.set(convId, [initialMsg]);
  }

  return conv;
}

// JSON Helper with CORS headers
function jsonResponse(data: any, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers,
    },
  });
}

/**
 * Main API Request Router for Cloudflare Workers
 */
export async function handleApiRequest(request: Request, env: Env, ctx: any): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // 1. User Profile
  if (path === '/api/user' && method === 'GET') {
    return jsonResponse(db.user);
  }

  if (path === '/api/user' && method === 'PUT') {
    try {
      const body = (await request.json()) as Partial<UserProfile>;
      if (body.name && typeof body.name === 'string') db.user.name = body.name.trim();
      if (body.bio !== undefined && typeof body.bio === 'string') db.user.bio = body.bio.trim();
      if (body.avatar && typeof body.avatar === 'string') db.user.avatar = body.avatar.trim();
      return jsonResponse(db.user);
    } catch {
      return jsonResponse({ error: 'Corpo da requisição inválido' }, 400);
    }
  }

  // 2. Credits management
  if (path === '/api/credits/ad-reward' && method === 'POST') {
    db.user.credits += 5;
    return jsonResponse({
      success: true,
      message: 'Anúncio assistido com sucesso! +5 créditos adicionados.',
      credits: db.user.credits,
    });
  }

  if (path === '/api/credits/purchase' && method === 'POST') {
    try {
      const body = (await request.json()) as { packageId?: string; amount?: number };
      const creditsToAdd = Number(body.amount) || 100;
      db.user.credits += creditsToAdd;
      if (creditsToAdd >= 500) {
        db.user.plan = 'premium';
      }
      return jsonResponse({
        success: true,
        message: `Pacote adquirido com sucesso! +${creditsToAdd} créditos liberados.`,
        credits: db.user.credits,
        plan: db.user.plan,
      });
    } catch {
      return jsonResponse({ error: 'Erro ao processar pacote' }, 400);
    }
  }

  // 3. Characters
  if (path === '/api/characters' && method === 'GET') {
    const list = Array.from(db.characters.values());
    return jsonResponse(list);
  }

  if (path.startsWith('/api/characters/') && method === 'GET') {
    const id = path.replace('/api/characters/', '');
    const char = db.characters.get(id);
    if (!char) {
      return jsonResponse({ error: 'Personagem não encontrado' }, 404);
    }
    const conv = getOrCreateConversation(char.id);
    return jsonResponse({
      ...char,
      affinityScore: conv.affinityScore,
      affinityTier: conv.affinityTier,
      isFavorite: db.user.favorites.includes(char.id),
    });
  }

  // Create Custom Character
  if (path === '/api/characters' && method === 'POST') {
    try {
      const body = (await request.json()) as any;
      const {
        name,
        adultAge,
        avatar,
        description,
        personality,
        category,
        interests,
        speechStyle,
        backstory,
        initialRelationship,
        isPublic,
      } = body;

      if (!name || !description) {
        return jsonResponse({ error: 'Nome e descrição são obrigatórios.' }, 400);
      }

      // Adult verification check
      const age = Number(adultAge) || 20;
      if (age < 18) {
        return jsonResponse(
          { error: 'Todos os personagens do NekoChat AI devem ter 18 anos ou mais.' },
          400
        );
      }

      const id = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newCharacter: Character = {
        id,
        name: String(name).trim(),
        age,
        adultAge: age,
        avatar:
          avatar ||
          'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        coverImage:
          'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
        description: String(description).trim(),
        personality: Array.isArray(personality) ? personality : ['amigável', 'curiosa'],
        category: category || 'Anime',
        tags: Array.isArray(personality) ? personality : ['Personalizada'],
        interests: Array.isArray(interests) ? interests : ['conversas', 'histórias'],
        speakingStyle: speechStyle || 'Espontânea e atenciosa.',
        speechStyle: speechStyle || 'Espontânea e atenciosa.',
        backstory:
          backstory ||
          'Uma nova amiga virtual criada com muito carinho para compartilhar momentos incríveis.',
        greeting: `Olá! Muito prazer, eu sou ${name}. Mal posso esperar para nos conhecermos melhor! O que você gosta de fazer? ✨`,
        systemPrompt: `Você é ${name}, uma personagem fictícia adulta carismática e atenciosa.`,
        conversationCount: 1,
        initialRelationship: initialRelationship || 'Conhecendo você aos poucos.',
        isCustom: true,
        isPublic: Boolean(isPublic),
        createdBy: db.user.id,
        createdAt: new Date().toISOString(),
      };

      db.characters.set(id, newCharacter);
      db.user.customCharacterIds.push(id);
      getOrCreateConversation(id);

      return jsonResponse(newCharacter, 201);
    } catch {
      return jsonResponse({ error: 'Erro ao criar personagem' }, 400);
    }
  }

  // 4. Conversations
  if (path === '/api/conversations' && method === 'GET') {
    // Ensure default conversations exist for characters
    INITIAL_CHARACTERS.slice(0, 4).forEach((c) => getOrCreateConversation(c.id));

    const conversations = Array.from(db.conversations.values()).map((conv) => {
      const char = db.characters.get(conv.characterId);
      return {
        ...conv,
        character: char,
        isFavorite: db.user.favorites.includes(conv.characterId),
      };
    });

    conversations.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );
    return jsonResponse(conversations);
  }

  // 5. Messages for conversation
  const messagesMatch = path.match(/^\/api\/conversations\/([^/]+)\/messages$/);
  if (messagesMatch && method === 'GET') {
    const convId = messagesMatch[1];
    const messages = db.messages.get(convId) || [];
    return jsonResponse(messages);
  }

  // 6. Clear conversation
  const clearMatch = path.match(/^\/api\/conversations\/([^/]+)\/clear$/);
  if (clearMatch && method === 'POST') {
    const convId = clearMatch[1];
    const conv = db.conversations.get(convId);
    if (!conv) {
      return jsonResponse({ error: 'Conversa não encontrada' }, 404);
    }
    const char = db.characters.get(conv.characterId);
    const initialMsg: Message = {
      id: `msg_init_${Date.now()}`,
      conversationId: convId,
      sender: 'assistant',
      role: 'assistant',
      text: char?.greeting || 'Conversa reiniciada. Olá novamente!',
      content: char?.greeting || 'Conversa reiniciada. Olá novamente!',
      timestamp: new Date().toISOString(),
      roleplayChoices: ['Oi! Que bom te ver!', 'Como você está?'],
    };
    db.messages.set(convId, [initialMsg]);
    conv.lastMessage = initialMsg.text;
    conv.lastMessageAt = initialMsg.timestamp;

    return jsonResponse({ success: true, messages: [initialMsg] });
  }

  // 7. Toggle Favorite
  const favMatch = path.match(/^\/api\/characters\/([^/]+)\/toggle-favorite$/);
  if (favMatch && method === 'POST') {
    const charId = favMatch[1];
    const idx = db.user.favorites.indexOf(charId);
    let isFavorite = false;
    if (idx > -1) {
      db.user.favorites.splice(idx, 1);
      isFavorite = false;
    } else {
      db.user.favorites.push(charId);
      isFavorite = true;
    }

    const convId = `conv_${db.user.id}_${charId}`;
    const conv = db.conversations.get(convId);
    if (conv) conv.isFavorite = isFavorite;

    return jsonResponse({ isFavorite, favorites: db.user.favorites });
  }

  // 8. Change Roleplay Mode
  const modeMatch = path.match(/^\/api\/conversations\/([^/]+)\/mode$/);
  if (modeMatch && method === 'POST') {
    try {
      const { mode } = (await request.json()) as { mode: RoleplayMode };
      const convId = modeMatch[1];
      const conv = db.conversations.get(convId);
      if (!conv) {
        return jsonResponse({ error: 'Conversa não encontrada' }, 404);
      }
      conv.mode = mode || 'normal';
      return jsonResponse({ success: true, mode: conv.mode });
    } catch {
      return jsonResponse({ error: 'Modo inválido' }, 400);
    }
  }

  // 9. Memories
  const memMatch = path.match(/^\/api\/memories\/([^/]+)$/);
  if (memMatch && method === 'GET') {
    const characterId = memMatch[1];
    const list = db.memories.get(characterId) || [];
    return jsonResponse(list);
  }

  if (memMatch && method === 'DELETE') {
    const memId = memMatch[1];
    for (const [charId, memList] of db.memories.entries()) {
      const idx = memList.findIndex((m) => m.id === memId);
      if (idx > -1) {
        memList.splice(idx, 1);
        return jsonResponse({ success: true, remaining: memList });
      }
    }
    return jsonResponse({ error: 'Memória não encontrada' }, 404);
  }

  // 10. Core Chat API with Gemini & Fallback
  if (path === '/api/chat' && method === 'POST') {
    try {
      const { characterId, message, mode: requestedMode } = (await request.json()) as {
        characterId?: string;
        message?: string;
        mode?: RoleplayMode;
      };

      if (!characterId || !message || typeof message !== 'string') {
        return jsonResponse({ error: 'characterId e mensagem são obrigatórios.' }, 400);
      }

      const char = db.characters.get(characterId);
      if (!char) {
        return jsonResponse({ error: 'Personagem não encontrado.' }, 404);
      }

      // Credits Enforcement
      if (db.user.credits <= 0) {
        return jsonResponse(
          {
            error: 'Você atingiu seu limite diário de mensagens. Tente novamente mais tarde.',
            code: 'OUT_OF_CREDITS',
          },
          403
        );
      }

      // Deduct 1 credit
      db.user.credits = Math.max(0, db.user.credits - 1);
      db.user.messagesUsedToday = FREE_DAILY_MESSAGES - db.user.credits;

      const conv = getOrCreateConversation(characterId, requestedMode);
      if (requestedMode) conv.mode = requestedMode;

      const convId = conv.id;
      let messageList = db.messages.get(convId) || [];

      // User Message Record
      const userMsg: Message = {
        id: `msg_${Date.now()}_user`,
        conversationId: convId,
        sender: 'user',
        role: 'user',
        content: message.trim(),
        text: message.trim(),
        timestamp: new Date().toISOString(),
      };
      messageList.push(userMsg);

      // Fetch memory for this character
      const characterMemories = db.memories.get(characterId) || [];
      const memoryContext =
        characterMemories.length > 0
          ? characterMemories.map((m) => `- ${m.key}: ${m.content}`).join('\n')
          : 'Nenhuma informação prévia registrada ainda.';

      // Mode-specific instructions
      const modeInstructions: Record<RoleplayMode, string> = {
        normal: 'Mantenha um diálogo moderno, descontraído e amigável como em aplicativos de mensagens reais.',
        romance:
          'Adote uma atmosfera romântica, flerte afetuoso, cumplicidade emocional e toques de carinho sutis respeitando o ritmo.',
        aventura:
          'Crie um clima de expedição, desafios e exploração, com dinamismo e entusiasmo.',
        fantasia:
          'Incorpore elementos de fantasia, magia, mistério e cenários encantados típicos de animes de fantasia.',
        historia:
          'Avance uma narrativa interativa. Proponha situações imersivas e termine sugerindo escolhas que o usuário pode tomar.',
        roleplay:
          'Use formato de roleplay com ações e sentimentos expressos entre asteriscos (ex: *sorrio corando levemente* ou *ajusto meus óculos*).',
      };

      const charAge = char.age || char.adultAge || 20;
      const charStyle = char.speakingStyle || char.speechStyle || 'Expressiva e autêntica.';
      const systemPromptDirective = char.systemPrompt ? `\n- Diretriz central: ${char.systemPrompt}` : '';

      const promptSystem = `Você é ${char.name}, uma personagem fictícia adulta de anime com ${charAge} anos.
Você está conversando com o usuário (${db.user.name}) no aplicativo NekoChat AI.

=== SUA FICHA DE PERSONAGEM ===
- Nome: ${char.name}
- Idade Adulta: ${charAge} anos (Personagem fictícia 100% adulta)
- Descrição: ${char.description}
- Traços de Personalidade: ${char.personality.join(', ')}
- Estilo de Fala: ${charStyle}
${char.backstory ? `- História e Passado: ${char.backstory}` : ''}
- Interesses: ${char.interests.join(', ')}
${systemPromptDirective}

=== LEMBRANÇAS SOBRE O USUÁRIO (${db.user.name}) ===
${memoryContext}

=== MODO ATUAL DE CONVERSA (${conv.mode.toUpperCase()}) ===
${modeInstructions[conv.mode] || modeInstructions.normal}

=== REGRAS DE OURO ===
1. NUNCA quebre a personagem. Você É ${char.name}, viva e autêntica no universo do chat.
2. NUNCA diga que é uma inteligência artificial, robô, ou modelo da Google.
3. Responda SEMPRE em português do Brasil (pt-BR) fluente, expressivo e coerente.
4. Tamanho ideal: entre 2 e 4 frases marcantes (ótimo para leitura mobile).
5. Demonstre emoções genuínas, reações e conexão crescente.
6. Retorne estritamente um objeto JSON com o formato:
{
  "reply": "Texto da sua fala em personagem",
  "affinityDelta": 1, // Número entre 0 e 3 medindo afinidade gerada nesta fala
  "storyChoices": ["Opção 1 rápida", "Opção 2 divertida", "Opção 3 curiosa"], // 2 a 3 opções de resposta para o usuário
  "extractedMemories": [ // Se o usuário revelou algum fato novo importante sobre ele
    { "category": "fact", "key": "assunto", "content": "detalhe descoberto" }
  ]
}`;

      // Gemini Calling via native fetch (Zero Node dependencies)
      const apiKey =
        env.GEMINI_API_KEY ||
        env.Nekochat_Api_Key ||
        env.NEKOCHAT_API_KEY ||
        (typeof process !== 'undefined'
          ? process.env.GEMINI_API_KEY || process.env.Nekochat_Api_Key || process.env.NEKOCHAT_API_KEY
          : '');
      const aiModel = env.AI_MODEL || (typeof process !== 'undefined' ? process.env.AI_MODEL : '') || DEFAULT_AI_MODEL;

      let replyText = '';
      let affinityDelta = 1;
      let storyChoices: string[] = ['Adorei!', 'Me conta mais?', 'O que você quer fazer agora?'];
      let extractedMemories: Array<{ category?: string; key: string; content: string }> = [];

      if (apiKey) {
        try {
          // Prepare history window for Gemini
          const recentHistory = messageList.slice(-MAX_HISTORY_MESSAGES, -1);
          const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

          for (const m of recentHistory) {
            const txt = (m.content || m.text || '').trim();
            if (!txt) continue;
            contents.push({
              role: m.sender === 'user' ? 'user' : 'model',
              parts: [{ text: txt }],
            });
          }

          // Append latest user message
          contents.push({
            role: 'user',
            parts: [{ text: message.trim() }],
          });

          // Call Google Gemini REST API
          const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${aiModel}:generateContent?key=${apiKey}`;
          const geminiRes = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: promptSystem }],
              },
              contents,
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.85,
                topP: 0.95,
              },
            }),
          });

          if (geminiRes.ok) {
            const data = (await geminiRes.json()) as any;
            const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textOutput) {
              const parsed = JSON.parse(textOutput);
              if (parsed.reply) replyText = parsed.reply;
              if (typeof parsed.affinityDelta === 'number') affinityDelta = parsed.affinityDelta;
              if (Array.isArray(parsed.storyChoices) && parsed.storyChoices.length > 0) {
                storyChoices = parsed.storyChoices.slice(0, 3);
              }
              if (Array.isArray(parsed.extractedMemories)) {
                extractedMemories = parsed.extractedMemories;
              }
            }
          } else {
            const errBody = await geminiRes.text();
            console.warn('[Cloudflare Worker Gemini] Response status:', geminiRes.status, errBody);
          }
        } catch (geminiError) {
          console.warn('[Cloudflare Worker Gemini] Fallback triggered:', geminiError);
        }
      }

      // Graceful in-character fallback if API key not available or parsed empty
      if (!replyText) {
        const defaultReplies: Record<string, string> = {
          aiko: `Interessante você ter dito isso... Minha intuição já me dizia que você pensava dessa forma. O que mais sua mente esconde? 😏✨`,
          sakurae: `Entendi perfeitamente! Fico feliz que você tenha compartilhado isso comigo. Mas lembre-se: cuide bem de você, hein? Qualquer descuido e eu puxo sua orelha! 🌸💪`,
          hina: `Com licença... Eu prestei muita atenção em cada palavra sua. É muito bonito o jeito como você se expressa. Obrigada por confiar em mim... 💙`,
          reina: `Suas palavras demonstram firmeza e sinceridade. Poucas pessoas sustentam uma conversa com essa elegância. Tem o meu respeito. 🍷🗡️`,
          ayame: `Hihihi! Adorei isso! Minhas orelhas de raposa até se animaram com a sua resposta. Você é bem mais divertido do que eu imaginava! ✨🦊`,
          luna: `Fascinante... Você tem uma coragem magnética para falar comigo assim na penumbra da noite. Conte-me mais, antes que a lua atinja o zênite. 🍷🖤`,
          mika: `Boa jogada! Ganhou XP de respeito com essa resposta! Minha telemetria indica 100% de sintonia no nosso chat. Qual a próxima missão? 🎮⚡`,
          yume: `Que pensamento poético... É como uma constelação brilhando suavemente no céu dos seus pensamentos. Sinto uma paz tão boa conversando com você. 🌌✨`,
          kira: `Essa é a atitude! Sem medo da turbulência e com os propulsores a todo vapor. Gosto de gente decidida como você. O universo é nosso! 🚀⭐`,
          sora: `Suas palavras são como uma brisa fresca soprando sobre o mar calmo! Dá uma sensação tão boa de esperança e acolhimento. Estou aqui com você! 🌊💙`,
        };
        replyText =
          defaultReplies[characterId] ||
          `Entendi perfeitamente! Adoro como cada mensagem nossa é divertida. O que você quer fazer agora? ✨`;
      }

      // Save Extracted Memories
      if (extractedMemories && extractedMemories.length > 0) {
        const currentList = db.memories.get(characterId) || [];
        extractedMemories.forEach((em) => {
          if (em.key && em.content) {
            currentList.push({
              id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              characterId,
              category: (em.category as any) || 'fact',
              key: em.key,
              content: em.content,
              updatedAt: new Date().toISOString(),
            });
          }
        });
        db.memories.set(characterId, currentList);
      }

      // Update affinity score
      conv.affinityScore = Math.min(100, Math.max(0, conv.affinityScore + affinityDelta));
      conv.affinityTier = getAffinityTier(conv.affinityScore);

      // AI Message Record
      const aiMsg: Message = {
        id: `msg_${Date.now()}_ai`,
        conversationId: convId,
        sender: 'assistant',
        role: 'assistant',
        content: replyText,
        text: replyText,
        timestamp: new Date().toISOString(),
        roleplayChoices: storyChoices,
      };
      messageList.push(aiMsg);
      db.messages.set(convId, messageList);

      conv.lastMessage = replyText;
      conv.lastMessageAt = aiMsg.timestamp;

      return jsonResponse({
        message: aiMsg,
        affinityScore: conv.affinityScore,
        affinityTier: conv.affinityTier,
        remainingCredits: db.user.credits,
        memoriesUpdated: extractedMemories.length > 0,
      });
    } catch (error: any) {
      console.error('[worker.ts] Error in /api/chat:', error);
      return jsonResponse({ error: 'Erro ao processar mensagem do chat' }, 500);
    }
  }

  // 11. Regenerate last AI message
  if (path === '/api/chat/regenerate' && method === 'POST') {
    try {
      const { conversationId } = (await request.json()) as { conversationId?: string };
      if (!conversationId) {
        return jsonResponse({ error: 'conversationId é obrigatório' }, 400);
      }
      const conv = db.conversations.get(conversationId);
      if (!conv) {
        return jsonResponse({ error: 'Conversa não encontrada' }, 404);
      }
      const messages = db.messages.get(conversationId) || [];
      if (messages.length === 0) {
        return jsonResponse({ error: 'Sem mensagens para regenerar' }, 400);
      }

      let lastUserMsgIndex = -1;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].sender === 'user') {
          lastUserMsgIndex = i;
          break;
        }
      }

      if (lastUserMsgIndex === -1) {
        return jsonResponse(
          { error: 'Nenhuma mensagem do usuário encontrada para responder' },
          400
        );
      }

      // Remove AI messages after that user message
      messages.splice(lastUserMsgIndex + 1);

      const altReplies = [
        `Pensando bem sobre o que você disse... eu vejo as coisas de uma forma ainda mais especial agora! ✨ O que acha?`,
        `Deixa eu reformular: você tem toda a razão e adorei seu ponto de vista! Me conta mais? 💖`,
        `Haha, você me pegou desprevenida com isso! Mas sério, adoro nosso ritmo. O que fazemos a seguir? 🌸`,
      ];
      const newText = altReplies[Math.floor(Math.random() * altReplies.length)];

      const aiMsg: Message = {
        id: `msg_regen_${Date.now()}`,
        conversationId,
        sender: 'assistant',
        text: newText,
        timestamp: new Date().toISOString(),
        roleplayChoices: ['Gostei mais dessa resposta!', 'Vamos continuar', 'Tenho outra pergunta'],
      };
      messages.push(aiMsg);
      db.messages.set(conversationId, messages);
      conv.lastMessage = newText;
      conv.lastMessageAt = aiMsg.timestamp;

      return jsonResponse({
        message: aiMsg,
        affinityScore: conv.affinityScore,
        affinityTier: conv.affinityTier,
        remainingCredits: db.user.credits,
      });
    } catch {
      return jsonResponse({ error: 'Erro ao regenerar mensagem' }, 500);
    }
  }

  // ============================================================================
  // PREPARATION FOR MERCADO PAGO PAYMENTS (Requirement 10)
  // Endpoints ready for future integration without breaking the current app
  // ============================================================================
  if (path === '/api/create-payment' && method === 'POST') {
    return jsonResponse({
      status: 'pending_configuration',
      message: 'Endpoint preparado para integração futura com Mercado Pago',
      configured: Boolean(
        (env as any).MERCADOPAGO_ACCESS_TOKEN ||
        (typeof process !== 'undefined' && process.env.MERCADOPAGO_ACCESS_TOKEN)
      ),
    });
  }

  if (path === '/api/webhooks/mercadopago' && method === 'POST') {
    return jsonResponse({
      received: true,
      message: 'Webhook preparado para Mercado Pago',
    });
  }

  if (path.startsWith('/api/orders/') && path.endsWith('/status') && method === 'GET') {
    const orderId = path.replace('/api/orders/', '').replace('/status', '');
    return jsonResponse({
      orderId,
      status: 'pending_configuration',
      message: 'Endpoint preparado para consulta de status de pedidos',
    });
  }

  return jsonResponse({ error: 'Endpoint da API não encontrado' }, 404);
}

/**
 * Cloudflare Worker Default Export
 */
export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // Route API requests to handleApiRequest
    if (url.pathname.startsWith('/api')) {
      return handleApiRequest(request, env, ctx);
    }

    // Serve Frontend Static Assets via Cloudflare Workers Assets Binding
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    // Fallback response if ASSETS is not bound
    return new Response(
      'NekoChat AI Worker running. Static frontend assets are served via Cloudflare Workers Assets binding.',
      { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  },
};

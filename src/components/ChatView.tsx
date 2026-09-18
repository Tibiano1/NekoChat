import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Heart,
  Star,
  MoreVertical,
  Send,
  RotateCcw,
  Copy,
  Trash2,
  Brain,
  Sparkles,
  ShieldCheck,
  Check,
  Zap,
  Film,
  Smile,
  ChevronDown,
} from 'lucide-react';
import {
  Character,
  Conversation,
  Message,
  RoleplayMode,
  getAffinityTier,
} from '../types';
import {
  fetchMessages,
  sendChatMessage,
  regenerateChatMessage,
  clearConversationMessages,
  toggleCharacterFavorite,
  updateConversationMode,
} from '../services/api';
import { AdBanner } from './AdBanner';

interface ChatViewProps {
  character: Character;
  conversation: Conversation;
  credits: number;
  isFavorite: boolean;
  onBack: () => void;
  onOpenProfile: () => void;
  onOpenMemory: () => void;
  onOpenCredits: () => void;
  onToggleFavorite: (charId: string) => void;
  onCreditsUpdated: (newCredits: number) => void;
  onAffinityUpdated: (newScore: number, newTier: string) => void;
}

const ROLEPLAY_MODES: { id: RoleplayMode; label: string; icon: string; desc: string }[] = [
  { id: 'normal', label: 'Conversa Normal', icon: '💬', desc: 'Diálogo descontraído do cotidiano' },
  { id: 'romance', label: 'Romance & Flerte', icon: '💖', desc: 'Clima afetuoso e conexão íntima' },
  { id: 'aventura', label: 'Aventura & Ação', icon: '⚔️', desc: 'Desafios, explorações e viagens' },
  { id: 'fantasia', label: 'Fantasia & Magia', icon: '🌌', desc: 'Mundo místico e poderes arcanos' },
  { id: 'historia', label: 'História Interativa', icon: '📖', desc: 'Narrativa com escolhas dinâmicas' },
  { id: 'roleplay', label: 'Roleplay Imersivo', icon: '🎭', desc: 'Ações e emoções entre asteriscos (*gesto*)' },
];

const QUICK_ACTIONS = [
  '*sorrio*',
  '*olho nos seus olhos*',
  '*seguro sua mão*',
  '*abraço você carinhosamente*',
  '*dou risada*',
];

export const ChatView: React.FC<ChatViewProps> = ({
  character,
  conversation,
  credits,
  isFavorite,
  onBack,
  onOpenProfile,
  onOpenMemory,
  onOpenCredits,
  onToggleFavorite,
  onCreditsUpdated,
  onAffinityUpdated,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentMode, setCurrentMode] = useState<RoleplayMode>(conversation.mode || 'normal');
  const [isTyping, setIsTyping] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [affinityScore, setAffinityScore] = useState(conversation.affinityScore);
  const [affinityGainedFlash, setAffinityGainedFlash] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  // Load message history
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const msgs = await fetchMessages(conversation.id);
        if (isMounted) {
          setMessages(msgs);
          setTimeout(() => scrollToBottom(false), 100);
        }
      } catch (err) {
        console.error('Failed to load messages', err);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isTyping]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    if (credits <= 0) {
      setErrorBanner('Você atingiu seu limite diário de mensagens. Tente novamente mais tarde.');
      return;
    }

    setInput('');
    setErrorBanner('');

    // Optimistic user message
    const tempUserMsg: Message = {
      id: `msg_tmp_${Date.now()}`,
      conversationId: conversation.id,
      sender: 'user',
      role: 'user',
      content: text,
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsTyping(true);

    try {
      const response = await sendChatMessage(character.id, text, currentMode);
      setMessages((prev) => [...prev, response.message]);
      onCreditsUpdated(response.remainingCredits);

      if (response.affinityScore !== affinityScore) {
        setAffinityScore(response.affinityScore);
        onAffinityUpdated(response.affinityScore, response.affinityTier);
        setAffinityGainedFlash(true);
        setTimeout(() => setAffinityGainedFlash(false), 2500);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const isLimit =
        err.message?.includes('limite') ||
        err.message?.includes('OUT_OF_CREDITS') ||
        err.message?.includes('diário');
      setErrorBanner(
        isLimit
          ? 'Você atingiu seu limite diário de mensagens. Tente novamente mais tarde.'
          : 'Não consegui responder agora. Tente novamente.'
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleRegenerate = async () => {
    if (isTyping) return;
    setIsTyping(true);
    try {
      const response = await regenerateChatMessage(conversation.id);
      // Replace last message
      setMessages((prev) => {
        const copy = [...prev];
        if (copy.length > 0 && copy[copy.length - 1].sender === 'assistant') {
          copy[copy.length - 1] = response.message;
        } else {
          copy.push(response.message);
        }
        return copy;
      });
      onCreditsUpdated(response.remainingCredits);
      setAffinityScore(response.affinityScore);
      onAffinityUpdated(response.affinityScore, response.affinityTier);
    } catch (err: any) {
      console.error('Regenerate error:', err);
      setErrorBanner('Falha ao regenerar resposta.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = async () => {
    try {
      const res = await clearConversationMessages(conversation.id);
      setMessages(res.messages);
      setShowClearConfirm(false);
      setIsMenuOpen(false);
    } catch (err) {
      console.error('Failed to clear chat', err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleSelectMode = async (mode: RoleplayMode) => {
    setCurrentMode(mode);
    setIsModeSelectorOpen(false);
    try {
      await updateConversationMode(conversation.id, mode);
    } catch (err) {
      console.error('Failed to update mode', err);
    }
  };

  const currentTier = getAffinityTier(affinityScore);

  return (
    <div
      id="chat-view-container"
      className="fixed inset-0 z-50 flex flex-col bg-[#0b0f17] text-zinc-100 max-w-2xl mx-auto overflow-hidden shadow-2xl"
    >
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#0f1420]/95 backdrop-blur-md border-b border-zinc-800/90 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          {/* Botão voltar ao catálogo */}
          <button
            id="chat-back-btn"
            onClick={onBack}
            className="p-2 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer shrink-0"
            title="Voltar ao catálogo"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Character Avatar with online dot */}
          <div
            onClick={onOpenProfile}
            className="relative w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-rose-500/40 cursor-pointer shrink-0 hover:ring-rose-400 transition-all shadow-md"
            title="Ver detalhes da personagem"
          >
            <img
              src={character.avatar}
              alt={character.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-[#0f1420]" />
          </div>

          {/* Nome, Idade, Indicador de Personalidade e Status */}
          <div className="overflow-hidden min-w-0">
            <div className="flex items-center space-x-1.5">
              <h2
                onClick={onOpenProfile}
                className="text-sm font-bold text-white tracking-tight truncate cursor-pointer hover:text-rose-300 transition-colors"
              >
                {character.name}
              </h2>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800/90 text-zinc-400 font-semibold shrink-0 border border-zinc-700/50">
                {character.age || character.adultAge || 20} anos
              </span>
            </div>

            <div className="flex items-center space-x-1.5 text-[11px] text-zinc-400 truncate">
              <span className="flex items-center gap-1 text-emerald-400 font-medium shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Online
              </span>
              <span>•</span>
              <span className="text-zinc-300 truncate text-[11px]">
                {character.personality[0] || 'Confiante'}
              </span>
              <span>•</span>
              <button
                onClick={onOpenProfile}
                className="flex items-center space-x-1 text-rose-400 font-semibold hover:underline cursor-pointer shrink-0"
                title="Afinidade com a personagem"
              >
                <span>❤️ {affinityScore}%</span>
              </button>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-1 shrink-0">
          {/* Botão Favorito ⭐ */}
          <button
            id="chat-favorite-btn"
            onClick={() => onToggleFavorite(character.id)}
            className="p-2 rounded-xl text-zinc-300 hover:bg-zinc-800 transition-all active:scale-95 cursor-pointer"
            title="Favoritar personagem ⭐"
          >
            <Star
              className={`w-4 h-4 transition-colors ${
                isFavorite
                  ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                  : 'text-zinc-400 hover:text-amber-300'
              }`}
            />
          </button>

          {/* Memory Inspector Button */}
          <button
            id="chat-memory-btn"
            onClick={onOpenMemory}
            className="p-2 rounded-xl text-zinc-400 hover:text-purple-300 hover:bg-purple-950/30 border border-transparent hover:border-purple-500/20 transition-all cursor-pointer"
            title="Ver memórias da personagem"
          >
            <Brain className="w-4 h-4 text-purple-400" />
          </button>

          {/* Menu Dropdown */}
          <div className="relative">
            <button
              id="chat-menu-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-2xl bg-[#121724] border border-zinc-800 shadow-2xl py-1.5 z-40 text-xs text-zinc-300 animate-fade-in">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-zinc-800 flex items-center space-x-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>Ver perfil completo</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenMemory();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-zinc-800 flex items-center space-x-2 cursor-pointer"
                >
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>Memórias aprendidas</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenCredits();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-zinc-800 flex items-center space-x-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Recarregar mensagens</span>
                </button>
                <div className="h-px bg-zinc-800 my-1" />
                <button
                  onClick={() => {
                    setShowClearConfirm(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpar conversa</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Roleplay Mode Bar & Affinity Meter */}
      <div className="bg-[#0b0f17] px-3 py-2 border-b border-zinc-800/80 flex items-center justify-between text-xs">
        {/* Mode Selector Pill */}
        <div className="relative">
          <button
            onClick={() => setIsModeSelectorOpen(!isModeSelectorOpen)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[11px] font-medium transition-all active:scale-95 cursor-pointer"
          >
            <span>{ROLEPLAY_MODES.find((m) => m.id === currentMode)?.icon}</span>
            <span className="font-semibold text-white">
              {ROLEPLAY_MODES.find((m) => m.id === currentMode)?.label}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {isModeSelectorOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-60 rounded-2xl bg-[#121724] border border-zinc-800 shadow-2xl p-1.5 z-40 space-y-1 animate-fade-in">
              <span className="text-[10px] uppercase font-bold text-zinc-500 px-2 py-1 block">
                Escolha o modo da interação:
              </span>
              {ROLEPLAY_MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectMode(m.id)}
                  className={`w-full p-2 rounded-xl text-left flex items-start space-x-2 transition-all cursor-pointer ${
                    currentMode === m.id
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'hover:bg-zinc-800 text-zinc-300'
                  }`}
                >
                  <span className="text-base">{m.icon}</span>
                  <div>
                    <span className="font-bold text-xs block">{m.label}</span>
                    <span className="text-[10px] text-zinc-400 leading-tight block">
                      {m.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Affinity Score Bar */}
        <div className="flex items-center space-x-2">
          {affinityGainedFlash && (
            <span className="text-[10px] font-bold text-rose-400 animate-bounce">
              +Afinidade!
            </span>
          )}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] text-zinc-400 font-medium">Afinidade:</span>
            <div className="w-16 h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${affinityScore}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-rose-400">{affinityScore}%</span>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="bg-rose-950/40 border-b border-rose-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-rose-200">
          <span>Tem certeza que deseja apagar o histórico deste chat?</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleClearChat}
              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold"
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {errorBanner && (
        <div className="bg-rose-900/60 border-b border-rose-500/40 px-4 py-2 flex items-center justify-between text-xs text-rose-200">
          <span>{errorBanner}</span>
          <button
            onClick={() => setErrorBanner('')}
            className="text-xs font-bold underline ml-2"
          >
            OK
          </button>
        </div>
      )}

      {/* Discreet Ad Banner */}
      <AdBanner onWatchRewardedAd={onOpenCredits} variant="compact" />

      {/* Messages Scroll Area */}
      <main className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
        {/* Character introduction header card in stream */}
        <div className="p-4 rounded-3xl bg-gradient-to-b from-zinc-900/80 to-[#10141f] border border-zinc-800/80 text-center max-w-sm mx-auto my-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-2 ring-2 ring-rose-500/30 shadow-lg">
            <img
              src={character.avatar}
              alt={character.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">{character.name}</h3>
          <p className="text-xs text-zinc-400 mt-1 italic">"{character.description}"</p>
          <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
            {character.personality.map((trait, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium border border-zinc-700/50"
              >
                #{trait}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">
            Início da conversa com {character.name}. Suas memórias são salvas automaticamente.
          </p>
        </div>

        {/* Message Bubbles */}
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const isLast = index === messages.length - 1;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div
                className={`flex items-end space-x-2 max-w-[85%] sm:max-w-[75%] ${
                  isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                }`}
              >
                {/* Mini avatar for AI */}
                {!isUser && (
                  <div
                    onClick={onOpenProfile}
                    className="w-7 h-7 rounded-xl overflow-hidden shrink-0 cursor-pointer ring-1 ring-white/10"
                  >
                    <img
                      src={character.avatar}
                      alt={character.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                )}

                {/* Speech Bubble */}
                <div
                  className={`relative p-3.5 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-md ${
                    isUser
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-br-xs'
                      : 'bg-[#151a26] text-zinc-200 border border-zinc-800/80 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Actions footer for AI message */}
                  {!isUser && (
                    <div className="mt-2 pt-1.5 border-t border-zinc-800/60 flex items-center justify-between gap-3 text-[10px] text-zinc-500">
                      <span className="text-[10px] text-zinc-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                          title="Copiar texto"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>

                        {isLast && (
                          <button
                            onClick={handleRegenerate}
                            disabled={isTyping}
                            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                            title="Regenerar resposta"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Story Choice Buttons (if provided) */}
              {!isUser && isLast && msg.roleplayChoices && msg.roleplayChoices.length > 0 && (
                <div className="mt-2 pl-9 flex flex-wrap gap-1.5 animate-fade-in">
                  {msg.roleplayChoices.map((choice, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => handleSend(choice)}
                      disabled={isTyping}
                      className="text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-950/40 to-rose-950/40 hover:from-purple-900/60 hover:to-rose-900/60 border border-purple-500/30 text-rose-200 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                      <span>{choice}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Animation Indicator */}
        {isTyping && (
          <div className="flex items-end space-x-2 pl-1 animate-fade-in">
            <div className="w-7 h-7 rounded-xl overflow-hidden shrink-0 ring-1 ring-white/10">
              <img
                src={character.avatar}
                alt={character.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 rounded-2xl bg-[#151a26] border border-zinc-800/80 rounded-bl-xs flex items-center space-x-1.5 text-xs text-zinc-400">
              <span className="font-semibold text-rose-300">{character.name}</span>
              <span>está digitando</span>
              <span className="flex space-x-1 ml-1">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Quick Action Chips */}
      <div className="px-3 py-1.5 bg-[#0e121c] border-t border-zinc-800/60 flex items-center space-x-1.5 overflow-x-auto no-scrollbar text-xs">
        <span className="text-[10px] text-zinc-500 uppercase font-bold shrink-0">Roleplay:</span>
        {QUICK_ACTIONS.map((action, idx) => (
          <button
            key={idx}
            onClick={() => setInput((prev) => (prev ? `${prev} ${action}` : action))}
            className="shrink-0 px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] font-medium transition-all active:scale-95 cursor-pointer"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Bottom Message Input Bar */}
      <footer className="p-3 bg-[#0f1420] border-t border-zinc-800 safe-area-pb">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          {/* Quick Credit Status button */}
          <button
            type="button"
            onClick={onOpenCredits}
            className="flex items-center space-x-1 px-2 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-amber-300 text-xs font-semibold cursor-pointer shrink-0"
            title="Ver saldo de mensagens"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">{credits}</span>
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Escreva uma mensagem para ${character.name}...`}
              disabled={isTyping}
              className="w-full py-2.5 pl-3 pr-9 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-rose-500/60 transition-colors"
            />
            <button
              type="button"
              onClick={() => setInput((prev) => prev + ' ✨')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {/* Send Button */}
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-md shadow-rose-950/60 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
            title="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </footer>
    </div>
  );
};

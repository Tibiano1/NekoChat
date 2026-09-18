import React, { useState } from 'react';
import {
  User,
  Heart,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  Settings,
  Edit2,
  Check,
  Star,
  Bell,
  Volume2,
  Moon,
  Info,
  Trash2,
} from 'lucide-react';
import { UserProfile, Character, Conversation } from '../types';

interface ProfileScreenProps {
  user: UserProfile | null;
  characters: Character[];
  conversations: Conversation[];
  onOpenCredits: () => void;
  onOpenCreator: () => void;
  onOpenChat: (character: Character) => void;
  onUpdateUserName: (name: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  characters,
  conversations,
  onOpenCredits,
  onOpenCreator,
  onOpenChat,
  onUpdateUserName,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || 'Lucas');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [typingEffects, setTypingEffects] = useState(true);
  const [settingsNotice, setSettingsNotice] = useState('');

  const myCreated = characters.filter((c) => c.isCustom);
  const myFavorites = characters.filter((c) => user?.favorites.includes(c.id));

  const maxCredits = user?.maxDailyCredits || 20;
  const remaining = user?.credits ?? 20;
  const messagesUsedToday = Math.max(0, maxCredits - remaining);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateUserName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  const handleToggleSound = () => {
    setSoundEnabled(!soundEnabled);
    setSettingsNotice('Configuração de som atualizada!');
    setTimeout(() => setSettingsNotice(''), 3000);
  };

  const handleToggleTyping = () => {
    setTypingEffects(!typingEffects);
    setSettingsNotice('Efeito de digitação atualizado!');
    setTimeout(() => setSettingsNotice(''), 3000);
  };

  return (
    <div id="profile-screen" className="pb-28 max-w-2xl mx-auto px-4 pt-4 space-y-6">
      {/* Settings Toast */}
      {settingsNotice && (
        <div className="p-3 rounded-2xl bg-zinc-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center shadow-lg animate-fade-in">
          {settingsNotice}
        </div>
      )}

      {/* Profile Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-zinc-900/90 to-[#101420] border border-zinc-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar */}
          <div className="relative w-20 h-20 rounded-3xl overflow-hidden ring-4 ring-rose-500/20 shadow-xl bg-zinc-800 shrink-0">
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
              }
              alt={user?.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full ring-2 ring-[#101420]" />
          </div>

          {/* User Details */}
          <div className="text-center sm:text-left flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="text-lg font-bold bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-lg text-white"
                  />
                  <button
                    onClick={handleSaveName}
                    className="p-1.5 rounded-lg bg-rose-600 text-white cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-black text-white tracking-tight">{user?.name}</h2>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    title="Editar nome"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            <p className="text-xs text-zinc-400 mt-0.5">
              Membro NekoChat AI • Conta Gratuita
            </p>

            <div className="mt-2.5 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Plano Gratuito
              </span>
              <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Maior de 18 anos</span>
              </span>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Daily Free Messages Quota Section (Requirement 8 & 11) */}
      <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">
              Limite Diário de Mensagens
            </h3>
          </div>
          <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
            {remaining} restantes
          </span>
        </div>

        {/* Required String from User Prompt: "Mensagens hoje: X / 20" */}
        <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-lg font-black text-white">
              Mensagens hoje: {messagesUsedToday} / {maxCredits}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              Mensagens restantes: <strong className="text-zinc-200">{remaining}</strong>
            </p>
          </div>

          <div className="w-full sm:w-48 bg-zinc-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (messagesUsedToday / maxCredits) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Personagens Favoritos Section (Requirement 11) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-tight">
              Personagens Favoritos ({myFavorites.length})
            </h3>
          </div>
        </div>

        {myFavorites.length === 0 ? (
          <div className="p-4 rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 text-center text-xs text-zinc-400">
            Você ainda não favoritou nenhum personagem.
            <p className="text-[11px] text-zinc-500 mt-1">
              Toque no ícone de coração nos cards para salvar seus favoritos aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myFavorites.map((char) => (
              <div
                key={char.id}
                className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 flex items-center justify-between gap-3 hover:border-rose-500/30 transition-all"
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <img
                    src={char.avatar}
                    alt={char.name}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                  <div className="truncate">
                    <span className="text-sm font-bold text-white block truncate">{char.name}</span>
                    <span className="text-[11px] text-zinc-400 block truncate">
                      {char.personality.slice(0, 2).join(', ')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChat(char)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shrink-0 transition-all cursor-pointer active:scale-95"
                >
                  Conversar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configurações Section (Requirement 11) */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-tight">
            Configurações
          </h3>
        </div>

        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 divide-y divide-zinc-800/80 overflow-hidden">
          {/* Dark Mode */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Moon className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">Modo Escuro</span>
                <span className="text-[10px] text-zinc-500">Padrão ativo para conforto visual</span>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
              Ativado
            </span>
          </div>

          {/* Sound toggle */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Volume2 className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">Sons do Aplicativo</span>
                <span className="text-[10px] text-zinc-500">Efeitos ao enviar e receber mensagens</span>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? 'bg-rose-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  soundEnabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Typing animation effect toggle */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">Efeito de Digitação</span>
                <span className="text-[10px] text-zinc-500">Exibir indicador animado quando a IA responde</span>
              </div>
            </div>
            <button
              onClick={handleToggleTyping}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                typingEffects ? 'bg-rose-600' : 'bg-zinc-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  typingEffects ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* About */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Info className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="text-xs font-semibold text-zinc-200 block">Sobre o NekoChat AI</span>
                <span className="text-[10px] text-zinc-500">Versão 1.0.0 • Mobile-First MVP</span>
              </div>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">v1.0.0</span>
          </div>
        </div>
      </div>

      {/* Safety & Compliance Card */}
      <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-400 space-y-1.5">
        <div className="flex items-center space-x-2 text-zinc-200 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Diretrizes e Segurança NekoChat AI</span>
        </div>
        <p className="text-[11px] leading-relaxed text-zinc-400">
          Todos os personagens neste aplicativo são entidades virtuais adultas fictícias (18+). As
          interações simulam diálogos para entretenimento, amizade, romance e histórias de fantasia.
        </p>
      </div>
    </div>
  );
};

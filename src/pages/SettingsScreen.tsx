import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Volume2,
  Moon,
  Sparkles,
  ShieldCheck,
  Trash2,
  Check,
  Edit2,
  Info,
  Layers,
  Bell,
  Mic,
  MessageSquare,
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsScreenProps {
  user: UserProfile | null;
  onUpdateUserName: (name: string) => void;
  onOpenCredits: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  onUpdateUserName,
  onOpenCredits,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || 'Viajante');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [saveNotice, setSaveNotice] = useState('');

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateUserName(nameInput.trim());
      setIsEditingName(false);
      setSaveNotice('Nome atualizado com sucesso!');
      setTimeout(() => setSaveNotice(''), 3000);
    }
  };

  return (
    <div id="settings-screen" className="pb-28 max-w-xl mx-auto px-4 pt-4 space-y-6 animate-fade-in text-zinc-100">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
          <SettingsIcon className="w-4 h-4" />
          <span>Configurações do Aplicativo</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Preferências e Conta
        </h1>
        <p className="text-xs text-zinc-400">
          Personalize seu perfil para as conversas e ajuste as opções de experiência.
        </p>
      </div>

      {saveNotice && (
        <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
          <Check className="w-4 h-4" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* User Name in Roleplay */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0f1420] border border-zinc-800 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Seu Nome no Chat</h3>
              <p className="text-xs text-zinc-400">
                Como as personagens chamam você durante as conversas
              </p>
            </div>
          </div>
        </div>

        {isEditingName ? (
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              maxLength={24}
              placeholder="Digite seu nome..."
              className="flex-1 py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-rose-500"
            />
            <button
              onClick={handleSaveName}
              className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
            >
              Salvar
            </button>
            <button
              onClick={() => {
                setNameInput(user?.name || 'Viajante');
                setIsEditingName(false);
              }}
              className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-bold text-rose-300">
              {user?.name || 'Viajante'}
            </span>
            <button
              onClick={() => setIsEditingName(true)}
              className="py-1.5 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center space-x-1.5 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Editar</span>
            </button>
          </div>
        )}
      </div>

      {/* Experience Controls */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0f1420] border border-zinc-800 space-y-4 shadow-lg">
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Experiência e Interface
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-4 h-4 text-zinc-400" />
            <div>
              <p className="text-xs font-bold text-white">Efeitos Sonoros</p>
              <p className="text-[11px] text-zinc-400">Sons suaves ao enviar e receber mensagens</p>
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              soundEnabled ? 'bg-rose-600' : 'bg-zinc-800'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                soundEnabled ? 'left-5.5' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Moon className="w-4 h-4 text-zinc-400" />
            <div>
              <p className="text-xs font-bold text-white">Modo Escuro (Padrão)</p>
              <p className="text-[11px] text-zinc-400">Otimizado para economia de bateria e conforto visual</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-400">Ativo</span>
        </div>
      </div>

      {/* Safety & Adult 18+ Verification Note */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/90 space-y-2">
        <div className="flex items-center space-x-2 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Diretrizes e Segurança 18+
          </h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Todas as personagens do NekoChat AI são estritamente fictícias e maiores de 18 anos. O foco do aplicativo é entretenimento interativo, amizade, roleplay e romance virtual seguro.
        </p>
      </div>

      {/* Architecture for Expansion (Requirement 10) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
        <div className="flex items-center space-x-2 text-purple-400">
          <Layers className="w-4 h-4" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Estrutura para Expansão Futura
          </h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          O NekoChat AI foi construído com arquitetura modular preparada para suporte a:
        </p>
        <ul className="text-xs text-zinc-300 space-y-1.5 pl-1">
          <li className="flex items-center space-x-2">
            <span className="text-rose-400">•</span>
            <span>Novas personagens e criação personalizada</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-rose-400">•</span>
            <span>Memória contínua e níveis de relacionamento</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-rose-400">•</span>
            <span>Geração de imagens e mensagens de voz</span>
          </li>
          <li className="flex items-center space-x-2">
            <span className="text-rose-400">•</span>
            <span>Planos de assinatura e notificações</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

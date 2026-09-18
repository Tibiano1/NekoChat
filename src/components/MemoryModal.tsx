import React, { useState, useEffect } from 'react';
import { X, Brain, Trash2, Sparkles, Check, Info, ShieldAlert } from 'lucide-react';
import { Character, UserMemory } from '../types';
import { fetchUserMemories, deleteUserMemory } from '../services/api';

interface MemoryModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  character,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !character) return null;

  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteSuccess, setDeleteSuccess] = useState('');

  const loadMemories = async () => {
    try {
      setLoading(true);
      const data = await fetchUserMemories(character.id);
      setMemories(data);
    } catch (err) {
      console.error('Failed to load memories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, [character.id]);

  const handleDelete = async (id: string) => {
    try {
      await deleteUserMemory(id);
      setMemories((prev) => prev.filter((m) => m.id !== id));
      setDeleteSuccess('Memória apagada com sucesso');
      setTimeout(() => setDeleteSuccess(''), 2000);
    } catch (err) {
      console.error('Failed to delete memory', err);
    }
  };

  const getCategoryBadge = (cat: UserMemory['category']) => {
    switch (cat) {
      case 'name':
        return { label: 'Nome / Identidade', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' };
      case 'preference':
        return { label: 'Preferência', color: 'bg-pink-500/10 text-pink-300 border-pink-500/20' };
      case 'interest':
        return { label: 'Interesse / Hobby', color: 'bg-purple-500/10 text-purple-300 border-purple-500/20' };
      case 'fact':
        return { label: 'Fato Pessoal', color: 'bg-blue-500/10 text-blue-300 border-blue-500/20' };
      case 'relationship':
        return { label: 'Relacionamento', color: 'bg-rose-500/10 text-rose-300 border-rose-500/20' };
      case 'story_event':
        return { label: 'História / Roleplay', color: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
      default:
        return { label: 'Memória', color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        id="memory-modal-container"
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto bg-[#0f141f] border border-zinc-800 rounded-3xl shadow-2xl p-5 text-zinc-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Memória de {character.name}
              </h3>
              <p className="text-[11px] text-zinc-400">
                O que ela aprendeu e lembra sobre você
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {deleteSuccess && (
          <div className="mt-3 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            {deleteSuccess}
          </div>
        )}

        {/* Explain Card */}
        <div className="mt-3 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-300 flex items-start gap-2.5 leading-relaxed">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white block">Como funciona a memória persistente:</span>
            Quando você compartilha seu nome, gostos ou histórias (ex: "gosto de Minecraft" ou "tenho um cão chamado Thor"), {character.name} guarda esses fatos para citar carinhosamente no futuro.
          </div>
        </div>

        {/* List of Memories */}
        <div className="mt-4 space-y-2.5">
          {loading ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              Carregando memórias de {character.name}...
            </div>
          ) : memories.length === 0 ? (
            <div className="py-8 text-center px-4">
              <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-zinc-300">Nenhuma memória gravada ainda</p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Converse com {character.name}, conte sobre você e seus hobbies para que ela guarde no diário dela!
              </p>
            </div>
          ) : (
            memories.map((mem) => {
              const badge = getCategoryBadge(mem.category);
              return (
                <div
                  key={mem.id}
                  className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start justify-between gap-2 hover:border-zinc-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-xs font-bold text-white">{mem.key}</span>
                    </div>
                    <p className="text-xs text-zinc-300">{mem.content}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(mem.id)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Esquecer este fato"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

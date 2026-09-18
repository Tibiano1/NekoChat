import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck, Image, Wand2, Check } from 'lucide-react';
import { Character } from '../types';

interface CharacterCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (character: Character) => void;
}

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&auto=format&fit=crop&q=80',
];

export const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [adultAge, setAdultAge] = useState(21);
  const [avatar, setAvatar] = useState(SAMPLE_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [category, setCategory] = useState<Character['category']>('Anime');
  const [description, setDescription] = useState('');
  const [personalityText, setPersonalityText] = useState('carinhosa, brincalhona, inteligente');
  const [interestsText, setInterestsText] = useState('animes, cafeterias, música, passeios noturnos');
  const [speechStyle, setSpeechStyle] = useState('Descontraída, doce, cheia de emojis e carinho.');
  const [backstory, setBackstory] = useState('Uma jovem recém-chegada à cidade procurando fazer conexões verdadeiras e viver novas histórias.');
  const [initialRelationship, setInitialRelationship] = useState('Amigável e curiosa para te conhecer.');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor, informe o nome da personagem.');
      return;
    }
    if (adultAge < 18) {
      setError('Por conformidade ética e termos, a personagem deve ter 18 anos ou mais.');
      return;
    }
    if (!description.trim()) {
      setError('Por favor, insira uma pequena descrição.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const personality = personalityText
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);

      const interests = interestsText
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      const chosenAvatar = customAvatarUrl.trim() || avatar;

      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          adultAge,
          avatar: chosenAvatar,
          category,
          description: description.trim(),
          personality,
          interests,
          speechStyle: speechStyle.trim(),
          backstory: backstory.trim(),
          initialRelationship: initialRelationship.trim(),
          isPublic,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Erro ao criar personagem');
      }

      const newChar = await res.json();
      onCreated(newChar);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha ao criar personagem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        id="character-creator-modal-container"
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0f141f] border border-zinc-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-zinc-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Criar Personagem de IA</h3>
              <p className="text-xs text-zinc-400">Configure a personalidade e a história única da sua IA</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-2">
              Escolha o Avatar Anime
            </label>
            <div className="grid grid-cols-6 gap-2 mb-2">
              {SAMPLE_AVATARS.map((imgUrl, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    setAvatar(imgUrl);
                    setCustomAvatarUrl('');
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    avatar === imgUrl && !customAvatarUrl
                      ? 'border-rose-500 ring-2 ring-rose-500/40 scale-105'
                      : 'border-zinc-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="avatar option" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  {avatar === imgUrl && !customAvatarUrl && (
                    <span className="absolute inset-0 bg-rose-500/30 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow" />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <input
              type="url"
              value={customAvatarUrl}
              onChange={(e) => setCustomAvatarUrl(e.target.value)}
              placeholder="Ou cole a URL de uma imagem personalizada..."
              className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500/60"
            />
          </div>

          {/* Name & Adult Age */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-zinc-300 mb-1">
                Nome da Personagem *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Kasumi, Rin, Chloe..."
                required
                className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500/60"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Idade (18+)</span>
              </label>
              <input
                type="number"
                min={18}
                max={99}
                value={adultAge}
                onChange={(e) => setAdultAge(Number(e.target.value))}
                required
                className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-rose-500/60"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">Categoria Principal</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-rose-500/60 cursor-pointer"
            >
              <option value="Anime">Anime</option>
              <option value="Romance">Romance</option>
              <option value="Fantasia">Fantasia</option>
              <option value="Aventura">Aventura</option>
              <option value="Gamer">Gamer</option>
              <option value="Mistério">Mistério</option>
              <option value="Comédia">Comédia</option>
              <option value="Sci-fi">Sci-fi</option>
            </select>
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Pequena Descrição *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Uma garota energética que adora videogames e café com canela."
              required
              className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500/60"
            />
          </div>

          {/* Personality Traits */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Traços de Personalidade (separados por vírgula)
            </label>
            <input
              type="text"
              value={personalityText}
              onChange={(e) => setPersonalityText(e.target.value)}
              placeholder="Ex: extrovertida, fofa, provocadora, carinhosa"
              className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500/60"
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Interesses & Hobbies (separados por vírgula)
            </label>
            <input
              type="text"
              value={interestsText}
              onChange={(e) => setInterestsText(e.target.value)}
              placeholder="Ex: desenhar, rock japonês, astronomia, doces"
              className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500/60"
            />
          </div>

          {/* Speech Style */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              Estilo de Fala & Humor
            </label>
            <textarea
              rows={2}
              value={speechStyle}
              onChange={(e) => setSpeechStyle(e.target.value)}
              placeholder="Ex: Gosta de usar emojis, fala com entusiasmo e brinca com o usuário."
              className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500/60 resize-none"
            />
          </div>

          {/* Backstory */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 mb-1">
              História e Passado
            </label>
            <textarea
              rows={2}
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              placeholder="Conte um pouco sobre as origens e objetivos da personagem..."
              className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-rose-500/60 resize-none"
            />
          </div>

          {/* Public / Private toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <div>
              <span className="text-xs font-bold text-zinc-200 block">Personagem Pública</span>
              <span className="text-[11px] text-zinc-400">
                Outros usuários poderão descobrir e conversar com ela
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              id="btn-submit-character-creation"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-rose-950/60 transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Gerando IA...' : 'Dar Vida à Personagem'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

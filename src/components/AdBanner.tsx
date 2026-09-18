import React from 'react';
import { Film, Sparkles, X, ExternalLink } from 'lucide-react';

interface AdBannerProps {
  onWatchRewardedAd?: () => void;
  variant?: 'compact' | 'card';
}

export const AdBanner: React.FC<AdBannerProps> = ({
  onWatchRewardedAd,
  variant = 'compact',
}) => {
  if (variant === 'compact') {
    return (
      <div className="w-full px-3 py-1.5 bg-gradient-to-r from-zinc-900 via-purple-950/20 to-zinc-900 border-y border-zinc-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 shrink-0">
            Ad
          </span>
          <p className="text-zinc-400 text-[11px] truncate">
            ✨ Desbloqueie mensagens ilimitadas e sem anúncios no <strong className="text-rose-400">VIP</strong>
          </p>
        </div>

        {onWatchRewardedAd && (
          <button
            onClick={onWatchRewardedAd}
            className="shrink-0 ml-2 text-[10px] font-bold px-2 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
          >
            <Film className="w-3 h-3 text-rose-400" />
            <span>+5 msgs</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-zinc-900 via-rose-950/20 to-purple-950/30 border border-zinc-800 flex items-center justify-between gap-3 shadow-md my-2">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              Patrocinado
            </span>
            <span className="text-xs font-bold text-white">NekoChat Club VIP</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Roleplay ilimitado, vozes de IA e conexões sem limites.
          </p>
        </div>
      </div>

      {onWatchRewardedAd && (
        <button
          onClick={onWatchRewardedAd}
          className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-bold shadow transition-all active:scale-95 cursor-pointer flex items-center space-x-1"
        >
          <Film className="w-3.5 h-3.5" />
          <span>+5 msgs</span>
        </button>
      )}
    </div>
  );
};

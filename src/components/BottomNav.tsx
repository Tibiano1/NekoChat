import React from 'react';
import { LayoutGrid, Star, Settings } from 'lucide-react';

export type TabType = 'catalog' | 'favorites' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  favoritesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  favoritesCount = 0,
}) => {
  const tabs = [
    {
      id: 'catalog' as TabType,
      label: 'Catálogo',
      icon: LayoutGrid,
    },
    {
      id: 'favorites' as TabType,
      label: 'Favoritos',
      icon: Star,
      badge: favoritesCount,
    },
    {
      id: 'settings' as TabType,
      label: 'Configurações',
      icon: Settings,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0b0f17]/95 backdrop-blur-lg border-t border-zinc-800/80 safe-area-pb shadow-2xl">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-rose-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 font-medium'
              }`}
            >
              {isActive && (
                <span className="absolute inset-0 bg-rose-500/10 rounded-2xl -z-10 border border-rose-500/20 animate-fade-in" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? 'scale-110 stroke-[2.4] ' + (tab.id === 'favorites' ? 'fill-amber-400 text-amber-400' : '')
                      : 'stroke-[1.8]'
                  }`}
                />
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 bg-gradient-to-r from-rose-500 to-pink-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center ring-2 ring-[#0b0f17]">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

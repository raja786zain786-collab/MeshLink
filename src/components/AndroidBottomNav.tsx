import React from 'react';
import { MessageSquare, Bluetooth, Share2, Phone, Settings } from 'lucide-react';

export type MainTab = 'conversations' | 'discovery' | 'relay' | 'calls' | 'settings';

interface AndroidBottomNavProps {
  currentTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  unreadCount?: number;
}

export const AndroidBottomNav: React.FC<AndroidBottomNavProps> = ({
  currentTab,
  onSelectTab,
  unreadCount = 0,
}) => {
  const tabs: { id: MainTab; label: string; icon: React.ElementType }[] = [
    { id: 'conversations', label: 'Chats', icon: MessageSquare },
    { id: 'discovery', label: 'Nearby', icon: Bluetooth },
    { id: 'relay', label: 'Relay', icon: Share2 },
    { id: 'calls', label: 'Calls', icon: Phone },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#1f2c34] border-t border-[#222e35] text-[#8696a0] max-w-2xl mx-auto shadow-2xl">
      <div className="grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full transition-colors relative ${
                isActive ? 'text-[#00a884] font-bold' : 'text-[#8696a0] hover:text-[#d1d7db]'
              }`}
            >
              <div
                className={`flex items-center justify-center w-12 h-7 rounded-full transition-all ${
                  isActive ? 'bg-[#00a884]/20 text-[#00a884]' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium tracking-tight mt-0.5">{tab.label}</span>
              {tab.id === 'conversations' && unreadCount > 0 && (
                <span className="absolute top-2 right-4 min-w-4 h-4 px-1 bg-[#00a884] text-[#111b21] font-bold text-[10px] rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-[#00a884] border border-[#00a884]/60 px-3.5 py-2 text-xs font-medium text-[#111b21] shadow-xl backdrop-blur-sm font-sans animate-fade-in">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — MeshLink runs 100% locally with zero internet.</span>
    </div>
  );
};

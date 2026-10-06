import React, { useState, useEffect } from 'react';
import { Menu, Maximize2, Minimize2, Waves, Clock } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { useHaptic } from '../hooks/useHaptic';

interface HeaderProps {
  onOpenSettings: () => void;
  version: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, version }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const { light } = useHaptic();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const s = now.getSeconds().toString().padStart(2, '0');
      setCurrentTime(`${h}:${m}:${s}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    light();
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen toggle not permitted or supported:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-cyan-800/50 shadow-xs px-2 sm:px-4 py-1.5 sm:py-2">
      <div className="flex items-center justify-between gap-1.5 max-w-7xl mx-auto">
        {/* Left: Hamburger menu + Title + Version */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
          <button
            onClick={() => {
              light();
              onOpenSettings();
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 active:bg-cyan-950 transition border border-transparent hover:border-cyan-700/50 active:scale-95 shrink-0"
            aria-label="設定メニューを開く"
            title="設定メニュー"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xs shadow-cyan-500/30 shrink-0">
              <Waves className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="flex items-baseline gap-1 sm:gap-2 min-w-0">
              <h1 className="text-xs sm:text-base font-black tracking-tight text-white flex items-center truncate">
                <span className="text-cyan-400">トーイン</span>
                <span>コントローラー</span>
              </h1>
              <span className="text-[9px] sm:text-xs font-bold px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-mono shrink-0">
                {version ? `v${version}` : 'v1.7'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Clock + PWA Install + Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Live operating clock */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-mono text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{currentTime || '--:--:--'}</span>
          </div>

          <PWAInstallButton />

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-slate-800/80 hover:bg-slate-700 active:bg-cyan-950 text-slate-300 hover:text-white border border-slate-700 transition active:scale-95"
            title={isFullscreen ? '全画面表示を終了' : '全画面表示'}
            aria-label="全画面表示切替"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

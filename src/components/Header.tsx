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
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-cyan-800/50 shadow-md px-3 sm:px-5 py-2.5">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Hamburger menu + Title + Version */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              light();
              onOpenSettings();
            }}
            className="p-2 -ml-1 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 active:bg-cyan-950 transition border border-transparent hover:border-cyan-700/50 active:scale-95"
            aria-label="設定メニューを開く"
            title="設定メニュー"
          >
            <Menu className="w-5 h-5 text-cyan-400" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xs shadow-cyan-500/30">
              <Waves className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center">
                <span className="text-cyan-400">トーイン</span>
                <span>コントローラー</span>
              </h1>
              <span className="text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-mono">
                {version ? `v${version}` : 'v1.6'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Clock + PWA Install + Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Live operating clock */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-mono text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>{currentTime || '--:--:--'}</span>
          </div>

          <PWAInstallButton />

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:bg-cyan-950 text-slate-300 hover:text-white border border-slate-700 transition active:scale-95"
            title={isFullscreen ? '全画面表示を終了' : '全画面表示'}
            aria-label="全画面表示切替"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-slate-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

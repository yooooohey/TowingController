import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-white shadow transition-all active:scale-95 border border-cyan-400/40"
        title="アプリをホーム画面・端末にインストール"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">アプリをインストール</span>
        <span className="sm:hidden">インストール</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-cyan-300 border border-cyan-500/30 shadow transition active:scale-95"
          title="ホーム画面に追加"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ホーム画面に追加</span>
          <span className="sm:hidden">追加</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">iPhone / iPad に追加</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-sm text-slate-300 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <p className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-900 text-cyan-300 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
                  <span>Safari下部または上部の<strong>「共有」</strong>ボタン（四角から矢印のアイコン）をタップします。</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-900 text-cyan-300 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">2</span>
                  <span>メニューをスクロールし<strong>「ホーム画面に追加」</strong>を選択します。</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-900 text-cyan-300 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">3</span>
                  <span>右上の<strong>「追加」</strong>をタップすると、全画面で起動できるアイコンが追加されます。</span>
                </p>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-cyan-600 hover:bg-cyan-500 py-2.5 text-sm font-semibold text-white transition active:scale-98 shadow"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

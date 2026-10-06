import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  Anchor,
  User,
  Ship,
  Sparkles,
} from 'lucide-react';
import { ColumnConfig } from '../types';
import { useHaptic } from '../hooks/useHaptic';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnConfig[];
  version: string;
  onUpdateColumnsMeta: (newMeta: Array<{ id: string; staffName: string; jetName: string }>) => void;
  onResetToSampleData: () => void;
  onClearAllReservations: () => void;
  onImportData: (jsonStr: string) => boolean;
  onExportData: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  columns,
  version,
  onUpdateColumnsMeta,
  onResetToSampleData,
  onClearAllReservations,
  onImportData,
  onExportData,
}) => {
  const { light, medium, strong } = useHaptic();

  // Local state for column names
  const [columnForm, setColumnForm] = useState<
    Array<{ id: string; staffName: string; jetName: string }>
  >([]);

  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setColumnForm(
        columns.map((c) => ({
          id: c.id,
          staffName: c.staffName,
          jetName: c.jetName,
        }))
      );
      setConfirmClear(false);
      setConfirmReset(false);
    }
  }, [isOpen, columns]);

  if (!isOpen) return null;

  const handleStaffChange = (index: number, val: string) => {
    setColumnForm((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], staffName: val.toUpperCase() };
      return copy;
    });
  };

  const handleJetChange = (index: number, val: string) => {
    setColumnForm((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], jetName: val.toLowerCase() };
      return copy;
    });
  };

  const handleSaveMeta = () => {
    medium();
    onUpdateColumnsMeta(columnForm);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const ok = onImportData(text);
        if (ok) {
          strong();
          onClose();
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex bg-black/70 backdrop-blur-xs transition-opacity animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-slate-900 border-r border-cyan-800/50 h-full overflow-y-auto flex flex-col text-slate-100 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-slate-900/95 backdrop-blur-md border-b border-cyan-800/40">
          <div className="flex items-center gap-2">
            <Anchor className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-black text-white">設定・管理メニュー</h2>
          </div>
          <button
            onClick={() => {
              light();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="設定を閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-5 space-y-6 flex-1">
          {/* Section 1: Boat & Captain settings (ボート＆船長設定) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">
                  ボート＆船長設定
                </h3>
                <p className="text-[11px] text-slate-400">
                  各列のスタッフ名（大文字）とマリンジェット名（小文字）
                </p>
              </div>
              <button
                type="button"
                onClick={handleSaveMeta}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow transition active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>保存</span>
              </button>
            </div>

            {saveToast && (
              <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs text-center font-bold animate-fadeIn">
                ✓ ボート＆船長設定を保存しました
              </div>
            )}

            <div className="space-y-2.5">
              {columnForm.map((col, idx) => (
                <div
                  key={col.id}
                  className="p-3 rounded-xl bg-slate-850 border border-slate-700/80 space-y-2"
                >
                  <div className="text-[11px] font-mono font-bold text-cyan-300 flex items-center justify-between">
                    <span>列 {idx + 1}</span>
                    <span className="text-slate-400 font-normal">
                      ID: {col.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Staff name */}
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                        <User className="w-3 h-3 text-cyan-400" />
                        スタッフ名（大文字）
                      </label>
                      <input
                        type="text"
                        value={col.staffName}
                        onChange={(e) => handleStaffChange(idx, e.target.value)}
                        placeholder="KEN"
                        className="w-full h-8 px-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold uppercase focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>

                    {/* Marine jet name */}
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 flex items-center gap-1">
                        <Ship className="w-3 h-3 text-cyan-400" />
                        ジェット名（小文字）
                      </label>
                      <input
                        type="text"
                        value={col.jetName}
                        onChange={(e) => handleJetChange(idx, e.target.value)}
                        placeholder="spark 1"
                        className="w-full h-8 px-2.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-200 text-xs font-medium lowercase focus:border-cyan-400 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Data operations */}
          <section className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">
              データ管理・バックアップ
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportData}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition active:scale-95"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>JSON書き出し</span>
              </button>

              <label className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-semibold text-slate-200 transition active:scale-95 cursor-pointer">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>JSON読み込み</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Force Refresh & Clear Cache */}
            <button
              type="button"
              onClick={async () => {
                try {
                  if ('serviceWorker' in navigator) {
                    const registrations = await navigator.serviceWorker.getRegistrations();
                    for (const reg of registrations) {
                      await reg.unregister();
                    }
                  }
                  if ('caches' in window) {
                    const keys = await caches.keys();
                    for (const key of keys) {
                      await caches.delete(key);
                    }
                  }
                } catch {
                  // Ignore
                }
                window.location.reload();
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-600/70 text-xs font-bold text-cyan-200 transition active:scale-98 shadow-sm"
              title="端末に保存された古いキャッシュやPWAデータを消去して最新バージョンを読み込みます"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span>最新版へ強制更新（キャッシュ削除）</span>
            </button>

            {/* Clear today's reservations */}
            {confirmClear ? (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 space-y-2">
                <p className="text-xs text-red-200 font-bold text-center">
                  全列の予約データをすべて消去しますか？
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      strong();
                      onClearAllReservations();
                      setConfirmClear(false);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow"
                  >
                    消去を実行
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-850 hover:bg-red-950/50 border border-slate-700 hover:border-red-700/50 text-xs font-semibold text-slate-300 hover:text-red-300 transition active:scale-98"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>本日の全予約をクリア</span>
              </button>
            )}

            {/* Reset to sample data */}
            {confirmReset ? (
              <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-500/50 space-y-2">
                <p className="text-xs text-cyan-200 font-bold text-center">
                  初期サンプルデータ（4列の予約例）に戻しますか？
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      medium();
                      onResetToSampleData();
                      setConfirmReset(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow"
                  >
                    リセット実行
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-cyan-300 transition active:scale-98"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>初期サンプルデータにリセット</span>
              </button>
            )}
          </section>

          {/* Section 3: App info & Operation guidelines */}
          <section className="space-y-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>操作のヒント</span>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>予約カード長押し（0.25秒）:</strong> ドラッグして別の列へ移動（自動で時系列順に並び替え）。</li>
              <li><strong>予約カードタップ:</strong> 予約の編集・削除。</li>
              <li><strong>列ヘッダーのドラッグ:</strong> スタッフ名同士、またはジェット名同士をドラッグ＆ドロップで入れ替え。</li>
              <li><strong>新規追加ダイアログ:</strong> 時間や人数の枠を上下スワイプして即座に調整。</li>
              <li><strong>「続けて」ボタン:</strong> 15分進めて次の予約を連続で手早く登録。</li>
            </ul>

            <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
              トーインコントローラー {version ? `v${version}` : 'v1.7'} • PWA Ready
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

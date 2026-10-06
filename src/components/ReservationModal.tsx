import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Check,
  FastForward,
  ChevronUp,
  ChevronDown,
  Clock,
  Users,
  Tag,
  PenLine,
} from 'lucide-react';
import { Reservation, MenuType, MENU_DEFINITIONS } from '../types';
import { addMinutesToTime, getNextFiveMinuteTime } from '../utils/time';
import { useHaptic } from '../hooks/useHaptic';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetColumnId: string;
  targetColumnStaff: string;
  targetColumnJet: string;
  editingReservation: Reservation | null; // null if adding new
  onSave: (
    data: { time: string; pax: number; menu: MenuType; name: string },
    columnId: string,
    existingId?: string
  ) => void;
  onDelete?: (reservationId: string, columnId: string) => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  targetColumnId,
  targetColumnStaff,
  targetColumnJet,
  editingReservation,
  onSave,
  onDelete,
}) => {
  const { light, medium, strong } = useHaptic();

  // Form states
  const [time, setTime] = useState('09:00');
  const [pax, setPax] = useState(2);
  const [menu, setMenu] = useState<MenuType>('D');
  const [name, setName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Swipe gesture tracking refs for Time
  const timeSwipeStartRef = useRef<number | null>(null);
  const timeAccumulatedDeltaRef = useRef<number>(0);

  // Swipe gesture tracking refs for Pax
  const paxSwipeStartRef = useRef<number | null>(null);
  const paxAccumulatedDeltaRef = useRef<number>(0);

  // Initialize form when modal opens or editing reservation changes
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      return;
    }

    if (editingReservation) {
      setTime(editingReservation.time);
      setPax(editingReservation.pax);
      setMenu(editingReservation.menu);
      setName(editingReservation.name || '');
    } else {
      // New reservation defaults per spec:
      // - 予約時間: 現在時刻からもっとも近い「5分刻み」の時刻（切り上げ）
      // - 人数: 2名
      // - メニュー: 'D'
      // - 予約名: 空白
      setTime(getNextFiveMinuteTime());
      setPax(2);
      setMenu('D');
      setName('');
    }
    setShowDeleteConfirm(false);
  }, [isOpen, editingReservation]);

  if (!isOpen) return null;

  // Handlers for Time adjustments
  const adjustTime = (deltaMinutes: number) => {
    light();
    setTime((prev) => addMinutesToTime(prev, deltaMinutes));
  };

  // Time Swipe handlers (up swipe = increase time, down swipe = decrease time)
  const handleTimePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    timeSwipeStartRef.current = e.clientY;
    timeAccumulatedDeltaRef.current = 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleTimePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (timeSwipeStartRef.current === null) return;
    const currentY = e.clientY;
    const diff = timeSwipeStartRef.current - currentY; // positive = dragged up

    // 25px per 5-minute increment
    const threshold = 25;
    if (Math.abs(diff) >= threshold) {
      const step = diff > 0 ? 5 : -5;
      adjustTime(step);
      timeSwipeStartRef.current = currentY;
    }
  };

  const handleTimePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    timeSwipeStartRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }
  };

  // Handlers for Pax adjustments
  const adjustPax = (delta: number) => {
    light();
    setPax((prev) => Math.max(1, prev + delta));
  };

  // Pax Swipe handlers
  const handlePaxPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    paxSwipeStartRef.current = e.clientY;
    paxAccumulatedDeltaRef.current = 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePaxPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (paxSwipeStartRef.current === null) return;
    const currentY = e.clientY;
    const diff = paxSwipeStartRef.current - currentY; // positive = dragged up

    const threshold = 25;
    if (Math.abs(diff) >= threshold) {
      const step = diff > 0 ? 1 : -1;
      adjustPax(step);
      paxSwipeStartRef.current = currentY;
    }
  };

  const handlePaxPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    paxSwipeStartRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }
  };

  // Save actions
  const handleSaveAndClose = () => {
    medium();
    onSave(
      { time, pax, menu, name: name.trim() },
      targetColumnId,
      editingReservation ? editingReservation.id : undefined
    );
    onClose();
  };

  // "続けて" action (only in Add mode per spec:
  // "予約を保存し、時間を15分進めた状態でモーダルを開いたままにする（人数、メニュー、予約名は維持）。連続入力用。")
  const handleSaveAndContinue = () => {
    medium();
    onSave(
      { time, pax, menu, name: name.trim() },
      targetColumnId
    );
    // Advance time by 15 mins for the next reservation
    setTime((prev) => addMinutesToTime(prev, 15));
  };

  const handleDelete = () => {
    if (!editingReservation || !onDelete) return;
    strong();
    onDelete(editingReservation.id, targetColumnId);
    onClose();
  };

  const isEditing = !!editingReservation;
  const menuList: MenuType[] = ['D', 'M', 'U', 'J', 'X'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3.5 bg-slate-900/95 backdrop-blur-md border-b border-cyan-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-base sm:text-lg font-black text-white">
                {isEditing ? '予約の編集' : '新規予約の追加'}
              </h2>
            </div>
            <p className="text-xs text-cyan-300 font-mono mt-0.5">
              列: {targetColumnStaff} / {targetColumnJet}
            </p>
          </div>
          <button
            onClick={() => {
              light();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 sm:space-y-5">
          {/* 1. Time Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                予約時間（上下スワイプ または 5分単位）
              </label>
              <span className="text-[11px] text-cyan-400 font-medium">5分刻み</span>
            </div>

            {/* Big interactive Swipe Card for Time */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustTime(-5)}
                className="w-11 h-16 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-cyan-950 border border-slate-700 flex flex-col items-center justify-center text-slate-300 hover:text-white transition active:scale-95"
                title="-5分"
              >
                <Minus className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold">-5m</span>
              </button>

              <div
                onPointerDown={handleTimePointerDown}
                onPointerMove={handleTimePointerMove}
                onPointerUp={handleTimePointerUp}
                onPointerCancel={handleTimePointerUp}
                className="flex-1 h-16 rounded-xl bg-slate-800/90 border-2 border-cyan-500/40 hover:border-cyan-400 flex items-center justify-between px-3 select-none cursor-ns-resize shadow-inner relative group"
                style={{ touchAction: 'none' }}
              >
                <div className="flex flex-col items-center justify-center text-cyan-400/80">
                  <ChevronUp className="w-4 h-4" />
                  <ChevronDown className="w-4 h-4 -mt-1" />
                </div>

                <div className="text-center font-mono font-black text-2xl sm:text-3xl text-white tracking-wider">
                  {time}
                </div>

                {/* Native time input button trigger */}
                <input
                  type="time"
                  step="300"
                  value={time}
                  onChange={(e) => {
                    if (e.target.value) {
                      setTime(e.target.value);
                      light();
                    }
                  }}
                  className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                  title="直接入力"
                />

                <span className="text-[10px] text-cyan-300/80 font-mono bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                  SWIPE↕
                </span>
              </div>

              <button
                type="button"
                onClick={() => adjustTime(5)}
                className="w-11 h-16 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-cyan-950 border border-slate-700 flex flex-col items-center justify-center text-slate-300 hover:text-white transition active:scale-95"
                title="+5分"
              >
                <Plus className="w-5 h-5" />
                <span className="text-[10px] font-mono font-bold">+5m</span>
              </button>
            </div>

            {/* Quick time adjustment pills */}
            <div className="grid grid-cols-4 gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => adjustTime(-15)}
                className="py-1 px-2 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono transition active:scale-95 border border-slate-700"
              >
                -15分
              </button>
              <button
                type="button"
                onClick={() => adjustTime(-5)}
                className="py-1 px-2 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono transition active:scale-95 border border-slate-700"
              >
                -5分
              </button>
              <button
                type="button"
                onClick={() => adjustTime(5)}
                className="py-1 px-2 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono transition active:scale-95 border border-slate-700"
              >
                +5分
              </button>
              <button
                type="button"
                onClick={() => adjustTime(15)}
                className="py-1 px-2 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-mono transition active:scale-95 border border-slate-700"
              >
                +15分
              </button>
            </div>
          </div>

          {/* 2. Pax (人数) Input Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                人数（上下スワイプ または 1人単位）
              </label>
              <span className="text-[11px] text-cyan-400 font-medium">最小 1名</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustPax(-1)}
                disabled={pax <= 1}
                className="w-11 h-14 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-40 disabled:hover:bg-slate-800 active:bg-cyan-950 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition active:scale-95"
                title="-1名"
              >
                <Minus className="w-5 h-5" />
              </button>

              <div
                onPointerDown={handlePaxPointerDown}
                onPointerMove={handlePaxPointerMove}
                onPointerUp={handlePaxPointerUp}
                onPointerCancel={handlePaxPointerUp}
                className="flex-1 h-14 rounded-xl bg-slate-800/90 border-2 border-cyan-500/40 hover:border-cyan-400 flex items-center justify-between px-3 select-none cursor-ns-resize shadow-inner"
                style={{ touchAction: 'none' }}
              >
                <div className="flex flex-col items-center justify-center text-cyan-400/80">
                  <ChevronUp className="w-3.5 h-3.5" />
                  <ChevronDown className="w-3.5 h-3.5 -mt-1" />
                </div>

                <div className="text-center font-mono font-black text-2xl text-white">
                  {pax} <span className="text-base font-normal text-slate-300">名</span>
                </div>

                <span className="text-[10px] text-cyan-300/80 font-mono bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                  SWIPE↕
                </span>
              </div>

              <button
                type="button"
                onClick={() => adjustPax(1)}
                className="w-11 h-14 rounded-xl bg-slate-800 hover:bg-slate-750 active:bg-cyan-950 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition active:scale-95"
                title="+1名"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Pax selector buttons */}
            <div className="grid grid-cols-6 gap-1.5 mt-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    light();
                    setPax(num);
                  }}
                  className={`py-1 text-xs rounded-lg font-mono font-bold transition active:scale-95 border ${
                    pax === num
                      ? 'bg-cyan-600 text-white border-cyan-400 ring-2 ring-cyan-400/30'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {num}名
                </button>
              ))}
            </div>
          </div>

          {/* 3. Menu Selection (D, M, U, J, X) with exact spec colors */}
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              メニュー選択
            </label>

            <div className="grid grid-cols-5 gap-2">
              {menuList.map((code) => {
                const info = MENU_DEFINITIONS[code];
                const isSelected = menu === code;

                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      light();
                      setMenu(code);
                    }}
                    className={`h-14 rounded-xl flex flex-col items-center justify-center transition-all border font-mono font-black ${
                      info.bgColor
                    } ${info.textColor} ${
                      isSelected
                        ? 'ring-4 ring-cyan-400 scale-105 shadow-lg border-white'
                        : 'opacity-70 hover:opacity-100 border-transparent hover:scale-102'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl">{code}</span>
                    <span className="text-[9px] font-bold tracking-tight opacity-90 truncate max-w-full px-1">
                      {code === 'D' && '黄'}
                      {code === 'M' && '赤'}
                      {code === 'U' && '青'}
                      {code === 'J' && '緑'}
                      {code === 'X' && '黒'}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              選択中: <strong className="text-white">{MENU_DEFINITIONS[menu].name}</strong> — {MENU_DEFINITIONS[menu].description}
            </p>
          </div>

          {/* 4. Guest Name Input (予約名: 任意) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <PenLine className="w-3.5 h-3.5 text-cyan-400" />
                予約名・メモ（任意）
              </label>
              {name && (
                <button
                  type="button"
                  onClick={() => setName('')}
                  className="text-[11px] text-slate-400 hover:text-white"
                >
                  クリア
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="例: 佐藤様、ホテル手配など"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder-slate-500 text-sm outline-hidden transition"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 z-10 p-4 sm:p-5 bg-slate-900/95 backdrop-blur-md border-t border-cyan-800/40 space-y-2">
          {showDeleteConfirm ? (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 space-y-2.5 animate-fadeIn">
              <p className="text-xs text-red-200 text-center font-bold">
                この予約（{time} - {pax}名 - {menu}）を削除しますか？
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition shadow"
                >
                  はい、削除する
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      light();
                      setShowDeleteConfirm(true);
                    }}
                    className="p-3 rounded-xl bg-red-950/80 hover:bg-red-900/90 text-red-400 hover:text-red-300 border border-red-800/60 transition active:scale-95"
                    title="予約を削除"
                    aria-label="削除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAndClose}
                    className="flex-1 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/50 transition active:scale-98"
                  >
                    <Check className="w-5 h-5" />
                    <span>保存する</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleSaveAndContinue}
                    className="flex-1 py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-cyan-950 text-cyan-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border border-cyan-700/60 transition active:scale-98"
                    title="保存して時間を15分進めて続けて入力"
                  >
                    <FastForward className="w-4 h-4 text-cyan-400" />
                    <span>続けて入力（+15分）</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAndClose}
                    className="flex-1 py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-950/50 transition active:scale-98"
                  >
                    <Check className="w-4 h-4" />
                    <span>保存する</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

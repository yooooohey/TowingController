import React, { useRef } from 'react';
import { Users, Clock } from 'lucide-react';
import { Reservation, MENU_DEFINITIONS } from '../types';

interface ReservationCardProps {
  reservation: Reservation;
  columnId: string;
  isDragging?: boolean;
  onSelect: (reservation: Reservation, columnId: string) => void;
  onPointerStartDrag?: (
    reservation: Reservation,
    columnId: string,
    initialEvent: React.PointerEvent<HTMLDivElement>
  ) => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  columnId,
  isDragging = false,
  onSelect,
  onPointerStartDrag,
}) => {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasTriggeredDragRef = useRef(false);

  const menuInfo = MENU_DEFINITIONS[reservation.menu] || MENU_DEFINITIONS.D;

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Left click or touch only
    if (e.button !== 0) return;

    startPosRef.current = { x: e.clientX, y: e.clientY };
    hasTriggeredDragRef.current = false;

    // Start 250ms long press timer for drag initiation
    longPressTimerRef.current = setTimeout(() => {
      hasTriggeredDragRef.current = true;
      if (onPointerStartDrag) {
        onPointerStartDrag(reservation, columnId, e);
      }
    }, 250);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (longPressTimerRef.current && !hasTriggeredDragRef.current) {
      const dist = Math.hypot(
        e.clientX - startPosRef.current.x,
        e.clientY - startPosRef.current.y
      );
      // Cancel long-press if moved more than 8px (indicates user is scrolling)
      if (dist > 8) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If long-press drag didn't fire, this was a short tap -> open Edit Modal
    if (!hasTriggeredDragRef.current) {
      onSelect(reservation, columnId);
    }
    hasTriggeredDragRef.current = false;
  };

  const handlePointerCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    hasTriggeredDragRef.current = false;
  };

  return (
    <div
      data-card-id={reservation.id}
      data-column-id={columnId}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={`relative w-full rounded-xl p-3 select-none transition-all cursor-pointer border ${
        isDragging
          ? 'opacity-30 scale-95 border-dashed border-cyan-400 bg-slate-800/40'
          : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80 hover:border-cyan-500/50 shadow-md hover:shadow-cyan-950/40 active:scale-[0.98]'
      }`}
      style={{ touchAction: 'pan-y' }}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Time display */}
        <div className="flex items-center gap-1.5 font-mono font-bold text-base sm:text-lg text-white">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
          <span>{reservation.time}</span>
        </div>

        {/* Menu badge: D (Yellow), M (Red), U (Blue), J (Green), X (Black) */}
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-black text-sm sm:text-base shadow-sm border ${menuInfo.bgColor} ${menuInfo.textColor} ${menuInfo.borderColor}`}
          title={`${menuInfo.code}: ${menuInfo.description}`}
        >
          {menuInfo.code}
        </div>
      </div>

      {/* Guest Name & Pax row */}
      <div className="mt-2 flex items-center justify-between gap-1 text-xs sm:text-sm">
        <div className="truncate font-medium text-slate-200 pr-1">
          {reservation.name ? (
            <span className="text-white font-semibold">{reservation.name}</span>
          ) : (
            <span className="text-slate-400 italic">（予約名なし）</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-700/80 text-cyan-300 font-bold font-mono">
          <Users className="w-3 h-3 text-cyan-400" />
          <span>{reservation.pax}名</span>
        </div>
      </div>
    </div>
  );
};

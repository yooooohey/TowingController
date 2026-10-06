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
      className={`relative w-full rounded-md sm:rounded-lg p-1 sm:p-2 select-none transition-all cursor-pointer border ${
        isDragging
          ? 'opacity-30 scale-95 border-dashed border-cyan-400 bg-slate-800/40'
          : 'bg-slate-800/90 hover:bg-slate-800 border-slate-700/80 hover:border-cyan-500/50 shadow-xs hover:shadow-cyan-950/40 active:scale-[0.98]'
      }`}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Top Row: Time & Menu badge */}
      <div className="flex items-center justify-between gap-1">
        <div className="font-mono font-bold text-xs sm:text-sm text-white min-w-0 tracking-tight">
          {reservation.time}
        </div>

        {/* Menu badge: D (Yellow), M (Red), U (Blue), J (Green), X (Black) */}
        <div
          className={`w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center font-black text-xs shadow-xs border shrink-0 ${menuInfo.bgColor} ${menuInfo.textColor} ${menuInfo.borderColor}`}
          title={`${menuInfo.code}: ${menuInfo.description}`}
        >
          {menuInfo.code}
        </div>
      </div>

      {/* Bottom Row: Guest Name & Pax */}
      <div className="mt-1 flex items-center justify-between gap-1 text-[10px] sm:text-xs">
        <div className="truncate font-medium text-slate-200 min-w-0 flex-1 leading-tight">
          {reservation.name ? (
            <span className="text-white font-semibold truncate block">{reservation.name}</span>
          ) : (
            <span className="text-slate-400 italic truncate block">無記名</span>
          )}
        </div>

        <div className="shrink-0 text-cyan-300 font-bold font-mono text-[10px] sm:text-xs ml-0.5">
          {reservation.pax}名
        </div>
      </div>
    </div>
  );
};

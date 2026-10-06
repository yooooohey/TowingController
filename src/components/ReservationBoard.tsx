import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Users, Clock, User, Ship } from 'lucide-react';
import { ColumnConfig, Reservation, MENU_DEFINITIONS } from '../types';
import { ColumnHeader } from './ColumnHeader';
import { ReservationCard } from './ReservationCard';
import { useHaptic } from '../hooks/useHaptic';

interface ReservationBoardProps {
  columns: ColumnConfig[];
  onAddReservation: (columnId: string) => void;
  onEditReservation: (reservation: Reservation, columnId: string) => void;
  onMoveReservation: (
    reservation: Reservation,
    sourceColumnId: string,
    targetColumnId: string
  ) => void;
  onSwapStaffHeaders: (fromColumnIndex: number, toColumnIndex: number) => void;
  onSwapJetHeaders: (fromColumnIndex: number, toColumnIndex: number) => void;
}

export const ReservationBoard: React.FC<ReservationBoardProps> = ({
  columns,
  onAddReservation,
  onEditReservation,
  onMoveReservation,
  onSwapStaffHeaders,
  onSwapJetHeaders,
}) => {
  const { dragStart: hapticDragStart, success: hapticSuccess } = useHaptic();

  // Drag states
  const [draggedCard, setDraggedCard] = useState<{
    reservation: Reservation;
    sourceColumnId: string;
  } | null>(null);

  const [draggedHeader, setDraggedHeader] = useState<{
    type: 'staff' | 'jet';
    columnIndex: number;
    title: string;
  } | null>(null);

  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);
  const [hoveredHeaderIndex, setHoveredHeaderIndex] = useState<number | null>(null);

  // Column refs for hit testing
  const columnRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const setColumnRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) {
      columnRefs.current.set(id, el);
    } else {
      columnRefs.current.delete(id);
    }
  }, []);

  // Card pointer drag initiation (called after 250ms long press)
  const handleCardPointerStartDrag = useCallback(
    (
      reservation: Reservation,
      columnId: string,
      initialEvent: React.PointerEvent<HTMLDivElement>
    ) => {
      hapticDragStart();
      setDraggedCard({ reservation, sourceColumnId: columnId });
      setPointerPos({ x: initialEvent.clientX, y: initialEvent.clientY });
      setHoveredColumnId(columnId);
    },
    [hapticDragStart]
  );

  // Staff header drag initiation
  const handleStaffPointerDown = (columnIndex: number, e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary button
    if (e.button !== 0) return;
    hapticDragStart();
    setDraggedHeader({
      type: 'staff',
      columnIndex,
      title: columns[columnIndex].staffName,
    });
    setPointerPos({ x: e.clientX, y: e.clientY });
    setHoveredHeaderIndex(columnIndex);
  };

  // Jet header drag initiation
  const handleJetPointerDown = (columnIndex: number, e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    hapticDragStart();
    setDraggedHeader({
      type: 'jet',
      columnIndex,
      title: columns[columnIndex].jetName,
    });
    setPointerPos({ x: e.clientX, y: e.clientY });
    setHoveredHeaderIndex(columnIndex);
  };

  // Global pointer move listener during drag
  useEffect(() => {
    if (!draggedCard && !draggedHeader) return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      setPointerPos({ x: e.clientX, y: e.clientY });

      if (draggedCard) {
        // Find which column the pointer is currently over
        let targetId: string | null = null;
        for (const [colId, colEl] of columnRefs.current.entries()) {
          const rect = colEl.getBoundingClientRect();
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            targetId = colId;
            break;
          }
        }
        setHoveredColumnId(targetId);
      } else if (draggedHeader) {
        // Find which column header of the same type the pointer is over
        const elUnderPoint = document.elementFromPoint(e.clientX, e.clientY);
        const headerEl = elUnderPoint?.closest(`[data-header-type="${draggedHeader.type}"]`);
        if (headerEl) {
          const idxStr = headerEl.getAttribute('data-column-index');
          if (idxStr !== null) {
            setHoveredHeaderIndex(parseInt(idxStr, 10));
          } else {
            setHoveredHeaderIndex(null);
          }
        } else {
          setHoveredHeaderIndex(null);
        }
      }
    };

    const handleWindowPointerUp = (e: PointerEvent) => {
      if (draggedCard) {
        // Final hit-test for drop
        let targetId: string | null = null;
        for (const [colId, colEl] of columnRefs.current.entries()) {
          const rect = colEl.getBoundingClientRect();
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            targetId = colId;
            break;
          }
        }

        if (targetId) {
          hapticSuccess();
          onMoveReservation(
            draggedCard.reservation,
            draggedCard.sourceColumnId,
            targetId
          );
        }
        setDraggedCard(null);
        setHoveredColumnId(null);
      } else if (draggedHeader) {
        // Final header drop test
        const elUnderPoint = document.elementFromPoint(e.clientX, e.clientY);
        const headerEl = elUnderPoint?.closest(`[data-header-type="${draggedHeader.type}"]`);
        if (headerEl) {
          const idxStr = headerEl.getAttribute('data-column-index');
          if (idxStr !== null) {
            const targetIndex = parseInt(idxStr, 10);
            if (targetIndex !== draggedHeader.columnIndex) {
              hapticSuccess();
              if (draggedHeader.type === 'staff') {
                onSwapStaffHeaders(draggedHeader.columnIndex, targetIndex);
              } else {
                onSwapJetHeaders(draggedHeader.columnIndex, targetIndex);
              }
            }
          }
        }
        setDraggedHeader(null);
        setHoveredHeaderIndex(null);
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('pointercancel', handleWindowPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('pointercancel', handleWindowPointerUp);
    };
  }, [
    draggedCard,
    draggedHeader,
    hapticSuccess,
    onMoveReservation,
    onSwapStaffHeaders,
    onSwapJetHeaders,
  ]);

  return (
    <div className="relative flex-1 w-full overflow-hidden bg-slate-950 flex flex-col">
      {/* 4 columns layout: fits 4 columns across screen on mobile, tablet, and desktop */}
      <div className="flex-1 w-full overflow-hidden">
        <div className="grid grid-cols-4 gap-0.5 sm:gap-2 p-0.5 sm:p-2 md:p-3 h-full w-full">
          {columns.map((column, colIndex) => {
            const isColDropTarget =
              draggedCard !== null && hoveredColumnId === column.id;

            return (
              <div
                key={column.id}
                ref={(el) => setColumnRef(column.id, el)}
                className={`flex flex-col h-full rounded-lg sm:rounded-2xl border transition-colors select-none min-w-0 ${
                  isColDropTarget
                    ? 'bg-cyan-950/30 border-cyan-400 ring-2 ring-cyan-400/40'
                    : 'bg-slate-900/90 border-cyan-900/30 shadow-lg'
                }`}
              >
                {/* Column Header (Staff name upper, Marine jet name lower) */}
                <div className="px-0.5 sm:px-2 pt-1 sm:pt-1.5">
                  <ColumnHeader
                    columnIndex={colIndex}
                    staffName={column.staffName}
                    jetName={column.jetName}
                    isStaffDragSource={
                      draggedHeader?.type === 'staff' &&
                      draggedHeader.columnIndex === colIndex
                    }
                    isJetDragSource={
                      draggedHeader?.type === 'jet' &&
                      draggedHeader.columnIndex === colIndex
                    }
                    isStaffDropTarget={
                      draggedHeader?.type === 'staff' &&
                      hoveredHeaderIndex === colIndex &&
                      draggedHeader.columnIndex !== colIndex
                    }
                    isJetDropTarget={
                      draggedHeader?.type === 'jet' &&
                      hoveredHeaderIndex === colIndex &&
                      draggedHeader.columnIndex !== colIndex
                    }
                    onStaffPointerDown={handleStaffPointerDown}
                    onJetPointerDown={handleJetPointerDown}
                  />
                </div>

                {/* Reservation List: Each column independently vertically scrollable */}
                {/* With pb-[75vh] so the bottom Add button is always easy to reach as requested */}
                <div className="flex-1 overflow-y-auto px-0.5 sm:px-2 pt-1 sm:pt-2 space-y-1 sm:space-y-2 overscroll-contain">
                  {column.reservations.length === 0 ? (
                    <div className="text-center py-6 px-1 rounded-md border border-dashed border-slate-800 text-slate-500 text-[10px] sm:text-xs">
                      なし
                    </div>
                  ) : (
                    column.reservations.map((res) => (
                      <ReservationCard
                        key={res.id}
                        reservation={res}
                        columnId={column.id}
                        isDragging={draggedCard?.reservation.id === res.id}
                        onSelect={onEditReservation}
                        onPointerStartDrag={handleCardPointerStartDrag}
                      />
                    ))
                  )}

                  {/* Add Button at bottom of column */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => onAddReservation(column.id)}
                      className="w-full py-1 sm:py-2 px-0.5 sm:px-2 rounded-md sm:rounded-xl bg-slate-850 hover:bg-cyan-950/60 active:bg-cyan-900/80 border border-slate-700/80 hover:border-cyan-500/60 text-cyan-300 hover:text-cyan-200 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-0.5 sm:gap-1.5 transition active:scale-98 shadow-xs group"
                    >
                      <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 group-hover:scale-110 transition-transform" />
                      <span>＋ 追加</span>
                    </button>
                  </div>

                  {/* Generous bottom padding per specification: pb-[75vh] */}
                  <div className="h-[75vh] w-full pointer-events-none" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Ghost Element during Drag */}
      {draggedCard && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 w-48 sm:w-64 shadow-2xl rounded-xl p-2 sm:p-3 bg-slate-800/95 border-2 border-cyan-400 text-white opacity-95 scale-105 rotate-1"
          style={{
            left: `${pointerPos.x}px`,
            top: `${pointerPos.y}px`,
          }}
        >
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1 font-mono font-bold text-xs sm:text-base text-white">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
              <span>{draggedCard.reservation.time}</span>
            </div>
            <div
              className={`w-5 h-5 sm:w-7 sm:h-7 rounded flex items-center justify-center font-black text-xs sm:text-sm border ${
                MENU_DEFINITIONS[draggedCard.reservation.menu]?.bgColor || 'bg-yellow-400'
              } ${
                MENU_DEFINITIONS[draggedCard.reservation.menu]?.textColor || 'text-slate-900'
              }`}
            >
              {draggedCard.reservation.menu}
            </div>
          </div>
          <div className="mt-1 sm:mt-2 flex items-center justify-between text-[10px] sm:text-xs">
            <span className="truncate font-semibold text-slate-200">
              {draggedCard.reservation.name || '（予約名なし）'}
            </span>
            <div className="flex items-center gap-0.5 text-cyan-300 font-bold font-mono">
              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>{draggedCard.reservation.pax}名</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Ghost for Column Header Swap Drag */}
      {draggedHeader && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 shadow-2xl rounded-lg px-3 py-2 bg-cyan-600/95 border-2 border-white text-white opacity-95 scale-105 flex items-center gap-2 font-mono font-bold text-xs"
          style={{
            left: `${pointerPos.x}px`,
            top: `${pointerPos.y}px`,
          }}
        >
          {draggedHeader.type === 'staff' ? (
            <>
              <User className="w-4 h-4" />
              <span className="uppercase">{draggedHeader.title}</span>
            </>
          ) : (
            <>
              <Ship className="w-4 h-4" />
              <span className="lowercase">{draggedHeader.title}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

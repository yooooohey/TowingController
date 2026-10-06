import React from 'react';
import { GripVertical, User, Ship } from 'lucide-react';

interface ColumnHeaderProps {
  columnIndex: number;
  staffName: string;
  jetName: string;
  isStaffDragSource?: boolean;
  isJetDragSource?: boolean;
  isStaffDropTarget?: boolean;
  isJetDropTarget?: boolean;
  onStaffPointerDown?: (columnIndex: number, e: React.PointerEvent<HTMLDivElement>) => void;
  onJetPointerDown?: (columnIndex: number, e: React.PointerEvent<HTMLDivElement>) => void;
}

export const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  columnIndex,
  staffName,
  jetName,
  isStaffDragSource = false,
  isJetDragSource = false,
  isStaffDropTarget = false,
  isJetDropTarget = false,
  onStaffPointerDown,
  onJetPointerDown,
}) => {
  return (
    <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md pb-1.5 pt-1 border-b border-cyan-800/40">
      <div className="space-y-1">
        {/* Row 1: Staff Name (大文字) */}
        <div
          data-header-type="staff"
          data-column-index={columnIndex}
          onPointerDown={(e) => onStaffPointerDown?.(columnIndex, e)}
          className={`flex items-center justify-center px-1 py-1 rounded border cursor-grab active:cursor-grabbing transition-all select-none shadow-xs text-center ${
            isStaffDragSource
              ? 'opacity-30 border-dashed border-cyan-400 bg-cyan-950/40'
              : isStaffDropTarget
              ? 'bg-cyan-500/30 border-cyan-400 ring-2 ring-cyan-400 scale-[1.02]'
              : 'bg-slate-800 hover:bg-slate-750 border-slate-700/80 hover:border-cyan-500/50'
          }`}
          title="ドラッグして他の列のスタッフ名と入れ替え"
          style={{ touchAction: 'none' }}
        >
          <span className="font-black text-[10px] sm:text-xs tracking-tight text-white uppercase truncate w-full text-center">
            {staffName.toUpperCase()}
          </span>
        </div>

        {/* Row 2: Marine Jet Name (小文字) */}
        <div
          data-header-type="jet"
          data-column-index={columnIndex}
          onPointerDown={(e) => onJetPointerDown?.(columnIndex, e)}
          className={`flex items-center justify-center px-1 py-0.5 rounded border cursor-grab active:cursor-grabbing transition-all select-none shadow-xs text-center ${
            isJetDragSource
              ? 'opacity-30 border-dashed border-cyan-400 bg-cyan-950/40'
              : isJetDropTarget
              ? 'bg-cyan-500/30 border-cyan-400 ring-2 ring-cyan-400 scale-[1.02]'
              : 'bg-slate-850 hover:bg-slate-800 border-slate-700/60 hover:border-cyan-500/40'
          }`}
          title="ドラッグして他の列のマリンジェット名と入れ替え"
          style={{ touchAction: 'none' }}
        >
          <span className="font-semibold text-[9px] sm:text-[10px] tracking-tight text-cyan-200 lowercase truncate w-full text-center">
            {jetName.toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect, useCallback } from 'react';
import { TowInAppState, ColumnConfig, Reservation, MenuType } from './types';
import {
  loadAppState,
  saveAppState,
  sortReservationsByTime,
  getInitialAppState,
} from './utils/storage';
import { Header } from './components/Header';
import { ReservationBoard } from './components/ReservationBoard';
import { ReservationModal } from './components/ReservationModal';
import { SettingsDrawer } from './components/SettingsDrawer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const [appState, setAppState] = useState<TowInAppState>(() => loadAppState());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTargetColumnId, setModalTargetColumnId] = useState<string>('col-1');
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  }, []);

  // Save changes to localStorage whenever appState changes
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Ensure version is always upgraded to current 1.7
  useEffect(() => {
    if (appState.version !== '1.7') {
      setAppState((prev) => ({ ...prev, version: '1.7' }));
    }
  }, [appState.version]);

  // Open modal for adding new reservation to a specific column
  const handleOpenAddModal = (columnId: string) => {
    setModalTargetColumnId(columnId);
    setEditingReservation(null);
    setIsModalOpen(true);
  };

  // Open modal for editing an existing reservation
  const handleOpenEditModal = (reservation: Reservation, columnId: string) => {
    setModalTargetColumnId(columnId);
    setEditingReservation(reservation);
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingReservation(null);
  };

  // Save reservation (add or update)
  const handleSaveReservation = (
    data: { time: string; pax: number; menu: MenuType; name: string },
    columnId: string,
    existingId?: string
  ) => {
    setAppState((prevState) => {
      const nextColumns: ColumnConfig[] = prevState.columns.map((col) => {
        if (col.id !== columnId) return col;

        let nextReservations = [...col.reservations];
        if (existingId) {
          // Update existing reservation
          nextReservations = nextReservations.map((r) =>
            r.id === existingId
              ? {
                  ...r,
                  time: data.time,
                  pax: data.pax,
                  menu: data.menu,
                  name: data.name,
                }
              : r
          );
        } else {
          // Add new reservation
          const newReservation: Reservation = {
            id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            time: data.time,
            pax: data.pax,
            menu: data.menu,
            name: data.name,
            createdAt: Date.now(),
          };
          nextReservations.push(newReservation);
        }

        return {
          ...col,
          reservations: sortReservationsByTime(nextReservations),
        };
      });

      return {
        ...prevState,
        columns: nextColumns,
      };
    });

    showToast(existingId ? '予約を更新しました' : '予約を追加しました');
  };

  // Delete reservation
  const handleDeleteReservation = (reservationId: string, columnId: string) => {
    setAppState((prevState) => {
      const nextColumns = prevState.columns.map((col) => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          reservations: col.reservations.filter((r) => r.id !== reservationId),
        };
      });
      return {
        ...prevState,
        columns: nextColumns,
      };
    });
    showToast('予約を削除しました');
  };

  // Move reservation card across columns or re-order
  const handleMoveReservation = (
    reservation: Reservation,
    sourceColumnId: string,
    targetColumnId: string
  ) => {
    setAppState((prevState) => {
      const nextColumns = prevState.columns.map((col) => {
        if (col.id === sourceColumnId && col.id === targetColumnId) {
          // Dropped in same column -> keep sorted
          return {
            ...col,
            reservations: sortReservationsByTime(col.reservations),
          };
        }

        if (col.id === sourceColumnId) {
          // Remove from source
          return {
            ...col,
            reservations: col.reservations.filter((r) => r.id !== reservation.id),
          };
        }

        if (col.id === targetColumnId) {
          // Add to target and sort chronologically
          return {
            ...col,
            reservations: sortReservationsByTime([...col.reservations, reservation]),
          };
        }

        return col;
      });

      return {
        ...prevState,
        columns: nextColumns,
      };
    });

    const targetCol = appState.columns.find((c) => c.id === targetColumnId);
    showToast(`予約を ${targetCol?.staffName || '別列'} に移動しました`);
  };

  // Swap staff headers between columns
  const handleSwapStaffHeaders = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setAppState((prevState) => {
      const copy = [...prevState.columns];
      const tempStaff = copy[fromIndex].staffName;
      copy[fromIndex] = { ...copy[fromIndex], staffName: copy[toIndex].staffName };
      copy[toIndex] = { ...copy[toIndex], staffName: tempStaff };
      return { ...prevState, columns: copy };
    });
    showToast(
      `スタッフ入れ替え: ${appState.columns[fromIndex].staffName} ⇄ ${appState.columns[toIndex].staffName}`
    );
  };

  // Swap jet headers between columns
  const handleSwapJetHeaders = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setAppState((prevState) => {
      const copy = [...prevState.columns];
      const tempJet = copy[fromIndex].jetName;
      copy[fromIndex] = { ...copy[fromIndex], jetName: copy[toIndex].jetName };
      copy[toIndex] = { ...copy[toIndex], jetName: tempJet };
      return { ...prevState, columns: copy };
    });
    showToast(
      `ボート入れ替え: ${appState.columns[fromIndex].jetName} ⇄ ${appState.columns[toIndex].jetName}`
    );
  };

  // Settings: update staff & jet names
  const handleUpdateColumnsMeta = (
    newMeta: Array<{ id: string; staffName: string; jetName: string }>
  ) => {
    setAppState((prevState) => {
      const nextColumns = prevState.columns.map((col) => {
        const found = newMeta.find((m) => m.id === col.id);
        if (found) {
          return {
            ...col,
            staffName: found.staffName.toUpperCase(),
            jetName: found.jetName.toLowerCase(),
          };
        }
        return col;
      });
      return { ...prevState, columns: nextColumns };
    });
  };

  // Settings: Reset to sample data
  const handleResetToSampleData = () => {
    const fresh = getInitialAppState();
    setAppState(fresh);
    showToast('サンプルデータにリセットしました');
  };

  // Settings: Clear all reservations
  const handleClearAllReservations = () => {
    setAppState((prevState) => ({
      ...prevState,
      columns: prevState.columns.map((c) => ({ ...c, reservations: [] })),
    }));
    showToast('すべての予約を消去しました');
  };

  // Export JSON backup
  const handleExportData = () => {
    const dataStr = JSON.stringify(appState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const a = document.createElement('a');
    a.href = url;
    a.download = `towin-reservations-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('JSONファイルを書き出しました');
  };

  // Import JSON backup
  const handleImportData = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr) as Partial<TowInAppState>;
      if (!parsed || !Array.isArray(parsed.columns)) {
        showToast('ファイル形式が不正です');
        return false;
      }
      const safeColumns = parsed.columns.slice(0, 4).map((col, idx) => ({
        id: col.id || `col-${idx + 1}`,
        staffName: (col.staffName || `STAFF ${idx + 1}`).toUpperCase(),
        jetName: (col.jetName || `jet ${idx + 1}`).toLowerCase(),
        reservations: sortReservationsByTime(Array.isArray(col.reservations) ? col.reservations : []),
      }));

      const newState: TowInAppState = {
        version: parsed.version || '1.7',
        swipeMinutes: parsed.swipeMinutes || 5,
        columns: safeColumns,
      };

      setAppState(newState);
      showToast('データを復元しました');
      return true;
    } catch {
      showToast('JSONの読み込みに失敗しました');
      return false;
    }
  };

  // Find info for current modal target column
  const currentTargetCol = appState.columns.find((c) => c.id === modalTargetColumnId) || appState.columns[0];

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
        {/* Header */}
        <Header
          onOpenSettings={() => setIsSettingsOpen(true)}
          version="1.7"
        />

        {/* Main Reservation Board */}
        <ReservationBoard
          columns={appState.columns}
          onAddReservation={handleOpenAddModal}
          onEditReservation={handleOpenEditModal}
          onMoveReservation={handleMoveReservation}
          onSwapStaffHeaders={handleSwapStaffHeaders}
          onSwapJetHeaders={handleSwapJetHeaders}
        />

        {/* Add / Edit Reservation Modal Dialog */}
        <ReservationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          targetColumnId={modalTargetColumnId}
          targetColumnStaff={currentTargetCol.staffName}
          targetColumnJet={currentTargetCol.jetName}
          editingReservation={editingReservation}
          onSave={handleSaveReservation}
          onDelete={handleDeleteReservation}
        />

        {/* Settings Drawer (Hamburger menu) */}
        <SettingsDrawer
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          columns={appState.columns}
          version="1.7"
          onUpdateColumnsMeta={handleUpdateColumnsMeta}
          onResetToSampleData={handleResetToSampleData}
          onClearAllReservations={handleClearAllReservations}
          onImportData={handleImportData}
          onExportData={handleExportData}
        />

        {/* Offline Status Badge */}
        <OfflineIndicator />

        {/* Floating feedback toast */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 pointer-events-none animate-bounce">
            <div className="px-4 py-2.5 rounded-xl bg-cyan-600/95 backdrop-blur-md text-white text-xs font-bold shadow-2xl border border-cyan-400/40">
              {toastMessage}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

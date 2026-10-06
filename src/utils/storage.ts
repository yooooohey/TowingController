import { TowInAppState, ColumnConfig, Reservation } from '../types';
import { compareTimes } from './time';

export const STORAGE_KEY = 'towInAppState_v16';

export const DEFAULT_INITIAL_COLUMNS: ColumnConfig[] = [
  {
    id: 'col-1',
    staffName: 'KEN',
    jetName: 'spark 1',
    reservations: [
      {
        id: 'res-sample-1',
        time: '09:00',
        pax: 2,
        menu: 'D',
        name: '佐藤様',
        createdAt: Date.now() - 3600000,
      },
      {
        id: 'res-sample-2',
        time: '09:30',
        pax: 3,
        menu: 'M',
        name: '山田様',
        createdAt: Date.now() - 3000000,
      },
      {
        id: 'res-sample-3',
        time: '10:15',
        pax: 2,
        menu: 'U',
        name: '田中様',
        createdAt: Date.now() - 2400000,
      },
    ],
  },
  {
    id: 'col-2',
    staffName: 'RYO',
    jetName: 'spark 2',
    reservations: [
      {
        id: 'res-sample-4',
        time: '09:15',
        pax: 4,
        menu: 'J',
        name: '鈴木様',
        createdAt: Date.now() - 3400000,
      },
      {
        id: 'res-sample-5',
        time: '10:00',
        pax: 2,
        menu: 'D',
        name: '高橋様',
        createdAt: Date.now() - 2800000,
      },
    ],
  },
  {
    id: 'col-3',
    staffName: 'TAKUMI',
    jetName: 'fx cruiser',
    reservations: [
      {
        id: 'res-sample-6',
        time: '09:30',
        pax: 2,
        menu: 'X',
        name: '渡辺様',
        createdAt: Date.now() - 3200000,
      },
      {
        id: 'res-sample-7',
        time: '10:30',
        pax: 3,
        menu: 'M',
        name: '小林様',
        createdAt: Date.now() - 2000000,
      },
    ],
  },
  {
    id: 'col-4',
    staffName: 'DAIKI',
    jetName: 'vx deluxe',
    reservations: [
      {
        id: 'res-sample-8',
        time: '09:45',
        pax: 2,
        menu: 'D',
        name: '加藤様',
        createdAt: Date.now() - 2900000,
      },
      {
        id: 'res-sample-9',
        time: '11:00',
        pax: 4,
        menu: 'U',
        name: '松本様',
        createdAt: Date.now() - 1500000,
      },
    ],
  },
];

export function getInitialAppState(): TowInAppState {
  return {
    version: '1.6',
    swipeMinutes: 5,
    columns: DEFAULT_INITIAL_COLUMNS,
  };
}

/**
 * Ensures all reservations in each column are ordered strictly chronologically
 */
export function sortReservationsByTime(reservations: Reservation[]): Reservation[] {
  return [...reservations].sort((a, b) => {
    const diff = compareTimes(a.time, b.time);
    if (diff !== 0) return diff;
    return a.createdAt - b.createdAt;
  });
}

let inMemoryFallback: string | null = null;

function safeGetStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (err) {
    console.warn('localStorage read error, falling back to in-memory:', err);
  }
  return inMemoryFallback;
}

function safeSetStorageItem(key: string, value: string): void {
  inMemoryFallback = value;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
  } catch (err) {
    console.warn('localStorage write error:', err);
  }
}

/**
 * Loads state from localStorage or falls back to initial state
 */
export function loadAppState(): TowInAppState {
  try {
    const raw = safeGetStorageItem(STORAGE_KEY);
    if (!raw) {
      return getInitialAppState();
    }
    const parsed = JSON.parse(raw) as Partial<TowInAppState>;
    if (!parsed || !Array.isArray(parsed.columns) || parsed.columns.length === 0) {
      return getInitialAppState();
    }

    // Ensure 4 columns exist and their reservations are sorted
    const safeColumns: ColumnConfig[] = parsed.columns.slice(0, 4).map((col, idx) => ({
      id: col.id || `col-${idx + 1}`,
      staffName: (col.staffName || `STAFF ${idx + 1}`).toUpperCase(),
      jetName: (col.jetName || `jet ${idx + 1}`).toLowerCase(),
      reservations: sortReservationsByTime(Array.isArray(col.reservations) ? col.reservations : []),
    }));

    // Pad to 4 columns if fewer
    while (safeColumns.length < 4) {
      const idx = safeColumns.length;
      safeColumns.push({
        id: `col-${idx + 1}`,
        staffName: DEFAULT_INITIAL_COLUMNS[idx]?.staffName || `STAFF ${idx + 1}`,
        jetName: DEFAULT_INITIAL_COLUMNS[idx]?.jetName || `jet ${idx + 1}`,
        reservations: [],
      });
    }

    return {
      version: '1.6',
      swipeMinutes: parsed.swipeMinutes || 5,
      columns: safeColumns,
    };
  } catch (err) {
    console.error('Failed to parse saved state:', err);
    return getInitialAppState();
  }
}

/**
 * Saves state to localStorage
 */
export function saveAppState(state: TowInAppState): void {
  try {
    // Sort each column before saving
    const stateToSave: TowInAppState = {
      ...state,
      columns: state.columns.map((col) => ({
        ...col,
        reservations: sortReservationsByTime(col.reservations),
      })),
    };
    safeSetStorageItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

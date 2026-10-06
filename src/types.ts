export type MenuType = 'D' | 'M' | 'U' | 'J' | 'X';

export interface Reservation {
  id: string;
  time: string; // "HH:mm" (24h)
  pax: number; // party size, >= 1
  menu: MenuType;
  name: string; // guest name or memo
  createdAt: number;
}

export interface ColumnConfig {
  id: string; // e.g. "col-1", "col-2", "col-3", "col-4"
  staffName: string; // uppercase, e.g. "KEN"
  jetName: string; // lowercase, e.g. "spark 1"
  reservations: Reservation[];
}

export interface TowInAppState {
  columns: ColumnConfig[];
  version: string;
  swipeMinutes: number; // 5
}

export interface MenuMeta {
  code: MenuType;
  name: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  ringColor: string;
  description: string;
}

export const MENU_DEFINITIONS: Record<MenuType, MenuMeta> = {
  D: {
    code: 'D',
    name: 'D (イエロー)',
    bgColor: 'bg-yellow-400',
    textColor: 'text-slate-900',
    borderColor: 'border-yellow-500',
    ringColor: 'ring-yellow-400',
    description: 'トーイングチューブ / デュアル',
  },
  M: {
    code: 'M',
    name: 'M (レッド)',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    borderColor: 'border-red-600',
    ringColor: 'ring-red-500',
    description: 'モンスター / スピード体験',
  },
  U: {
    code: 'U',
    name: 'U (ブルー)',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    borderColor: 'border-blue-600',
    ringColor: 'ring-blue-500',
    description: 'ウェイクボード / フリーライド',
  },
  J: {
    code: 'J',
    name: 'J (グリーン)',
    bgColor: 'bg-green-500',
    textColor: 'text-white',
    borderColor: 'border-green-600',
    ringColor: 'ring-green-500',
    description: 'ジェットスキー体験 / クルーズ',
  },
  X: {
    code: 'X',
    name: 'X (ブラック)',
    bgColor: 'bg-black',
    textColor: 'text-white',
    borderColor: 'border-slate-700',
    ringColor: 'ring-slate-400',
    description: 'エクストリーム / スペシャル',
  },
};

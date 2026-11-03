'use client';

import { create } from 'zustand';

interface UiState {
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;

  // POS Mobile view state: 'catalog' | 'cart'
  posMobileView: 'catalog' | 'cart';
  setPosMobileView: (view: 'catalog' | 'cart') => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMobileSidebarOpen: false,
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),

  posMobileView: 'catalog',
  setPosMobileView: (view) => set({ posMobileView: view }),
}));

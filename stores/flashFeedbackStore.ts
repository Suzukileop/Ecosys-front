import { create } from 'zustand';
import type { FlashToast } from '@/lib/flash-feedback';

type FlashFeedbackState = {
  toasts: FlashToast[];
  push: (toast: Omit<FlashToast, 'id'>) => string;
  dismiss: (id: string) => void;
  clear: () => void;
};

function createToastId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `flash-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useFlashFeedbackStore = create<FlashFeedbackState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = createToastId();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    return id;
  },
  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  clear: () => set({ toasts: [] }),
}));

export function pushFlashFeedback(toast: Omit<FlashToast, 'id'>): string {
  return useFlashFeedbackStore.getState().push(toast);
}

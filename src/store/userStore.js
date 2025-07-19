import { create } from 'zustand';

export const useUserStore = create((set) => ({
  user: null,

  // Setter για να ενημερώνεις τον χρήστη
  setUser: (userData) => set({ user: userData }),

  // Clear function αν θέλεις να κάνεις logout ή reset
  clearUser: () => set({ user: null }),
}));
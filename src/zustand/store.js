import { create } from "zustand";
import userSlice from './slices/user.slice.js';
import gameSlice from "./slices/game.slice.js";

// Combine all slices in the store:
const useStore = create((set, get) => ({
  ...userSlice(set, get),
  ...gameSlice(set, get),
  gameType: 'color', // Default game type
  setGameType: (type) => set({ gameType: type }),
}));


export default useStore;

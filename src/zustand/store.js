import { create } from "zustand";
import userSlice from './slices/user.slice.js';
import gameSlice from "./slices/game.slice.js";

// Combine all slices in the store:
const useStore = create((...args) => ({
  ...userSlice(...args),
  ...gameSlice(...args),
}));


export default useStore;

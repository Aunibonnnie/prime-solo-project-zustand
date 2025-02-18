import { create } from "zustand";
import userSlice from './slices/user.slice.js';
import { createGameSlice } from "./slices/game.slice.js";

// Combine all slices in the store:
const useStore = create((...args) => ({
  ...userSlice(...args),
  ...createGameSlice(...args),
}));


export default useStore;

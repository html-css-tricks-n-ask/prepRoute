import { createSlice } from '@reduxjs/toolkit';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storage';

const token = storage.get(STORAGE_KEYS.TOKEN) || null;
const user = storage.getJSON(STORAGE_KEYS.USER);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token,
    user,
    isAuthenticated: !!token,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user: authUser, token: authToken } = action.payload;
      state.user = authUser;
      state.token = authToken;
      state.isAuthenticated = true;
      storage.set(STORAGE_KEYS.TOKEN, authToken);
      storage.setJSON(STORAGE_KEYS.USER, authUser);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      storage.remove(STORAGE_KEYS.TOKEN);
      storage.remove(STORAGE_KEYS.USER);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

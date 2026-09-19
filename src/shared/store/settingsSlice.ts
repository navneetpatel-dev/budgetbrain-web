import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import type { AccentPalette, ThemeMode } from '../theme/types';
import { DEFAULT_ACCENT, resolveAccent, resolveThemeMode } from '../theme/palettes';

interface SettingsState {
  theme: ThemeMode;
  accent: AccentPalette;
  currency: string;
  biometricEnabled: boolean;
  appLockPin: string | null;
}

const initialState: SettingsState = {
  theme: 'system',
  accent: DEFAULT_ACCENT,
  currency: 'INR',
  biometricEnabled: false,
  appLockPin: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.theme = action.payload;
    },
    setAccent(state, action: PayloadAction<AccentPalette>) {
      state.accent = action.payload;
    },
    setCurrency(state, action: PayloadAction<string>) {
      state.currency = action.payload;
    },
    setBiometricEnabled(state, action: PayloadAction<boolean>) {
      state.biometricEnabled = action.payload;
    },
    setAppLockPin(state, action: PayloadAction<string | null>) {
      state.appLockPin = action.payload;
    },
    hydratePreferences(state, action: PayloadAction<{ theme?: string | null; accent?: string | null }>) {
      if (action.payload.theme) state.theme = resolveThemeMode(action.payload.theme);
      if (action.payload.accent) state.accent = resolveAccent(action.payload.accent);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (_state, action) => {
      const incoming = (action as { payload?: { settings?: Partial<SettingsState> } }).payload?.settings;
      if (!incoming) return initialState;
      return {
        ...initialState,
        ...incoming,
        theme: resolveThemeMode(incoming.theme),
        accent: resolveAccent(incoming.accent),
      };
    });
  },
});

export const {
  setTheme,
  setAccent,
  setCurrency,
  setBiometricEnabled,
  setAppLockPin,
  hydratePreferences,
} = settingsSlice.actions;
export default settingsSlice.reducer;

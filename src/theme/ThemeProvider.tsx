import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import {
  DEFAULT_THEME,
  isThemeId,
  resolveScheme,
  THEMES,
  type Appearance,
  type Palette,
  type ThemeDef,
  type ThemeId,
} from './themes';

type Ctx = {
  theme: ThemeDef;
  colors: Palette;
  scheme: 'light' | 'dark';
  appearance: Appearance;
  ready: boolean;
  setThemeId: (id: ThemeId) => void;
  setAppearance: (a: Appearance) => void;
};

const STORAGE_KEY = 'ui_preferences';

const ThemeCtx = createContext<Ctx | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [themeId, setThemeIdState] = useState<ThemeId>(DEFAULT_THEME);
  const [appearance, setAppearanceState] = useState<Appearance>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const p = raw ? (JSON.parse(raw) as { themeId?: unknown; appearance?: unknown }) : {};
        if (isThemeId(p.themeId)) setThemeIdState(p.themeId);
        if (p.appearance === 'light' || p.appearance === 'dark' || p.appearance === 'system') setAppearanceState(p.appearance);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<Ctx>(() => {
    const persist = (next: { themeId: ThemeId; appearance: Appearance }) =>
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    const theme = THEMES[themeId];
    const scheme = resolveScheme(appearance, system);
    return {
      theme,
      colors: theme[scheme],
      scheme,
      appearance,
      ready,
      setThemeId: (id) => {
        setThemeIdState(id);
        persist({ themeId: id, appearance });
      },
      setAppearance: (a) => {
        setAppearanceState(a);
        persist({ themeId, appearance: a });
      },
    };
  }, [themeId, appearance, system, ready]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme(): Ctx {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme fora do AppThemeProvider');
  return ctx;
}

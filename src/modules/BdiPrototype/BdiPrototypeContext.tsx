import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  BdiConfig,
  LeftnavMode,
  MastheadMode,
  persistBdiConfig,
  readInitialBdiConfig,
} from './config';

interface BdiContextValue extends BdiConfig {
  setLeftnav: (mode: LeftnavMode) => void;
  setMasthead: (mode: MastheadMode) => void;
}

const BdiContext = createContext<BdiContextValue | null>(null);

export function BdiPrototypeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cfg, setCfg] = useState<BdiConfig>(() => readInitialBdiConfig());

  const apply = useCallback((next: BdiConfig) => {
    persistBdiConfig(next);
    setCfg(next);
  }, []);

  const value = useMemo<BdiContextValue>(
    () => ({
      ...cfg,
      setLeftnav: (mode) => apply({ ...cfg, leftnav: mode }),
      setMasthead: (mode) => apply({ ...cfg, masthead: mode }),
    }),
    [cfg, apply],
  );

  return <BdiContext.Provider value={value}>{children}</BdiContext.Provider>;
}

export function useBdiConfig(): BdiContextValue {
  const ctx = useContext(BdiContext);
  if (!ctx) {
    // Defensive fallback so consumers never crash if the provider is absent.
    return {
      leftnav: 'rivery',
      masthead: 'off',
      setLeftnav: () => undefined,
      setMasthead: () => undefined,
    };
  }
  return ctx;
}

import { createContext } from 'react';

export const TopBarContext = createContext<{
  show: boolean;
  setShowPanel: (state: boolean) => any;
}>({
  show: false,
  setShowPanel: () => {},
});

export const TopBarProvider = TopBarContext.Provider;

/**
 * BDI prototype — runtime version toggle config.
 *
 * Two independent flags select which chrome the app renders, giving the four
 * comparison versions:
 *   leftnav=rivery, masthead=off  -> Original Rivery
 *   leftnav=exo,    masthead=off  -> Exosphere Leftnav
 *   leftnav=rivery, masthead=exo  -> Exosphere Masthead
 *   leftnav=exo,    masthead=exo  -> Both
 *
 * Resolution order: URL query param  ->  localStorage  ->  env default  ->  hard default.
 * A URL param is also persisted to localStorage so it sticks across navigations.
 */

export type LeftnavMode = 'rivery' | 'exo';
export type MastheadMode = 'off' | 'exo';

export interface BdiConfig {
  leftnav: LeftnavMode;
  masthead: MastheadMode;
}

const LS = { leftnav: 'bdi.leftnav', masthead: 'bdi.masthead' } as const;

function param(name: string): string | null {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}
function lsGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, val: string): void {
  try {
    window.localStorage.setItem(key, val);
  } catch {
    /* ignore */
  }
}

const envLeftnav = (import.meta.env.VITE_BDI_LEFTNAV || '').toLowerCase();
const envMasthead = (import.meta.env.VITE_BDI_MASTHEAD || '').toLowerCase();

function resolveLeftnav(): LeftnavMode {
  const p = param('leftnav');
  if (p === 'exo' || p === 'rivery') {
    lsSet(LS.leftnav, p);
    return p;
  }
  const stored = lsGet(LS.leftnav);
  if (stored === 'exo' || stored === 'rivery') return stored;
  return envLeftnav === 'exo' ? 'exo' : 'rivery';
}

function resolveMasthead(): MastheadMode {
  const p = param('masthead');
  if (p === 'exo' || p === 'off') {
    lsSet(LS.masthead, p);
    return p;
  }
  const stored = lsGet(LS.masthead);
  if (stored === 'exo' || stored === 'off') return stored;
  return envMasthead === 'exo' ? 'exo' : 'off';
}

export function readInitialBdiConfig(): BdiConfig {
  return { leftnav: resolveLeftnav(), masthead: resolveMasthead() };
}

export function persistBdiConfig(cfg: BdiConfig): void {
  lsSet(LS.leftnav, cfg.leftnav);
  lsSet(LS.masthead, cfg.masthead);
  // Reflect in the URL without triggering a route change.
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('leftnav', cfg.leftnav);
    url.searchParams.set('masthead', cfg.masthead);
    window.history.replaceState(window.history.state, '', url.toString());
  } catch {
    /* ignore */
  }
}

/** The prototype switcher is only shown in dev / when running on mocks. */
export function isBdiPrototypeEnv(): boolean {
  return (
    Boolean(import.meta.env.DEV) || import.meta.env.VITE_USE_MOCKS === 'true'
  );
}

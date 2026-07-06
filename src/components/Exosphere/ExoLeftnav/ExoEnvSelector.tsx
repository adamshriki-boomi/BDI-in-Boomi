/**
 * ────────────────────────────────────────────────────────────
 * CUSTOM EXOSPHERE EXTENSION
 * NOT part of @boomi/exosphere.
 *
 * Approved by: Adam Shriki  on  2026-07-06
 * Reason: Exosphere-styled account/environment selector pill for the BDI leftnav
 *   (the original Rivery colored pill). Exosphere ships no account/env switcher;
 *   this is only the trigger — the drawer body reuses Rivery's AccountEnvSelection.
 *
 * Rules this file follows:
 *   - Colors come from --exo-* tokens; the env swatch uses the environment's own
 *     runtime color (data-driven, resolved to a CSS value via VITE_EXO_THEME).
 *   - Consumes the Exosphere ExIcon primitive for the caret.
 *
 * Revisit if Exosphere ships an account/environment switcher.
 * ────────────────────────────────────────────────────────────
 */
import {
  ExIcon,
  IconSize,
  IconVariant,
} from '@boomi/exosphere/dist/react/icon';
import { useCore } from 'store/core';
import { useSelectedEnvironment } from 'store/environments/hooks/useGetEnvironment';

export interface ExoEnvSelectorProps {
  onClick: () => void;
  active: boolean;
}

/**
 * The account/environment pill at the top of the leftnav. Shows the active
 * account + environment (with the env's color as a swatch) and opens the
 * account/env switcher drawer. Mirrors Rivery's `EnvironmentView` trigger.
 */
export function ExoEnvSelector({ onClick, active }: ExoEnvSelectorProps) {
  const { name, color } = useSelectedEnvironment();
  const { activeAccountName } = useCore();

  return (
    <button
      type="button"
      aria-label="environment account selector"
      aria-expanded={active}
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--exo-spacing-x-small, 8px)',
        width: '100%',
        padding:
          'var(--exo-spacing-x-small, 8px) var(--exo-spacing-standard, 16px)',
        minHeight: 48,
        border: 'none',
        borderBottom: '1px solid var(--exo-color-border-secondary, #e5e5e5)',
        // No open/active background change — the pill stays as-is when clicked.
        background: 'transparent',
        cursor: 'pointer',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          flexShrink: 0,
          background: color || 'var(--exo-color-background-brand, #072b55)',
        }}
      />
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flex: 1,
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: 'var(--exo-color-font-secondary, #57606a)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {activeAccountName}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--exo-color-font, #1f1f1f)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {name || 'Environment'}
        </span>
      </span>
      {/* Chevron (open `>`), not the filled caret triangle. XS = 16px, the
          smallest Exosphere icon size — S/M/L are 24/32/48px and dwarf the text. */}
      <ExIcon
        icon="direction-arrowhead-right"
        size={IconSize.XS}
        variant={IconVariant.TERTIARY}
      />
    </button>
  );
}

export default ExoEnvSelector;

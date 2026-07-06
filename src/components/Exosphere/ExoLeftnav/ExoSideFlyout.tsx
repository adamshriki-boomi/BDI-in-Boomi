/**
 * ────────────────────────────────────────────────────────────
 * CUSTOM EXOSPHERE EXTENSION
 * NOT part of @boomi/exosphere.
 *
 * Approved by: Adam Shriki  on  2026-07-06
 * Reason: Exosphere's shipped drawer (ExSideDrawer) is anchored to the RIGHT
 *   edge of the viewport. The BDI leftnav needs a LEFT-anchored flyout that
 *   slides out flush against the sidebar (matching the original Rivery Create /
 *   environment drawers), so users "feel at home". No shipped component covers this.
 *
 * Rules this file follows:
 *   - Colors come from --exo-* tokens (raw values only as CSS var() fallbacks).
 *   - Layout px (offsets / widths) are positional, not design values.
 *   - Consumes Exosphere primitives in its content (see ExoCreateFlyout / ExoEnvSelector).
 *
 * Revisit if Exosphere ships a left-anchored drawer.
 * ────────────────────────────────────────────────────────────
 */
import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface ExoSideFlyoutProps {
  open: boolean;
  onClose: () => void;
  /** Panel width in px (Create = 530, env = 300 — mirrors the Rivery drawer widths). */
  width: number;
  /** px from the viewport left where the panel starts — the right edge of the nav. */
  leftOffset: number;
  /** px from the viewport top (0, or the masthead height when the masthead is on). */
  top: number;
  ariaLabel?: string;
  children: ReactNode;
}

const KEYFRAMES =
  '@keyframes exoFlyoutIn{from{transform:translateX(-12px);opacity:0}to{transform:translateX(0);opacity:1}}';

/**
 * A left-anchored, portaled slide-out panel. Portaled to <body> with fixed
 * positioning so it escapes the authenticated-app grid's `overflow:hidden`
 * (which would otherwise clip an absolutely-positioned child of the nav cell).
 * The backdrop starts at `leftOffset`, leaving the nav itself un-dimmed and
 * interactive (so the trigger can toggle the flyout closed) — as Rivery does.
 */
export function ExoSideFlyout({
  open,
  onClose,
  width,
  leftOffset,
  top,
  ariaLabel,
  children,
}: ExoSideFlyoutProps) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <>
      <style>{KEYFRAMES}</style>
      <div
        aria-hidden
        onClick={onClose}
        style={{
          position: 'fixed',
          top,
          right: 0,
          bottom: 0,
          left: leftOffset,
          background: 'var(--exo-color-shadow-strong, rgba(0, 0, 0, 0.4))',
          zIndex: 1200,
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        style={{
          position: 'fixed',
          top,
          bottom: 0,
          left: leftOffset,
          width,
          background: 'var(--exo-color-background, #ffffff)',
          borderRight: '1px solid var(--exo-color-border-secondary, #e5e5e5)',
          boxShadow:
            '6px 0 20px var(--exo-color-shadow-moderate, rgba(0, 0, 0, 0.15))',
          zIndex: 1201,
          overflowY: 'auto',
          animation: 'exoFlyoutIn 0.22s ease-out',
        }}
      >
        {children}
      </aside>
    </>,
    document.body,
  );
}

export default ExoSideFlyout;

import {
  ExIconButton,
  IconButtonType,
} from '@boomi/exosphere/dist/react/icon-button';
import { IconVariant } from '@boomi/exosphere/dist/react/icon';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { useCore } from 'store/core';
import { useSelectedEnvironment } from 'store/environments/hooks/useGetEnvironment';
import { ReactComponent as BoomiLogo } from './assets/boomi-logo.svg';
import agentStudioIcon from './assets/agent-studio.png';

/**
 * BDI prototype — the Boomi platform Masthead, matching Figma node 5253:11156
 * (file tiKPfwTdw9PLZ6Dcfb222L), "Size=>XL-1200, Auth=True". A dark navy 56px
 * global top bar. Rendered when the prototype toggle is `masthead=exo`.
 *
 * EXOSPHERE-CUSTOM: Exosphere does not ship a single Masthead component, so this
 * is a flagged custom composite of Exosphere primitives (ExPill, ExIconButton)
 * + Exosphere `--exo-*` tokens, plus token-styled nav tabs / user pill to match
 * the Figma. Recorded in EXOSPHERE-CUSTOM.md.
 */

const NAVY = 'var(--exo-palette-navy-80, #072b55)';
const ACTIVE_TAB_BG = '#395577';
const NAV_TEXT = '#b5bfcc';
const USER_OUTLINE = '#8395aa';

function Caret() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** App-switcher waffle — a 3x3 grid of dots (matches the Figma "DotsNine"). */
function NineDots() {
  const coords = [6, 12, 18];
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      {coords.flatMap(cy =>
        coords.map(cx => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r="1.6"
            fill="currentColor"
          />
        )),
      )}
    </svg>
  );
}

function Tab({
  label,
  active = false,
  caret = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  caret?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        minHeight: 32,
        minWidth: 48,
        justifyContent: 'center',
        padding: '4px 8px',
        borderRadius: 4,
        border: 'none',
        cursor: 'pointer',
        background: active ? ACTIVE_TAB_BG : 'transparent',
        color: active ? '#ffffff' : NAV_TEXT,
        fontSize: 14,
        fontWeight: active ? 600 : 400,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ padding: '0 4px' }}>{label}</span>
      {caret ? <Caret /> : null}
    </button>
  );
}

function abbreviate(name: string): string {
  const n = (name || '').trim();
  if (!n) return 'ENV';
  const words = n.split(/\s+/);
  if (words.length > 1)
    return words
      .map(w => w[0])
      .join('')
      .slice(0, 3)
      .toUpperCase();
  return n.slice(0, 3).toUpperCase();
}

export function ExoMasthead() {
  const history = useHistory();
  const { username, activeAccountName, selectedAccountId, envId } = useCore();
  const env = useSelectedEnvironment();

  const envAbbrev = abbreviate(env?.name || activeAccountName || '');
  const userLabel = username || activeAccountName || 'User';
  const goHome = () =>
    history.push(`/dashboard/${selectedAccountId}/${envId}/dashboard`);

  return (
    <div
      data-bdi="exo-masthead"
      style={{
        height: 56,
        background: NAVY,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px 8px 8px',
        boxSizing: 'border-box',
        // Sit above the full-bleed Angular /ng iframe in the content area.
        position: 'relative',
        zIndex: 20,
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
      }}
    >
      {/* Left: logo lockup + primary nav */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 24, minWidth: 0 }}
      >
        <button
          type="button"
          onClick={goHome}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 6px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          <span
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'inline-flex',
            }}
          >
            <BoomiLogo style={{ width: '100%', height: '100%' }} />
          </span>
          <span
            style={{
              color: '#ffffff',
              fontFamily: "'Poppins', 'Nunito Sans', sans-serif",
              fontWeight: 700,
              fontSize: 20,
              whiteSpace: 'nowrap',
            }}
          >
            Data Integration
          </span>
        </button>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Tab label="Dashboard" active caret onClick={goHome} />
          <Tab label="Build" />
          <Tab label="Deploy" caret />
          <Tab label="Manage" caret />
        </nav>
      </div>

      {/* Right: action group */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* Environment badge — matches the Figma's warning-yellow Pill tokens
            (the shipped ExPill 'yellow' renders white in this build). */}
        <span
          title={env?.name || ''}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            height: 32,
            padding: '4px 12px',
            borderRadius: 50,
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            background: 'var(--exo-color-background-warning, #fcedbd)',
            border:
              '1px solid var(--exo-color-background-warning-strong, #cf761b)',
            color: 'var(--exo-color-font, #1f1f1f)',
          }}
        >
          {envAbbrev}
        </span>

        <ExIconButton
          type={IconButtonType.TERTIARY}
          variant={IconVariant.INVERSE}
          icon="magnifying-glass"
          label="Search"
        />
        <ExIconButton
          type={IconButtonType.TERTIARY}
          variant={IconVariant.INVERSE}
          icon="information"
          label="Help"
        />
        <ExIconButton
          type={IconButtonType.TERTIARY}
          variant={IconVariant.INVERSE}
          icon="envelope-closed"
          label="Notifications"
          indicator
        />

        {/* Agent Studio shortcut — the Boomi colorful brand mark, recomposed
            from the Figma source vector/gradient layers (see assets/). */}
        <img
          src={agentStudioIcon}
          alt="Agent Studio"
          title="Agent Studio"
          style={{
            width: 32,
            height: 32,
            flexShrink: 0,
            objectFit: 'contain',
          }}
        />

        {/* App-switcher waffle (3x3 dots) */}
        <button
          type="button"
          aria-label="Apps"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            border: 'none',
            background: 'transparent',
            color: '#ffffff',
            cursor: 'pointer',
            borderRadius: 4,
            flexShrink: 0,
          }}
        >
          <NineDots />
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            maxWidth: 160,
            minWidth: 48,
            height: 32,
            padding: '4px 12px',
            boxSizing: 'border-box',
            border: `1px solid ${USER_OUTLINE}`,
            borderRadius: 16,
            color: '#ffffff',
            fontSize: 14,
          }}
          title={userLabel}
        >
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ExoMasthead;

import {
  ButtonFlavor,
  ButtonType,
  ExButton,
} from '@boomi/exosphere/dist/react/button';
import { ExIcon, IconSize } from '@boomi/exosphere/dist/react/icon';
import {
  ExLeftMenubar,
  ExLeftmenubarDivider,
  ExLeftmenubarLink,
} from '@boomi/exosphere/dist/react/leftmenubar';
import { AccountEnvSelection } from 'layout/Sidebar/components/AccountEnvSelection';
import {
  createSidebarUrl,
  DrawerType,
  WIDE_MENU_LG,
} from 'layout/Sidebar/common';
import { useBdiConfig } from 'modules/BdiPrototype';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useCore } from 'store/core';
import { SidebarTags } from 'utils/tracking.tags';
import ExoCreateFlyout from './ExoCreateFlyout';
import ExoEnvSelector from './ExoEnvSelector';
import ExoSideFlyout from './ExoSideFlyout';

/**
 * BDI prototype — the Rivery left sidebar rebuilt with the Exosphere
 * `ExLeftMenubar` family, wired to the same nav items / routes as the original
 * `src/layout/Sidebar`. Rendered when the prototype toggle is `leftnav=exo`.
 *
 * Restores the affordances the first rebuild dropped vs. Rivery (all composed
 * OUTSIDE the memoized menubar — see the icon note below):
 * - a prominent primary "Create" button opening an Exosphere-reskinned LEFT
 *   flyout with the four Data Flow options (ExoCreateFlyout),
 * - the account/environment selector pill (ExoEnvSelector) + its drawer,
 * - the "Ask AI" entry (bound to the external Kapa widget by `id`),
 * - the "Blueprints" nav link.
 *
 * Implementation notes:
 * - Uses plain `ExLeftMenubar` + `ExLeftmenubarLink`; the `ExLeftmenubarAdjustable`
 *   wrapper's collapse/scroll machinery mis-renders in this embedding.
 * - Icons use Exosphere `ExIcon` (themed for the light menubar).
 * - CRITICAL: the menubar subtree is rendered ONCE (memoized) and the active
 *   (`selected`) state is applied imperatively via refs. The leftmenubar web
 *   component relocates its slotted icons into its shadow DOM; if React
 *   re-renders the subtree (e.g. on the post-login `/` -> dashboard redirect, or
 *   on drawer open/close) it reconciles those moved nodes and the icons
 *   disappear. Rendering once — and keeping the new buttons/state OUTSIDE the
 *   memo — avoids that.
 */

type NavEntry = {
  key: string; // first URL segment, used for active matching
  label: string;
  icon: string; // Exosphere ExIcon name
  to: string;
};

const MASTHEAD_HEIGHT = 56;
const CREATE_FLYOUT_WIDTH = parseInt(WIDE_MENU_LG, 10); // 530 — matches Rivery
const ENV_FLYOUT_WIDTH = 300; // matches Rivery's env drawer default

export function ExoLeftnav() {
  const history = useHistory();
  const { pathname } = useLocation();
  const { selectedAccountId, envId, user, activeAccountName } = useCore();
  const accountId = selectedAccountId;
  const activeKey = pathname.split('/')[1] || '';
  // When the masthead is also on, it carries the brand + user, so the leftnav
  // drops both (and fits the reduced 100% body height under the masthead row).
  const { masthead } = useBdiConfig();
  const hasMasthead = masthead === 'exo';

  // Which side flyout is open — reuses the original Rivery DrawerType toggle
  // semantics (CREATE_RIVER | ENVIRONMENTS). Kept outside the memoized menubar.
  const [drawer, setDrawer] = useState<DrawerType | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [navRight, setNavRight] = useState(0);

  // Measure the nav's right edge so the (fixed, portaled) flyout sits flush
  // against it. Portaling is required because the app grid is `overflow:hidden`.
  useEffect(() => {
    if (!drawer) return undefined;
    const measure = () => {
      if (navRef.current) {
        setNavRight(navRef.current.getBoundingClientRect().right);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [drawer]);

  // Stable nav config (depends only on the resolved account/env). Blueprints is
  // included unconditionally here (Rivery gates it on the `allow_recipe` setting;
  // gating on an async-resolving flag would re-memoize the menubar and destroy
  // its slotted icons — so the prototype always shows it).
  const sections = useMemo<NavEntry[][]>(() => {
    const url = (p: string, s = '') =>
      createSidebarUrl(p, s)({ accountId, envId });
    return [
      [
        {
          key: 'dashboard',
          label: 'Dashboard',
          icon: 'bar-chart-vertical',
          to: url('dashboard', 'dashboard'),
        },
        {
          key: 'activities',
          label: 'Activities',
          icon: 'list-bulleted',
          to: url('activities', 'activities'),
        },
      ],
      [
        {
          key: 'rivers',
          label: 'Data Flows',
          icon: 'values-flow',
          to: url('rivers'),
        },
        { key: 'kits', label: 'Kits', icon: 'folder-group', to: url('kits') },
      ],
      [
        {
          key: 'connections',
          label: 'Connections',
          icon: 'integration-color',
          to: url('connections', 'connections'),
        },
        {
          key: 'blueprints',
          label: 'Blueprints',
          icon: 'document',
          to: url('blueprints', 'blueprints'),
        },
        {
          key: 'variables',
          label: 'Variables',
          icon: 'database-dataset',
          to: url('variables', 'variables'),
        },
        {
          key: 'environments',
          label: 'Environments',
          icon: 'globe-east',
          to: url('environments', 'environments'),
        },
      ],
      [
        {
          key: 'settings',
          label: 'Settings',
          icon: 'cog-outline',
          to: url('settings', 'account'),
        },
        { key: 'whats-new', label: "What's New", icon: 'star-outline', to: '' },
        { key: 'help', label: 'Help', icon: 'book-bookmark', to: '' },
      ],
    ];
  }, [accountId, envId]);

  // key -> link host element, for imperative `selected` updates.
  const linkRefs = useRef<Record<string, any>>({});

  // Render the menubar ONCE (stable element). React must not re-reconcile this
  // subtree, or the relocated slotted icons get destroyed.
  const menubar = useMemo(
    () => (
      <ExLeftMenubar>
        {sections.map((section, si) => (
          <React.Fragment key={si}>
            {si > 0 ? <ExLeftmenubarDivider /> : null}
            {section.map(item => (
              <ExLeftmenubarLink
                key={item.key}
                ref={(el: any) => {
                  if (el) linkRefs.current[item.key] = el;
                }}
                label={item.label}
                tooltipText={item.label}
                onClick={item.to ? () => history.push(item.to) : undefined}
              >
                <ExIcon slot="icon" icon={item.icon} size={IconSize.S} />
              </ExLeftmenubarLink>
            ))}
          </React.Fragment>
        ))}
      </ExLeftMenubar>
    ),
    [sections, history],
  );

  // Apply active state imperatively whenever the route changes.
  useEffect(() => {
    Object.entries(linkRefs.current).forEach(([key, el]) => {
      if (el) el.selected = key === activeKey;
    });
  }, [activeKey, menubar]);

  const initials = `${(user?.first_name || 'B')[0]}${
    (user?.last_name || 'D')[0]
  }`.toUpperCase();
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(' ');

  const flyoutTop = hasMasthead ? MASTHEAD_HEIGHT : 0;

  // Plain block layout (no flex / fixed width / overflow-x) — constraining the
  // menubar makes its shadow content clip on the left. Bottom stack pinned absolute.
  return (
    <div
      ref={navRef}
      data-bdi="exo-leftnav"
      style={{
        height: hasMasthead ? '100%' : '100vh',
        position: 'relative',
        // The authenticated app renders a full-bleed Angular `/ng` iframe in the
        // content area that otherwise overlaps the nav's left edge once it loads
        // (~1s in), hiding the icons + brand. The original Rivery sidebar uses
        // zIndex 6 for the same reason; sit safely above it.
        zIndex: 10,
        // Reserve space for the absolute bottom stack (Ask AI + optional user row).
        paddingBottom: hasMasthead ? 48 : 108,
        boxSizing: 'border-box',
        background: 'var(--exo-color-background, #ffffff)',
        borderRight: '1px solid var(--exo-color-border-secondary, #e5e5e5)',
      }}
    >
      {/* Brand header — hidden when the masthead carries the brand. */}
      {!hasMasthead && (
        <button
          type="button"
          onClick={() =>
            history.push(createSidebarUrl('home')({ accountId, envId }))
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--exo-spacing-x-small, 8px)',
            width: '100%',
            padding: 'var(--exo-spacing-standard, 16px)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--exo-color-font, #1f1f1f)',
          }}
        >
          <span
            aria-hidden
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 26,
              height: 26,
              flexShrink: 0,
              borderRadius: 6,
              background: 'var(--exo-color-background-brand, #072b55)',
              color: 'var(--exo-color-font-inverse, #ffffff)',
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            b
          </span>
          <span style={{ fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap' }}>
            Data Integration
          </span>
        </button>
      )}

      {/* Account / environment selector (opens the switcher drawer). */}
      <ExoEnvSelector
        active={drawer === DrawerType.ENVIRONMENTS}
        onClick={() =>
          setDrawer(prev =>
            prev === DrawerType.ENVIRONMENTS ? null : DrawerType.ENVIRONMENTS,
          )
        }
      />

      {/* "Create" action — opens the Exosphere-reskinned Create flyout. Uses the
          SECONDARY (outlined) type so it stays discoverable without shouting over
          the rest of the nav. */}
      <div
        style={{
          padding:
            'var(--exo-spacing-small, 12px) var(--exo-spacing-standard, 16px)',
        }}
      >
        <ExButton
          type={ButtonType.SECONDARY}
          flavor={ButtonFlavor.BASE}
          aria-label="Create"
          data-pendo-id={SidebarTags.CREATE_BUTTON}
          onClick={() =>
            setDrawer(prev =>
              prev === DrawerType.CREATE_RIVER ? null : DrawerType.CREATE_RIVER,
            )
          }
          style={{ display: 'block', width: '100%' }}
        >
          {/* slot="prefix" lets the button size the icon and set the icon/text
              gap itself (its ::slotted rule) — don't set size or a manual gap. */}
          <ExIcon slot="prefix" icon="plus" />
          Create
        </ExButton>
      </div>

      {/* Primary navigation (rendered once) */}
      {menubar}

      {/* Bottom utility stack — pinned to the bottom (kept in block flow so the
          menubar's shadow content is never clipped). */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
        {/* Ask AI — no onClick; the external Kapa widget binds to this id. */}
        <button
          id="ask-ai-button"
          type="button"
          aria-label="Ask AI"
          data-pendo-id={SidebarTags.ASK_AI_BUTTON}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--exo-spacing-x-small, 8px)',
            width: '100%',
            padding:
              'var(--exo-spacing-small, 12px) var(--exo-spacing-standard, 16px)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--exo-color-data-solid-periwinkle, #6b6bd6)',
          }}
        >
          <ExIcon icon="star-fill" size={IconSize.S} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Ask AI</span>
        </button>

        {/* User row — hidden when the masthead carries the user menu. */}
        {!hasMasthead && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--exo-spacing-x-small, 8px)',
              padding:
                'var(--exo-spacing-small, 12px) var(--exo-spacing-standard, 16px)',
              borderTop: '1px solid var(--exo-color-border-secondary, #e5e5e5)',
              background: 'var(--exo-color-background, #ffffff)',
              boxSizing: 'border-box',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '50%',
                flexShrink: 0,
                background: 'var(--exo-color-background-brand, #072b55)',
                color: 'var(--exo-color-font-inverse, #ffffff)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {initials}
            </span>
            <span
              style={{
                fontSize: 13,
                color: 'var(--exo-color-font, #1f1f1f)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={fullName || activeAccountName}
            >
              {fullName || activeAccountName || 'User'}
            </span>
          </div>
        )}
      </div>

      {/* Left-anchored flyouts (portaled to <body>, fixed against the nav's right edge). */}
      <ExoSideFlyout
        open={drawer === DrawerType.CREATE_RIVER}
        onClose={() => setDrawer(null)}
        width={CREATE_FLYOUT_WIDTH}
        leftOffset={navRight}
        top={flyoutTop}
        ariaLabel="Create data flow"
      >
        <ExoCreateFlyout onClose={() => setDrawer(null)} />
      </ExoSideFlyout>

      <ExoSideFlyout
        open={drawer === DrawerType.ENVIRONMENTS}
        onClose={() => setDrawer(null)}
        width={ENV_FLYOUT_WIDTH}
        leftOffset={navRight}
        top={flyoutTop}
        ariaLabel="Account and environment selector"
      >
        {/* Reuse the original Rivery account/env switcher body verbatim. */}
        <AccountEnvSelection setDrawer={setDrawer} />
      </ExoSideFlyout>
    </div>
  );
}

export default ExoLeftnav;

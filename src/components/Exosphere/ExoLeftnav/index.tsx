import { ExIcon, IconSize } from '@boomi/exosphere/dist/react/icon';
import {
  ExLeftMenubar,
  ExLeftmenubarDivider,
  ExLeftmenubarLink,
} from '@boomi/exosphere/dist/react/leftmenubar';
import { createSidebarUrl } from 'layout/Sidebar/common';
import { useBdiConfig } from 'modules/BdiPrototype';
import React, { useEffect, useMemo, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useCore } from 'store/core';

/**
 * BDI prototype — the Rivery left sidebar rebuilt with the Exosphere
 * `ExLeftMenubar` family, wired to the same nav items / routes as the original
 * `src/layout/Sidebar`. Rendered when the prototype toggle is `leftnav=exo`.
 *
 * Implementation notes:
 * - Uses plain `ExLeftMenubar` + `ExLeftmenubarLink`; the `ExLeftmenubarAdjustable`
 *   wrapper's collapse/scroll machinery mis-renders in this embedding.
 * - Icons use Exosphere `ExIcon` (themed for the light menubar).
 * - CRITICAL: the menubar subtree is rendered ONCE (memoized) and the active
 *   (`selected`) state is applied imperatively via refs. The leftmenubar web
 *   component relocates its slotted icons into its shadow DOM; if React
 *   re-renders the subtree (e.g. on the post-login `/` -> dashboard redirect) it
 *   reconciles those moved nodes and the icons disappear. Rendering once avoids that.
 */

type NavEntry = {
  key: string; // first URL segment, used for active matching
  label: string;
  icon: string; // Exosphere ExIcon name
  to: string;
};

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

  // Stable nav config (depends only on the resolved account/env).
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

  // Plain block layout (no flex / fixed width / overflow-x) — constraining the
  // menubar makes its shadow content clip on the left. User row pinned absolute.
  return (
    <div
      data-bdi="exo-leftnav"
      style={{
        height: hasMasthead ? '100%' : '100vh',
        position: 'relative',
        // The authenticated app renders a full-bleed Angular `/ng` iframe in the
        // content area that otherwise overlaps the nav's left edge once it loads
        // (~1s in), hiding the icons + brand. The original Rivery sidebar uses
        // zIndex 6 for the same reason; sit safely above it.
        zIndex: 10,
        paddingBottom: hasMasthead ? 0 : 56,
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

      {/* Primary navigation (rendered once) */}
      {menubar}

      {/* User row — hidden when the masthead carries the user menu. */}
      {!hasMasthead && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
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
  );
}

export default ExoLeftnav;

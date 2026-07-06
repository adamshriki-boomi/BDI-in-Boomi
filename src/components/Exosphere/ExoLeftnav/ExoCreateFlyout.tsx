/**
 * ────────────────────────────────────────────────────────────
 * CUSTOM EXOSPHERE EXTENSION
 * NOT part of @boomi/exosphere.
 *
 * Approved by: Adam Shriki  on  2026-07-06
 * Reason: Exosphere reskin of Rivery's "Create Data Pipelines & Workflows"
 *   flyout. Exosphere ships no card-picker drawer, so the panel is composed
 *   from --exo-* tokens. Behaviour + copy + the four options are preserved 1:1
 *   from the original (data + actions are REUSED, not re-implemented — see below)
 *   so the create experience still "feels at home".
 *
 * Rules this file follows:
 *   - Colors / spacing / radii come from --exo-* tokens (raw values only as fallbacks).
 *   - Reuses the shipped `riverItems` catalog and the real navigation/draft hooks.
 *
 * Revisit if Exosphere ships a card-list picker.
 * ────────────────────────────────────────────────────────────
 */
import { ExIcon, IconSize } from '@boomi/exosphere/dist/react/icon';
import { RiverTypes } from 'api/types';
import { RoutesBuilder } from 'app/routes';
// REUSE: same catalog (title/description/type) the Rivery drawer renders — the
// illustrations are swapped for Exosphere ExIcons (ICON_BY_TYPE) to stay on-system.
import { riverItems } from 'containers/Onboarding/components/Steps/Step1';
// REUSE: same draft-river side-effect the Rivery Logic card fires.
import { useRiverBuilder } from 'containers/River/hooks/useRiverLoader';
import { useHistory } from 'react-router-dom';
import { useAccount, useCore } from 'store/core';
import { useGroupsState } from 'store/groups';
import { getCrossId } from 'utils/api.sanitizer';
// REUSE: same per-river-type route builder.
import { useRiverRouteBuilder } from 'utils/create-river.helpers';

// One Exosphere icon per Data Flow type (replacing the off-system Rivery
// illustrations). All are monochrome kebab icons that inherit the brand color.
const ICON_BY_TYPE: Record<string, string> = {
  [RiverTypes.SOURCE_TO_FZ]: 'hub-dataset', // the datasets/tables being moved
  [RiverTypes.LOGIC]: 'code', // SQL + Python
  [RiverTypes.ACTION]: 'Toolbox', // "build your own"
  Kits: 'folder-group', // matches the leftnav Kits icon
};

// Hover lifts the card via border + shadow only (no background change) so the
// grey icon badge stays visible.
const CARD_STYLES =
  '.exo-create-card{transition:border-color .15s,box-shadow .15s}' +
  '.exo-create-card:hover:not(:disabled){' +
  'border-color:var(--exo-color-background-action,#0b5cd7);' +
  'box-shadow:0 2px 8px var(--exo-color-shadow-weak,rgba(0,0,0,0.08))}' +
  '.exo-create-card:disabled{opacity:.6;cursor:not-allowed}';

export interface ExoCreateFlyoutProps {
  onClose: () => void;
}

/**
 * The Create flyout body — Exosphere-reskinned cards driven by the same data
 * and actions as the original Rivery `RiverTypeBoxes` (createDrawer variant).
 */
export function ExoCreateFlyout({ onClose }: ExoCreateFlyoutProps) {
  const history = useHistory();
  const { selectedAccountId: accountId, envId } = useCore();
  const { isViewerRole } = useAccount();
  const { createLinkByRiverType } = useRiverRouteBuilder();
  const { defaultGroup } = useGroupsState();
  const createRiver = useRiverBuilder();

  const handleClick = (type: RiverTypes | 'Kits') => {
    onClose();
    if (isViewerRole) return;
    if (type === 'Kits') {
      history.push(RoutesBuilder.kits({ accountId, envId }));
      return;
    }
    // Logic Flow also spins up a draft river before navigating (as Rivery does).
    if (type === RiverTypes.LOGIC) {
      createRiver(getCrossId(defaultGroup), type);
    }
    history.push(createLinkByRiverType({ type: type as RiverTypes }));
  };

  return (
    <div
      style={{
        padding:
          'var(--exo-spacing-large, 24px) var(--exo-spacing-standard, 16px)',
      }}
    >
      <style>{CARD_STYLES}</style>
      <header
        style={{
          textAlign: 'center',
          marginBottom: 'var(--exo-spacing-large, 24px)',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--exo-color-font, #1f1f1f)',
          }}
        >
          Create Data Pipelines &amp; Workflows
        </h2>
        <p
          style={{
            margin: 'var(--exo-spacing-x-small, 8px) 0 0',
            fontSize: 13,
            color: 'var(--exo-color-font-secondary, #57606a)',
          }}
        >
          Each type of Data Flow helps you accomplish different tasks.
        </p>
      </header>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--exo-spacing-standard, 16px)',
        }}
      >
        {riverItems.map(item => {
          const iconName = ICON_BY_TYPE[item.type as string] ?? 'values-flow';
          return (
            <button
              key={item.title}
              type="button"
              className="exo-create-card"
              aria-label={item.title}
              disabled={isViewerRole}
              onClick={() => handleClick(item.type as RiverTypes | 'Kits')}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                alignItems: 'center',
                gap: 'var(--exo-spacing-standard, 16px)',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                padding: 'var(--exo-spacing-standard, 16px)',
                borderRadius: 'var(--exo-radius-standard, 8px)',
                border: '1px solid var(--exo-color-border-secondary, #e5e5e5)',
                background: 'var(--exo-color-background, #ffffff)',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--exo-color-background-secondary, #f5f5f5)',
                }}
              >
                <ExIcon icon={iconName} size={IconSize.S} />
              </span>
              <span
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--exo-spacing-x-small, 8px)',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--exo-color-font, #1f1f1f)',
                  }}
                >
                  {item.title}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    lineHeight: 1.4,
                    color: 'var(--exo-color-font-secondary, #57606a)',
                  }}
                >
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ExoCreateFlyout;

import { useAccount, useCore } from 'store/core/hooks';
import { useRiver } from 'store/river/hooks';

/**
 * When user is a viewer - or account is blocked - or user is in versions mode he has readonly permissions
 */
export function useEnableEdit() {
  const { isAccountBlocked } = useCore();
  const { isViewerRole } = useAccount();
  const { isVersionMode } = useRiver();
  return { enableEdit: !(isVersionMode || isViewerRole || isAccountBlocked) };
}

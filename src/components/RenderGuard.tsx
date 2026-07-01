import { ReactElement, ReactNode } from 'react';

interface RenderGuardProps {
  /**
   * the value is verified with a `Boolean()`
   */
  condition: boolean | string | Function;
  children: ReactNode;
  /**
   * (default) null
   */
  fallback?: ReactElement;
}
/**
 * conditional render component
 */
export const RenderGuard = ({
  condition,
  children,
  fallback = null,
}: RenderGuardProps): any => {
  return Boolean(condition) ? children : fallback;
};

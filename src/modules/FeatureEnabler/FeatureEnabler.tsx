import React from 'react';
import { useCore } from 'store/core';

/**
 * disables a button when account is blocked
 */
export function FeatureEnabler({
  children,
  scope = '',
  hideWhenDisabled = false,
}) {
  const { isAccountBlocked, accountScopes } = useCore();
  const unauthorized =
    (scope && !accountScopes.includes(scope)) || isAccountBlocked;
  if (hideWhenDisabled && unauthorized) {
    return null;
  }
  return unauthorized
    ? React.cloneElement(children, { disabled: true })
    : children;
}

import React, { useEffect } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useRiver } from 'store/river';
import './ErrorBoundary.scss';
import { ErrorFallbackRivers } from './ErrorFallbackRivers';

export function ErrorBoundaryRivers({ children }) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallbackRivers}>
      {children}
    </ReactErrorBoundary>
  );
}

export const RiverFailCheck = () => {
  const { errorFailRiver } = useRiver();
  useEffect(() => {
    if (errorFailRiver) {
      throw new Error(errorFailRiver);
    }
  }, [errorFailRiver]);
  return null;
};

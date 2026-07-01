import React, { useEffect } from 'react';
import { useCoreActions } from 'store/core';

export function WelcomeScreen() {
  const { setOnboardingRedirect } = useCoreActions();

  useEffect(() => {
    // Clear the onboarding redirect flag when we reach the onboarding page
    setOnboardingRedirect(false);
  }, [setOnboardingRedirect]);

  return <div />;
}

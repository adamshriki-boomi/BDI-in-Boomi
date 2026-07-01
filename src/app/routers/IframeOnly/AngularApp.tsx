import { OldApp } from 'components';
import React from 'react';
import { useCore } from 'store/core';
import { useUrlMapper } from '../hooks/useUrlMapper';

export const AngularApp = React.memo(Angular);
function Angular() {
  const { shouldRenderRoute, url } = useUrlMapper();
  const iframeStateStyle = shouldRenderRoute
    ? { m: 0 }
    : { position: 'absolute', transform: 'translateX(-150%)', top: 0 };

  // WHY? 🧐  when these change, we want to force iframe reload (and by that calling token and login)
  const { selectedAccountId, envId } = useCore();
  const urlForIframe = !shouldRenderRoute ? 'inactive' : url;
  return (
    <OldApp
      url={urlForIframe}
      disabled={!shouldRenderRoute}
      iframeKey={`${selectedAccountId}/${envId}`}
      {...iframeStateStyle}
    />
  );
}

import { History } from 'history';
import React, { MutableRefObject, useLayoutEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { OldAppIframe } from './OldAppIframe';

type Props = {
  url?: string;
  className?: string;
  params?: string;
  disabled?: boolean;
  /**
   * (deafult: true) adds 'iframe' param in order to remove any sidebar/topbar
   */
  useIframeParam?: boolean;
  iframeKey?: string;
};

export function OldApp({ disabled, ...props }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>();
  useIframeUrlListener(iframeRef, disabled);

  return <OldAppIframe ref={iframeRef} {...props} disabled={disabled} />;
}

type IframeRef = MutableRefObject<HTMLIFrameElement>;

/**
 * silently updates the react-app url in respond to
 * the internal iframe's url change
 * @param iframeRef iframe node reference
 */
const useIframeUrlListener = (iframeRef: IframeRef, disabled: boolean) => {
  const history: any = useHistory();
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    function onIframeHashChange(ev) {
      updateLocationHash({ history, iframeUrl: ev.newURL, appUrl: pathname });
    }
    const currentIframe = iframeRef?.current;
    let timeoutId;
    if (!disabled) {
      timeoutId = setTimeout(() => {
        if (currentIframe) {
          getWindow(currentIframe)?.addEventListener(
            'hashchange',
            onIframeHashChange,
          );
        }
      }, 500);
    }
    return () => {
      clearTimeout(timeoutId);
      getWindow(currentIframe)?.removeEventListener(
        'hashchange',
        onIframeHashChange,
      );
    };
  }, [history, iframeRef, pathname, disabled]);
};

const getWindow = (iframe): Window => iframe?.contentWindow?.window;
/**
 * checked whether newURL includes different information then oldUrl
 */
const hasUrlChanged = (newURL: string, oldUrl: string) => {
  const newUrlSplitted = newURL.split('/#');
  newUrlSplitted.shift();
  const amountOfSlashInIframe = newUrlSplitted.join('').match(/\//gm)?.length;
  const amountOfSlashInOldUrl = oldUrl.match(/\//gm)?.length;
  return amountOfSlashInIframe > amountOfSlashInOldUrl;
};

type UpdateLocationHashProps = {
  history: History;
  iframeUrl: string;
  appUrl: string;
};
/**
 * silently updates the location's hash if iframrUrl(ng) is different than appUrl (react)
 */
const ngHostnamePortRegxp = /^((https:)*\/\/[a-z0-9.:-]+\/ng\/#)/;
const ngHostPortRegexp = new RegExp(ngHostnamePortRegxp, 'gi');
const updateLocationHash = ({
  history,
  iframeUrl,
  appUrl,
}: UpdateLocationHashProps) => {
  // means it's a route originated from the iframe
  const isInternalChange = !iframeUrl.includes('iframe');
  const hasIframeUrlChanged = hasUrlChanged(iframeUrl, appUrl);
  const isUrlInCurrentLocation = iframeUrl.includes(appUrl);

  if ((isInternalChange && !isUrlInCurrentLocation) || hasIframeUrlChanged) {
    const urlToUpdate = (iframeUrl as string)
      .replace(ngHostPortRegexp, '')
      // remove any parameters from the url
      .split('?iframe')
      .shift();
    // silent: react-router should not handle route change
    if (isUrlInCurrentLocation) history.push(urlToUpdate);
    else {
      history.replace(urlToUpdate);
    }
  }
};

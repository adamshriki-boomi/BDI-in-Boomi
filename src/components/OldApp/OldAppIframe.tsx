import { chakra, FlexProps } from '@chakra-ui/react';
import { TopBarContext } from 'app/AppTopBarContext';
import { StyleProps } from 'components';
import { getQueryParams } from 'hooks/router';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import { SidebarShell, useShouldShowSidebar } from 'modules/RiverRightBar';
import { VERSION_PARAM } from 'modules/Versions';
import queryString from 'query-string';
import React, {
  LegacyRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useCore } from 'store/core';
import { ParamsOptions } from 'containers/River/RiverLogic/Logic/components/RiverBar/RiverBar';

interface Props extends FlexProps {
  url?: string;
  iframeRef?: LegacyRef<any>;
  params?: string;
  useIframeParam?: boolean;
  ariaLabel?: string;
  iframeKey?: string;
  disabled?: boolean;
  height?: string;
}

const useParamsResolver = paramsInput => {
  const location = useLocation();
  if (paramsInput) {
    return paramsInput;
  } else {
    const state = location?.state;
    const searchParams = location?.search?.replace('?', '') || '';
    const hasParams = state && Object.keys(state)?.length > 0;
    const params = hasParams ? `${queryString.stringify(state)}&` : '';
    return `${params}${searchParams}`;
  }
};

const useKeepIframeTokenSynced = () => {
  const { account } = useCore();
  const token = account?.token;
  useEffect(() => {
    const iframe = (document.querySelector('iframe') as HTMLIFrameElement)
      ?.contentWindow;
    iframe?.postMessage('refresh', window.location.href);
  }, [token]);
};

export const OldAppIframe = React.forwardRef(
  (
    {
      url = '',
      useIframeParam = true,
      ariaLabel = 'old-app',
      iframeKey = '',
      disabled = false,
      params,
      height = '100vh',
      ...rest
    }: Props,
    ref: LegacyRef<HTMLIFrameElement>,
  ) => {
    useTitleUpdater(url, disabled);
    const { showSidebar, paramsForIframe } = useUrlParamsResolver(
      params,
      disabled,
    );

    const { show: isVisible } = useContext(TopBarContext);

    const heightWithBanner =
      params === ParamsOptions.POPUP
        ? height
        : isVisible
        ? `calc(${height} - 45px)`
        : '100vh';

    const src = createUrl({ url, params: paramsForIframe, useIframeParam });
    useKeepIframeTokenSynced();

    return (
      <SidebarShell
        m="0"
        gridTemplateAreas={`'content ${SidebarShell.sidebarGridArea}'`}
        fallbackAreas="'content'"
        showSidebar={showSidebar}
        {...rest}
      >
        <chakra.iframe
          gridArea="content"
          ref={el => {
            if (el) {
              el.contentWindow.location.replace(src);
            }
            if (typeof ref === 'function') {
              ref(el);
            } else if (ref?.hasOwnProperty('current')) {
              (ref as any).current = el;
            }
          }}
          key={iframeKey}
          title="old-app-iframe"
          width="full"
          height={heightWithBanner}
          border="none"
          {...(src.indexOf('create_first_river') >= 0 && fullScreenStyle)}
          role="application"
          aria-label={ariaLabel}
        ></chakra.iframe>
      </SidebarShell>
    );
  },
);

const fullScreenStyle: StyleProps = {
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 10,
  height: '100vh',
};
const createUrl = ({ url, params, useIframeParam }) => {
  const iframeParam = useIframeParam ? 'iframe' : '';
  const paramSeparator =
    iframeParam && (params || '&').endsWith('&') ? '' : '&';
  return `/${import.meta.env.VITE_IFRAME_URL}/#/${url.replace(
    /^\//,
    '',
  )}?${params}${paramSeparator}${iframeParam}`;
};

export const useIsNewLegacyRiverSaved = () => {
  const EventsMapper =
    (setInfo, replace) =>
    ({ data }) => {
      if (data?.type === 'new_river') {
        setInfo(data?.data?.cross_id);
      } else if (data?.type === 'go_to_activities') {
        replace({ search: `river_drawer=activities` });
      }
    };
  const [newRiverCrossId, setNewRiverSaved] = useState(null);
  const clearId = useCallback(() => setNewRiverSaved(null), []);
  const { replace } = useHistory();
  useEffect(() => {
    window.addEventListener('message', EventsMapper(setNewRiverSaved, replace));
  }, [replace]);

  return { newRiverCrossId, clearId };
};
const resolveNewRiverParams = paramsFinal => {
  const {
    selected_river_type,
    cacheSlayer,
    run_type,
    selected_source,
    selected_target,
  } = getQueryParams([
    'selected_river_type',
    'cacheSlayer',
    'run_type',
    'selected_source',
    'selected_target',
  ]);
  const dsParam = selected_source ? `&selected_source=${selected_source}` : '';
  const targetParam = selected_target
    ? `&selected_target=${selected_target}`
    : '';
  return run_type
    ? paramsFinal?.replace('&river_drawer=variables', '')
    : `cacheSlayer=${cacheSlayer}${dsParam}&selected_river_type=${selected_river_type}&${targetParam}`;
};
const useUrlParamsResolver = (params, disabled) => {
  const paramsFinal = useParamsResolver(params);
  const paramsArray = paramsFinal.split('&');
  const isInVersionView = paramsArray.find(param =>
    param.includes(`${VERSION_PARAM}=`),
  );
  const { isInNewRiverPage, isInRiverView } = useShouldShowSidebar({
    params,
  });
  const { version } = getQueryParams(['version']);
  const paramsForIframe = isInVersionView
    ? `version=${version}`
    : isInNewRiverPage
    ? resolveNewRiverParams(paramsFinal)
    : isInRiverView && !isInVersionView
    ? 'river_drawer=true'
    : paramsFinal;
  const showSidebar = (isInRiverView || isInNewRiverPage) && !disabled;
  return { showSidebar, paramsForIframe };
};

const TITLE_OVERRIDES: Record<string, string> = {
  river: 'Data Flow',
  rivers: 'Data Flows',
};

const useTitleUpdater = (url: string, disabled: boolean) => {
  const titleName = disabled ? undefined : url?.split('/').shift();
  useDocumentTitle(
    disabled
      ? undefined
      : TITLE_OVERRIDES[titleName] ??
          `${titleName.charAt(0).toUpperCase()}${titleName.substring(1)}`,
  );
};

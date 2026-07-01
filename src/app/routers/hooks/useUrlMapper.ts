// any "url" defined within urlMap will be transformed by the provided function

import { reactAppRoutes, supportedAppRoutes } from 'app/routes';
import { useLocation } from 'react-router-dom';
import { useCore } from 'store/core';

// because some urls are accessed with slightly different prefix/suffix
type CreateUrlConfig = {
  prefix: string;
  accountId: string;
  envId: string;
};
const join = (sections: string[]) => sections.join('/');

const createAccountUrl = ({ prefix, accountId, envId }: CreateUrlConfig) =>
  join([prefix, accountId, envId]);
const createPrefixedWrappedUrl = (config: CreateUrlConfig) =>
  join([createAccountUrl(config), config.prefix]);
const urlMap = {
  kits: createAccountUrl,
  environments: createPrefixedWrappedUrl,
  tokens: createPrefixedWrappedUrl,
};

// urls that should be resolved with a react component and NOT by iframe
// i.e - settings is rendered within the react app and not displayed in an iframe
/**
 * resolves the current url and map it to the relevant url that should
 * navigate inside the old-app iframe
 */
export const useUrlMapper = () => {
  const { pathname: url } = useLocation();

  const { selectedAccountId: accountId, envId } = useCore();
  const prefix = url.startsWith('/') ? url.substr(1) : url;
  const isRouteExcluded = reactAppRoutes.some(excludedUrl =>
    prefix?.toLowerCase()?.startsWith(excludedUrl?.toLowerCase()),
  );

  const isPrefixIncludesAccount = prefix.split('/').length > 1;
  // url doesn't include any account/envId
  const isShortUrl = isRouteExcluded ? !isPrefixIncludesAccount : true;

  const createUrl = (prefixToUrl: string) => {
    return join([
      createAccountUrl({
        prefix: prefixToUrl,
        accountId,
        envId,
      }),
      prefixToUrl,
    ]);
  };
  // when prefix is empty, app should redirect to dashboard and not
  const resolvePrefix = prefix => {
    const prefixToUrl = prefix === '' ? 'dashboard' : prefix;
    const isPrefixSupported = isSupportedRoute(prefixToUrl);
    return isPrefixIncludesAccount || !isPrefixSupported
      ? prefix
      : createUrl(prefixToUrl);
  };

  // when some minimal urls are used, some of them have to be transformed
  // to full urls with account and envId
  const normalizedPrefix = urlMap[prefix]
    ? `${urlMap[prefix]({ prefix, accountId, envId })}`
    : resolvePrefix(prefix);

  return {
    shouldRenderRoute: !isRouteExcluded,
    url: `${isShortUrl ? normalizedPrefix : prefix}`,
  };
};

const isSupportedRoute = (url: string) => {
  return supportedAppRoutes.some(route => route !== '' && url.includes(route));
};

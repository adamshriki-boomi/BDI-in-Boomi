import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useCoreActions } from 'store/core';
import { CreateConnection } from '../containers/CreateConnection';
import { LoginRoutes } from '../LoginRoutes';

/**
 * query parameters that should act as route parameters
 * requirements:
 * 1. define "route" with a relevant component
 *
 * a param-route defined with a component is added to the Login.tsx->Routes with QueryParamsRoutes. the "route" is used as the "path"
 * exception: no need to define components with { route: '/' }
 */
type ParamRoute = {
  /**
   * the url the router should redirect to
   */
  route: string;
  component?: React.ComponentType<any>;
  /**
   * not implemented yet
   */
  replace?: boolean;
  /**
   * (default: true) if false, user is signed out AFTER the route handler
   */
  keepSession?: boolean;
};
const ParamsRoutes: { [key: string]: ParamRoute } = {
  // login
  emailVerified: {
    route: '/',
    replace: true,
    keepSession: true,
  },
  sfConnectSignup: {
    route: LoginRoutes.SIGNUP_PARTNER,
  },
  partnerConnect: {
    route: LoginRoutes.SIGNUP_PARTNER,
  },
  boomi_account_id: {
    route: '/',
    keepSession: true,
  },
  reset_password: {
    route: LoginRoutes.FORGOT_PASSWORD,
  },
  // TODO what's the result url?
  link_not_valid: {
    route: '/',
  },
  not_valid: {
    route: '/',
  },
  signup_not_valid: {
    route: '/',
  },
  inviteUser: {
    route: LoginRoutes.SET_PASSWORD,
    replace: true,
  },
  googleConnectSignup: {
    route: LoginRoutes.SIGNUP,
  },
  registration: {
    route: LoginRoutes.CREATE_ACCOUNT,
  },
  getting_started: {
    route: LoginRoutes.ONBOARDING_GETTING_STARTED,
    keepSession: true,
  },
  create_connection: {
    route: LoginRoutes.CREATE_CONNECTION,
    component: CreateConnection,
  },
  pass: {
    route: LoginRoutes.SET_PASSWORD,
    replace: true,
  },
};

/**
 * used by Login.tsx to automatically define <Route /> for query-params with components
 */
export const QueryParamsRoutes = Object.entries(ParamsRoutes).filter(
  ([param, routeConfig]) => routeConfig.component,
);

const resolveQueryParam = (parsedHash: Record<string, any>) => {
  if (!parsedHash) return;
  const params = Object.keys(parsedHash);
  const resultRoute = params?.find(key => ParamsRoutes[key]);
  return resultRoute;
};

export const useQueryParamsRouter = (data: Record<string, any>) => {
  const { signOut } = useCoreActions();
  const { push } = useHistory();
  const routeParam = resolveQueryParam(data);
  const route = ParamsRoutes?.[routeParam]?.route;
  const shouldSignout = !ParamsRoutes?.[routeParam]?.keepSession;
  useParamActions(routeParam, data);

  useEffect(() => {
    if (route) {
      push(route, { data });
    }
  }, [route, push, data]);

  useEffect(() => {
    if (route && shouldSignout) {
      signOut();
    }
  }, [signOut, route, shouldSignout]);
};

/**
 * Store Actions Dispatcher according to a defined query param (that exists in url)
 * a map of queryParam => actions to perform when query param exists
 * in addition to that, a redirect takes place according to ParamsRoutes
 * @required each queryParam should implement its own handler (function)
 * @example emailVerified: () => doSomething()
 */
const useParamActions = (routeParam: string, data: Record<string, any>) => {
  const { setUserEmail } = useCoreActions();
  const routeActions = {
    emailVerified: () => setUserEmail(data?.user_email),
  };

  if (routeActions?.[routeParam]) {
    routeActions?.[routeParam]();
  }
};

import { PageOverlaySpinner } from 'components';
import React, { Suspense } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { useCore } from 'store/core';
import { AppRoutes } from './routes';
// import { useAuth } from 'store/auth';

interface PrivateRouteProps {
  component?: any;
  children?: any;
  adminRoute?: boolean;
  [key: string]: any;
}
export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  component: Component = children,
  adminRoute = false,
  ...rest
}) => {
  const { isAuthenticated, isAdminRole, isGlobalOperatorRole } = useCore();

  const renderRoute = (props: any) => {
    if (isAuthenticated) {
      return (
        validateAdminRoute({
          adminRoute,
          isAdminRole,
          isGlobalOperatorRole,
        }) || (
          <Suspense fallback={<PageOverlaySpinner />}>
            <Component {...props} {...rest} isAuthenticated={isAuthenticated} />
          </Suspense>
        )
      );
    }
    return (
      <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    );
  };

  return <Route {...rest} render={renderRoute} />;
};

function validateAdminRoute({ adminRoute, isAdminRole, isGlobalOperatorRole }) {
  const canAccessAdminRoutes = isAdminRole || isGlobalOperatorRole;
  if (adminRoute && !canAccessAdminRoutes) {
    return <Redirect to={AppRoutes.HOME} />;
  }
  return false;
}

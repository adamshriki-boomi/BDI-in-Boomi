import { RoutesBuilder, useAccountRoute } from 'app/routes';
import { Breadcrumbs } from 'components';
import React, { useMemo } from 'react';

export function RiverBreadcrumbs({ riverName }) {
  const riversUrl = useAccountRoute(RoutesBuilder.rivers);
  const breadcrumbs = useMemo(
    () => [
      { label: 'Data Flows' },
      { label: 'Data Flows List', href: riversUrl },
      { label: riverName },
    ],
    [riversUrl, riverName],
  );
  return <Breadcrumbs links={breadcrumbs} pb="0" />;
}

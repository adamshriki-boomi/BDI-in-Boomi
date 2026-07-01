import * as React from 'react';
import TableSource from './TableSource';
import {
  useIsBlueprint,
  useIsSupportedPredefinedReports,
  useSttFormContext,
} from 'modules/SourceTarget/components/form';
import { BlueprintSourceSettings } from './TableSource/BlueprintSourceSettings';

export function TableSourceSettings() {
  const mainRiverForm = useSttFormContext();
  const sourceDefinition = mainRiverForm?.watch('river.properties.source');
  const targetDefinition = mainRiverForm?.watch('river.properties.target');
  const isPredefined = useIsSupportedPredefinedReports();
  const isBlueprint = useIsBlueprint();
  if (isBlueprint) {
    return <BlueprintSourceSettings />;
  }
  return (
    <TableSource
      sourceDefinition={sourceDefinition}
      targetDefinition={targetDefinition}
      isPredefined={isPredefined}
    />
  );
}

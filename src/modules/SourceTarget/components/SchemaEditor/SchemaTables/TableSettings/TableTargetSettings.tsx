import * as React from 'react';
import TableTarget from './TableTarget';
import { useSttFormContext } from 'modules/SourceTarget/components/form';

export function TableTargetSettings() {
  const mainRiverForm = useSttFormContext();
  const targetDefinition = mainRiverForm?.watch('river.properties.target');
  return <TableTarget targetDefinition={targetDefinition} />;
}

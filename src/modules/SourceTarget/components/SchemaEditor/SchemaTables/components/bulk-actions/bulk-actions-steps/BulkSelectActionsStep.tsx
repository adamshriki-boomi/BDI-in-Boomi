import * as React from 'react';
import { FormProvider, useFormContext } from 'react-hook-form';
import { Divider, RenderGuard } from 'components';
import { BulkCDCExtractionMode } from './actions-components/BulkCDCExtractionMode';
import { BulkStandardExtractionMode } from './actions-components/BulkStandardExtractionMode';
import { BulkStandardLoadingMode } from './actions-components/BulkStandardLoadingMode';
import { BulkCalculatedColumns } from './actions-components/BulkCalculatedColumns';
import { useGetRiverCommonProps } from 'modules/SourceTarget';
import { storageTargets } from 'api/types';

export function BulkSelectActionsStep() {
  const { isNotStandard, hasIncrement } = useGetRiverCommonProps();
  const formApi = useFormContext();

  const targetName = formApi.watch('targetName');
  const isStorage = storageTargets.includes(targetName);

  return (
    <FormProvider {...formApi}>
      <RenderGuard condition={isNotStandard}>
        <>
          <BulkCDCExtractionMode />
          <BulkActionsDivider />
        </>
      </RenderGuard>
      <RenderGuard condition={hasIncrement}>
        <BulkStandardExtractionMode />
        <BulkActionsDivider />
      </RenderGuard>
      <RenderGuard condition={!isStorage}>
        <BulkStandardLoadingMode />
        <BulkActionsDivider />
      </RenderGuard>
      <BulkCalculatedColumns />
    </FormProvider>
  );
}

const BulkActionsDivider = () => {
  return <Divider orientation="horizontal" w="100%" bg="gray.300" my={6} />;
};

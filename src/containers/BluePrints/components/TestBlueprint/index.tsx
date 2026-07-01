import {
  Center,
  Icon,
  LightningBolt,
  RiveryButton,
  TestBp,
  Text,
} from 'components';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useAsyncFn, useToggle } from 'react-use';
import { BlueprintsTags } from 'utils/tracking.tags';
import {
  useAddBlueprintFileMutation,
  useLazyGetReportsInterfaceParametersBatchQuery,
} from '../../blueprints.query';
import { reportParamsPath } from './helpers';
import { LegacyTestPanel } from './LegacyTestPanel';
import { MultiReportTestPanel } from './MultiReportTestPanel';

export default function TestBlueprint() {
  const [showTesting, setShowTesting] = useToggle(false);
  const formApi = useFormContext();
  const [fetchReportsBatch] = useLazyGetReportsInterfaceParametersBatchQuery();
  const [addBlueprintFile] = useAddBlueprintFileMutation();

  const [{ loading: isFetching, value: data }, getParameters] =
    useAsyncFn(async () => {
      const fileRes: any = await addBlueprintFile({
        content: formApi?.watch('yaml'),
        hidden: true,
      });
      const fileCrossId = fileRes?.data?.cross_id;
      if (!fileCrossId)
        throw new Error('Failed to upload draft blueprint file');

      const batchRes = await fetchReportsBatch({
        file_cross_id: fileCrossId,
      }).unwrap();
      const globalParams = batchRes?.global_params ?? {};
      const reports = batchRes?.reports ?? {};

      Object.entries(reports).forEach(([name, params]: [string, any]) => {
        formApi.setValue(reportParamsPath(name), params?.standard ?? []);
      });

      const blueprintType = batchRes?.blueprint_type;
      const isLegacy = blueprintType === 'legacy';
      const legacyDateRange =
        isLegacy && globalParams?.date_range?.name
          ? {
              ...globalParams.date_range,
              time_period: 'custom',
              start_date: globalParams.date_range.start_date ?? null,
              end_date: globalParams.date_range.end_date ?? null,
            }
          : null;
      formApi.setValue('blueprint', {
        ...formApi?.watch('blueprint'),
        authentication: globalParams?.authentication,
        type: blueprintType,
        date_range: legacyDateRange,
      });
      formApi.setValue(
        'river.properties.source.additional_settings.interface_parameters.source',
        globalParams?.standard ?? [],
      );
      return batchRes;
    }, [formApi, addBlueprintFile, fetchReportsBatch]);

  const initiateTest = useCallback(async () => {
    setShowTesting(true);
    await getParameters();
  }, [getParameters, setShowTesting]);

  if (!showTesting) {
    return (
      <Center p={4} bg="body" h="full" w="full" flexDir="column" gap={2}>
        <Icon as={TestBp} boxSize="100px" />
        <Text>Test your Blueprint configuration</Text>
        <RiveryButton
          label="Test Blueprint"
          variant="outlined-primary"
          isDisabled={!formApi?.watch('yaml') || !formApi?.watch('name')}
          leftIcon={<Icon as={LightningBolt} />}
          onClick={initiateTest}
          data-pendo-id={BlueprintsTags.EDIT_TEST_BLUEPRINT_BUTTON}
        />
      </Center>
    );
  }

  const isLegacy = data?.blueprint_type === 'legacy';
  return isLegacy ? (
    <LegacyTestPanel
      data={data}
      refresh={getParameters}
      isFetching={isFetching}
    />
  ) : (
    <MultiReportTestPanel
      data={data}
      refresh={getParameters}
      isFetching={isFetching}
    />
  );
}

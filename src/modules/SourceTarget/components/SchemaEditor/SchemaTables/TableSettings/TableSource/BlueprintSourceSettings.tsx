import { ExLoader, LoaderSize } from '@boomi/exosphere';
import { SourceTypes } from 'api/types';
import {
  Center,
  Flex,
  Icon,
  RefreshIcon,
  RiveryButton,
  Text,
} from 'components';
import { FormControls, InputLabel, InputTypes } from 'components/Form';
import {
  interfaceParamsToSupportBoolean,
  useGetBlueprintReportInterfaceParams,
} from 'containers/BluePrints/helpers';
import { useToastComponent } from 'hooks/useToast';
import { useSttFormContext } from 'modules/SourceTarget/components/form';
import { blueprintsApi } from 'modules/SourceTarget/components/SchemaEditor/BluePrints/blueprints.query';
import { DateRange } from 'modules/SourceTarget/store';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLazyGetMetadataV1Query } from 'store/metadata/metadataSvcV1';
import { DateTimeEditor } from '../components';
import { useTableSettings, useTableSettingsFormContext } from '../form.hooks';
import { useTableSettingsTabs } from '../TableSettingsDrawer';

const PARAMS_PATH =
  'table.additional_source_settings.interface_parameters.source';

function getControlType(type) {
  switch (type) {
    case 'string':
      return InputTypes.TEXT;
    case 'integer':
      return InputTypes.NUMBER;
    case 'boolean':
      return InputTypes.RADIO;
    default:
      return InputTypes.TEXT;
  }
}

function reconcileParams(declared: any[], tableSaved: any[] | undefined) {
  const savedByName = new Map<string, any>(
    (tableSaved ?? []).map((p: any) => [p.name, p]),
  );
  return declared.map((d: any) => {
    const saved = savedByName.get(d.name);
    if (saved) {
      return { ...d, ...(saved as object) };
    }
    return { ...d, value: d.value ?? '' };
  });
}

function paramsEqual(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i]?.name !== b[i]?.name ||
      a[i]?.type !== b[i]?.type ||
      a[i]?.value !== b[i]?.value
    )
      return false;
  }
  return true;
}

export function InterfaceParametersFields({
  declared,
  basePath = PARAMS_PATH,
  formApi,
  width = '450px',
}: {
  declared: any[];
  basePath?: string;
  formApi?: any;
  width?: string;
}) {
  const tableForm = useTableSettingsFormContext();
  const effectiveFormApi = formApi ?? tableForm;

  const fieldConfigs = useMemo(
    () =>
      declared.map((d: any, idx: number) => {
        const isBoolean = d?.type === 'boolean';
        return {
          type: getControlType(d?.type),
          name: `${basePath}.${idx}.value`,
          display_name: d?.name?.replace(/_/g, ' '),
          chakra: true,
          required: true,
          ...(isBoolean && {
            values: [
              { label: 'True', value: 'true' },
              { label: 'False', value: 'false' },
            ],
            size: 'xs',
          }),
        };
      }),
    [declared, basePath],
  );

  if (declared.length === 0) return null;

  return (
    <Flex flexDir="column" gap={1} pt={1} width={width}>
      {fieldConfigs.map((control, idx) => (
        <Flex key={`${control.name}-${idx}`} py={0.5}>
          <FormControls controls={control} api={effectiveFormApi as any} />
        </Flex>
      ))}
    </Flex>
  );
}

function ReloadReportMetadataButton({
  hasDeclaredParams,
  dateRangeParam,
}: {
  hasDeclaredParams: boolean;
  dateRangeParam?: any;
}) {
  const formMethods = useTableSettingsFormContext();
  const parentForm = useSttFormContext();
  const definitions = formMethods?.watch('definitions') as any;
  const blueprintId = definitions?.blueprintId;
  const reportName = definitions?.report_name;
  const connectionId = formMethods?.watch('connectionId');
  const interfaceParams = formMethods?.watch(PARAMS_PATH);
  const tableDateRange = formMethods?.watch('table.date_range') as any;
  const sourceInterfaceParams = parentForm?.watch(
    'river.properties.source.additional_settings.interface_parameters.source',
  );

  const [triggerMetadata, { isFetching }] = useLazyGetMetadataV1Query();
  const { success, error, warning } = useToastComponent();
  const dispatch = useDispatch();
  const { setTabIndex } = useTableSettingsTabs();

  const reload = useCallback(async () => {
    if (!blueprintId || !reportName) return;
    const fieldNames = ((interfaceParams as any[]) ?? []).map(
      (_, idx) => `${PARAMS_PATH}.${idx}.value` as any,
    );
    if (fieldNames.length) {
      const isValid = await formMethods.trigger(fieldNames);
      if (!isValid) return;
    }
    const mergedByName = new Map<string, any>();
    (sourceInterfaceParams ?? []).forEach((p: any) =>
      mergedByName.set(p.name, p),
    );
    (interfaceParams ?? []).forEach((p: any) => mergedByName.set(p.name, p));
    const mergedParams = Array.from(mergedByName.values());
    const hasDateRange = Boolean(dateRangeParam?.name);
    const res: any = await triggerMetadata({
      pull_request_inputs: {
        connection_id: connectionId,
        recipe_id: blueprintId,
        report_name: reportName,
        ...(hasDateRange &&
          tableDateRange && {
            date_range: {
              ...tableDateRange,
              type: dateRangeParam?.type ?? 'datetime',
            },
          }),
        ...(mergedParams.length && {
          interface_parameters: {
            source: interfaceParamsToSupportBoolean(mergedParams),
          },
        }),
      },
      datasource_id: SourceTypes.BLUEPRINT,
      task: 'get_source_metadata',
      task_type: 'source',
    } as any);
    if (res?.error) {
      error({
        description: res?.error?.message || 'Failed to reload report metadata',
      });
      return;
    }
    // Blueprint metadata result shape: {[schemaName]: {[tableName]: {columns: [...]}}}.
    // Treat the response as "no results" when no table under any schema has
    // any columns to map.
    const hasMappingResults = Object.values(res?.data ?? {}).some(
      (schema: any) =>
        schema &&
        typeof schema === 'object' &&
        Object.values(schema).some(
          (table: any) => (table?.columns?.length ?? 0) > 0,
        ),
    );
    if (!hasMappingResults) {
      warning({
        description:
          'Mapping retrieved no results. Check your configurations and try again.',
        duration: 10000,
      });
      return;
    }
    success({
      description:
        'Metadata was successfully reloaded. Navigate to the Mapping tab to view changes.',
      duration: 10000,
    });
    dispatch(blueprintsApi.util.invalidateTags(['Blueprints']));
    setTabIndex(0);
  }, [
    blueprintId,
    reportName,
    connectionId,
    interfaceParams,
    sourceInterfaceParams,
    tableDateRange,
    dateRangeParam?.name,
    dateRangeParam?.type,
    triggerMetadata,
    success,
    error,
    warning,
    dispatch,
    setTabIndex,
    formMethods,
  ]);

  if (!blueprintId || !reportName || !hasDeclaredParams) return null;

  return (
    <RiveryButton
      label="Reload Report Metadata"
      variant="default"
      leftIcon={<Icon as={RefreshIcon} />}
      onClick={reload}
      isLoading={isFetching}
      alignSelf="flex-start"
      mb={2}
    />
  );
}

function DateRangeField() {
  const { value, update } = useTableSettings<DateRange>('date_range');
  return (
    <Flex flexDir="column" pb={2}>
      <Flex gap={1} align="center">
        <Text color="tagMagenta">*</Text>
        <Text>Date Range</Text>
      </Flex>
      <Flex pt={1}>
        <DateTimeEditor
          value={value as any}
          onChange={update}
          onlyCustom={true}
        />
      </Flex>
    </Flex>
  );
}

export function BlueprintSourceSettings() {
  const formMethods = useTableSettingsFormContext();
  const definitions = formMethods?.watch('definitions') as any;
  const blueprintId = definitions?.blueprintId;
  const reportName = definitions?.report_name;

  const { reportInterfaceParameters, isFetching } =
    useGetBlueprintReportInterfaceParams(blueprintId, reportName);

  const declared = reportInterfaceParameters?.standard;
  const hasDateRangeParam = Boolean(
    (reportInterfaceParameters as any)?.date_range?.name,
  );
  const [reconciled, setReconciled] = useState(false);

  useEffect(() => {
    if (!declared || reconciled) return;
    const current = formMethods.getValues(PARAMS_PATH);
    const next = reconcileParams(declared, current);
    if (!paramsEqual(current, next)) {
      formMethods.setValue(PARAMS_PATH, next, { shouldDirty: true });
    }
    setReconciled(true);
  }, [declared, reconciled, formMethods]);

  const isLoading =
    Boolean(blueprintId && reportName) &&
    (isFetching || !declared || !reconciled);

  if (isLoading) {
    return (
      <Center h="full" w="full" py={8}>
        <ExLoader size={LoaderSize.MEDIUM} />
      </Center>
    );
  }

  return (
    <Flex gap="1" maxW="900px" flexDir="column" h="full">
      <Text textStyle="R7" color="font-secondary">
        Set up the setting to your Source Data.
      </Text>
      <Flex flexDir="column" gap={2}>
        {declared && (
          <Flex flexDir="column" gap={2}>
            <InputLabel variant="semibold" label="Report Parameters" />
            <InterfaceParametersFields declared={declared} />
            {hasDateRangeParam && <DateRangeField />}
            <ReloadReportMetadataButton
              hasDeclaredParams={
                ((declared?.length ||
                  Object.values(reportInterfaceParameters?.date_range)
                    ?.length) ??
                  0) > 0
              }
              dateRangeParam={(reportInterfaceParameters as any)?.date_range}
            />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

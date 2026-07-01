import { HStack, Icon, RiveryInfoTooltip, Text } from 'components';
import { useLegacyBlueprintDateRange } from 'containers/BluePrints/helpers';
import { useTableField } from 'modules/SourceTarget/components/form';
import { useMemo } from 'react';
import { HiOutlineExclamation } from 'react-icons/hi';
import { DateTimePopover } from '../SchemaTables/components/DateTimePopover';
import { TableTargetName } from '../SchemaTables/components/EditableInput';
import { TableLoadingMode } from '../SchemaTables/components/TableCells';
import { TableName } from '../SchemaTables/components/TableName';
import { BlueprintMultiCheck } from './BlueprintMultiCheck';
import { BlueprintSingleCheck } from './BlueprintSingleCheck';

const headerProps = {
  fontWeight: 'medium',
};

function BlueprintReportNameCell(props: any) {
  const { row, column } = props;
  const reportName = row?.original?.id;
  const reportParams = column?.getProps?.reportsInterfaceParams?.[reportName];
  const { value } = useTableField('no_schema', reportName);
  const isSelected = Boolean((value as any)?.is_selected);

  const standardParams: any[] = useMemo(
    () => reportParams?.standard ?? [],
    [reportParams?.standard],
  );
  const savedStandard: any[] = useMemo(
    () =>
      (value as any)?.additional_source_settings?.interface_parameters
        ?.source ?? [],
    [value],
  );

  const requiredParams: string[] = useMemo(
    () => reportParams?.required_params ?? [],
    [reportParams?.required_params],
  );

  const hasMissingStandard = useMemo(() => {
    const requiredStandardNames = requiredParams.filter(
      n => n !== 'date_range' && n !== 'authentication',
    );
    if (requiredStandardNames.length === 0) return false;
    const standardByName = new Map(standardParams.map(p => [p.name, p]));
    const savedByName = new Map(savedStandard.map(p => [p.name, p.value]));
    const isEmpty = (v: any) => v === undefined || v === null || v === '';
    return requiredStandardNames.some(name => {
      const saved = savedByName.get(name);
      if (!isEmpty(saved)) return false;
      const param: any = standardByName.get(name);
      return isEmpty(param?.value);
    });
  }, [requiredParams, standardParams, savedStandard]);

  const hasMissingDateRange = useMemo(() => {
    if (!requiredParams.includes('date_range')) return false;
    const tableDateRange = (value as any)?.date_range;
    return !tableDateRange?.start_date && !tableDateRange?.end_date;
  }, [requiredParams, value]);

  const hasMissing = isSelected && (hasMissingStandard || hasMissingDateRange);

  return (
    <HStack gap={1} alignItems="center">
      {hasMissing && (
        <RiveryInfoTooltip
          description="One or more report parameters are missing values"
          buttonProps={{ padding: 0, minW: 0 }}
          icon={
            <Icon as={HiOutlineExclamation} color="yellow.500" boxSize={5} />
          }
        />
      )}
      <TableName {...props} />
    </HStack>
  );
}

function useReportHasDateRangeParam(props: any) {
  const reportName = props?.row?.original?.id;
  const params = props?.column?.getProps?.reportsInterfaceParams?.[reportName];
  return Boolean(params?.date_range?.name);
}

function useIsRowSelected(props: any) {
  const reportName = props?.row?.original?.id;
  const { value } = useTableField('no_schema', reportName);
  return Boolean(value?.is_selected);
}

function BlueprintExtractMethodCell(props: any) {
  const isSelected = useIsRowSelected(props);
  const hasDateRange = useReportHasDateRangeParam(props);
  if (!isSelected) return null;
  return (
    <Text textTransform="capitalize">
      {hasDateRange ? 'incremental' : 'all'}
    </Text>
  );
}

function BlueprintDateRangeCell(props: any) {
  const { row, column } = props;
  const isSelected = useIsRowSelected(props);
  const hasDateRange = useReportHasDateRangeParam(props);
  const {
    dateRange: legacyDateRange,
    setDateRange: setLegacyDateRange,
    isLegacy,
  } = useLegacyBlueprintDateRange();
  if (!isSelected || !hasDateRange) return null;
  const { source, isPredefined } = column.getProps.riverProperties;
  if (isLegacy) {
    return (
      <DateTimePopover
        row={row}
        setValue={setLegacyDateRange}
        outerValue={legacyDateRange}
        onlyCustom
        source={source}
        isPredefined={isPredefined}
      />
    );
  }
  return (
    <DateTimePopover row={row} source={source} isPredefined={isPredefined} />
  );
}

export const blueprintColumns = [
  {
    Header: BlueprintMultiCheck,
    Cell: BlueprintSingleCheck,
    id: 'selected',
    weight: 'min-content',
  },
  {
    Header: 'Report',
    accessor: 'report_id',
    Cell: BlueprintReportNameCell,
    sortBy: 'report_name',
    sortType: 'string',
    headerProps,
    weight: 'minmax(max-content, 1fr)',
  },
  {
    Header: 'Target Table',
    id: 'table-target',
    Cell: TableTargetName,
    weight: 'minmax(max-content, 1fr)',
    sortType: 'string',
    headerProps,
  },
  {
    Header: 'Extract Method',
    id: 'extract_method',
    Cell: BlueprintExtractMethodCell,
    weight: 'auto',
    headerProps,
  },
  {
    Header: 'Date Range',
    id: 'date-range',
    Cell: BlueprintDateRangeCell,
    weight: 'minmax(max-content, 2fr)',
    headerProps,
  },
  {
    Header: 'Loading Mode',
    id: 'target_loading',
    Cell: TableLoadingMode,
    weight: 'minmax(max-content, 1fr)',
    sortType: 'string',
    headerProps,
    styleProps: { textTransform: 'capitalize' },
  },
];

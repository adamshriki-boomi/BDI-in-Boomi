import { getTableArgs } from 'modules/SourceTarget';
import { useGetReportsQuery } from 'modules/SourceTarget/store/predefined.query';
import { useMemo } from 'react';
import {
  useIsDisabledRiverForm,
  useSttFormContext,
  useSttSource,
} from '../../form/form.hooks';
import { RtkQueryTable, TablesParams } from '../SchemaTables/RtkQueryTable';
import { columns } from './columns';

export function ReportsTable() {
  const form = useSttFormContext();
  const formData = form.watch();
  const source = formData.river.properties.source.name;

  const params = useMemo(() => ({ source }), [source]);
  const isRiverFormDisabled = useIsDisabledRiverForm();

  const tableColumns = useMemo(
    () =>
      columns.map(col => ({
        ...col,
        getProps: { isDisabled: isRiverFormDisabled },
      })),
    [isRiverFormDisabled],
  );
  return (
    <RtkQueryTable
      columns={tableColumns}
      useApiQuery={useTablesState as any}
      apiParams={params}
    />
  );
}

type useTablesStateParams = TablesParams &
  Pick<getTableArgs, 'schema_name' | 'tableIds'> & {
    searchValue: string;
  };
const useTablesState = (params: useTablesStateParams) => {
  const source = useSttSource();
  const { searchValue, ...restParams } = params;
  const { data, isFetching } = useGetReportsQuery(
    {
      datasource_id: source?.name,
      ...restParams,
    },
    {
      skip: !Boolean([source?.name].every(Boolean)),
    },
  );

  return { data, isFetching };
};

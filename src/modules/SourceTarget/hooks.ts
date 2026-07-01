import { RoutesBuilder } from 'app/routes';
import { useIsSupportedPredefinedReports, useSttSource } from './components';
import { useDataSourcesSections } from '../Datasources';
import { useSttExtractMethod } from './components/form';
import { IRiverExtractMethod } from './store';

export const createSourceLegacyRoute = (
  accountId,
  envId,
  additional_params,
) => ({
  pathname: RoutesBuilder.createRiverLegacy({
    accountId,
    envId,
  }),
  search: `?cacheSlayer=${new Date().getTime()}&run_type=new_interface&selected_river_type=src_to_trgt&${additional_params}`,
});

const getTableNameByExtractMethod = (
  ff: Record<string, any>,
  extractMethod: IRiverExtractMethod,
) => {
  switch (extractMethod) {
    case IRiverExtractMethod.BW:
      return {
        singular: ff?.bw_table_name || 'Data Source',
        plural: ff?.bw_table_name_plural || 'Data Sources',
      };
    default: // fallback for table names that are not coupled to extract method
      return {
        singular: ff?.table_name || 'Table',
        plural: ff?.table_name_plural || 'tables',
      };
  }
};

export const useGetSchemaTableNameCaption = () => {
  const source = useSttSource();
  const { selectedDataSource } = useDataSourcesSections('source', source?.name);
  const ff = selectedDataSource?.feature_flags;
  const extractMethod = useSttExtractMethod();
  const isPredefined = useIsSupportedPredefinedReports();
  const noSchemaStructure = isPredefined || ff?.schema_name === false;
  const { singular: tableNameCaption, plural: tableNameCaptionPlural } =
    getTableNameByExtractMethod(ff, extractMethod);
  const schemaNameCaptionPlural = ff?.schema_name_plural || 'Schemas';
  return {
    noSchemaStructure,
    schemaNameCaption: ff?.schema_name || 'schema',
    schemaNameCaptionPlural,
    tableNameCaption,
    tableNameCaptionPlural,
    schemasAndTablesTitle: noSchemaStructure
      ? tableNameCaptionPlural
      : `${schemaNameCaptionPlural} and ${tableNameCaptionPlural}`,
  };
};

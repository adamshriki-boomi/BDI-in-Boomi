import { useGetAllDataSourcesQuery } from 'modules';

export function useSourceByType() {
  const { data } = useGetAllDataSourcesQuery(null);
  return {
    get: dsId => data?.find(ds => ds.id === dsId || ds.api_name === dsId),
  };
}

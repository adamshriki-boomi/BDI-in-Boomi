import { useGetAllDataSourcesQuery } from 'modules/Datasources/store';

export function useDSHighFrequency() {
  const { data: dataSourcesArray } = useGetAllDataSourcesQuery(null);
  return (
    (dataSourcesArray as any[])
      ?.map(
        ({
          id: value,
          icon,
          name: label,
          status,
          description_high_frequency,
          feature_flags: { default_high_frequency_min_rpu },
        }) => {
          return {
            label,
            status,
            default_high_frequency_min_rpu,
            value,
            icon,
            description: description_high_frequency,
          };
        },
      )
      ?.filter(ds => ds.value !== 'cdc') || []
  );
}

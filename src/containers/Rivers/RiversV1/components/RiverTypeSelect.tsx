import { RiverTypeSelect } from 'containers/Activities/components/ActivitiesFilters';
import { getQueryParams } from 'hooks/router';
import { Tagger } from 'components/Tracking/Tagger';
import { RiversTags } from 'utils/tracking.tags';

export function RiversGridTypeSelect({ column: { getProps } }) {
  const { api } = getProps?.filtersApi;
  const { river_type } = getQueryParams(['river_type']);
  return (
    <Tagger tags={RiversTags.RIVER_TYPE_DROPDOWN}>
      <RiverTypeSelect
        name="river_type"
        onChange={river_type => api.setParam({ river_type })}
        value={river_type}
      />
    </Tagger>
  );
}

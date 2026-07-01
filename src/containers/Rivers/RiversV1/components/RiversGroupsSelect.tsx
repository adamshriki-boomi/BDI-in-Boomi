import { GroupsSelect } from 'containers/Activities/components/ActivitiesFilters';
import { Tagger } from 'components/Tracking/Tagger';
import { getQueryParams } from 'hooks/router';
import { RiversTags } from 'utils/tracking.tags';

export default function RiversGroupsSelect({ column: { getProps } }) {
  const { api } = getProps?.filtersApi;
  const { group_id } = getQueryParams(['group_id']);
  return (
    <Tagger tags={RiversTags.RIVER_GROUP_DROPDOWN}>
      <GroupsSelect
        name="group_id"
        onChange={group_id => api.setParam({ group_id })}
        value={group_id}
        label="Data Flow Group"
      />
    </Tagger>
  );
}

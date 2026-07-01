import { CustomSelectForm } from 'components/Form';
import { Tagger } from 'components/Tracking/Tagger';
import { RiversTags } from 'utils/tracking.tags';

const options = ['Active', 'Disabled', 'Suspended'].map(status => ({
  label: status,
  value: status.toLowerCase(),
}));

export function StatusSelect({ column: { getProps } }) {
  const { api, params } = getProps?.filtersApi;
  const handleChange = option =>
    api.setParam({ river_status: option ? option.value : null });

  const selectedValue = options?.filter(
    ({ value }) => params?.river_status === value,
  );

  return (
    <Tagger tags={RiversTags.STATUS_DROPDOWN}>
      <CustomSelectForm
        options={options}
        controlId="river status"
        label="Status"
        aria-label="Status"
        name="river_status"
        chakra
        isClearable
        onChange={handleChange}
        value={selectedValue}
        isMulti={false}
      />
    </Tagger>
  );
}

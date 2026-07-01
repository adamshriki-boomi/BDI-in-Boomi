import { RenderGuard } from 'components';
import { CustomSelectForm } from 'components/Form';
import { useCore } from 'store/core';

const options = [
  { label: 'All', value: 'all' },
  { label: 'New Interface', value: 'new' },
];

export function InterfaceSelect({ column: { getProps } }) {
  const { isSuperAdminUser } = useCore();
  const { api, params } = getProps?.filtersApi;
  const handleChange = option =>
    api.setParam({ interface_type: option ? option.value : null });

  const selectedValue = options?.filter(
    ({ value }) => params?.interface_type === value,
  );

  return (
    <RenderGuard condition={isSuperAdminUser}>
      <CustomSelectForm
        options={options}
        controlId="river status"
        label="Interface"
        aria-label="Interface"
        name="river_interface"
        chakra
        isClearable
        onChange={handleChange}
        value={selectedValue}
        isMulti={false}
      />
    </RenderGuard>
  );
}

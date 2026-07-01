import { Grid, HStack } from '@chakra-ui/react';
import { RiveryButton } from 'components';
import { RiveryDatePicker } from 'components/Form/components/RiveryDatePicker';
import { CustomSelectForm } from 'components/Form/components/SelectFormGroup/CustomSelectForm';
import { useGetUsersQuery } from 'containers/Settings/Users/users.query';
import { useCallback, useRef } from 'react';
import { getOId } from 'utils/api.sanitizer';
import { pluck } from 'utils/array.utils';
import { calculateTime } from 'utils/date.utils';

const EntityTypeOptions = [
  'rivers',
  'users',
  'connections',
  'river_groups',
].map(option => ({
  value: option,
  label: option !== 'river_groups' ? option : 'groups',
}));

const EventTypeOptions = ['create', 'update', 'delete'].map(option => ({
  label: option,
  value: option,
}));

const useUserOptions = () => {
  const { data: users } = useGetUsersQuery(null);
  return users?.map(user => ({
    label: user.user_name ?? user.user_email,
    value: getOId(user._id),
  }));
};

export default function AuditLogFilters({ params, onChange, resetFilters }) {
  const datePickerRef = useRef<any>(null);
  const onClearAll = useCallback(() => {
    datePickerRef?.current.setDefaultPickerLabel();
    resetFilters();
  }, [resetFilters]);

  const onValChange = useCallback(
    (field, value) => {
      onChange({ [field]: value });
    },
    [onChange],
  );

  return (
    <Grid gap={2} templateColumns="repeat(4, 1fr) 100px">
      <EntitySelect
        onChange={v => onValChange('entity_type', v)}
        params={params}
      />
      <EventSelect
        onChange={v => onValChange('event_type', v)}
        params={params}
      />
      <UserSelect onChange={v => onValChange('user_id', v)} params={params} />

      <RiveryDatePicker
        ref={datePickerRef}
        defaultValue={{
          label: 'Current Day',
          value: calculateTime('C', 0),
        }}
        setPickerValue={event => {
          if (
            event.label === 'Custom' ||
            params.start_time !== event.value.event_start_time ||
            params.end_time !== event.value.event_end_time
          ) {
            onChange({
              start_time: event.value.event_start_time,
              end_time: event.value.event_end_time,
            });
          }
        }}
      />
      <HStack marginTop={4}>
        <RiveryButton
          _focus={{ boxShadow: 'none' }}
          fontWeight="normal"
          variant="text"
          onClick={onClearAll}
          aria-label="clear filters"
          label="Clear"
        />
      </HStack>
    </Grid>
  );
}

const getOptionValue = pluck<any, string>('value');

function EntitySelect({ onChange, params }) {
  const handleChange = options => {
    if (typeof options === 'string') {
      onChange(params.entity_type.filter(val => val !== options));
      return;
    }
    onChange(options.map(getOptionValue));
  };
  const selectedValue = EntityTypeOptions?.filter(({ value }) =>
    params?.entity_type?.includes(value),
  );
  return (
    <CustomSelectForm
      label="Entity Type"
      controlId="entity_type"
      options={EntityTypeOptions}
      name="entity_type"
      placeholder="Select / Search Entity"
      onChange={handleChange}
      value={selectedValue}
    />
  );
}

function EventSelect({ onChange, params }) {
  const handleChange = options => {
    if (typeof options === 'string') {
      onChange(params.event_type.filter(val => val !== options));
      return;
    }
    onChange(options.map(getOptionValue));
  };
  const selectedValue = EventTypeOptions?.filter(({ value }) =>
    params?.event_type?.includes(value),
  );
  return (
    <CustomSelectForm
      label="Event Type"
      controlId="event_type"
      options={EventTypeOptions}
      name="event_type"
      placeholder="Select / Search Event"
      onChange={handleChange}
      value={selectedValue}
    />
  );
}

function UserSelect({ onChange, params }) {
  const options = useUserOptions();
  const handleChange = options => {
    if (typeof options === 'string') {
      onChange(params.user_id.filter(val => val !== options));
      return;
    }
    onChange(options.map(getOptionValue));
  };
  const selectedValue = options?.filter(({ value }) =>
    params?.user_id?.includes(value),
  );
  return (
    <CustomSelectForm
      label="User"
      controlId="audit_log_user"
      options={options}
      name="user_id"
      placeholder="Select / Search User"
      onChange={handleChange}
      value={selectedValue}
    />
  );
}

import { DateTimeEditor } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/components';
import { useCallback } from 'react';
import { CustomSelectForm } from '../components';

export function DateRangeSelect(props) {
  const update = useCallback(
    v => props?.api?.setValue(props.name, v, { shouldDirty: true }),
    [props?.api, props.name],
  );
  const value = props?.api?.watch(props.name);
  return <DateTimeEditor value={value} onChange={update} />;
}

export function SplitIntervals(props) {
  return (
    <CustomSelectForm
      options={chunkSizeOptions}
      controlId=""
      isMulti={false}
      {...props}
      defaultValue="dont_split"
    />
  );
}

const chunkSizeOptions = [
  { label: 'Dont Split', value: 'dont_split' },
  { label: 'Minutely', value: 'minutes' },
  { label: 'Hourly', value: 'hours' },
  { label: 'Daily', value: 'days' },
  { label: 'Weekly', value: 'weeks' },
  { label: 'Monthly', value: 'months' },
  { label: 'Yearly', value: 'years' },
];

import { SelectFormGroup } from 'components/Form/components';
import { ExtractMethod as MethodType } from 'modules/SourceTarget';
import { Input, Radio } from '../components';
import { ExtractMethod } from 'api/types';

export function ExtractMethodSelect(props) {
  const extractionMethods: {
    label: string;
    value: MethodType;
    disabled: boolean;
  }[] = [
    {
      label: 'Incremental',
      value: ExtractMethod.INCREMENTAL,
      disabled: props.is_disabled,
    },
    { label: 'All', value: ExtractMethod.ALL, disabled: props.is_disabled },
  ];
  return (
    <Radio
      label="Pick the way you would like to extract data from your source."
      aria-label="extraction method"
      mb="4"
      {...props}
      values={extractionMethods}
    />
  );
}

export const IncrementalFieldSelect = props => {
  return (
    <SelectFormGroup
      label="Incremental Field"
      options={props.options}
      controlId="incremental-field"
      chakra
      isRequired
      {...props}
      {...(props.options?.length === 1 && { value: props.options[0] })}
    />
  );
};

export function IncrementalTypeInput({ defaultValue }) {
  return (
    <Input
      label="Incremental Type"
      value={defaultValue}
      chakra
      mb="3"
      readOnly
    />
  );
}

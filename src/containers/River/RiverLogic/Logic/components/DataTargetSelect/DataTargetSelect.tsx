import { IDataTarget } from 'api/types';
import { Flex, Image } from 'components';
import { SelectFormGroup } from 'components/Form/components';
import {
  useTargetByBlockType,
  useTargetTypesFilter,
} from 'modules/Datasources/useLogicTargets';
import * as React from 'react';

type DataTargetSelectProps = {
  onChange: (item: IDataTarget) => any;
  /**
   * step type
   */
  value: string;
  controlId: string;
};

export function DataTargetSelect({
  value,
  controlId,
  onChange,
}: DataTargetSelectProps) {
  const selectedDataTarget = useTargetByBlockType(value);
  const logicTargets = useTargetTypesFilter();

  return (
    <SelectFormGroup
      options={logicTargets}
      controlId={`data-target-type-${controlId}`}
      onChange={onChange}
      value={selectedDataTarget}
      {...dataTargetsSelectProps}
    />
  );
}

const DataTargetOption = props => {
  return (
    <Flex justifyContent="space-between" flexWrap="nowrap">
      {props.children}
      <Image src={props.data.icon} alt="target type" size={Image.Size.XS} />
    </Flex>
  );
};

const IndicatorSeparator = ({ selectProps }) => (
  <Image
    src={`${selectProps?.value?.icon}`}
    alt={`separator ${selectProps?.value?.name}`}
    size={Image.Size.XS}
  />
);

const dataTargetsSelectProps = {
  getOptionValue: (option: IDataTarget) => option.logic_step_type,
  getOptionLabel: (option: IDataTarget) => option.name,
  components: {
    Option: DataTargetOption,
    IndicatorSeparator,
  },
};

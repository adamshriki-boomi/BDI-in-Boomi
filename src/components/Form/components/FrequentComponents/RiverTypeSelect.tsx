import { RiverTypes } from 'api/types';
import {
  ActionRiverIcon,
  HStack,
  Icon,
  LogicIcon,
  S2TIcon,
  Text,
} from 'components';
import { CustomSelectForm } from 'components/Form';
import React from 'react';
import { useRiverTypes, useRiverTypesLoader } from 'store/riverTypes';
import { FormSelectProps } from '../FormSelect';

const riverTypeIcons = {
  [RiverTypes.SOURCE_TO_TARGET]: S2TIcon,
  [RiverTypes.SOURCE_TO_FZ]: S2TIcon,
  [RiverTypes.LOGIC]: LogicIcon,
  [RiverTypes.ACTION]: ActionRiverIcon,
};

function IconComponent({ value, data = null }: any) {
  return (
    <Icon
      as={riverTypeIcons[value ?? data?.value]}
      boxSize={4}
      color="inherit"
    />
  );
}

function SelectOption({ label, value, data = null }: any) {
  return (
    <HStack gridArea="1/1/2/3" justify="space-between">
      <HStack>
        <Icon as={riverTypeIcons[value ?? data?.value]} boxSize={4} />
        <Text noOfLines={1} wordBreak="break-all">
          {label ?? data?.label}
        </Text>
      </HStack>
    </HStack>
  );
}

const typeComponents = isMulti => ({
  ...(!isMulti && { SingleValue: SelectOption, Option: SelectOption }),
});

export function RiverTypeQuerySelect({
  ...selectProps
}: Omit<FormSelectProps, 'options, controlId'>) {
  useRiverTypesLoader();
  const { riverTypes } = useRiverTypes();
  const options = riverTypes.map(({ type: value, title: label }) => ({
    value,
    label,
  }));
  return (
    <CustomSelectForm
      options={options}
      controlId="river type"
      label="Data Flow Type"
      aria-label="Data Flow Type"
      chakra
      isClearable
      components={typeComponents(selectProps.isMulti)}
      displayIcon={IconComponent}
      {...selectProps}
    />
  );
}

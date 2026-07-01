import { Grid } from '@chakra-ui/react';
import { Box, Center, HStack, Text } from 'components';
import {
  DropdownIndicator,
  FormSelect,
  SelectFormGroup,
  SelectFormGroupProps,
} from 'components/Form';
import { RenderGuard } from 'components/RenderGuard';
import { useIsDisabledRiverForm } from 'modules/SourceTarget';
import React, { useEffect, useState } from 'react';
import { components as RSComponents } from 'react-select';

function CustomOption(props) {
  const { innerProps, label, isSelected, isMulti, displayIcon, value } = props;
  const IconComponent = displayIcon;
  const [selected, setSelected] = useState(isSelected);

  useEffect(() => setSelected(isSelected), [isSelected]);
  return (
    <RenderGuard
      condition={isMulti}
      fallback={<Box borderRadius={4}>{label}</Box>}
    >
      <Grid
        pl={3}
        templateColumns={Boolean(displayIcon) ? '26px 1fr' : '1fr'}
        alignItems="center"
        {...innerProps}
        onClick={e => {
          innerProps.onClick(e);
          setSelected(!selected);
        }}
        role="button"
        whiteSpace="nowrap"
        h="100%"
      >
        <RenderGuard condition={Boolean(displayIcon)}>
          <IconComponent data={props.data} value={value} />
        </RenderGuard>
        <Text>{label}</Text>
      </Grid>
    </RenderGuard>
  );
}

export const MoreSelectedBadge = ({ overflow }) => {
  const length = overflow?.length;
  const label = `+ ${length}`;

  return (
    <Center
      height={22}
      w={9}
      backgroundColor="background-secondary"
      p={1}
      borderRadius={4}
      fontSize="10px"
      border="1px solid"
    >
      {label}
    </Center>
  );
};

export function MultiValue(props) {
  const { selectProps, getValue, index } = props;
  const containerW = selectProps.styles.container()?.width ?? 300;
  //Max width of label
  const maxLWidth = selectProps.styles.container()?.maxLWidth ?? 50;
  //Based on container width and max width of label, we calculate how many labels we can show
  const maxToShow = Math.floor((containerW - 180) / maxLWidth);
  //This function calculates when we need to show the "more" badge
  const overflow = getValue()
    .slice(maxToShow)
    .map(x => x.label);

  const withCreate = selectProps.styles.menuList()?.withCreate ?? false;

  return index < maxToShow || withCreate ? (
    <RSComponents.MultiValue {...props} />
  ) : index === maxToShow ? (
    <MoreSelectedBadge overflow={overflow} />
  ) : null;
}

function CustomValueContainer({ innerProps, selectProps, children }) {
  const maxLWidth = selectProps.styles.container()?.maxLWidth ?? 65;
  return (
    <HStack {...innerProps}>
      <Box
        maxW={`${maxLWidth}px`}
        whiteSpace="nowrap"
        overflow="hidden"
        textOverflow="ellipsis"
        mt="1px"
      >
        {children}
      </Box>
    </HStack>
  );
}

export function CustomSelectForm({
  options,
  name,
  displayIcon = '',
  //check if filter props can be removed, after merging
  isMulti = true,
  updateFilter = null,
  filtersOn = true,
  onChange = null,
  ...rest
}: SelectFormGroupProps & {
  updateFilter?(value, name): void;
  filtersOn?: boolean;
  api?: any;
  height?: any;
}) {
  const [value, setValue] = useState(null);
  const handleRemoveValue = (option, name) => {
    setValue(state => state.filter(({ value }) => value !== option));
    updateFilter && updateFilter(option, name);
  };
  const components = {
    Option: props => <CustomOption {...props} displayIcon={displayIcon} />,
    MultiValueLabel: props => (
      <CustomValueContainer
        {...props}
        onRemove={(option, name) => handleRemoveValue(option, name)}
      />
    ),
    MultiValue,
    DropdownIndicator: value?.length ? () => <div /> : DropdownIndicator,
  };

  useEffect(() => {
    if (!filtersOn && value) {
      setValue(null);
    }
  }, [filtersOn, value]);

  const onChangeFunc = v => {
    onChange && onChange(v);
    updateFilter && updateFilter(v, name);
    setValue(v);
  };
  const { components: customComponents } = rest;
  const sortedAZoptions =
    isMulti && Boolean(options?.length)
      ? (options as any[])?.sort((a, b) => {
          const aSelected =
            Array.isArray(value) &&
            value.some(option => {
              const optionLabel = option?.label ?? option.name ?? option.title;
              return [a.label, a.name, a.title].includes(optionLabel);
            });
          const bSelected =
            Array.isArray(value) &&
            value.some(option => {
              const optionLabel = option?.label ?? option.name ?? option.title;
              return [b.label, b.name, b.title].includes(optionLabel);
            });
          return (bSelected ? 1 : 0) - (aSelected ? 1 : 0);
        })
      : options;
  const showDisabledStyle = useIsDisabledRiverForm();
  return (
    <>
      {rest?.api ? (
        <FormSelect
          api={rest?.api}
          controlId={rest?.controlId}
          ariaLabel={name}
          options={sortedAZoptions}
          name={name}
          isMulti={isMulti}
          hideSelectedOptions={false}
          onChange={onChangeFunc}
          chakra
          blurInputOnSelect={false}
          closeMenuOnSelect={!isMulti}
          {...rest}
          components={{ ...(components as any), ...customComponents }}
          {...(showDisabledStyle && {
            customStyles: {
              control: provided => ({
                ...provided,
                backgroundColor: 'var(--chakra-colors-gray-150)',
                borderColor: 'var(--chakra-colors-gray-300)',
              }),
              input: provided => ({
                ...provided,
                color: 'var(--chakra-colors-gray-700)',
              }),
            },
          })}
        />
      ) : (
        <SelectFormGroup
          value={value}
          ariaLabel={name}
          options={sortedAZoptions}
          name={name}
          isMulti={isMulti}
          hideSelectedOptions={false}
          formatValueAs={value => [value]}
          onChange={onChangeFunc}
          chakra
          blurInputOnSelect={false}
          closeMenuOnSelect={!isMulti}
          {...rest}
          components={{ ...(components as any), ...customComponents }}
        />
      )}
    </>
  );
}

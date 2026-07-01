import { Box, Collapse, Icon, useDisclosure } from '@chakra-ui/react';
import {
  ChevronDown,
  ChevronUp,
  Flex,
  Grid,
  HStack,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import {
  CustomSelectForm,
  RiverySwitch,
  SwitchComplexLabel,
} from 'components/Form';
import { useMultiLinerSelectStyles } from 'components/Form/components/SelectFormGroup/select.styles';
import { useCallback, useMemo } from 'react';
import { useController } from 'react-hook-form';
import { useEffectOnce } from 'react-use';
import { PartitionKindEnum } from './TargetS3';

export function SettingsHeader() {
  return (
    <Flex flexDir="column">
      <Text textStyle="M6" color="primary">
        Data Loading Settings
      </Text>
      <Text textStyle="R7" color="font-secondary">
        Select and enter all the values for the chosen Target Destination.
      </Text>
    </Flex>
  );
}

export function CollapseWrap({ children }) {
  const { onToggle, isOpen } = useDisclosure();
  return (
    <Flex flexDir="column" w="full" pt={1}>
      <HStack
        role="button"
        onClick={onToggle}
        w="full"
        justify="space-between"
        pb={1}
        {...(!isOpen && { borderBottom: '1px', borderBottomColor: 'gray.300' })}
      >
        <Text color="primary">Advanced Settings</Text>
        <Icon color="primary" as={isOpen ? ChevronUp : ChevronDown} />
      </HStack>
      <Collapse in={isOpen}>
        <Grid
          gridGap="4"
          p="4"
          border="1px"
          borderRadius="md"
          borderColor="gray.300"
        >
          {children}
        </Grid>
      </Collapse>
    </Flex>
  );
}

export function RiveryMetadataField({ formApi }) {
  const { field: targetAdditionalSettings } = useController({
    name: 'river.properties.target.additional_settings',
    control: formApi.control,
  });

  const onSwitchChange = useCallback(
    ({ target }) => {
      targetAdditionalSettings.onChange({
        ...targetAdditionalSettings.value,
        use_rivery_metadata: target.checked,
      });
    },
    [targetAdditionalSettings],
  );

  return (
    <RiverySwitch
      formControlStyle={{ alignItems: 'baseline' }}
      leftLabel
      label={
        <SwitchComplexLabel
          label="Add Rivery Metadata"
          description={
            <Box>
              Rivery_last_update, Rivery_river_id and Rivery_run_id columns will
              be added to the target table. For additional metadata fields, use
              expressions. For more information,{' '}
              <RiveryButton
                label="visit our documentation"
                variant="link"
                size="xs"
                href="https://help.boomi.com/docs/Atomsphere/Data_Integration/Targets/data-integration-metadata-overview"
                target="_blank"
              />
            </Box>
          }
        />
      }
      name="river.properties.target.additional_settings.use_rivery_metadata"
      isChecked={Boolean(targetAdditionalSettings?.value?.use_rivery_metadata)}
      onChange={onSwitchChange}
    />
  );
}

const defaultOptionsNullValues = [
  '',
  'NULL',
  'null',
  'NUL',
  '0000-00-00',
  '0000-00-00 00:00:00',
];

export function ReplaceNullValuesField({ formApi }) {
  const style = useMultiLinerSelectStyles();
  const { field: targetAdditionalSettings } = useController({
    name: 'river.properties.target.additional_settings',
    control: formApi.control,
  });

  const onSwitchChange = useCallback(
    ({ target }) => {
      if (target.checked) {
        targetAdditionalSettings.onChange({
          ...targetAdditionalSettings.value,
          define_null_values: defaultOptionsNullValues,
        });
        return;
      }
      const { define_null_values, ...rest } = targetAdditionalSettings.value;
      targetAdditionalSettings.onChange({
        ...rest,
      });
    },
    [targetAdditionalSettings],
  );

  const defaultNullValues = useMemo(
    () =>
      targetAdditionalSettings?.value?.define_null_values?.map(value => ({
        value,
        label: value,
      })),
    [targetAdditionalSettings?.value?.define_null_values],
  );

  return (
    <Flex flexDir="column" gap={2}>
      <RiverySwitch
        formControlStyle={{ alignItems: 'baseline' }}
        leftLabel
        onChange={onSwitchChange}
        isChecked={Boolean(targetAdditionalSettings?.value?.define_null_values)}
        label={
          <SwitchComplexLabel
            label="Replace values with NULL"
            description={
              <Box>
                By default, the NULL_IF clause will be used in this list of
                values: ‘’, ‘NULL,’ ‘null,’ ‘NUL,’ ‘0000-00-00’, ‘0000-00-00
                00:00:00’. To modify the list, enable the option.
              </Box>
            }
          />
        }
      />
      <RenderGuard
        condition={Boolean(targetAdditionalSettings?.value?.define_null_values)}
      >
        <Box w="410px">
          <CustomSelectForm
            controlId="nullValuesList"
            withCreate
            options={defaultNullValues}
            value={defaultNullValues?.filter(label => label)}
            onChange={(list: any) => {
              const define_null_values = list.map(({ value }) => value);
              targetAdditionalSettings?.onChange({
                ...targetAdditionalSettings.value,
                define_null_values,
              });
            }}
            customStyles={style}
          />
        </Box>
      </RenderGuard>
    </Flex>
  );
}

export function TruncateColumnsField({ formApi }) {
  const { field: targetAdditionalSettings } = useController({
    name: 'river.properties.target.additional_settings',
    control: formApi.control,
  });

  const onSwitchChange = useCallback(
    ({ target }) => {
      targetAdditionalSettings.onChange({
        ...targetAdditionalSettings.value,
        truncate_columns: target.checked,
      });
    },
    [targetAdditionalSettings],
  );

  return (
    <RiverySwitch
      leftLabel
      ariaLabel="Truncate Columns"
      ml="auto"
      label={
        <SwitchComplexLabel
          label="Truncate Columns"
          description="Cut varchar values which are longer than the column definition."
        />
      }
      isChecked={Boolean(targetAdditionalSettings?.value?.truncate_columns)}
      onChange={onSwitchChange}
      formControlStyle={{ alignItems: 'baseline' }}
    />
  );
}

export function ReplaceInvalid({ formApi }) {
  const { field: targetAdditionalSettings } = useController({
    name: 'river.properties.target.additional_settings',
    control: formApi.control,
  });

  const onSwitchChange = useCallback(
    ({ target }) => {
      targetAdditionalSettings.onChange({
        ...targetAdditionalSettings.value,
        replace_invalid_chars: target.checked,
      });
    },
    [targetAdditionalSettings],
  );

  return (
    <RiverySwitch
      leftLabel
      ml="auto"
      label={
        <SwitchComplexLabel
          label="Replace Invalid UTF-8 Characters"
          description="Replace invalid utf-8 characters with Unicode replacement character."
        />
      }
      name="river.properties.target.additional_settings.replace_invalid_chars"
      onChange={onSwitchChange}
      formControlStyle={{ alignItems: 'baseline' }}
      isChecked={Boolean(
        targetAdditionalSettings?.value?.replace_invalid_chars,
      )}
    />
  );
}

export function PartitionedKind({ formApi }) {
  const { field: targetField } = useController({
    name: 'river.properties.target.partitioned_kind',
    control: formApi.control,
  });

  useEffectOnce(() => {
    if (!formApi.getValues('river.properties.target.path')) {
      formApi.setValue(
        'river.properties.target.path',
        '{river_name}_{river_id}',
      );
    }
    if (!targetField.value || targetField.value === '') {
      targetField.onChange(PartitionKindEnum.BY_DAY);
      formApi.setValue(
        'river.properties.target.partitioned_kind',
        PartitionKindEnum.BY_DAY,
      );
    }
  });
  return (
    <CustomSelectForm
      name="river.properties.target.partitioned_kind"
      options={partitionKindOptions}
      label="File Zone Folders Period Partition"
      api={formApi}
      controlId="partition_kind"
      isMulti={false}
      isRequired
    />
  );
}

const partitionKindOptions = [
  { value: PartitionKindEnum.BY_DAY, label: 'Day' },
  { value: PartitionKindEnum.BY_HOUR, label: 'Day-Hour' },
  { value: PartitionKindEnum.BY_MINUTE, label: 'Day-Hour-Minute' },
];

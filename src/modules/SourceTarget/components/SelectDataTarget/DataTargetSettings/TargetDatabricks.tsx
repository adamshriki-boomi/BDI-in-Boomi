import { MetadataType } from 'api/endpoints/metadata.api';
import { SourceTypes, TargetTypes, TargetTypesV1 } from 'api/types';
import { Box, Divider, Flex, RenderGuard, Text } from 'components';
import { Input, RadioGroup, RiverySwitch } from 'components/Form';
import { CatalogSelect } from 'containers/River/Targets/components/MetaQuery/CatalogSelect';
import { useEffect } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import {
  CollapseWrap,
  RiveryMetadataField,
  SettingsHeader,
} from './commonTargetSettings';
import { CustomFzTarget } from './CustomFzTarget';
import { SchemaV1Select } from 'containers/River/Targets/components/MetaQuery/SchemaV1Select';

const CUSTOM_LOCATION_FIELD =
  'river.properties.target.store_in_custom_location';
const CUSTOM_LOCATION_TYPE_FIELD =
  'river.properties.target.custom_location_type';
const CUSTOM_LOCATION_PATH_FIELD =
  'river.properties.target.custom_location_path';

enum CustomLocationTypes {
  DBFS = 'DBFS (Databricks File System)',
  EXTERNAL = 'External Location',
}

enum CustomLocationValues {
  DBFS = 'DBFS',
  EXTERNAL = 'EXTERNAL',
}

const options = Object.entries(CustomLocationTypes).map(([value, label]) => ({
  label,
  value,
  ariaLabel: `${label}-button`,
}));

export function TargetDatabaricks({ connectionReady }) {
  const formApi = useFormContext();

  const { field: sourceName } = useController({
    name: 'river.properties.source.name',
    control: formApi.control,
  });

  const { field: connectionIdField } = useController({
    name: 'river.properties.target.connection_id',
    control: formApi.control,
  });

  const { field: customLocationType } = useController({
    name: CUSTOM_LOCATION_TYPE_FIELD,
    control: formApi.control,
  });

  const { field: customLocationToggle } = useController({
    name: CUSTOM_LOCATION_FIELD,
    control: formApi.control,
  });

  const { field: customLocationPath } = useController({
    name: CUSTOM_LOCATION_PATH_FIELD,
    control: formApi.control,
  });

  const isBlueprint = sourceName.value === SourceTypes.BLUEPRINT;

  useEffect(() => {
    if (customLocationToggle.value && !customLocationType.value) {
      customLocationType.onChange(
        isBlueprint ? CustomLocationValues.EXTERNAL : CustomLocationValues.DBFS,
      );
    }
  }, [
    customLocationToggle.value,
    customLocationType,
    customLocationType.value,
    isBlueprint,
  ]);

  return (
    <>
      <SettingsHeader />
      <Box w="full">
        <CatalogSelect
          ariaLabel="catalog_name"
          name="river.properties.target.catalog_name"
          connectionId={connectionIdField.value}
          useFormApi={formApi}
          errorPrompt
          datasource_id={TargetTypesV1.DATABRICKS}
          task_type="target"
          type={MetadataType.DATABASES}
        />
      </Box>
      <Box w="full">
        <SchemaV1Select
          ariaLabel="schema_name"
          name="river.properties.target.schema_name"
          connectionId={connectionIdField.value}
          dependentFields={['catalog_name']}
          datasource_id={TargetTypes.DATABRICKS}
          task_type="target"
          required="Schema is required"
        />
      </Box>
      <Box>
        <Box my={2}>
          <RiverySwitch
            formControlStyle={{
              alignItems: 'baseline',
              justify: 'space-between',
            }}
            leftLabel
            name={CUSTOM_LOCATION_FIELD}
            onChange={e => {
              const value = e.target.checked;
              customLocationToggle.onChange(value);
              if (!value) {
                customLocationType.onChange(null);
                customLocationPath.onChange(null);
              }
            }}
            label={
              <Text textStyle="M6" color="primary">
                Custom Storing Location
              </Text>
            }
          />
        </Box>
        <RenderGuard condition={customLocationToggle.value}>
          <Flex flexDir="column" gap={2} mb={4}>
            <RadioGroup
              label=""
              name={CUSTOM_LOCATION_TYPE_FIELD}
              values={options}
              checked={customLocationType.value}
              onChange={v => {
                customLocationType.onChange(v);
                customLocationPath.onChange('');
              }}
              {...(isBlueprint && { display: 'none' })}
            />
            <Text fontSize="xs" color="font-secondary">
              {customLocationType.value === CustomLocationValues.DBFS
                ? 'The table will be stored in Databricks File System (DBFS)'
                : 'You may use an external location prefix for creating a Delta table under external location. The location will be set as {externalLocation}/{schema}/{table} path automatically.'}
            </Text>
            <Input
              chakra
              label={
                customLocationType.value === CustomLocationValues.DBFS
                  ? 'External Table Location Path'
                  : 'External Path'
              }
              api={formApi}
              name={CUSTOM_LOCATION_PATH_FIELD}
            />
          </Flex>
        </RenderGuard>
      </Box>
      <CollapseWrap>
        <Flex flexDir="column" gap={2}>
          <RiveryMetadataField formApi={formApi} />
          <Divider />
          <CustomFzTarget connId={connectionIdField.value} api={formApi} />
        </Flex>
      </CollapseWrap>
    </>
  );
}

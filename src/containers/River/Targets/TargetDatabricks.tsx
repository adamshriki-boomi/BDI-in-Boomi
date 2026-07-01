import { Box, Flex, Text } from '@chakra-ui/react';
import { MetadataType } from 'api/endpoints/metadata.api';
import { MergeMethods, TargetTypes } from 'api/types';
import {
  AddChildColumn,
  ExpressionColumn,
  HeaderColumn,
  KeyColumn,
  ModeSelectorColumn,
  RowActionsColumns,
  TargetColumn,
  toTypeSelector,
} from 'components/Form/columnsMapperConfig';
import {
  createOption,
  FormSelect,
  Input,
  Radio,
  RiverySwitch,
} from 'components/Form/components';
import { FormSection } from 'components/Form/FormSection';
import { isVariableString } from 'containers/River/hooks/useAsyncMetadata';
import React from 'react';
import { useGetMetadataQuery } from 'store/metadata';
import { CallType } from 'store/river/hooks/useRiverForMetadataCall';
import { getOId } from 'utils/api.sanitizer';
import { LoadingMode } from '../RiverLogic/Logic/components/LoadingMode';
import { DataBaseSelect, DropTableRiverEnds } from './components/';
import { ModalColumnsMapperController } from './components/ModalColumnsMapperController';

const mergeMethods = [
  {
    label: 'Switch - Merge',
    value: MergeMethods.SWITCH_TABLES,
  },
  {
    label: 'Merge',
    value: MergeMethods.MERGE,
  },
];
enum LocationTypes {
  DBFS = 'DBFS',
  EXTERNAL = 'EXTERNAL',
}
const locationTypesOptions = [
  {
    label: 'DBFS',
    value: LocationTypes.DBFS,
  },
  {
    label: 'External Location',
    value: LocationTypes.EXTERNAL,
  },
];
const strLocation = '{externalLocation}/{schema}/{table}';
const locationTypeComponent = {
  [LocationTypes.EXTERNAL]: ({ useFormApi }) => (
    <>
      <Text fontSize="xs" m={2}>
        You may use an external location prefix for creating a Delta table under
        external location. The location will be set as {strLocation} path
        automatically.
      </Text>
      <Box
        ml={4}
        as={Input}
        name="content.location"
        label="External Table Location Path"
        required
        api={useFormApi}
        mt={4}
      />
    </>
  ),
  [LocationTypes.DBFS]: ({ useFormApi }) => (
    <>
      <Text fontSize="xs" m={2}>
        The table will be stored in Databricks File System (DBFS).
      </Text>
      <Box
        ml={4}
        as={Input}
        name="content.location"
        label="External Path"
        required
        api={useFormApi}
        mt={4}
      />
    </>
  ),
};
const LocationComponent = ({ step, formApi }) => {
  const isUseLocation = Boolean(step.content.use_location);
  const locationType = step.content.location_type || LocationTypes.DBFS;
  const Component = locationTypeComponent[locationType];
  return isUseLocation ? (
    <Box>
      <Radio
        label=""
        name="content.location_type"
        values={locationTypesOptions}
        api={formApi}
      />
      <Component useFormApi={formApi} />
    </Box>
  ) : null;
};
export function LogicTable({ useFormApi, onSubmitHandler, step }) {
  const formChanges = useFormApi.watch();
  const control = useFormApi.control;
  const {
    content: { database, catalog },
  } = step;
  const selectedDatabase = database ? createOption(database) : '';
  const databaseResponse = useGetMetadataQuery(toMetaQueryConfig(step));
  const selectedCatalog = catalog ? createOption(catalog) : '';

  return (
    <form onSubmit={onSubmitHandler}>
      <Flex flexDir="column" gap={3}>
        <FormSection title="Load Into">
          <DataBaseSelect
            connectionId={getOId(step.content?.gConnection)}
            value={selectedCatalog}
            useFormApi={useFormApi}
            step={step}
            type={MetadataType.CATALOGS}
            label="Catalog"
            name="content.catalog"
            placeholder="Select Catalog or use variable."
            helpText="Leaving empty will inherit the default catalog from the connection"
            chakra={false}
          />
          <FormSelect
            name="content.database"
            label="Schema"
            metadataResponse={databaseResponse}
            options={databaseResponse.data}
            isValidNewOption={isVariableString}
            controlId="database"
            api={useFormApi}
            value={selectedDatabase}
            editableCreate
            defaultCreateLabel=""
            placeholder="Select database or use a variable"
            hideErrorTitle
            isClearable
          />
          <Input
            name="content.target_table"
            label="Table Name"
            api={useFormApi}
            placeholder="Define table name or use a variable"
          />
          <Box my={4}>
            <RiverySwitch
              name="content.use_location"
              label="Store in a custom location"
              api={useFormApi}
            />
          </Box>
          <LocationComponent step={step} formApi={useFormApi} />
          <LoadingMode
            formChanges={formChanges}
            useFormApi={useFormApi}
            mergeMethods={mergeMethods}
          />
          <DropTableRiverEnds api={useFormApi} />
        </FormSection>
      </Flex>
      <ModalColumnsMapperController
        control={control}
        api={useFormApi}
        step={step}
        type={TargetTypes.DATABRICKS}
      />
    </form>
  );
}

export const types = [
  'STRING',
  'BIGINT',
  'FLOAT',
  'BOOLEAN',
  'TIMESTAMP',
  'TIME',
  'INTEGER',
  'SMALLINT',
  'TINYINT',
  'DOUBLE',
  'DATE',
  'BINARY',
  'NUMERIC',
  'JSON',
];

export const defaultType = types[0];

export const LogicTargets = {
  Table: true,
  Variable: true,
  FileExport: false,
};

export const mappingCols = {
  columns: [
    HeaderColumn,
    KeyColumn,
    TargetColumn,
    toTypeSelector({ repeat: true, typeOptions: types }),
    ModeSelectorColumn,
    ExpressionColumn,
    AddChildColumn,
    RowActionsColumns,
  ],
};
export const toMetaQueryConfig = (step: any) => {
  const id = getOId(step.content?.gConnection);
  return {
    id: id ? `${id}_${step.content?.catalog}` : null,
    step,
    type: MetadataType.DATABASES,
    callType: CallType.LOGIC,
  };
};

export const defaultFields = {
  catalog: null,
  database: null,
};

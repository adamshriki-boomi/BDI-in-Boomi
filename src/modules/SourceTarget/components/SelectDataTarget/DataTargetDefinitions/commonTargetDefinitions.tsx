import { Box, chakra } from '@chakra-ui/react';
import { SourceTypes, storageTargets } from 'api/types';
import { ExclamationCircle, Flex, HStack, RenderGuard, Text } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import {
  CustomSelectForm,
  Input,
  RiverySwitch,
  SwitchComplexLabel,
} from 'components/Form';
import SvgRdsAppend from 'components/Icons/components/RdsAppend';
import SvgRdsMerge from 'components/Icons/components/RdsMerge';
import SvgRdsOverwrite from 'components/Icons/components/RdsOverwrite';
import { useDataSourcesSections } from 'modules/Datasources';
import { useGetRiverCommonProps } from 'modules/SourceTarget/components/form';
import { IRiverExtractMethod } from 'modules/SourceTarget/store';
import { useCallback } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { EXTRACT_METHOD } from '../../form/form.consts';
import { MenuList, Option, SingleValue } from './SelectComponents';

enum ELoadingOptions {
  MERGE = 'merge',
  APPEND = 'append',
  OVERWRITE = 'overwrite',
}

const LoadingOptions = [
  {
    label: 'Upsert Merge',
    value: ELoadingOptions.MERGE,
    icon: SvgRdsMerge,
    description:
      'The system will match rows based on your chosen keys columns so that it can either replace matching rows, keep unmatched rows, or add new ones.',
  },
  {
    label: 'Append Only',
    value: ELoadingOptions.APPEND,
    icon: SvgRdsAppend,
    description:
      'Data in the current load will be appended to the existing table',
  },
  {
    label: 'Overwrite',
    value: ELoadingOptions.OVERWRITE,
    icon: SvgRdsOverwrite,
    description: 'This mode replaces existing tables with the new ones loaded',
  },
];

export const RelevantLoadingOptions = () => {
  //in cdc and change tracking + system versioning there is not option to select overwrite
  const { isNotStandard } = useGetRiverCommonProps();
  return isNotStandard
    ? LoadingOptions.filter(
        option => option.value !== ELoadingOptions.OVERWRITE,
      )
    : LoadingOptions;
};

function customStyleForTableDefault(isTableView, value, field) {
  return (
    isTableView &&
    !value && {
      customStyles: {
        placeholder: style => ({ ...style, color: 'font' }),
      },
      placeholder: `${field?.label}  (Default)`,
    }
  );
}

export function SingleTableTargetSettings({
  formApi,
  targetField,
  fieldNames,
  isTableView = false,
  children = null,
  mergeMethods = null,
}) {
  const selectedLoadingMethod =
    formApi.watch(fieldNames?.loading_method) ?? targetField?.loading_method;
  const isMergeMode = [
    selectedLoadingMethod?.value,
    selectedLoadingMethod,
  ].includes(ELoadingOptions.MERGE);
  const showMergeMethod =
    Boolean(fieldNames?.merge_method) && isMergeMode && mergeMethods;
  const filteredLoadingOptions = RelevantLoadingOptions();
  const defaultLoadingMode = filteredLoadingOptions.find(
    ({ value }) => value === targetField?.loading_method,
  );
  const defaultMergeMethod = mergeMethods?.find(
    ({ value }) => value === targetField?.merge_method,
  );
  return (
    <>
      <Flex flexDir="column" gap={2}>
        <Flex flexDir="column" gap={1}>
          {!isTableView && (
            <Text color="primary" textStyle="M7">
              Default Loading Mode
            </Text>
          )}
          {!isTableView && (
            <Text color="font-secondary">
              Select the way you would like to load the data.
            </Text>
          )}
          <CustomSelectForm
            api={formApi}
            name={fieldNames?.loading_method}
            chakra
            options={filteredLoadingOptions}
            defaultValue={targetField?.loading_method}
            components={{
              Option: props => (
                <Option
                  isTableView={isTableView}
                  defaultSetting={defaultLoadingMode}
                  {...props}
                />
              ),
              SingleValue: props => (
                <SingleValue
                  isTableView={isTableView}
                  defaultSetting={defaultLoadingMode}
                  {...props}
                />
              ),
              MenuList,
            }}
            controlId="loading mode"
            isMulti={false}
            {...customStyleForTableDefault(
              isTableView,
              formApi.watch(fieldNames?.loading_method),
              defaultLoadingMode,
            )}
          />
        </Flex>
        <RenderGuard condition={showMergeMethod}>
          <HStack>
            <Text textStyle="R7">Merge Method</Text>
            <CustomSelectForm
              api={formApi}
              name={fieldNames?.merge_method}
              chakra
              options={mergeMethods}
              defaultValue={targetField?.merge_method}
              components={{
                Option: props => (
                  <Option
                    isTableView={isTableView}
                    defaultSetting={defaultMergeMethod}
                    {...props}
                  />
                ),
                SingleValue: props => (
                  <SingleValue
                    isTableView={isTableView}
                    defaultSetting={defaultMergeMethod}
                    {...props}
                  />
                ),
                MenuList,
              }}
              controlId="merge mode"
              isMulti={false}
              {...customStyleForTableDefault(
                isTableView,
                formApi.watch(fieldNames?.merge_method),
                defaultMergeMethod,
              )}
            />
          </HStack>
        </RenderGuard>
      </Flex>
      <RenderGuard
        condition={Boolean(fieldNames?.ordered_merge_key) && isMergeMode}
      >
        <Flex gap={2} flexDir="column" pt={!isTableView && 2} pb={4} pl={2}>
          <HStack>
            <RiverySwitch
              api={formApi}
              name={fieldNames?.ordered_merge_key}
              label={
                <SwitchComplexLabel
                  label="Filter Logical Key Duplication Between Files"
                  description="Filters out duplications in the current Source pull."
                />
              }
              leftLabel
              formControlStyle={{ alignItems: 'baseline' }}
              ml="auto"
            />
          </HStack>
          <Box>
            <RiveryAlert
              variant="warning-light"
              icon={ExclamationCircle}
              description="Use only when duplicates are expected in the Source, but not in the Target Table."
            />
          </Box>
          <RenderGuard
            condition={
              Boolean(fieldNames?.order_expression) &&
              formApi?.watch(fieldNames?.ordered_merge_key)
            }
          >
            <Box ml={2}>
              <Input
                api={formApi}
                name={fieldNames?.order_expression}
                label="Set filter order expression, otherwise it will be selected randomly:"
                chakra
                placeholder="Example: col_name1"
              />
            </Box>
          </RenderGuard>
        </Flex>
      </RenderGuard>
      {children}
    </>
  );
}

export function TablePrefixField({ formApi }) {
  return (
    <Flex flexDir="column">
      <Text display="inline">
        Table Prefix{' '}
        <chakra.span display="inline-block">(optional)</chakra.span>
      </Text>
      <Input
        api={formApi}
        name="river.properties.target.target_prefix"
        chakra
        label="Add a character/phrase to the beginning of the Target Table name."
        placeholder="Example: ODS"
      />
    </Flex>
  );
}

export function useConvertFileAllowed() {
  const formApi = useFormContext();

  const source = formApi?.watch('river.properties.source');
  const extractMethod = formApi?.watch(EXTRACT_METHOD);
  const { selectedDataSource } = useDataSourcesSections('source', source?.name);

  const currentFileType =
    selectedDataSource?.data_source_type_settings
      ?.supported_file_types_per_data_warehouse?.bq?.[0];

  const isStorageSource = storageTargets.includes(source?.name);
  const sectionId = selectedDataSource?.section_id;
  const sectionIds = Array.isArray(sectionId) ? sectionId : [sectionId];
  const isNonStorageConnection =
    sectionIds && !sectionIds.includes('sec_storage');
  const sourceCompatible = isStorageSource || isNonStorageConnection;
  const extractMethodValid = extractMethod !== IRiverExtractMethod.LOG;
  const notWebhook = source?.name !== SourceTypes.WEBHOOK;
  const isAllowed = sourceCompatible && extractMethodValid && notWebhook;

  return {
    isAllowed,
    currentFileType: currentFileType?.toUpperCase(),
  };
}

export function FileFormatSettings({ formApi, currentFileType }) {
  const { field: isConvertFileField } = useController({
    name: 'river.properties.target.is_convert_file',
    control: formApi.control,
  });

  const { field: convertFileTypeField } = useController({
    name: 'river.properties.target.convert_file_type',
    control: formApi.control,
  });

  const handleSwitchChange = useCallback(
    ({ target }) => {
      const isChecked = target.checked;
      isConvertFileField.onChange(isChecked);
      convertFileTypeField.onChange(isChecked ? 'parquet' : null);
    },
    [isConvertFileField, convertFileTypeField],
  );

  const isToggleChecked =
    isConvertFileField.value ?? Boolean(convertFileTypeField.value);

  return (
    <Flex flexDir="column" gap="2">
      <Text>File Format</Text>
      <Text color="font-secondary">
        Boomi Data Integration allows you to convert CSV/JSON files to Parquet
        directories. Parquet is an open source file format designed for flat
        columnar data storage. Parquet works well with large amounts of complex
        data.
      </Text>
      <HStack>
        <Text>Current File Type: </Text>
        <Text textStyle="M7">{currentFileType}</Text>
      </HStack>
      <RiverySwitch
        formControlStyle={{
          alignItems: 'baseline',
          justify: 'space-between',
        }}
        label="Convert File To Parquet Format"
        isChecked={isToggleChecked}
        onChange={handleSwitchChange}
        leftLabel
      />
    </Flex>
  );
}

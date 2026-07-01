import { Box, Collapse, Flex } from '@chakra-ui/react';
import {
  ChevronDown,
  ChevronUp,
  RiveryButton,
  Text,
  HStack,
  Icon,
  RenderGuard,
  PlusIcon,
  InfoTooltip,
} from 'components';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from 'react-hook-form';
import * as React from 'react';
import { useToggle } from 'react-use';
import {
  ExpressionTypeSelect,
  useHandleCalculatedExpressions,
} from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/TableSource/SourceCommonSettings';
import { TypeSelect } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/Mapping/components/AllColumns/TypeSelect';
import { CalculatedColumns } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/Mapping/CalculatedColumn';
import RiveryAlert from 'components/Alert/Alert';
import { RiverySwitch } from 'components/Form';
import { storageTargets } from 'api/types';

export const BulkCalculatedColumns = () => {
  const [isCreatingMode, setIsCreatingMode] = useToggle(false);
  const formApi = useFormContext();
  const sourceName = formApi.watch('source.name');
  const targetName = formApi.watch('targetName');
  const isStorage = storageTargets.includes(targetName);
  const {
    isDisabled: isExpressionSelectDisabled,
    defaultValue,
    hasTargetColumns,
    shouldShowCalculatedColumn,
  } = useHandleCalculatedExpressions(sourceName, targetName);

  const {
    fields: newCalculatedColumns,
    append,
    update,
    remove,
  } = useFieldArray({
    name: 'actions.newCalculatedColumns',
    control: formApi.control,
  });

  const handleDeleteColumn = columnFormApi => {
    const columnIdToDelete = columnFormApi.watch('column_id');
    const columnIndex = newCalculatedColumns.findIndex(
      (col: any) => col.column_id === columnIdToDelete,
    );
    if (columnIndex !== -1) {
      // newCalculatedColumns.splice(columnIndex, 1);
      remove(columnIndex);
    } else {
      setIsCreatingMode();
    }
  };

  const handleAddedColumn = columnFormApi => {
    const columnIdToEdit = columnFormApi.watch('column_id');
    const columnIndex = newCalculatedColumns.findIndex(
      (col: any) => col.column_id === columnIdToEdit,
    );
    if (columnIndex !== -1) {
      // edit an existing column
      update(columnIndex, columnFormApi.watch());
    } else {
      // add a new column
      append(columnFormApi.watch());
      setIsCreatingMode();
    }
  };

  const BulkColumn = props => {
    const column = props.column;
    const columnFormApi = useForm({
      defaultValues: {
        column_id: column?.column_id ?? crypto.randomUUID(),
        calculated_column_mode: column?.calculated_column_mode ?? defaultValue,
        expression: column?.expression ?? '',
        name: column?.name ?? '',
        alias: column?.name ?? '',
        mode: column?.mode ?? 'NULLABLE',
        type: column?.type ?? '',
        is_selected: true,
        is_key: column?.is_key ?? false,
      },
      mode: 'onChange',
    });

    const isApplyDisabled =
      !columnFormApi?.watch('name') ||
      !columnFormApi?.watch('expression') ||
      !columnFormApi?.watch('type');

    return (
      <FormProvider {...columnFormApi}>
        <Flex
          border="1px"
          borderColor="gray.300"
          p={4}
          gap={4}
          flexDir="column"
          borderRadius={4}
          borderTopRadius={column ? 0 : 4}
        >
          <RiveryAlert
            variant="warning-light"
            icon={InfoTooltip}
            description={`When adding a calculated column with the same name as an existing column in the table, the existing column will be overwritten with the new expression configuration.`}
          />
          <ExpressionTypeSelect
            isDisabled={isExpressionSelectDisabled}
            defaultValue={defaultValue}
          />
          <CalculatedColumns />
          <RenderGuard condition={hasTargetColumns}>
            <TypeSelect label="Data Type" target={targetName} />
          </RenderGuard>
          <RenderGuard condition={!isStorage}>
            <RiverySwitch
              label="Set column as Match Key"
              leftLabel
              isChecked={columnFormApi?.watch('is_key')}
              onChange={({ target }) =>
                columnFormApi.setValue('is_key', target.checked)
              }
              formControlStyle={{
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            />
          </RenderGuard>
          <HStack
            justify="space-between"
            borderTop="1px"
            borderTopColor="gray.300"
            mx={-4}
            px={4}
            pt={4}
          >
            <RiveryButton
              label={column ? 'Delete' : 'Discard'}
              variant="default"
              size="small"
              onClick={() => handleDeleteColumn(columnFormApi)}
            />
            <RiveryButton
              label={column ? 'Apply Changes' : 'Add Column'}
              aria-label="Add Column"
              variant="primary"
              size="small"
              isDisabled={isApplyDisabled}
              onClick={() => handleAddedColumn(columnFormApi)}
            />
          </HStack>
        </Flex>
      </FormProvider>
    );
  };

  const BulkColumnCollapsable = props => {
    const column = props.column;
    const [isOpen, setIsOpen] = useToggle(false);
    return (
      <Flex w="450px" flexDir="column">
        <HStack
          role="button"
          onClick={setIsOpen}
          w="full"
          justify="space-between"
          bgColor="background-secondary"
          fontStyle="M7"
          h={50}
          paddingInline={4}
          border={isOpen ? '1px solid' : undefined}
          borderColor="gray.300"
          borderTopRadius={5}
          borderBottomRadius={isOpen ? 0 : 5}
          borderBottomColor={isOpen ? 'transparent' : 'gray.300'}
        >
          <Text color={isOpen ? 'primary' : 'font'}>
            {column?.name ?? 'New Calculated Column'}
          </Text>
          <Icon boxSize={4} as={isOpen ? ChevronUp : ChevronDown} />
        </HStack>

        <Box>
          <Collapse in={isOpen}>
            <BulkColumn column={column} />
          </Collapse>
        </Box>
      </Flex>
    );
  };

  // Hide entire section if neither source nor target calculated columns are supported
  if (!shouldShowCalculatedColumn) {
    return null;
  }

  return (
    <Flex w="450px" flexDir="column" gap={4}>
      <Flex flexDir="column">
        <Text textStyle="M6" color="primary">
          Calculated Columns
        </Text>
        <Flex alignItems="center">
          <Text textStyle="R7" color="font-secondary">
            Add Calculated Column to all selected Tables.
          </Text>
          <RiveryButton
            label="Add"
            variant="default"
            size="sm"
            ml="auto"
            onClick={setIsCreatingMode}
            leftIcon={<Icon as={PlusIcon} />}
          />
        </Flex>
      </Flex>
      <RenderGuard condition={isCreatingMode}>
        <BulkColumn />
      </RenderGuard>
      {newCalculatedColumns.map((column, index) => (
        <BulkColumnCollapsable column={column} key={index} />
      ))}
    </Flex>
  );
};

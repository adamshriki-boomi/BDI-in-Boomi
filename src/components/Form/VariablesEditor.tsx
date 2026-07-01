import { Variable } from 'api/types/rivers.types';
import {
  Box,
  ButtonCreate,
  HStack,
  Icon,
  RiveryModal,
  RiveryOverlay,
  Text,
} from 'components';
import { createOption, CustomSelectForm } from 'components/Form/components';
import { InfoIcon } from 'components/Icons';
import { RiveryTable } from 'components/RiveryTable/RiveryTable';
import { RiverVariableForm } from 'containers/River/RiverLogic/Logic/components/RiverVariables/RiverVariableForm';
import { useEnableEdit } from 'hooks/useEnableEdit';
import { useRiverType } from 'hooks/useRiverType';
import { useVersionController } from 'modules/Versions/hooks';
import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useFormContext } from 'react-hook-form';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { Column } from 'react-table';
import { useToggle } from 'react-use';
import { useAccount } from 'store/core';
import { compare } from 'utils/array.utils';
import {
  CheckboxClearValueOnStart,
  DeleteButton,
  IsEncryptedCheckbox,
  TableCheckbox,
  TableDatePicker,
  TableInput,
  VariableName,
} from './components/VariablesEditorComponents';
import { useVariables, VariablesEditContext } from './variables.context';
export const enum VariantVariables {
  INPUTS = 'inputs',
  OUTPUTS = 'outputs',
  RIVER_INPUTS = 'river_inputs',
}
export interface VariablesEditProps {
  variables: Record<string, any & Variable>;
  outputVariables?: Record<string, any & Variable>;
  onChange?: (value: Record<string, Variable>) => any;
  onDirty?: (value: Record<string, any> | undefined) => any;
  onMappingChange?: (stepVar: string, riverVar: string) => any;
  onAddOutputVariable?: (newVariableName: string) => any;
  variant?: VariantVariables | undefined;
  compact?: boolean;
  disabled?: boolean;
  createFormApi?: any;
}

const emptyVars = {};

function objReducer(state, { type, payload }) {
  switch (type) {
    case 'reset':
      return initialVariableState;
    default:
      return {
        ...state,
        [type]: payload,
      };
  }
}

function toFieldUpdater(variables: object, onChange) {
  if (onChange) {
    return (varName, fieldKey, fieldValue) => {
      const res = Object.fromEntries(
        Object.entries(variables).map(([key, value]) => {
          if (varName === key) {
            return [key, { ...value, [fieldKey]: fieldValue }];
          } else {
            return [key, value];
          }
        }),
      );
      onChange(res);
    };
  } else {
    return null;
  }
}

function VariablesTableTooltip({ title, description }) {
  return (
    <RiveryOverlay placement="bottom" description={description} portal>
      <HStack py={2} pr={2} alignItems="flex-end">
        <Text>{title}</Text>
        <Icon
          as={InfoIcon}
          color="font-secondary"
          boxSize={3}
          mb="4px!important"
        />
      </HStack>
    </RiveryOverlay>
  );
}

const inputsTableColumns: Column[] = [
  {
    Header: 'Variable Type',
    accessor: '1.type',
  },
  {
    Header: 'Variable Name',
    accessor: '0',
    Cell: VariableName,
  },
  {
    Header: 'Value',
    accessor: '1.value',
    Cell: props => {
      const Editor =
        props.row.original?.[1]?.type === 'Interval Param'
          ? TableDatePicker
          : TableInput;
      return <Editor {...props} />;
    },
  },
];
const riverInputsTableColumns: Column[] = [
  {
    Header: 'Variable Name',
    accessor: '0',
    Cell: VariableName,
  },
  {
    Header: 'Value',
    accessor: '1.value',
    Cell: TableInput,
  },
];

const outputTableColumns: Column[] = [
  {
    Header: 'Variable Name',
    accessor: '0',
    Cell: VariableName,
  },
  {
    Header: 'Populate',
    Cell: () => <FaLongArrowAltRight size={32} />,
    weight: 'min-content',
  },
  {
    Header: 'Logic Flow Variable',
    accessor: '1.value',
    Cell: OutputVariableSelector,
  },
];

const variantsColumns = {
  [VariantVariables.RIVER_INPUTS]: riverInputsTableColumns,
  [VariantVariables.INPUTS]: inputsTableColumns,
  [VariantVariables.OUTPUTS]: outputTableColumns,
};

const varNameCol = {
  Header: 'Variable Name',
  accessor: '0',
  Cell: VariableName,
};

const varValueCol = {
  Header: () => (
    <VariablesTableTooltip
      title="Value"
      description="Variables values can contain up to 20,000 characters"
    />
  ),
  accessor: '1.value',
  Cell: TableInput,
};

const delValueCol = {
  Header: '',
  id: 'delete',
  Cell: DeleteButton,
  weight: 'min-content',
};

const variableTableColumns = allowLogicPython =>
  [
    varNameCol,
    varValueCol,
    Boolean(allowLogicPython) && {
      Header: (
        <VariablesTableTooltip
          title="Encrypt"
          description="Currently supported for Python steps only."
        />
      ),
      accessor: '1.is_encrypted',
      Cell: IsEncryptedCheckbox,
      weight: 'max-content',
      styleProps: { justifyContent: 'center' },
    },
    {
      Header: () => (
        <VariablesTableTooltip
          title="Contains Multiple Values"
          description="Variables values can contain up to 10,000 records"
        />
      ),
      accessor: '1.is_multi_value',
      Cell: TableCheckbox,
      weight: '150px',
      styleProps: { justifyContent: 'center' },
      headerProps: { whiteSpace: 'break-spaces' },
    },
    {
      Header: 'Clear Value On Start',
      accessor: '1.clear_value_on_start',
      Cell: CheckboxClearValueOnStart,
      weight: '110px',
      styleProps: { justifyContent: 'center' },
      headerProps: { whiteSpace: 'break-spaces' },
    },
    delValueCol,
  ].filter(val => val.Cell);

const variableSource2Target = [
  varNameCol,
  varValueCol,
  {
    Header: 'Is Private',
    accessor: '1.is_private',
    Cell: TableCheckbox,
    weight: 'max-content',
    styleProps: { justifyContent: 'center' },
  },
  delValueCol,
];

const variableBlueprint = [
  varNameCol,
  varValueCol,
  {
    Header: 'Is Encrypted',
    accessor: '1.is_encrypted',
    Cell: IsEncryptedCheckbox,
    weight: 'max-content',
    styleProps: { justifyContent: 'center' },
  },
  delValueCol,
];

const initialVariableState = {
  name: '',
  value: '',
  is_multi_value: false,
  clear_value_on_start: true,
};

export function VariablesEditor({
  variables = emptyVars,
  outputVariables = emptyVars,
  onMappingChange,
  onAddOutputVariable,
  onChange,
  onDirty,
  variant = undefined,
  disabled = false,
  compact = false,
  createFormApi = null,
}: VariablesEditProps) {
  const [newVarState, updateNewVarState] = useReducer(
    objReducer,
    initialVariableState,
  );
  const formApi = useFormContext();
  const formValues = formApi?.watch() ?? createFormApi?.watch();
  const isBlueprintRiver =
    formValues &&
    ['Blueprint', 'blueprint_copilot', 'blueprint'].includes(
      formValues?.river?.properties?.source.name,
    );

  const { isSettingOn } = useAccount();
  const { isSourceToTarget } = useRiverType();
  const columns = isSourceToTarget
    ? isBlueprintRiver
      ? variableBlueprint
      : variableSource2Target
    : variantsColumns[variant] ||
      variableTableColumns(isSettingOn('allow_logic_python'));
  const onDelete = onChange
    ? varName => {
        const { [varName]: _, ...newVale } = variables;
        onChange(newVale);
      }
    : null;
  const onUpdate = onChange
    ? updated => {
        const res = Object.fromEntries(
          Object.entries(variables).map(([key, value]) => {
            if (updated?.name === key) {
              return [key, { ...updated }];
            } else {
              return [key, value];
            }
          }),
        );
        onChange(res);
      }
    : null;
  const onAdd = onChange
    ? variable => {
        const { name, ...newValue } = variable;
        onChange(
          Object.assign({ [name]: { ...newValue, value: '' } }, variables),
        );
        updateNewVarState({ type: 'reset', payload: null });
      }
    : null;

  const data = useMemo(
    () => (variables ? Object.entries(variables) : []),
    [variables],
  );

  const canAdd = Boolean(onAdd);

  useEffect(() => {
    if (onDirty) {
      onDirty(canAdd ? newVarState : undefined);
    }
  }, [newVarState, canAdd, onDirty]);

  return (
    <VariablesEditContext.Provider
      value={{
        newVarState,
        variables,
        outputVariables,
        onAdd,
        onDelete,
        onUpdate,
        onValue: toFieldUpdater(variables, onChange),
        onMappingChange,
        onAddOutputVariable,
      }}
    >
      <Box as="fieldset" disabled={disabled} display="contents">
        <RiveryTable
          inline={Boolean(variant)}
          fixedPageSize={compact}
          entityType="Variables"
          columns={columns}
          data={data}
          tableProps={{ maxHeight: '70vh' }}
          ariaLabel="variables editor"
          extraControls={
            <VariableFormDialog onSubmit={onAdd} variables={variables} />
          }
          filterLabel="Search Variables"
        />
      </Box>
    </VariablesEditContext.Provider>
  );
}

export function VariableSelector({
  value,
  onChange,
  onAddVariable,
  selectedVariables,
  variable,
  variableName = variable,
  createVar = true,
  hideIndicator = true,
  placeholder = undefined,
  styleProps = null,
  label = null,
}) {
  const { enableEdit } = useEnableEdit();
  const targetOptions =
    selectedVariables &&
    Object.keys(selectedVariables).map(value => ({
      value: createVar ? value : `{${value}}`,
      label: `{${value}}`,
    }));
  const selectedOption =
    targetOptions.find(compare('value', value)) ||
    (value && createOption(value));

  return (
    <CustomSelectForm
      chakra={false}
      isMulti={false}
      label={label}
      options={targetOptions}
      value={selectedOption}
      onChange={onChange}
      onAddOption={newVarName => {
        onAddVariable(newVarName?.replace(/[{}]/g, ''));
      }}
      controlId={`target variable ${variableName}`}
      withCreate={enableEdit}
      defaultCreateValue={variable}
      defaultCreateLabel={createVar ? 'Create variable' : ''}
      placeholder={placeholder}
      {...styleProps}
    />
  );
}

function OutputVariableSelector({
  value,
  row: {
    original: [outputVar],
  },
}) {
  const { outputVariables, onMappingChange, onAddOutputVariable } =
    useVariables();

  return (
    <VariableSelector
      value={value}
      onChange={({ value }: any) => {
        onMappingChange(outputVar, value);
      }}
      onAddVariable={newVarName => {
        onAddOutputVariable(newVarName);
        onMappingChange(outputVar, newVarName);
      }}
      variable={outputVar}
      selectedVariables={outputVariables}
    />
  );
}

export function VariableFormDialog({
  onClick = null,
  onCancel = null,
  disabled = null,
  onSubmit = null,
  variables = null,
}) {
  const [show, toggle] = useToggle(false);
  const { isActive: isInVersionMode } = useVersionController();
  return (
    <>
      <ButtonCreate
        onClick={() => {
          toggle(true);
          onClick && onClick();
        }}
        fontWeight="bold"
        ml="auto"
        disabled={disabled || isInVersionMode}
        aria-label="add variable"
      >
        Add Variable
      </ButtonCreate>

      <VariableFormModal
        variables={variables}
        show={show}
        toggle={useCallback(() => {
          toggle();
          onCancel && onCancel();
        }, [toggle, onCancel])}
        onSubmit={onSubmit}
      />
    </>
  );
}

export function VariableFormModal({
  show = true,
  toggle = null,
  onSubmit,
  variables,
}) {
  const title = 'Add Variable';
  return (
    <RiveryModal
      show={show}
      onClose={toggle}
      onSuccess={toggle}
      centered
      ariaLabel={title}
      title={title}
    >
      <RiverVariableForm
        variables={variables}
        onDone={toggle}
        onSubmit={onSubmit}
      />
    </RiveryModal>
  );
}

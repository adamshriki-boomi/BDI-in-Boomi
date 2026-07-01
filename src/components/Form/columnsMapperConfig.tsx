import { Flex, Icon, IconButton, Text } from '@chakra-ui/react';
import { Box, ConfirmationModal } from 'components';
import {
  createOption,
  Input,
  RiveryCheckbox,
  SelectFormGroup,
} from 'components/Form/components';
import { resolveNumber } from 'components/Form/components/Input/InputRenderer';
import { RiveryInfoTooltip } from 'components/RiveryOverlay/RiveryOverlay';
import React, { useContext, useEffect, useState } from 'react';
import { BsFolderPlus, BsPlusCircleFill, BsTrashFill } from 'react-icons/bs';
import { CgAddR, CgRemoveR } from 'react-icons/cg';
import { MdVpnKey } from 'react-icons/md';
import { useToggle } from 'react-use';
import { compare } from 'utils/array.utils';
import { ColumnsMapperContext } from './ColumnsMapper';
import { Grid } from '../index';

export function EditableCell({
  value: baseValue,
  row,
  column,
  type = undefined,
}) {
  const context = useContext(ColumnsMapperContext);
  const [value, setValue] = useState(baseValue);
  useEffect(() => {
    setValue(baseValue);
  }, [baseValue, setValue]);
  return column.isHidden && column.isHidden(context, row) ? null : (
    <Input
      disabled={column.getDisabled && column.getDisabled(context, row)}
      onBlur={({ target: { value } }) =>
        value !== baseValue && context.setFields(row.id, { [column.id]: value })
      }
      onChange={val => {
        const value =
          column?.type === 'number' ? resolveNumber(val) : val?.target?.value;
        setValue(value);
      }}
      label={`edit ${row.id} ${column.id}`}
      hideLabel
      value={value ?? ''}
      placeholder={
        column.placeholder ??
        (column.getPlaceholder ? column.getPlaceholder(row) : null)
      }
      type={column?.type ?? type}
    />
  );
}

function SelectCell({
  options,
  controlId,
  value,
  row,
  column,
  placeholder = undefined,
  components = undefined,
  onChange = undefined,
}) {
  const { setFields } = useContext(ColumnsMapperContext);
  const valueOption =
    options.find(compare('value', value)) || createOption(value);

  return (
    <SelectFormGroup
      controlId={controlId}
      value={valueOption}
      options={options}
      placeholder={placeholder}
      onChange={({ value }) => {
        const values = (onChange && onChange(value)) || {};
        values[column.id] = value;
        setFields(row.id, values);
      }}
      components={
        typeof components === 'function' ? components(row) : components
      }
    />
  );
}
export function TypeSelector(props) {
  const { column, row } = props;
  const displayRepeated = column.repeat && row?.original.mode === 'REPEATED';
  return (
    <>
      <SelectCell
        options={column.typeOptions.map(value => ({
          value,
          label: value,
        }))}
        {...props}
        onChange={column.onChange}
        controlId={`choose type ${props.row.id}`}
      />
      {displayRepeated ? (
        <RiveryInfoTooltip
          ariaLabel="repeated"
          icon={<Text fontWeight="light">[...]</Text>}
          description={`Array (Repeated) field will be uploaded as ${
            column.repeatLabel || 'Variant'
          }`}
        />
      ) : (
        <div style={{ whiteSpace: 'pre' }}>{'     '}</div>
      )}{' '}
    </>
  );
}

export function toTypeSelector(options) {
  return {
    Header: 'Type',
    accessor: 'type',
    Cell: TypeSelector,
    weight: 'minmax(80px, 1fr)',
    ...options,
  };
}

const modeOptions = ['NULLABLE', 'REQUIRED', 'REPEATED'].map(value => ({
  value,
  label: value,
}));

export function ModeSelector(props) {
  return (
    <SelectCell
      options={modeOptions}
      placeholder={modeOptions[0].label}
      {...props}
      controlId={`choose mode ${props.row.id}`}
    />
  );
}

export const ModeSelectorColumn = {
  Header: 'Mode',
  accessor: 'mode',
  Cell: ModeSelector,
  weight: 'minmax(80px, 1fr)',
};

export function KeyCell({ value, row: { original, id: rowId }, column }) {
  const { setFields } = useContext(ColumnsMapperContext);

  if (rowId.indexOf('.') > 0) {
    return null;
  }

  const disabled = original.type === 'RECORD';
  return (
    <IconButton
      icon={<MdVpnKey />}
      disabled={disabled}
      variant="text-link"
      isRound
      aria-label={disabled ? 'disabled lock' : value ? 'unlock' : 'lock'}
      color={!disabled && value ? 'warning' : undefined}
      onClick={() => setFields(rowId, { [column.id]: !value })}
    />
  );
}

export function AddChildButton({
  row: {
    original: { type },
    id,
  },
}) {
  const { addRow } = useContext(ColumnsMapperContext);

  return type === 'RECORD' ? (
    <IconButton
      icon={<Icon as={BsFolderPlus} />}
      isRound
      variant="text-link"
      aria-label={`insert mapping to ${id}`}
      onClick={() => addRow(`${id}.0`)}
    />
  ) : null;
}

export function RowActions({ row: { id } }) {
  const { addRow, removeRow } = useContext(ColumnsMapperContext);

  return (
    <Flex>
      <IconButton
        icon={<Icon as={BsPlusCircleFill} />}
        isRound
        variant="text-link"
        aria-label={`insert mapping before ${id}`}
        onClick={() => addRow(id)}
      />
      <IconButton
        icon={<Icon as={BsTrashFill} />}
        isRound
        variant="text-link"
        aria-label={`remove mapping ${id}`}
        onClick={() => removeRow(id)}
      />
    </Flex>
  );
}

export function ClearAllAction() {
  const { clearRows } = useContext(ColumnsMapperContext);

  return (
    <IconButton
      icon={<Icon as={BsTrashFill} />}
      isRound
      variant="text"
      aria-label="Clear All Mappings"
      onClick={clearRows}
      title="Clear All"
    />
  );
}

export const KeyColumn = {
  headerProps: { justify: 'center' },
  id: 'isKey',
  accessor: 'isKey',
  weight: 'min-content',
  Cell: KeyCell,
  Header: ({ setFilter, data }) => {
    const [keyOnly, toggleKeyOnly] = useToggle(false);
    useEffect(() => {
      setFilter('isKey', keyOnly);
    }, [data, keyOnly, setFilter]);

    return (
      <IconButton
        icon={<Icon as={MdVpnKey} />}
        isRound
        variant="text-link"
        aria-label={keyOnly ? 'show all' : 'show only primary key rows'}
        color={keyOnly ? 'warning' : undefined}
        onClick={toggleKeyOnly}
      />
    );
  },
};
export const HeaderColumn = {
  Header: ({ getToggleAllRowsExpandedProps }) => {
    return <div {...getToggleAllRowsExpandedProps()}>Name</div>;
  },
  accessor: 'fieldName',
  weight: 'minmax(auto,max-content)',
  Cell: toNestingToggle(EditableCell, { ml: 1 }),
};

export const TargetColumn = {
  Header: 'Target Field',
  accessor: 'alias',
  weight: 'minmax(auto, max-content)',
  Cell: EditableCell,
  getPlaceholder: ({ original: { fieldName } }) => fieldName,
  getDisabled: ({ getSortIndex }, { original }) =>
    getSortIndex(original.id) || original.type === 'RECORD',
};
export const AddChildColumn = {
  Header: '',
  id: 'addChild',
  Cell: AddChildButton,
  weight: 'min-content',
};
export const ExpressionColumn = {
  Header: 'Expression',
  accessor: 'expression',
  weight: 'minmax(auto, max-content)',
  Cell: EditableCell,
  placeholder: 'Expression',
};

export const RowActionsColumns = {
  id: 'actions',
  weight: 'min-content',
  Cell: RowActions,
  headerProps: { display: 'flex', justifyContent: 'end' },
  Header: ClearAllAction,
};

export function toNestingToggle(Component, defaultProps) {
  return props => {
    const { row } = props;
    const iconProps = row.canExpand
      ? row.getToggleRowExpandedProps({
          'aria-label': (row.isExpanded ? 'collapse ' : 'expand ') + row.id,
          role: 'button',
        })
      : undefined;

    return (
      // Use the row.canExpand and row.getToggleRowExpandedProps prop getter
      // to build the toggle for expanding a row
      <Box
        display="flex"
        alignItems="center"
        marginLeft={`${row.depth * 2}rem`}
      >
        {row.depth ? `[${row.depth}]` : null}
        {row.canExpand ? (
          row.isExpanded ? (
            <CgRemoveR {...iconProps} />
          ) : (
            <CgAddR {...iconProps} />
          )
        ) : null}{' '}
        <Component {...props} {...defaultProps} />
      </Box>
    );
  };
}

export function MappingOrder({
  value: fieldId,
  row: { id },
  column: { limit = null },
}) {
  const { getSortIndex, setSort } = useContext(ColumnsMapperContext);
  const sortIndex = getSortIndex(fieldId);

  if (id.indexOf('.') > 0) {
    return null;
  }

  const checked = Boolean(sortIndex);
  return (
    <RiveryCheckbox
      isChecked={checked}
      name={`${checked ? 'clear' : 'set'} ${id} as cluster key`}
      label={sortIndex || <span>&nbsp;</span>} // keep the checkbox aligned properly when there is no label
      onChange={({ target }) => setSort(fieldId, target.checked, limit)}
      aria-label={`${checked ? 'clear' : 'set'} ${id} as cluster key`}
    />
  );
}

export function UniqueField({
  row,
  column: {
    isHidden,
    UniqueFieldKey = 'dist',
    includeConfirmationModal = false,
  },
}) {
  const { getField, setIsUnique, ...context } =
    useContext(ColumnsMapperContext);
  const [showConfirmationModal, toggleConfirmationModal] = useToggle(false);
  if (row.id.indexOf('.') > 0) {
    return null;
  }
  const onChange = () => {
    setIsUnique(row.id, !checked, UniqueFieldKey);
  };
  const checked = getField(row.id, UniqueFieldKey);
  return (
    !(isHidden && isHidden(context, row)) && (
      <>
        <ConfirmationPartitionModal
          show={showConfirmationModal}
          onCancel={() => toggleConfirmationModal(false)}
          onConfirm={() => {
            onChange();
            toggleConfirmationModal();
          }}
        />
        <RiveryCheckbox
          isChecked={checked}
          name={`${checked ? 'clear' : 'set'} ${row.id} ${UniqueFieldKey}`}
          label={<span>&nbsp;</span>} // keep the checkbox aligned properly when there is no label
          onChange={({ target }) => {
            if (target.checked && includeConfirmationModal) {
              toggleConfirmationModal();
            } else {
              onChange();
            }
          }}
          aria-label={`${checked ? 'uncheck' : 'check'} ${
            row.id
          } ${UniqueFieldKey}`}
        />
      </>
    )
  );
}
export function CheckboxField({
  row,
  column: { fieldKey, isHidden, limit = null },
}) {
  const { getField, setBoolean, ...context } = useContext(ColumnsMapperContext);

  if (row.id.indexOf('.') > 0) {
    return null;
  }

  const checked = getField(row.id, fieldKey);
  return (
    !(isHidden && isHidden(context, row)) && (
      <RiveryCheckbox
        isChecked={Boolean(checked)}
        name={`${checked ? 'clear' : 'set'} ${row.id} as ${fieldKey}`}
        label={<span>&nbsp;</span>} // keep the checkbox aligned properly when there is no label
        onChange={({ target }) =>
          setBoolean(row.id, target.checked, fieldKey, limit)
        }
        aria-label={`${checked ? 'uncheck' : 'check'} ${row.id} ${fieldKey}`}
      />
    )
  );
}

export const ConfirmationPartitionModal = ({ show, onCancel, onConfirm }) => {
  return (
    <>
      <ConfirmationModal
        title="Partition Behavior"
        variant="info"
        confirmLabel="Confirm"
        onConfirm={onConfirm}
        onCancel={onCancel}
        show={show}
      >
        <Grid gap={2} flexDirection="column">
          <Flex gap={2} flexDir="column">
            <Text fontSize="sm" mb={5}>
              The first run may perform a full table scan as part of table
              creation, and subsequent runs benefit from the defined partitions.{' '}
            </Text>
            <Text>
              To <strong>prevent duplications</strong>, use the{' '}
              <strong>partition column</strong> as the <strong>only</strong>{' '}
              match key or exclude it if uniqueness cannot be guaranteed.
            </Text>
          </Flex>
        </Grid>
      </ConfirmationModal>
    </>
  );
};

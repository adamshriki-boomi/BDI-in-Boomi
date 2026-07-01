import { Box, Flex, Grid, Icon, IconButton } from '@chakra-ui/react';
import { DeleteIcon, RiveryButton, RiveryInfoTooltip } from 'components';
import { Tagger } from 'components/Tracking/Tagger';
import { ButtonCopy } from 'components/VariableList/ButtonCopy';
import { format } from 'date-fns';
import { FeatureEnabler } from 'modules';
import { forwardRef, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { IoMdAddCircle } from 'react-icons/io';
import { RiCalendarEventLine } from 'react-icons/ri';
import { InputTypes, RiveryCheckbox } from '.';
import { useVariables } from '../variables.context';
import { Input } from './Input';

type updateCellFN = (value: string | boolean) => any;

function useCellUpdater({
  row: {
    original: [valueKey],
  },
  column: { id: columnId },
}): [string, updateCellFN] {
  const { onValue } = useVariables();
  const fieldKey = columnId.split('.').pop();

  const onChange = useCallback(
    (value: string | boolean) => onValue(valueKey, fieldKey, value),
    [valueKey, fieldKey, onValue],
  );

  return [`${valueKey} ${fieldKey}`, onChange];
}

const TableInput = ({
  value,
  cell,
  row: {
    original: [_, { placeholder }],
    values: { '1.is_encrypted': isEncrypted },
  },
}) => {
  const [label, onChange] = useCellUpdater(cell);
  return (
    <CopyButtonTooltip
      value={value}
      component={
        <Input
          type={isEncrypted ? InputTypes.PASSWORD : InputTypes.TEXT}
          w="100%"
          autoComplete="new-password"
          onChange={({ target: { value } }) => onChange(value)}
          label={`edit ${label}`}
          hideLabel
          value={value ?? ''}
          placeholder={placeholder}
        />
      }
      {...(isEncrypted && { isOpen: false })}
    />
  );
};

function CopyButtonTooltip({ component, value, isOpen }) {
  return (
    <RiveryInfoTooltip
      placement="bottom-end"
      color="font"
      buttonProps={{ h: 0, maxW: '145px' }}
      extraProps={{
        contentProps: { mt: '10px!important' },
        isOpen,
      }}
      icon={component}
      description={
        <Grid maxH="150px" py={2} templateRows="1fr 28px">
          <Box overflowY="auto">{value}</Box>
          <Flex justify="end" pt={2}>
            <ButtonCopy size="small" value={value} buttontype="text" href="#" />
          </Flex>
        </Grid>
      }
    />
  );
}

const CheckboxClearValueOnStart = ({
  value,
  cell,
  row: {
    values: { '1.is_encrypted': isEncrypted },
  },
}) => {
  const [label, onChange] = useCellUpdater(cell);
  return isEncrypted ? (
    <></>
  ) : (
    <RiveryCheckbox
      mt={2}
      isChecked={Boolean(value)}
      name={`toggle ${label}`}
      label={null}
      aria-label={`toggle ${label}`}
      onChange={({ target }) => onChange(target.checked)}
    />
  );
};

const IsEncryptedCheckbox = ({ value, cell }) => {
  const [label] = useCellUpdater(cell);
  const { onUpdate } = useVariables();

  // const [labelClear, onChangeClear] = useCellUpdater(cell);
  return (
    <Tagger tags="is-encrypted-river-variable">
      <RiveryCheckbox
        mt={2}
        isChecked={Boolean(value)}
        name={`toggle ${label}`}
        label={null}
        aria-label={`toggle ${label}`}
        onChange={({ target }) => {
          const val = cell?.row?.original[1];
          onUpdate({
            name: cell?.row?.original[0],
            is_multi_value: val.is_multi_value,
            value: val.value,
            is_encrypted: target.checked,
            clear_value_on_start: target.checked
              ? false
              : val.clear_value_on_start,
          });
        }}
      />
    </Tagger>
  );
};

const TableCheckbox = ({ value, cell }) => {
  const [label, onChange] = useCellUpdater(cell);
  return (
    <RiveryCheckbox
      mt={1}
      isChecked={Boolean(value)}
      name={`toggle ${label}`}
      label={null}
      aria-label={`toggle ${label}`}
      onChange={({ target }) => {
        onChange(target.checked);
      }}
    />
  );
};

const DateEditButton = forwardRef<HTMLButtonElement, any>(
  function BaseEditButton({ label, value, hasValue, onClick }, ref) {
    return (
      <RiveryButton
        variant={hasValue ? 'primary' : 'gray-300'}
        ref={ref}
        onClick={onClick}
        whiteSpace="nowrap"
        label={label}
        rightIcon={<Icon as={RiCalendarEventLine} size="6" />}
      >
        {format(new Date(value), 'yyyy-MM-dd HH:mm:ss')}
      </RiveryButton>
    );
  },
);

const TableDatePicker = ({ value, cell }) => {
  const [label, onChange] = useCellUpdater(cell);
  return (
    <DatePicker
      selected={new Date(value || cell.row.original[1].placeholder)}
      shouldCloseOnSelect={false}
      showTimeInput
      dateFormat="PPpp"
      timeFormat="hh:mm"
      customInput={
        <DateEditButton label={`edit ${label}`} hasValue={Boolean(value)} />
      }
      portalId="date-picker-portal"
      onChange={value => onChange(format(value, 'yyyy-MM-dd HH:mm:ss'))}
    />
  );
};

const VariableName = ({ value }) => `{${value}}`;

const DeleteButton = ({
  cell: {
    row: {
      original: [valueKey],
    },
  },
}) => {
  const { onDelete } = useVariables();
  return (
    <FeatureEnabler scope="river:edit">
      <IconButton
        isRound
        aria-label={`delete variable ${valueKey}`}
        icon={<Icon as={DeleteIcon} boxSize={5} />}
        variant="text"
        onClick={() => onDelete(valueKey)}
      />
    </FeatureEnabler>
  );
};

const AddVariableButton = () => {
  const { onAdd } = useVariables();

  return (
    <IconButton
      aria-label="add variable"
      isRound
      icon={
        <Icon
          as={IoMdAddCircle}
          color={onAdd ? 'primary' : 'unset'}
          w={6}
          h={6}
        />
      }
      variant="text-link"
      disabled={!onAdd}
      onClick={onAdd}
    />
  );
};

export {
  AddVariableButton,
  DeleteButton,
  TableCheckbox,
  IsEncryptedCheckbox,
  CheckboxClearValueOnStart,
  TableInput,
  TableDatePicker,
  VariableName,
};

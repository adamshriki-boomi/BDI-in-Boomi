import {
  Box,
  CloseIconSmall,
  EditIcon,
  Flex,
  HStack,
  Icon,
  PlusIcon,
  Text,
  TransparentIconButton,
} from 'components';
import { SelectFormGroup } from 'components/Form/components';
import { useEnableEdit } from 'hooks/useEnableEdit';
import { ConnectionModal } from 'modules/ConnectionModal';
import { useCallback, useEffect } from 'react';
import { getCrossId } from 'utils/api.sanitizer';
import { pluck } from 'utils/array.utils';

const selectProps = {
  getOptionLabel: pluck<any, string>('connection_name'),
  getOptionValue: getCrossId,
};

export default function ConnectionSelectField({
  onOpenConnectionModal,
  ...selectFormProps
}) {
  const {
    selectedConnection,
    onChange,
    connections,
    validationMessage,
    label = 'Connection Name',
  } = selectFormProps;
  const onConnectionChange = useCallback(
    connection => {
      if (connection !== selectedConnection) {
        onChange(connection);
      }
    },
    [onChange, selectedConnection],
  );
  useConnectionUpdater({
    connections,
    selectedConnection,
    onConnectionChange,
  });

  const { enableEdit } = useEnableEdit();

  const components = {
    Option: props => (
      <CustomConnectionOption
        {...props}
        isDisabled={!enableEdit}
        onClick={onOpenConnectionModal}
        onSelectConneciton={onConnectionChange}
      />
    ),
    ClearIndicator: props => {
      return (
        <TransparentIconButton
          aria-label="clear-value"
          onClick={() => {
            onConnectionChange(null);
            props.setValue([]);
          }}
          icon={<Icon as={CloseIconSmall} />}
        />
      );
    },
  };

  return (
    <SelectFormGroup
      label={label}
      options={connections}
      placeholder="select connection"
      controlId="connections"
      value={selectedConnection}
      selectProps={selectProps}
      onChange={onConnectionChange}
      validationMessage={validationMessage}
      onAddOption={connection => {
        onConnectionChange(connection);
        onOpenConnectionModal(ConnectionModal.Mode.NEW);
      }}
      withCreate
      isClearable
      formatCreateLabel={value => CreateLabel(value)}
      components={components}
      {...selectFormProps}
    />
  );
}

const CreateLabel = value => {
  return (
    <Flex alignItems="center" gap={2}>
      <Icon as={PlusIcon} />
      <Text color="primary"> Add New Connection - {value}</Text>
    </Flex>
  );
};

function CustomConnectionOption({
  innerProps,
  label,
  data,
  isSelected,
  isDisabled,
  onClick,
  onSelectConneciton,
}) {
  return (
    <HStack
      width="100%"
      justify="space-between"
      sx={{
        '&:hover': {
          '& .chakra-icon': {
            visibility: !isDisabled ? 'visible' : 'hidden',
          },
        },
      }}
      {...innerProps}
    >
      <Box borderRadius={4}>{label}</Box>
      <Icon
        as={EditIcon}
        boxSize={4}
        color={isSelected ? 'white' : 'icon-tertiary'}
        visibility="hidden"
        role="button"
        onClick={e => {
          e.stopPropagation();
          onSelectConneciton(data);
          onClick(ConnectionModal.Mode.EDIT);
        }}
      />
    </HStack>
  );
}

/**
 * triggers an onChange when there's only 1 connection and it's not selected
 */

const useConnectionUpdater = ({
  connections,
  selectedConnection,
  onConnectionChange,
}) => {
  const shouldTriggerConnectionChange =
    connections.length === 1 && connections[0] !== selectedConnection;
  const connectionPayload = connections[0];

  useEffect(() => {
    if (shouldTriggerConnectionChange) {
      onConnectionChange(connectionPayload);
    }
  }, [shouldTriggerConnectionChange, onConnectionChange, connectionPayload]);
};

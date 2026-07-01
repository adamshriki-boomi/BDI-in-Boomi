import { Flex, Icon } from 'components';
import {
  CustomSelectForm,
  getError,
  SelectFormGroupProps,
} from 'components/Form';
import { useEnableEdit } from 'hooks/useEnableEdit';
import { ConnectionModal, Mode } from 'modules/ConnectionModal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { MdAddCircle, MdEdit } from 'react-icons/md';
import { getCrossId } from 'utils/api.sanitizer';
import { pluck } from 'utils/array.utils';
import {
  CustomConnectionOption,
  EditButton,
} from './SelectConnectionComponent';

const selectProps = {
  getOptionLabel:
    pluck<any, string>('connection_name') ?? pluck<any, string>('label'),
  getOptionValue: getCrossId,
};
interface RequiredProps {
  connection_type: string;
  connection_type_name: string;
}
export interface ConnectionBarProps<T> extends Partial<SelectFormGroupProps> {
  connections: T[];
  selectedConnection?: T & RequiredProps;
  connectionHeader?: string;
  dataSourceId?: string;
  connectionType?: string;
  newConnection?: any;
  ariaLabel?: string;
  label?: string;
  displayListOnly?: boolean;
  validationMessage?: string;
  onChange?: (connection: T) => any;
  clearable?: boolean;
  allowCreate?: boolean;
  useNewConnectionBar?: boolean;
  isRequired?: boolean;
  children?: React.ReactNode;
}

export function ConnectionBar<T>({
  connections,
  selectedConnection,
  connectionType,
  displayListOnly = false,
  dataSourceId = '',
  connectionHeader = '',
  validationMessage,
  onChange,
  label = 'Connection Name',
  ariaLabel = null,
  clearable = false,
  allowCreate = true,
  useNewConnectionBar = false,
  chakra = false,
  children = null,
  ...selectFormProps
}: ConnectionBarProps<T>) {
  const [connection, setConnection] = useState<string | 0>(null);
  const { enableEdit } = useEnableEdit();
  const onConnectionChange = useCallback(
    option => {
      if (option?.label === 'new' && enableEdit) {
        //If this is blueprint I want to set "new_connection" as the selected connection
        if (selectFormProps?.configuration) {
          onChange({
            connection_type: 'new',
          } as any);
        }
        setConnection(0);

        return;
      }
      if (option !== selectedConnection) {
        onChange(option);
      }
    },
    [enableEdit, onChange, selectFormProps, selectedConnection],
  );
  useConnectionUpdater({
    connections,
    selectedConnection,
    onConnectionChange,
  });

  const selectComponents = {
    Option: props => (
      <CustomConnectionOption
        enableEdit={enableEdit}
        setConnection={setConnection}
        {...props}
      />
    ),
    IndicatorSeparator: props => (
      <EditButton setConnection={setConnection} {...props} />
    ),
  };
  const connectionsOptions = useMemo(
    () =>
      useNewConnectionBar && allowCreate && enableEdit
        ? [{ label: 'new' }, ...connections]
        : connections,
    [connections, useNewConnectionBar, allowCreate, enableEdit],
  );
  return (
    // For blueprint connection
    <Flex
      {...(children
        ? { flexDir: 'column', w: 'full' }
        : { gap: 4, alignItems: 'flex-end' })}
    >
      {children}
      <CustomSelectForm
        ariaLabel={ariaLabel || label}
        label={label}
        options={connectionsOptions}
        placeholder="Select connection or Add New"
        controlId="connections"
        value={selectedConnection}
        selectProps={selectProps}
        onChange={onConnectionChange}
        validationMessage={validationMessage}
        isClearable={clearable}
        components={useNewConnectionBar && selectComponents}
        isMulti={false}
        chakra={chakra}
        {...selectFormProps}
      />
      {!displayListOnly && (
        <ConnectionModals
          useNewConnectionBar={useNewConnectionBar}
          connection={connection}
          setConnection={setConnection}
          connectionHeader={connectionHeader}
          connectionType={connectionType}
          selectedConnection={selectedConnection}
          dataSourceId={dataSourceId}
          onChange={onChange}
          allowCreate={allowCreate}
          configuration={selectFormProps?.configuration}
        />
      )}
    </Flex>
  );
}

function ConnectionModals({
  connection,
  setConnection,
  useNewConnectionBar = false,
  connectionHeader = '',
  connectionType = null,
  selectedConnection = null,
  dataSourceId = '',
  onChange = null,
  allowCreate = true,
  configuration = null,
}) {
  const { enableEdit } = useEnableEdit();
  const connectionName =
    (selectedConnection?.connection_type_name || connectionHeader) +
    ' Connection';
  const isEditMode = Boolean(connection);
  const header = isEditMode ? connectionName : `${connectionHeader} Connection`;
  return useNewConnectionBar ? (
    <ConnectionModal
      useNewConnectionBar={useNewConnectionBar}
      header={header}
      dataSourceId={dataSourceId}
      type={connectionType}
      onSave={onChange}
      mode={isEditMode ? Mode.EDIT : connection !== null ? Mode.NEW : null}
      setConnection={setConnection}
      configuration={configuration}
      {...(isEditMode && {
        crossId: connection ? connection : getCrossId(selectedConnection),
      })}
    />
  ) : (
    <>
      <ConnectionModal
        header={connectionName}
        buttonProps={{
          size: 'small',
          label: 'Edit',
          variant: 'text',
          color: enableEdit ? 'primary' : 'background-deselected',
          disabled: !selectedConnection,
          leftIcon: <Icon as={MdEdit} boxSize={5} />,
        }}
        dataSourceId={dataSourceId}
        crossId={getCrossId(selectedConnection)}
        type={connectionType}
        onSave={onChange}
        onTest={console.log}
        mode={ConnectionModal.Mode.EDIT}
      />
      {allowCreate ? (
        <ConnectionModal
          header={`${connectionHeader} Connection`}
          type={connectionType}
          dataSourceId={dataSourceId}
          mode={ConnectionModal.Mode.NEW}
          buttonProps={{
            size: 'small',
            label: 'New Connection',
            variant: 'text',
            color: 'primary',
            disabled: !enableEdit,
            leftIcon: <Icon as={MdAddCircle} boxSize={5} />,
          }}
          onSave={onChange}
          onTest={console.log}
        />
      ) : null}
    </>
  );
}

type ConnectionBarControlProps<T> = {
  api: Partial<UseFormReturn>;
  name: string;
} & ConnectionBarProps<T>;
export function ConnectionBarControl<T>({
  api,
  name,
  onChange,
  ...connectionBarProps
}: ConnectionBarControlProps<T>) {
  const errorMessage = getError(api, name);

  return (
    <Controller
      name={name}
      control={api.control}
      render={({
        field: { value, onChange: controllerOnChange, ...props },
      }) => (
        <ConnectionBar
          {...connectionBarProps}
          onChange={value => controllerOnChange(onChange(value))}
          validationMessage={errorMessage}
        />
      )}
    />
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
    connections.length === 1 &&
    connections[0] !== selectedConnection &&
    connections[0].connection_type !== 'blueprint_custom';
  const connectionPayload = connections[0];

  useEffect(() => {
    if (shouldTriggerConnectionChange) {
      onConnectionChange(connectionPayload);
    }
  }, [shouldTriggerConnectionChange, onConnectionChange, connectionPayload]);
};

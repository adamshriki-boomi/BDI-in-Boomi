import { SourceTypes } from 'api/types';
import { Flex, HStack, RenderGuard, Text } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { FormControls, InputTypes } from 'components/Form';
import { useLegacyBlueprintDateRange } from 'containers/BluePrints/helpers';
import { ConnectionBarInput, useLazyGetConnectionQuery } from 'modules';
import { ChangeConnectionConfirmation } from 'modules/SourceTarget/components/ConnectionSetup/ConfirmChangeConnection';
import { DateTimePopover } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/components/DateTimePopover';
import { useReachedTablesLimit } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/components/TableLimitMessage';
import { useMemo, useState } from 'react';
import { useController, useFormContext, useWatch } from 'react-hook-form';
import { useEffectOnce } from 'react-use';
import { getOId } from 'utils/api.sanitizer';

export default function InterfaceParametersComponent({
  noHeader = false,
  maxW = '440px',
}) {
  const formApi = useFormContext();
  const { field: blueprint } = useController({
    name: 'blueprint',
    control: formApi.control,
  });

  const { field: connectionIdField } = useController({
    name: 'river.properties.source.connection_id',
    control: formApi.control,
  });
  const [connectionForChange, setConnectionForChange] = useState(null);
  const [getConnection, { data: selectedConnection }] =
    useLazyGetConnectionQuery();

  const {
    dateRange: legacyDateRange,
    setDateRange: setLegacyDateRange,
    isLegacy: hasLegacyDateRange,
  } = useLegacyBlueprintDateRange();

  useEffectOnce(() => {
    if (connectionIdField?.value && !selectedConnection) {
      getConnection(getOId(connectionIdField.value));
    }
  });
  //Checking the number of tables in the schema to define whether mapping happened or not
  const schemas = useWatch({
    control: formApi.control,
    name: 'river.properties.schemas',
  });
  const { currentTablesLength } = useReachedTablesLimit(schemas);
  const connectionConfiguration = useMemo(() => {
    if (
      connectionIdField.value &&
      getOId(selectedConnection?.cross_id) === connectionIdField.value
    ) {
      const configuration = selectedConnection?.connection_details?.map(
        field => ({
          ...field,
          connection_name: selectedConnection?.connection_name,
        }),
      );
      return { fields: [...configuration] };
    } else {
      return blueprint?.value?.authentication;
    }
  }, [
    blueprint?.value?.authentication,
    connectionIdField.value,
    selectedConnection?.connection_details,
    selectedConnection?.connection_name,
    selectedConnection?.cross_id,
  ]);

  return (
    <>
      <Flex flexDir="column" gap={3} w={maxW}>
        <RenderGuard condition={!noHeader}>
          <Flex flexDir="column" gap={1} pb={1}>
            <HStack>
              <Text color="tagMagenta">*</Text>
              <Text color="primary" textStyle="M6">
                Interface Parameters
              </Text>
            </HStack>
            <RiveryAlert
              variant="warning-light"
              description={
                <>
                  <Text>
                    Please ensure all interface parameters are filled correctly
                    to enable accurate and reliable data fetching.
                  </Text>
                  <Text>
                    Missing or incorrect values may result in incomplete or
                    invalid data retrieval.
                  </Text>
                </>
              }
            />
          </Flex>
        </RenderGuard>
        <RenderGuard
          condition={
            (blueprint?.value?.authentication &&
              Object.values(blueprint?.value?.authentication).some(Boolean)) ||
            connectionIdField.value
          }
        >
          <Flex flexDir="column">
            <Text color="primary">Connection</Text>
            <ConnectionBarInput
              configuration={connectionConfiguration}
              dataSourceId="connector_executor"
              connectionType="blueprint_custom"
              useNewConnectionBar
              value={connectionIdField.value}
              onChange={async connection => {
                if (connection?.connection_type === 'new') {
                  connectionIdField.onChange(null);
                  return;
                }
                if (connectionIdField?.value && currentTablesLength > 0) {
                  setConnectionForChange(connection);
                  return;
                }
                await getConnection(getOId(connection.cross_id));
                connectionIdField.onChange(getOId(connection.cross_id));
              }}
              showLabel={false}
              ariaLabel="connections"
              chakra
              type="source"
            >
              <Text fontSize="12px">
                Select a Connection from an existing list or create a new one.
              </Text>
            </ConnectionBarInput>
          </Flex>
        </RenderGuard>
        <RenderGuard condition={hasLegacyDateRange}>
          <Flex flexDir="column" gap={1} pb={1}>
            <Text color="primary">Date Range</Text>
            <DateTimePopover
              setValue={setLegacyDateRange}
              outerValue={legacyDateRange}
              onlyCustom
              source={SourceTypes.BLUEPRINT}
            />
          </Flex>
        </RenderGuard>
        <Fields name="Standard" />
      </Flex>
      <ChangeConnectionConfirmation
        showConfirmation={Boolean(connectionForChange)}
        toggleConfirmation={() => setConnectionForChange(null)}
        onChange={() => connectionIdField.onChange(connectionForChange)}
        onDismiss={() => connectionIdField.onChange(connectionIdField.value)}
        entity="Connection"
      />
    </>
  );
}

function Fields({ name }) {
  const formApi = useFormContext();
  const defaultFields = useConstructFields(formApi);
  return (
    <RenderGuard condition={defaultFields?.length > 0}>
      <Flex flexDir="column" gap={1} pb={1}>
        <Text color="primary">{name}</Text>
        {defaultFields?.map((field, idx) => (
          <Flex key={idx} gap={1} py={0.5}>
            <FormControls controls={field} key={idx} api={formApi} />
          </Flex>
        ))}
      </Flex>
    </RenderGuard>
  );
}

function getControlType(type) {
  switch (type) {
    case 'string':
      return InputTypes.TEXT;
    case 'integer':
      return InputTypes.NUMBER;
    case 'boolean':
      return InputTypes.RADIO;
    default:
      return InputTypes.TEXT;
  }
}

export const SOURCE_INTERFACE_PARAMETERS_PATH =
  'river.properties.source.additional_settings.interface_parameters.source';

function useConstructFields(formApi) {
  const fieldName = SOURCE_INTERFACE_PARAMETERS_PATH;

  const fieldsArray = useMemo(() => {
    return formApi?.watch(fieldName)?.map((field, idx) => {
      const booleanValues = [
        { label: 'True', value: 'true' },
        { label: 'False', value: 'false' },
      ];
      const isBoolean = field.type === 'boolean';
      return {
        value: isBoolean ? JSON.stringify(field.value) : field.value,
        type: getControlType(field.type),
        name: `${fieldName}.${idx}.value`,
        display_name: field.name?.replace(/_/g, ' '),
        chakra: true,
        ...(isBoolean && {
          values: booleanValues,
          size: 'xs',
        }),
      };
    });
  }, [formApi, fieldName]);
  return fieldsArray;
}

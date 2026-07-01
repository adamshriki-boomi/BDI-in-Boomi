import { RunStatus, TestResult } from 'api/types';
import { Flex, Grid, HStack, RenderGuard, Text } from 'components';
import BluePrintSelect from 'containers/BluePrints/components/BluePrintSelect';
import { ConnectionBarInput, useTestConnection } from 'modules';
import { useMemo } from 'react';
import { useConnectionsByType } from 'store/connectionTypes';
import { useAccount } from 'store/core';
import { createOId, getOId } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { PollTestResponse } from '../../store/connection.api';
import {
  useIsDisabledRiverForm,
  useResetSource,
  useResetTarget,
  useSttFormContext,
} from '../form';
import { S2TDataSourceDisplay } from '../SelectDataSource/S2TDataSourceDisplay';
import { ConnectionTester } from './ConnectionTester';

interface ConnectionSetupProps<T> {
  datasource: T | any;
  value: string;
  onChange: (connection) => any;
  label: string;
  onTestComplete?: (results: Record<string, PollTestResponse>) => any;
  isTestComplete?: boolean;
  testResults?: TestResult[];
  testResult?: string;
  testStatus?: RunStatus;
  showConnectionSection?: boolean;
}
export function ConnectionSetup<T>({
  datasource,
  value,
  label,
  onChange,
  showConnectionSection = true,
}: ConnectionSetupProps<T>) {
  const resetSource = useResetSource();
  const resetTarget = useResetTarget();
  const { isMemberRole } = useAccount();
  const showDisabledStyle = useIsDisabledRiverForm();
  const formApi = useSttFormContext();
  const type = label.toLowerCase() as 'source' | 'target';
  const connectionId = formApi.watch(`river.properties.${type}.connection_id`);
  const { test, isLoading, cancel, resultsList, status } = useTestConnection(
    datasource?.connection_type,
    null,
  );
  const { connections } = useConnectionsByType(datasource?.connection_type);
  const selectedConnection = useMemo(
    () => connections.find(compare('cross_id', connectionId, getOId)),
    [connectionId, connections],
  );
  return (
    <Grid
      justifyItems="start"
      w="full"
      gridGap={8}
      gridAutoRows="min-content"
      justifyContent="center"
    >
      {/* For blueprint, display this section only if a blueprint file was already selected */}
      <RenderGuard
        condition={
          datasource?.name !== 'Blueprint' ||
          datasource?.additional_settings?.recipe_id
        }
      >
        <Flex flexDir="column" gap={2} w="440px">
          <HStack>
            <Text color="tagMagenta">*</Text>
            <PrimaryHeader>Selected Data {label}</PrimaryHeader>
          </HStack>
          <S2TDataSourceDisplay
            value={datasource?.name}
            image={datasource?.icon}
            onClick={() => (type === 'source' ? resetSource() : resetTarget())}
          />
        </Flex>
      </RenderGuard>
      <RenderGuard
        condition={showConnectionSection && datasource?.name !== 'Blueprint'}
        fallback={showConnectionSection ? <BluePrintSelect /> : null}
      >
        <Flex flexDir="column" gap={1} w="440px">
          <HStack>
            <Text color="tagMagenta">*</Text>
            <PrimaryHeader>{label} Connection</PrimaryHeader>
          </HStack>
          <Text textStyle="R7" textAlign="left" color="font-secondary">
            Please enter the necessary credentials to establish a connection
            with your Data {label}. You can select a connection from the
            existing list or create a new one.
          </Text>

          <Flex w="100%" flexDir="column" gap={4}>
            <ConnectionBarInput
              useNewConnectionBar
              value={createOId(value)}
              connectionType={datasource?.connection_type}
              dataSourceId={datasource?.id ?? datasource?.datasource_type_id}
              onChange={onChange}
              showLabel={false}
              ariaLabel="connections"
              defaultValue={formApi.watch(
                `river.properties.${type}.connection_id`,
              )}
              chakra
              type={type}
              allowCreate={!isMemberRole}
              isDisabled={showDisabledStyle}
              {...(showDisabledStyle && {
                customStyles: {
                  control: provided => ({
                    ...provided,
                    backgroundColor: 'var(--chakra-colors-gray-150)',
                    borderColor: 'var(--chakra-colors-gray-300)',
                  }),
                  singleValue: provided => ({
                    ...provided,
                    color: 'var(--chakra-colors-gray-700)',
                  }),
                },
              })}
            />
            <ConnectionTester
              test={() => test(connectionId)}
              isTesting={isLoading}
              cancel={cancel}
              resultsList={resultsList}
              status={status}
              showDetails={selectedConnection?.is_test_connection_list}
            />
          </Flex>
        </Flex>
      </RenderGuard>
    </Grid>
  );
}

const PrimaryHeader = props => (
  <Text as="h2" textStyle="M6" color="primary" {...props} />
);

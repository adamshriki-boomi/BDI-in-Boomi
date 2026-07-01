import { Box, Flex, Text } from 'components';
import { useGetSettingsQuery } from 'modules/Environments/EnvironmentsSettings/settings.query';
import {
  ConnectionDeployment,
  DataframeDeployment,
  GroupDeployment,
  Notifications,
  RiverDeployment,
  VariableDeployment,
} from 'modules/Environments/EnvironmentsSettings/SettingsSections';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ViewModes } from '../components/helpers';

export function Step3({ mode = ViewModes.ADD }) {
  const { data } = useGetSettingsQuery(null);
  const formApi = useFormContext();
  const isDisabled = mode === ViewModes.VIEW;

  useEffect(() => {
    if (data) {
      formApi?.reset({ deployment_settings: data });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Flex overflow="hidden" pt={1} direction="column" gap={4} maxH="100%">
      <Text color="font-secondary">
        You're nearly there! All that's left is to set your new package's
        preferred settings.{' '}
      </Text>
      <Text fontSize="md" color="purple.600" fontWeight="medium">
        Settings
      </Text>
      <Box>
        <Text fontSize="sm" color="font-secondary">
          These settings are only applicable to this package.
        </Text>
        <Text fontSize="sm" color="font-secondary">
          In the Environment Settings, you can make changes to the general
          settings.
        </Text>
      </Box>
      <Box w="50%" maxH="100%" pr={4} overflow="auto">
        <Notifications prefix="deployment_settings" disabled={isDisabled} />
        <RiverDeployment prefix="deployment_settings" disabled={isDisabled} />
        <ConnectionDeployment
          prefix="deployment_settings"
          disabled={isDisabled}
        />
        <GroupDeployment prefix="deployment_settings" disabled={isDisabled} />
        <VariableDeployment
          prefix="deployment_settings"
          disabled={isDisabled}
        />
        <DataframeDeployment
          prefix="deployment_settings"
          disabled={isDisabled}
        />
      </Box>
    </Flex>
  );
}

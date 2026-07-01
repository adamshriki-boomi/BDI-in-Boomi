import { Box, Flex, GridBox as Grid, HStack, Text } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import { useToastComponent } from 'hooks/useToast';
import { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
  IDeploymentSettings,
  useGetSettingsQuery,
  useSetSettingsMutation,
} from './settings.query';
import {
  BlueprintDeployment,
  ConnectionDeployment,
  DataframeDeployment,
  GroupDeployment,
  Notifications,
  RiverDeployment,
  VariableDeployment,
} from './SettingsSections';

export function EnvironmentsSettings() {
  const { success, error } = useToastComponent();
  const { data, isLoading } = useGetSettingsQuery(null);
  const [updateSettings, status] = useSetSettingsMutation();
  const formApi = useForm<IDeploymentSettings>({ mode: 'onChange' });
  const { handleSubmit } = formApi;

  useEffect(() => {
    if (data) {
      formApi.reset(data);
    }
  }, [data, formApi]);

  const onSubmit = useCallback(
    async (formData: IDeploymentSettings) => {
      const res: any = await updateSettings({
        deployment_settings: { ...formData },
      });
      if (res?.error) {
        error({
          description: res?.error?.data?.reason || res?.error?.data?.message,
        });
      }
    },

    [error, updateSettings],
  );

  useEffect(() => {
    if (status.isSuccess) {
      success({ description: 'Settings were updated' });
    }
  }, [status, success]);

  return (
    <FormProvider {...formApi}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
        {isLoading || status.isLoading ? <PageOverlaySpinner /> : null}
        <Flex gap={5} flexDirection="column" mr="3px">
          <HStack justifyContent="space-between">
            <Box>
              <Text color="font-secondary" size="sm">
                Your preferences and modifications here will be applied to all
                packages and will become the default settings for any new ones.
              </Text>
              <Text color="font-secondary" size="sm">
                Custom Package Settings allows you to adjust the settings for a
                specific package.
              </Text>
            </Box>
            <RiveryButton
              label="Save Settings"
              type="submit"
              disabled={!formApi?.formState.isDirty}
            />
          </HStack>
          <Grid overflow="auto" flex={1}>
            <Box w="45%" pr={4} pb={8}>
              <Notifications />
              <RiverDeployment />
              <BlueprintDeployment />
              <ConnectionDeployment />
              <GroupDeployment />
              <VariableDeployment />
              <DataframeDeployment />
            </Box>
          </Grid>
        </Flex>
      </form>
    </FormProvider>
  );
}

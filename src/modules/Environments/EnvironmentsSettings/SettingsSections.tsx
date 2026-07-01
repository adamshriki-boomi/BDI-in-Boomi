import { GridProps, HStack } from '@chakra-ui/react';
import { Box, GridBox, Text } from 'components';
import { RiverySwitch } from 'components/Form';
import MultiEmailsCreatableSelect from 'components/Form/components/MultiEmailsComponent';
import { useMemo } from 'react';
import { useController, useFormContext } from 'react-hook-form';

function Section({ title, children, ...rest }: GridProps & { title: string }) {
  return (
    <GridBox
      gap={2}
      pb={6}
      mb={5}
      flexDirection="column"
      borderBottom="1px solid"
      borderColor="gray.300"
      mr="auto"
      w="100%"
      {...rest}
    >
      <Text color="brand" fontWeight="bold" fontSize="sm">
        {title}
      </Text>
      <GridBox gap={3} flexDirection="column">
        {children}
      </GridBox>
    </GridBox>
  );
}

function LeftLabelSwitch({
  mainLabel,
  secondaryLabel,
  name,
  prefix,
  disabled = false,
}) {
  const formApi = useFormContext();
  const fieldName = prefix ? name.replace(/^/, `${prefix}.`) : name;
  return (
    <>
      <RiverySwitch
        isDisabled={disabled}
        api={formApi}
        name={fieldName}
        ml="auto"
        leftLabel
        formLabelStyle={{ ml: '0rem !important', cursor: 'pointer' }}
        label={
          <Box marginInlineStart={0}>
            <Text fontWeight="normal" fontSize="sm">
              {mainLabel}
            </Text>
          </Box>
        }
      />
      {secondaryLabel ? (
        <Text color="font-secondary" fontSize="xs" mt={-3} w="80%">
          {secondaryLabel}
        </Text>
      ) : null}
    </>
  );
}

export function Notifications({ prefix = null, disabled = false }) {
  const formApi = useFormContext();
  const isEnabledFieldName = useMemo(() => {
    const name = 'notifications.on_deployment.enabled';
    return prefix ? name.replace(/^/, `${prefix}.`) : name;
  }, [prefix]);

  const isEmailDisabled = useMemo(() => {
    return !formApi?.watch(isEnabledFieldName);
  }, [formApi, isEnabledFieldName]);

  const { field: emailsField } = useController({
    name: prefix
      ? `${prefix}.notifications.on_deployment.email`
      : 'notifications.on_deployment.email',
    control: formApi.control,
  });

  return (
    <Section title="Notifications">
      <LeftLabelSwitch
        name="notifications.on_deployment.enabled"
        mainLabel="Send Notification on Deployment"
        secondaryLabel="Send a notification when a package is deployed"
        prefix={prefix}
        disabled={disabled}
      />
      <HStack position="relative" justify="space-between" w="100%">
        <Box w="60px">
          <Text color="font-secondary" position="absolute" top={0}>
            Email to{' '}
          </Text>
        </Box>

        <Box flex={1}>
          <MultiEmailsCreatableSelect
            placeholder="Add Email Address"
            emailsField={emailsField}
            isDisabled={isEmailDisabled || disabled}
          />
        </Box>
      </HStack>
    </Section>
  );
}

export function RiverDeployment({ prefix = null, disabled = false }) {
  return (
    <Section title="Data Flow Deployment">
      <LeftLabelSwitch
        name="only_deploy_new_rivers"
        mainLabel="Deploy New Data Flows to a Target"
        secondaryLabel="Deploy Data Flows that are new to the Target Environment, avoiding existing Data Flows"
        prefix={prefix}
        disabled={disabled}
      />
      <LeftLabelSwitch
        name="add_related_rivers"
        mainLabel="Add Related Data Flows"
        secondaryLabel="Deploy all Data Flows that are linked or related to the Data Flows you selected."
        prefix={prefix}
        disabled={disabled}
      />
      <LeftLabelSwitch
        name="add_related_connections"
        mainLabel="Add Related Connection"
        secondaryLabel="Deploy all Connections associated with the Data Flows you've chosen."
        prefix={prefix}
        disabled={disabled}
      />
      <LeftLabelSwitch
        name="add_related_groups"
        mainLabel="Add Related Groups"
        secondaryLabel="Deploy all Groups that are related to the Data Flows you've selected"
        prefix={prefix}
        disabled={disabled}
      />
      <LeftLabelSwitch
        name="overwrite_dynamic_parameters"
        mainLabel="Overwrite Dynamic Parameters"
        secondaryLabel="Overwrite all previous Dynamic Parameters in the Target Environment."
        prefix={prefix}
        disabled={disabled}
      />
    </Section>
  );
}

export function ConnectionDeployment({ prefix = null, disabled = false }) {
  return (
    <Section title="Connection Deployment">
      <LeftLabelSwitch
        name="only_deploy_new_connections"
        mainLabel="Deploy New Connections to a Target"
        secondaryLabel="Deploy Connections that are new to the Target Environment, avoiding existing Connections"
        prefix={prefix}
        disabled={disabled}
      />
      <LeftLabelSwitch
        name="copy_connections_credentials"
        mainLabel="Add Credentials to Connections"
        secondaryLabel="Include your Connection registration credentials (login details, tokens, passwords, etc)."
        prefix={prefix}
        disabled={disabled}
      />
      <LeftLabelSwitch
        name="add_related_connections_from_connections"
        mainLabel="Add Related File Zone Connections From Connections"
        secondaryLabel="Deploy all custom File Zone Connections for selected Connections."
        prefix={prefix}
        disabled={disabled}
      />
    </Section>
  );
}

export function GroupDeployment({ prefix = null, disabled = false }) {
  return (
    <Section title="Group Deployment">
      <LeftLabelSwitch
        name="add_group_related_rivers"
        mainLabel="Add Related Data Flows"
        secondaryLabel="All Data Flows that are linked or related to the Groups you selected will be deployed."
        prefix={prefix}
        disabled={disabled}
      />
    </Section>
  );
}

export function VariableDeployment({ prefix = null, disabled = false }) {
  return (
    <Section title="Environment Variables Deployment">
      <LeftLabelSwitch
        name="only_deploy_new_variables"
        mainLabel="Deploy New Environment Variables to a Target"
        secondaryLabel="Deploy Variables that are new to the Target Environment, avoiding existing Variables."
        prefix={prefix}
        disabled={disabled}
      />
      <LeftLabelSwitch
        name="add_variable_values"
        mainLabel="Deploy Environment Variables With Their Values"
        secondaryLabel="Deploy the original values for each deployed variable."
        prefix={prefix}
        disabled={disabled}
      />
    </Section>
  );
}

export function DataframeDeployment({ prefix = null, disabled = false }) {
  return (
    <Section title="Dataframe Deployment" borderBottom="none">
      <LeftLabelSwitch
        name="only_deploy_new_dataframes"
        mainLabel="Deploy New Dataframes to a Target"
        secondaryLabel="Deploy Dataframes that are new to the Target Environment, avoiding existing DataFrames."
        prefix={prefix}
        disabled={disabled}
      />
      <LeftLabelSwitch
        name="add_related_dataframes"
        mainLabel="Deploy Related Dataframes to a Target"
        secondaryLabel="Deploy all Dataframes that are related to the Data Flows you've selected"
        prefix={prefix}
        disabled={disabled}
      />
    </Section>
  );
}

export function BlueprintDeployment({ prefix = null, disabled = false }) {
  return (
    <Section title="Blueprint Deployment" borderBottom="none">
      <LeftLabelSwitch
        name="only_deploy_new_recipes"
        mainLabel="Deploy New Blueprints to a Target"
        secondaryLabel="Deploy Blueprints that are new to the Target Environment, avoiding existing Blueprints."
        prefix={prefix}
        disabled={disabled}
      />
    </Section>
  );
}

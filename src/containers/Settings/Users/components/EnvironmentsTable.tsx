import {
  Box,
  Center,
  EnvironmentsIcon,
  Flex,
  Grid,
  Icon,
  Radio,
  RenderGuard,
  RiveryButton,
  RiveryOverlay,
  RiveryTable,
  Tag,
  Text,
} from 'components';
import {
  headerDescriptions,
  Roles,
  useGetIsAccountThatIsManagedByBoomi,
} from 'containers/Settings/Users/users.helpers';
import { useGetEnvironmentsQuery } from 'modules/Environments/environments.query';
import { useOpacityCalculate } from 'modules/Environments/helpers';
import { useCallback, useMemo } from 'react';
import { Controller } from 'react-hook-form';
import { useAccount } from 'store/core';

export default function EnvironmentsTable({ formApi, userView = false }) {
  const { control } = formApi;
  const { data: environmentEntities } = useGetEnvironmentsQuery('');
  const formValues = formApi.watch();
  //To match both Users and Teams
  const isAdmin = formValues?.is_admin || formValues?.is_all_environment_admin;

  const data = useMemo(
    () =>
      environmentEntities?.reduce((acc, env) => {
        if (acc.length === 0) {
          acc.push({
            environment_name: 'All Environments',
            id: 'all-environments',
            color: 'primary',
            role: Roles.ADMIN,
            is_admin: isAdmin,
          });
        }
        acc.push({
          environment_name: env.environment_name,
          id: env._id,
          color: env.color,
          role:
            (formValues?.role?.environments &&
              formValues.role.environments[env._id as any]) ??
            Roles.NO_ACCESS,
          is_admin: isAdmin,
        });
        return acc;
      }, []) ?? [],
    [environmentEntities, formValues?.role?.environments, isAdmin],
  );

  const columns = useMemo(
    () =>
      environmentColumns
        ?.map(column => {
          return {
            ...column,
            getProps: { control, formApi, userView },
          };
        })
        .filter(Boolean),
    [control, formApi, userView],
  );
  const isBoomiAccount = useGetIsAccountThatIsManagedByBoomi();
  const { isSettingOn } = useAccount();
  const isTabsViewEnabled = isSettingOn('allow_AD_users');
  const tableHeight = `calc(100vh - ${isTabsViewEnabled ? '290px' : '220px'})`;
  return (
    <Grid borderRadius={4} templateRows="auto 1fr" gap={2}>
      <Box color="font-secondary">
        <Text display="inline">
          Manage {userView ? 'user' : 'team'} roles and permissions for each
          Environment. For more information about user roles and permissions,
          visit our{' '}
        </Text>
        <RiveryButton
          label="documentation"
          variant="link"
          href="https://help.boomi.com/docs/Atomsphere/Data_Integration/Administration/user-roles-permissions"
          target="_blank"
        />
        .
      </Box>
      <Box overflow="auto" h={tableHeight} position="relative">
        <RiveryTable
          entityType="Environments"
          ariaLabel="environments list"
          noPagination={true}
          compact
          columns={columns}
          data={data}
          rowHandlers={{ isCustomPadding: true, markFirstRow: true }}
          variant="border"
          clearFilters={isBoomiAccount && <BoomiAlert isAdmin={isAdmin} />}
          contentProps={{
            sx: {
              '& [aria-label="environments list"]': {
                mt: isBoomiAccount && '38px',
              },
            },
          }}
        />
      </Box>
    </Grid>
  );
}

function BoomiAlert({ isAdmin }) {
  return (
    <Tag
      w="full"
      height="40px"
      justifyContent="center"
      textAlign="center"
      position="absolute"
      left="0px"
      top="52px"
      variant="contained-blue"
    >
      {isAdmin
        ? 'This user is set as Boomi Account Admin and has Admin permissions for all environments'
        : 'This user is set as Boomi Account User and can not be set as Admin'}
    </Tag>
  );
}

const commonStyle = {
  headerProps: {
    pl: 2,
    weight: '87px',
  },
  styleProps: { justifyContent: 'center' },
};

const environmentColumns = [
  {
    Header: () => <Text fontWeight="medium">Environments</Text>,
    accessor: 'environment_name',
    Cell: EnvName,
    headerProps: {
      px: 3,
    },
    styleProps: { position: 'relative', py: 0 },
    weight: '200px',
  },
  {
    Header: () => (
      <Center width="full" fontWeight="medium" fontSize="xs">
        No access
      </Center>
    ),
    id: Roles.NO_ACCESS,
    Cell: RoleSwitch,
    ...commonStyle,
  },
  {
    Header: RoleHeader,
    id: Roles.VIEWER,
    Cell: RoleSwitch,
    ...commonStyle,
  },
  {
    Header: RoleHeader,
    id: Roles.MEMBER,
    Cell: RoleSwitch,
    ...commonStyle,
  },
  {
    Header: RoleHeader,
    id: Roles.DEVELOPER,
    Cell: RoleSwitch,
    ...commonStyle,
  },
  {
    Header: RoleHeader,
    id: Roles.DEPLOYMENT_ADMIN,
    Cell: RoleSwitch,
    weight: 'minmax(min-content, 1fr)',
    headerProps: { px: 2 },
    styleProps: commonStyle.styleProps,
  },
  {
    Header: RoleHeader,
    id: Roles.ADMIN,
    Cell: RoleSwitch,
    headerProps: { px: 2, bg: 'background-selected-weak' },
    styleProps: { ...commonStyle.styleProps },
  },
];

function RoleHeader({ column: { id } }) {
  return (
    <Center fontSize="xs" fontWeight="medium" width="full" h={8}>
      <Text textTransform="capitalize" pr={1}>
        {headerDescriptions[id].name ?? id}
      </Text>
    </Center>
  );
}

function EnvName({
  value,
  row: {
    original: { color, id },
  },
}) {
  return (
    <RenderGuard
      condition={id !== 'all-environments'}
      fallback={
        <Box
          borderRight="2px solid"
          borderRightColor={color}
          fontWeight="medium"
          color="font"
          h="100%"
          w="100%"
          py={4}
          px={3}
        >
          {value}
        </Box>
      }
    >
      <Flex p={2} borderRight="2px solid" borderRightColor={color} w="100%">
        <Icon as={EnvironmentsIcon} color={color} mt={2} boxSize={5} />
        <RiveryOverlay description={value}>
          <Box
            h="100%"
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            py={2}
            px={3}
            color="font"
          >
            {value}
          </Box>
        </RiveryOverlay>
      </Flex>
    </RenderGuard>
  );
}
function RoleSwitch({ column: { id: role, getProps }, row: { original } }) {
  const { formApi } = getProps;
  const values = formApi.watch();
  return original.id === 'all-environments' ? (
    <CrossEnvsController {...getProps} role={role} />
  ) : (
    <RenderGuard
      fallback={
        <Box
          h="full"
          w="full"
          bg={
            values.is_admin
              ? 'selectedbackground-selected-weakLight'
              : undefined
          }
        />
      }
      condition={role !== Roles.ADMIN}
    >
      <SingleEnvController {...getProps} original={original} role={role} />
    </RenderGuard>
  );
}

function SingleEnvController({ control, formApi, original, role, userView }) {
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  const isBoomiAccount = useGetIsAccountThatIsManagedByBoomi();
  const defaultEnv =
    environmentsArray.find(env => env._id === original.id && env.is_default) ||
    formApi?.watch('default_environment') === original?.id;
  const isChangeDisabled =
    (formApi.watch('is_admin') && isBoomiAccount) ||
    (defaultEnv && role === Roles.NO_ACCESS) ||
    (userView &&
      (formApi.watch('source') !== 'rivery' ||
        formApi?.watch('teams')?.length > 0));
  const values = formApi.watch();
  const onChange = useCallback(
    ({ target }) => {
      formApi.setValue(`role.environments.${original?.id}`, role);
      formApi.setValue('is_admin', !target.checked);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role],
  );

  const opacityBG = useOpacityCalculate(original.color, 0.3);
  return (
    <Controller
      defaultValue={values?.role?.environments?.original?.id}
      name={`role.environments.${original?.id}` as const}
      control={control}
      render={({ field }) => {
        const checked =
          !values?.is_admin &&
          (field.value === role || (!field.value && role === Roles.NO_ACCESS));
        return (
          <Center position="relative" w="100%" h="100%">
            <Box bg={checked ? opacityBG : 'transparent'} w="100%" h="100%" />
            <Flex position="absolute" direction="column" alignItems="flex-end">
              <Radio
                isChecked={checked}
                name={field.name}
                onChange={onChange}
                isDisabled={isChangeDisabled}
              />
            </Flex>
          </Center>
        );
      }}
    />
  );
}

function CrossEnvsController({ formApi, userView, role }) {
  const isBoomiAccount = useGetIsAccountThatIsManagedByBoomi();
  const isChangeDisabled =
    (!formApi.watch('is_admin') && isBoomiAccount && role === Roles.ADMIN) ||
    (formApi.watch('is_admin') && isBoomiAccount && role !== Roles.ADMIN) ||
    (userView &&
      (formApi.watch('source') !== 'rivery' ||
        formApi?.watch('teams')?.length > 0));
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  const allEnvsRoles = Object.values(formApi?.watch('role.environments') ?? {});
  const allEnvironmentIds = (environmentsArray ?? []).map(env => {
    if (role === Roles.NO_ACCESS && env.is_default) {
      return null;
    }
    return env._id;
  });
  const checked = formApi.watch('is_admin')
    ? role === Roles.ADMIN
    : allEnvsRoles.every(envRole => envRole === role) ||
      (allEnvsRoles.every(envRole => envRole === undefined) &&
        role === Roles.NO_ACCESS);

  const onChange = useCallback(
    ({ target }) => {
      if (target.id === Roles.ADMIN) {
        formApi.setValue('is_admin', target.checked);
        return;
      }
      const newRoles = allEnvironmentIds?.reduce((acc, id: any) => {
        acc[id] = role;
        return acc;
      }, {});
      formApi.setValue('role.environments', newRoles);
      formApi.setValue('is_admin', false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role],
  );
  return (
    <Radio
      aria-label={`all-${role}`}
      isChecked={checked}
      onChange={onChange}
      id={role}
      isDisabled={isChangeDisabled}
    />
  );
}

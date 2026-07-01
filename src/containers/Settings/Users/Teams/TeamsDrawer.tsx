import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  EnvironmentsIcon,
  Flex,
  Grid,
  HStack,
  Icon,
  LockClosed,
  RenderGuard,
  RiveryModalProps,
  Slide,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Textarea,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { CloseIconButton } from 'components/Buttons/RiveryButton';
import { RiveryDrawerFooter } from 'components/Drawer/RiveryDrawerFooter';
import { CustomSelectForm, Input } from 'components/Form';
import SvgSingleUser from 'components/Icons/components/SingleUser';
import { useFocusFirstField } from 'hooks/useFocusFirstField';
import { useToastComponent } from 'hooks/useToast';
import { useGetEnvironmentsQuery } from 'modules/Environments/environments.query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { getOId } from 'utils/api.sanitizer';
import EnvironmentsTable from '../components/EnvironmentsTable';
import { UserDrawerForm } from '../components/InviteNewUser';
import UsersGrid from '../components/UsersGrid';
import { useUpdateTeamMutation } from '../teams.query';
import { Roles } from '../users.helpers';

interface TeamsModalProps extends RiveryModalProps {
  team: any;
}

interface TeamDrawerFormProps {
  display_name: string;
  description: string;
  default_environment: string;
  is_admin: boolean;
  team_id: string;
  role: {
    environments: Record<string, string>;
  };
}

export function TeamsDrawer({ team, ...rest }: TeamsModalProps) {
  const {
    replace,
    location: { pathname, search, state },
  } = useHistory();
  const [user, selectUser] = useState(null);
  const changeUser = useCallback(
    user => {
      selectUser(user);
      user?.groups &&
        replace({
          pathname,
          search,
          state: { ...(state as any), teams: user?.groups },
        });
    },
    [pathname, replace, search, state],
  );

  return (
    <Drawer
      variant="semifull"
      placement="right"
      onClose={rest.onClose}
      isOpen={rest.show}
      onOverlayClick={() => {
        selectUser(null);
        rest.onClose();
      }}
    >
      <DrawerOverlay />
      <DrawerContent
        transition="transform 0.1s !important"
        transitionTimingFunction="linear !important"
      >
        <TeamDrawerForm
          selectUser={changeUser}
          team={team}
          onClose={rest.onClose}
        />
        <Slide direction="right" in={Boolean(user)} style={{ zIndex: 10 }}>
          <Box h="full" w="full" bg="white">
            <UserDrawerForm
              disabled
              userID={user?.user_id}
              setUser={selectUser}
              onClose={() => selectUser(null)}
              teamsView
            />
          </Box>
        </Slide>
      </DrawerContent>
    </Drawer>
  );
}

function assignEnvironments(team, allEnvironments) {
  const hasRoles =
    team && team?.environments && !team?.is_all_environment_admin;
  return hasRoles
    ? Object.entries(team.environments).reduce(
        (result, [envId, value]) => ({ ...result, [envId]: value['role'] }),
        {},
      )
    : allEnvironments.reduce(
        (result, env) => ({ ...result, [getOId(env._id)]: undefined }),
        {},
      );
}

const defaultAccountEnv = {
  label: 'Account Default Environment',
  value: 'default',
  style: {
    borderBottom: '1px solid var(--chakra-colors-gray-300)',
  },
};

const useGetDefaultEnvironmentsList = (isAdmin, teamEnvironments) => {
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  const list = isAdmin
    ? environmentsArray
    : environmentsArray.filter(
        env =>
          teamEnvironments[env?._id] &&
          teamEnvironments[env?._id] !== Roles.NO_ACCESS,
      );
  const optionsList = list?.map(env => {
    return {
      value: env?._id,
      label: env?.environment_name,
    };
  });
  return [defaultAccountEnv].concat(optionsList as any);
};

export function TeamDetailsInput({ ...props }) {
  return <Input chakra size="md" {...props} />;
}

function TeamDrawerForm({ team, selectUser, onClose }) {
  const { success, error } = useToastComponent();
  const { data: environmentsArray } = useGetEnvironmentsQuery('');
  const environments = assignEnvironments(team, environmentsArray);

  const [updateTeam, { isError, isSuccess }] = useUpdateTeamMutation();
  const { handleSubmit, ...useFormApi } = useForm<TeamDrawerFormProps>({
    defaultValues: {
      display_name: team?.display_name ?? '',
      description: team?.description ?? '',
      default_environment: team?.default_environment ?? 'default',
      is_admin: team?.is_all_environment_admin,
      role: {
        environments: environments,
      },
    },
    mode: 'onChange',
  });

  const defaultEnvironmentsList = useGetDefaultEnvironmentsList(
    useFormApi?.watch('is_admin'),
    useFormApi?.watch('role')?.environments,
  );
  const onFormSubmit = (formData: TeamDrawerFormProps) => {
    const {
      role: { environments },
      is_admin,
      ...formValues
    } = formData;
    const {
      remote_display_name,
      source,
      account_id: account,
      ...values
    } = team;

    const teamEnvironments = Object.entries(environments).reduce(
      (acc, [env, role]) => {
        if (![Roles.NO_ACCESS, undefined].includes(role as Roles)) {
          acc[env] = { role };
        }
        return acc;
      },
      {},
    );
    updateTeam({
      ...values,
      ...formValues,
      account,
      environments: teamEnvironments,
      is_all_environment_admin: is_admin,
    });
  };
  useEffect(() => {
    if (isError) {
      error({ description: 'Team update failed' });
    }
    if (isSuccess) {
      success({ description: 'Team updated successfully' });
    }
  }, [error, isError, isSuccess, success]);
  const selectedDefaultEnvironment = useFormApi.watch('default_environment');
  useFocusFirstField(useFormApi, 'display_name');
  const selectedDefaultTeam = defaultEnvironmentsList.find(
    env => selectedDefaultEnvironment === env.value,
  );
  return (
    <>
      <form style={{ height: '100%' }} onSubmit={handleSubmit(onFormSubmit)}>
        <Grid h="full" gridTemplateRows="auto 1fr auto">
          <DrawerHeader pb={0} w="full">
            <HStack
              justify="space-between"
              borderBottom="1px solid var(--chakra-colors-gray-300)"
            >
              <Text textStyle="M4">Edit Team</Text>
              <CloseIconButton
                onClick={onClose}
                aria-label="close dataframes"
              />
            </HStack>
          </DrawerHeader>
          <DrawerBody py={0}>
            <Grid
              templateColumns="300px auto"
              gap={1}
              overflow="hidden"
              h="100%"
            >
              <Grid
                templateRows="repeat(5, min-content)"
                gap={4}
                bg="background-secondary"
                borderRight="1px"
                borderRightColor="gray.300"
                p={3}
              >
                <RenderGuard condition={team?.source !== 'rivery'}>
                  <TeamDetailsInput
                    label="Provisioned Directory Group"
                    name="remote_display_name"
                    value={team?.remote_display_name}
                    isDisabled
                  />
                </RenderGuard>
                <TeamDetailsInput
                  label="Team Name"
                  secondaryLabel={
                    <Text color="font-secondary">
                      Enter a display name to use in Boomi Data Integration.
                    </Text>
                  }
                  placeholder="Team Name"
                  name="display_name"
                  required
                  api={useFormApi}
                />
                <TeamDetailsInput
                  label="Description"
                  placeholder="Description"
                  name="description"
                  api={useFormApi}
                  as={Textarea}
                  lines={3}
                />
                <CustomSelectForm
                  label="Default Team Environment"
                  secondaryLabel={
                    <Text color="font-secondary">
                      Set a default Environment for this team
                    </Text>
                  }
                  value={selectedDefaultTeam}
                  placeholder="Use Account Default Environment"
                  options={defaultEnvironmentsList}
                  isMulti={false}
                  controlId="default_environment_team"
                  name="default_environment"
                  api={useFormApi}
                />
                <RenderGuard condition={team?.source !== 'rivery'}>
                  <RiveryAlert
                    mt={4}
                    icon={LockClosed}
                    variant="info"
                    description="This team is provisioned and synced from external directory."
                  />
                </RenderGuard>
              </Grid>
              <TeamsDrawerTabs formApi={useFormApi} selectUser={selectUser} />
            </Grid>
          </DrawerBody>
          <RiveryDrawerFooter
            cancelLabel="Cancel"
            saveLabel="Apply Changes"
            handleOnClose={onClose}
            disabledSave={!useFormApi.formState.isValid}
            handleOnSuccess={onClose}
          />
        </Grid>
      </form>
    </>
  );
}

function TeamsDrawerTabs({ formApi, selectUser }) {
  const tabs = useMemo(() => {
    return [
      {
        title: 'Permissions',
        component: () => <EnvironmentsTable formApi={formApi} />,
        route: 'environments',
        icon: EnvironmentsIcon,
      },
      {
        title: 'Users',
        component: () => <UsersGrid setSelectedUser={selectUser} teamsDrawer />,
        route: 'users',
        icon: SvgSingleUser,
      },
    ];
  }, [formApi, selectUser]);
  return (
    <Tabs p={3} isLazy>
      <TabList gap={4}>
        {tabs.map(({ title, icon }, index) => (
          <Tab key={index}>
            <Flex gap={2} alignItems="center">
              <Icon as={icon} />
              {title}
            </Flex>
          </Tab>
        ))}
      </TabList>
      <TabPanels>
        {tabs.map(({ component: TabContent }, index) => (
          <TabPanel key={index}>
            <TabContent />
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}

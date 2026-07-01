import { Flex, HStack, useBoolean } from '@chakra-ui/react';
import { IUser } from 'api/types';
import {
  Breadcrumbs,
  ButtonCreate,
  Divider,
  RenderGuard,
  RiveryTabs,
  Text,
  View,
} from 'components';
import SvgSingleUser from 'components/Icons/components/SingleUser';
import { UserGroupIcon } from 'layout/Sidebar/components/icons';
import React, { useCallback, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useAccount } from 'store/core';
import { UsersDrawer } from './components/InviteNewUser';
import UsersGrid from './components/UsersGrid';
import { TeamsTab } from './Teams/TeamsTab';
import { useGetIsAccountThatIsManagedByBoomi } from './users.helpers';

export function Users() {
  const { isSettingOn } = useAccount();
  return (
    <View p={4} pt={3} h="100%">
      <Flex flexDir="column" bg="white" overflow="hidden" h="100%">
        <Breadcrumbs
          links={[{ label: 'Settings' }, { label: 'Users Management' }]}
        />
        <RenderGuard
          condition={!isSettingOn('allow_AD_users')}
          fallback={<UsersTeamsTabs />}
        >
          <Divider orientation="horizontal" w="100%" bg="gray.300" mb={2} />
          <UsersTab />
        </RenderGuard>
      </Flex>
    </View>
  );
}

function UsersTeamsTabs() {
  const tabs = useMemo(() => {
    return [
      {
        title: 'Users',
        route: 'users',
        component: UsersTab,
        icon: SvgSingleUser,
      },
      {
        title: 'Teams',
        route: 'teams',
        component: TeamsTab,
        icon: UserGroupIcon,
      },
    ];
  }, []);
  return (
    <RiveryTabs
      items={tabs}
      route="tab"
      queryParam
      gridProps={{
        display: 'flex',
        overflow: 'hidden',
        flexDirection: 'column',
        height: 'full',
      }}
      tabPanelsProps={{
        overflow: 'hidden',
        height: 'full',
        sx: { '& > div': { h: 'full' } },
      }}
    />
  );
}

function UsersTab() {
  const { isSettingOn } = useAccount();
  const {
    replace,
    location: { pathname, search, state },
  } = useHistory();
  const [showUsersForm, toggleUsersForm] = useBoolean(false);
  const [selectedUser, setSelectedUser] = useState<IUser>(null);
  const [refetch, toggleRefetch] = useToggle(false);
  const boomiAccount = useGetIsAccountThatIsManagedByBoomi();
  const manageUsersBySsoOnly =
    isSettingOn('manage_users_by_sso_only') || boomiAccount;

  const changeUser = useCallback(
    user => {
      setSelectedUser(user);
      user?.groups &&
        replace({
          pathname,
          search,
          state: { ...(state as any), teams: user?.groups },
        });
      toggleUsersForm.on();
    },
    [pathname, replace, search, state, toggleUsersForm],
  );
  return (
    <Flex flexDir="column" gap={2} overflow="hidden" h="100%">
      <HStack justify="space-between" pt={1}>
        <Text color="font-secondary">Add and manage your Users</Text>
        <ButtonCreate
          mr={1}
          onClick={toggleUsersForm.on}
          isDisabled={manageUsersBySsoOnly}
          tooltip="User management is restricted to SSO only"
        >
          Add User
        </ButtonCreate>
      </HStack>
      <UsersGrid
        setSelectedUser={changeUser}
        refetch={refetch}
        toggleRefetch={toggleRefetch}
      />
      <UsersDrawer
        refetch={() => toggleRefetch(true)}
        user={selectedUser}
        show={showUsersForm}
        onClose={() => {
          replace({ state: null, pathname, search });
          toggleUsersForm.off();
          setSelectedUser(null);
        }}
      />
    </Flex>
  );
}

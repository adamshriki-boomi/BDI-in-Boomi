import { Box, Flex, Icon, Tag } from '@chakra-ui/react';
import { IUser } from 'api/types';
import { NoResults, OutlinedSuccess, TableDateTime } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { PaginatedApiRiveryTable } from 'components/RiveryTable/PaginatedApiRiveryTable';
import { useEffect, useMemo } from 'react';
import { Column, useSortBy } from 'react-table';
import { useToggle } from 'react-use';
import { useAccount, useCore } from 'store/core';
import { parseSearchParams } from 'utils/searchParams';
import { useGetUsersQuery } from '../usersV1.query';
import UserActions from './UserActions';
import { useGetIsAccountThatIsManagedByBoomi } from '../users.helpers';

interface UsersGridProps {
  setSelectedUser: React.Dispatch<React.SetStateAction<IUser>>;
  teamsDrawer?: boolean;
  refetch?: boolean;
  toggleRefetch?: (toggle: boolean) => void;
}

const paramIdMap = {
  name: 'name',
};

const useFetchData = () => {
  const { activeAccountId: account_id } = useCore();
  const params = parseSearchParams();
  const {
    pageIndex,
    pageSize,
    sortBy: sort_by,
    sortOrder: sort_order,
    tab,
    ...rest
  } = params;
  const { data: users, ...api } = useGetUsersQuery({
    account_id,
    page: params?.pageIndex ? params?.pageIndex + 1 : 1,
    items_per_page: params?.pageSize ?? 20,
    sort_by,
    sort_order,
    ...rest,
  } as any);

  return {
    data: users?.items ?? [],
    total: users?.total_items || 0,
    totalShowing:
      users?.page * (params?.pageSize ?? 20) - (params?.pageSize ?? 20) + 1,
    totalPages: users
      ? Math.ceil(
          users?.total_items / (params?.pageSize ? params?.pageSize : 20),
        )
      : 0,
    ...api,
  };
};

export default function UsersGrid({
  setSelectedUser,
  teamsDrawer = false,
  refetch = false,
  toggleRefetch = null,
}: UsersGridProps) {
  const { isSettingOn } = useAccount();
  //Indicated whether the account is configured with Active Directory
  const isADUsers = isSettingOn('allow_AD_users');
  const isBoomiAccount = useGetIsAccountThatIsManagedByBoomi();
  const [pending, setPending] = useToggle(false);
  const { userEmail } = useCore();
  const columns = useMemo(() => {
    const usersColumns = usersHeaders(isADUsers, teamsDrawer, isBoomiAccount);
    return usersColumns?.map(column => ({
      ...column,
      getProps: { setSelectedUser, setPending, teamsDrawer, toggleRefetch },
    }));
  }, [
    isADUsers,
    isBoomiAccount,
    setPending,
    setSelectedUser,
    teamsDrawer,
    toggleRefetch,
  ]);

  const tableHeight = teamsDrawer ? `calc(100vh - 200px)` : '100%';

  ///This is to reset the refetch state after the refetch is done
  useEffect(() => {
    if (refetch) {
      setTimeout(() => {
        toggleRefetch(false);
      }, 100);
    }
  }, [refetch, toggleRefetch]);
  return (
    <Box overflow="auto" h={tableHeight} position="relative">
      <PaginatedApiRiveryTable
        ariaLabel="users list"
        entityType="Users"
        useApiQuery={useFetchData}
        paramIdMap={paramIdMap}
        columns={columns}
        useSortBy={useSortBy}
        filterLabel="Search Users"
        masterFilterKey="name"
        loadingActions={pending}
        refetchOnRefresh
        refetchOnChange={refetch}
        rowHandlers={{
          isRowDisabled: ({ status, user_email }) =>
            ['Suspended', 'disabled'].includes(status) ||
            user_email === userEmail,
        }}
        noRecords={NoResults}
        recordNotFound={NoResults}
        clearFilters={isBoomiAccount && <BoomiAlert />}
        contentProps={{
          sx: {
            '& [aria-label="users list"]': {
              mt: isBoomiAccount && '95px',
            },
          },
        }}
      />
    </Box>
  );
}

function BoomiAlert() {
  return (
    <Tag
      w="full"
      height="85px"
      justifyContent="center"
      textAlign="center"
      position="absolute"
      left="0px"
      top="80px"
      variant="white"
    >
      <Flex flexDir="column" gap={1}>
        <Box>
          User administration is handled via the Boomi Platform User Management
          system.{' '}
        </Box>
        This section enables you to configure role-based permissions for
        individual users across Boomi Data Integration environments.
        <Box>
          For more information,
          <RiveryButton
            ml={1}
            label="visit our documentation"
            variant="link"
            href="https://help.boomi.com/docs/Atomsphere/Data_Integration/Administration/user-roles-permissions"
            target="_blank"
            display="inline"
          />
          .
        </Box>
      </Flex>
    </Tag>
  );
}

export const commonStyle = {
  styleProps: { px: 3, py: 0 },
  headerProps: { py: 2, px: 3 },
};

const activeDirectoryHeaders: Column[] = [
  {
    Header: 'Source',
    accessor: 'source',
    sortBy: 'source',
    Cell: ({ value }) =>
      value === 'active_directory' ? 'Directory' : 'Rivery',
    weight: '100px',
    ...commonStyle,
  },
  {
    Header: '# Teams',
    accessor: 'groups',
    Cell: ({ value, row: { original } }) =>
      original?.source === 'active_directory' && Boolean(value?.length)
        ? value?.length
        : null,
    weight: 'min-content',
    ...commonStyle,
    styleProps: { ...commonStyle.styleProps, justifyContent: 'center' },
  },
];

const UsersGridHeaders = isBoomiAccount => {
  return [
    {
      Header: 'Admin',
      accessor: 'is_admin',
      sortBy: 'is_admin',
      Cell: ({ value }) =>
        Boolean(value) && <Icon as={OutlinedSuccess} boxSize={5} />,
      weight: 'min-content',
      ...commonStyle,
    },
    ...(!isBoomiAccount
      ? [
          {
            Header: 'Invited By',
            accessor: 'invited_by',
            // sortBy: 'invited_by',
            Cell: ({ value, row }) =>
              row?.original?.source === 'active_directory'
                ? 'Active Directory'
                : value,
            ...commonStyle,
          },
        ]
      : []),
    {
      Header: 'Creation Date',
      accessor: 'created_at',
      sortBy: 'created_at',
      Cell: TableDateTime,
      ...commonStyle,
    },
    {
      Header: 'Last login',
      accessor: 'last_login',
      sortBy: 'last_login',
      Cell: TableDateTime,
      ...commonStyle,
    },
  ];
};
const usersHeaders = (isADUsers, teamsDrawer, isBoomiAccount): Column[] => [
  {
    Header: 'Name',
    accessor: 'user_name',
    Cell: UserName,
    sortBy: 'user_name',
    ...commonStyle,
  },
  {
    Header: 'Email Address',
    accessor: 'user_email',
    sortBy: 'user_email',
    ...commonStyle,
  },

  ...(isADUsers && !teamsDrawer ? activeDirectoryHeaders : []),
  ...(!teamsDrawer ? UsersGridHeaders(isBoomiAccount) : []),
  {
    Header: 'Status',
    accessor: 'status',
    // sortBy: 'status',
    Cell: Status,
    weight: 'max-content',
    ...commonStyle,
    styleProps: { py: 3, justify: 'center' },
  },
  ...(!teamsDrawer
    ? [
        {
          Header: '',
          id: 'actions',
          Cell: UserActions,
          weight: 'min-content',
          className: 'actions-cell',
        },
      ]
    : []),
];

function UserName({ value, column: { getProps }, row: { original } }) {
  const { setSelectedUser } = getProps;
  const { userEmail } = useCore();
  const { first_name, last_name, user_email } = original;
  return (
    <RiveryButton
      h="full"
      w="full"
      label={value ? value : `${first_name} ${last_name}`}
      bg="transparent"
      p={0}
      variant="link"
      onClick={() => setSelectedUser(original)}
      justifyContent="start"
      isDisabled={userEmail === user_email}
    />
  );
}

const statusMap = {
  active: { variant: 'contained-green' },
  Active: { variant: 'contained-green' },
  disabled: {
    description: 'Deactivated',
    variant: 'contained-gray',
  },
  Suspended: {
    description: 'Deactivated',
    variant: 'contained-gray',
  },
  pending: {
    description: 'Pending',
    variant: 'yellow',
  },
  'Invitation pending': {
    description: 'Pending',
    variant: 'yellow',
  },
};

function Status({ value }) {
  return (
    <Tag
      variant={statusMap?.[value]?.variant}
      py={0.5}
      px={1}
      fontWeight="medium"
      fontSize="xs"
      textTransform="capitalize"
    >
      {statusMap[value]?.description || value}
    </Tag>
  );
}

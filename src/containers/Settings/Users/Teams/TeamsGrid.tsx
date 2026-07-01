import { Box, Icon, Tag, TagLabel } from '@chakra-ui/react';
import { ITeam } from 'api/types';
import { OutlinedSuccess, RenderGuard, TableDateTime } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { PaginatedApiRiveryTable } from 'components/RiveryTable/PaginatedApiRiveryTable';
import { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSortBy } from 'react-table';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { getOId } from 'utils/api.sanitizer';
import { parseSearchParams } from 'utils/searchParams';
import { EnvironmentPills } from '../components/EnvironmentPills';
import { useGetTeamsQuery } from '../teams.query';
import BulkActions from './components/BulkActions';
import TeamActions from './TeamActions';

interface TeamsGridProps {
  setSelectedTeam: React.Dispatch<React.SetStateAction<ITeam>>;
  userView?: boolean;
}

const paramIdMap = {
  display_name: 'display_name',
};

const useFetchData = () => {
  const { activeAccountId: account_id } = useCore();
  const {
    location: { state },
  } = useHistory<any>();
  const userTeams = state?.teams?.map(getOId);
  const params = parseSearchParams();
  const {
    pageIndex,
    pageSize,
    sortBy: sort_by,
    sortOrder: sort_order,
    tab,
    //I remove those two from param map so they don't get passed to the API
    //These are used to filter users not teams
    name,
    team_id,
    //
    ...rest
  } = params;
  const { data: teams, ...api } = useGetTeamsQuery({
    account_id,
    page: params?.pageIndex ? params?.pageIndex + 1 : 1,
    items_per_page: params?.pageSize ?? 20,
    sort_by,
    sort_order,
    ...(userTeams?.length > 0 && {
      team_id: userTeams,
    }),
    ...rest,
  } as any);

  const teamsData = teams?.items.map(team => {
    const environments = Object.assign(
      {},
      ...Object.entries(team.environments).map(([key, value]) => ({
        [key]: { ...(value as any), cross_id: key },
      })),
    );
    return {
      ...team,
      environments,
    };
  });
  return {
    data:
      tab !== 'teams' && !Boolean(userTeams?.length)
        ? []
        : teamsData
        ? teamsData
        : [],
    total: teams?.total_items || 0,
    totalShowing:
      teams?.page * (params?.pageSize ?? 20) - (params?.pageSize ?? 20) + 1,
    totalPages: teams
      ? Math.ceil(
          teams?.total_items / (params?.pageSize ? params?.pageSize : 20),
        )
      : 0,
    ...api,
  };
};

export default function TeamsGrid({
  userView = false,
  setSelectedTeam,
}: TeamsGridProps) {
  const [pending, setPending] = useToggle(false);
  const [selectedTeams, setTeamsForBulk] = useState([]);

  const columns = useMemo(() => {
    const columns = userView ? userViewColumns : teamsHeaders;
    return columns?.map(column => ({
      ...column,
      getProps: {
        setSelectedTeam,
        setPending,
        setTeamsForBulk,
        selectedTeams,
        userView,
      },
    }));
  }, [userView, setSelectedTeam, setPending, selectedTeams]);

  return (
    <>
      <Box overflow="auto" h={`calc(100vh - ${userView ? '200px' : '175px'})`}>
        <PaginatedApiRiveryTable
          entityType="Teams"
          useApiQuery={useFetchData}
          paramIdMap={paramIdMap}
          columns={columns}
          useSortBy={useSortBy}
          filterLabel="Search Teams"
          masterFilterKey="display_name"
          loadingActions={pending}
          refetchOnRefresh
          noRecords={() => <div />}
        />
      </Box>
      <BulkActions teams={selectedTeams} setTeamsForBulk={setTeamsForBulk} />
    </>
  );
}

export const commonStyle = {
  styleProps: { px: 3, py: 0 },
  headerProps: { py: 2, px: 3 },
};

const userViewColumns = [
  {
    Header: 'Name',
    accessor: 'display_name',
    Cell: TeamName,
    sortBy: 'display_name',
    weight: 'minmax(300px, 1fr)',
    ...commonStyle,
    styleProps: {
      ...commonStyle.styleProps,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minH: '45px',
    },
  },
  {
    Header: '# Environments',
    accessor: 'environments',
    Cell: EnvironmentPills,
    weight: 'minmax(60px, 1fr)',
    ...commonStyle,
  },
  {
    Header: 'Admin',
    accessor: 'is_all_environment_admin',
    sortBy: 'is_all_environment_admin',
    Cell: ({ value }) =>
      Boolean(value) && <Icon as={OutlinedSuccess} boxSize={5} />,
    weight: 'minmax(60px, 1fr)',
    ...commonStyle,
    styleProps: {
      ...commonStyle.styleProps,
    },
  },
];

const teamsHeaders = [
  // {
  //   Header: SelectAllCheck,
  //   id: 'selected',
  //   Cell: SelectSingleCheck,
  //   weight: 'min-content',
  //   ...commonStyle,
  // },
  ...userViewColumns,
  {
    Header: 'Creation Date',
    accessor: 'created_at',
    sortBy: 'created_at',
    Cell: TableDateTime,
    ...commonStyle,
  },
  {
    Header: 'Type',
    accessor: 'source',
    sortBy: 'source',
    Cell: Source,
    weight: 'max-content',
    ...commonStyle,
  },
  {
    Header: '',
    id: 'actions',
    Cell: TeamActions,
    weight: 'min-content',
    className: 'actions-cell',
  },
];

function TeamName({ value, column: { getProps }, row: { original } }) {
  const { setSelectedTeam, userView } = getProps;
  return (
    <RenderGuard
      condition={!userView}
      fallback={<Box fontWeight="medium">{value}</Box>}
    >
      <RiveryButton
        h="full"
        w="full"
        label={value}
        display="block"
        textAlign="start"
        p={0}
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        variant="link"
        onClick={() => setSelectedTeam(original)}
        justifyContent="start"
        title={value}
      />
    </RenderGuard>
  );
}

function Source({ value }) {
  const isLocal = value === 'rivery';
  return (
    <Tag variant={isLocal ? 'blue' : 'orange'} size="sm">
      <TagLabel textTransform="capitalize">
        {isLocal ? 'Local' : 'Directory'}
      </TagLabel>
    </Tag>
  );
}

// function SelectAllCheck({ column: { getProps }, rows }) {
//   const ids = rows.map(({ original: { _id } }) => _id);
//   const onSelectAllFromPage = useCallback(
//     ({ target: { checked } }) => {
//       if (checked) {
//         getProps.setTeamsForBulk(state => {
//           const selected = [...state];
//           const allSelected = selected.concat(ids);
//           return allSelected;
//         });
//       } else {
//         getProps.setTeamsForBulk(state => {
//           const selected = [...state];
//           const allSelected = selected.filter(id => !ids.includes(id));
//           return allSelected;
//         });
//       }
//     },

//     [getProps, ids],
//   );
//   const isChecked =
//     Boolean(getProps.selectedTeams.length) &&
//     ids?.every(id => getProps.selectedTeams.includes(id));

//   return (
//     <RiveryCheckbox
//       name="all-teams"
//       label={''}
//       isChecked={getProps.selectedTeams?.length > 0}
//       onChange={onSelectAllFromPage}
//       isIndeterminate={!isChecked && getProps.selectedTeams?.length > 0}
//     />
//   );
// }

// function SelectSingleCheck({ column: { getProps }, row: { original } }) {
//   const isChecked = getProps.selectedTeams.includes(original._id);
//   const onSelectTeam = useCallback(
//     ({ target: { checked } }) => {
//       getProps.setTeamsForBulk(state => {
//         if (checked) {
//           return state.concat(original._id);
//         }
//         return state.filter(id => id !== original._id);
//       });
//     },
//     [getProps, original._id],
//   );
//   return (
//     <RiveryCheckbox
//       name={`team-${original._id}`}
//       label={''}
//       isChecked={isChecked}
//       onChange={onSelectTeam}
//     />
//   );
// }

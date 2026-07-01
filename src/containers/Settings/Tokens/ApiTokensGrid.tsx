import { Box } from '@chakra-ui/react';
import { ButtonCreate, ExternalLink, GridBox, RiveryTable } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { PageOverlaySpinner } from 'components/Loaders/Loader';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import { Dispatch, SetStateAction, useMemo } from 'react';
import { Column, useSortBy } from 'react-table';
import { useSelectedEnvironment } from 'store/environments/hooks/useGetEnvironment';
import { getDate } from 'utils/api.sanitizer';
import { displayDate } from 'utils/date.utils';
import { ITokenData } from './tokens.query';

interface ApiTokensGridProps {
  loading: boolean;
  data: ITokenData[];
  toggleNewTokenModal(): void;
  setSelectedRow: Dispatch<SetStateAction<ITokenData>>;
  setToken: Dispatch<SetStateAction<{ token_id: string; token_name: string }>>;
}

export function ApiTokensGrid({
  loading,
  data,
  toggleNewTokenModal,
  setSelectedRow,
  setToken,
}: ApiTokensGridProps) {
  const { name: environmentName } = useSelectedEnvironment();
  const columns = useMemo(
    () =>
      tokenTablecolumns.map(column => ({
        ...column,
        getProps: { setToken, setSelectedRow },
      })),
    [setToken, setSelectedRow],
  );

  const tokens = useMemo(() => {
    if (data) {
      const tokens = data.map(token => {
        return {
          ...token,
          insert_time: getDate(token.insert_time),
          expiration_date: getDate(token.expiration_date),
          last_used_at: getDate(token.last_used_at),
        };
      });
      return tokens;
    }
    return [];
  }, [data]);

  return (
    <RiveryTable
      ariaLabel="tokens list"
      entityType="Tokens"
      loader={loading ? <PageOverlaySpinner /> : null}
      noPagination
      columns={columns}
      useSortBy={useSortBy}
      data={tokens}
      extraControls={
        <ButtonCreate ml="auto" mb="3px" mr="3px" onClick={toggleNewTokenModal}>
          Add Token
        </ButtonCreate>
      }
      filterLabel="Search Tokens"
      title={
        <GridBox gap={3}>
          <Box fontSize="small" fontWeight="light" color="font-secondary">
            Tokens you have generated that can be used to access the API For the{' '}
            {environmentName} environment.
            <ExternalLink
              pl={2}
              url="https://help.boomi.com/docs/Atomsphere/Data_Integration/RESTAPI/dataintegration-api-overview"
              label="Learn More..."
              size="small"
            />
          </Box>
        </GridBox>
      }
    />
  );
}

const commonStyle = {
  styleProps: { px: 3 },
  headerProps: { px: 3 },
};

const tokenTablecolumns: Column[] = [
  {
    Header: 'Token Name',
    accessor: 'token_name',
    Cell: TokenName,
    sortBy: 'token_name',
    ...commonStyle,
  },
  {
    Header: 'Created By',
    accessor: 'updated_by_name',
    sortBy: 'updated_by_name',
    ...commonStyle,
  },
  {
    Header: 'Created Date',
    accessor: 'insert_time',
    Cell: DateTime,
    sortBy: 'insert_time',
    ...commonStyle,
  },
  {
    Header: 'Expired Date',
    accessor: 'expiration_date',
    Cell: DateTime,
    sortBy: 'expiration_date',
    ...commonStyle,
  },
  {
    Header: 'Last Used',
    accessor: 'last_used_at',
    Cell: DateTime,
    sortBy: 'last_used_at',
    ...commonStyle,
  },
  {
    Header: '',
    id: 'actions',
    Cell: Actions,
    headerProps: { px: 2 },
    weight: 'min-content',
  },
];

function TokenName({
  value,
  row,
  column: {
    getProps: { setSelectedRow },
  },
}) {
  return (
    <RiveryButton
      label={value}
      fontSize="sm"
      p={0}
      variant="link"
      onClick={() => setSelectedRow(row.original)}
    />
  );
}

function DateTime({ value }) {
  return <div>{displayDate(value, 'yyyy-MM-dd,  HH:mm:ss')}</div>;
}

function Actions({
  column: {
    getProps: { setToken },
  },
  row: {
    original: { token_id, token_name },
  },
}) {
  const actions = [
    {
      ...RiveryDropdown.DeleteMenuItem,
      onClick: () => setToken({ token_id, token_name }),
    },
  ];

  return <RiveryDropdown isLazy menuItems={actions} />;
}

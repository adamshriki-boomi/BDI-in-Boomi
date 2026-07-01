import { API } from 'api';
import { EnvironmentDefault } from 'api/types';
import { RoutesBuilder } from 'app/routes';
import { Box, Flex, HStack, InfiniteScrollComponent, Text } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { FilterInput, RiveryCheckbox } from 'components/Form';
import { ReactNode } from 'react';
import { useCore } from 'store/core';
import { getOId } from 'utils/api.sanitizer';
import { useAccountsList } from './useAccountsList';

enum Modes {
  FULL,
  MINIMAL,
}
export type AccountDetails = {
  account: string;
  env: string;
};
type Props = {
  maxH?: string;
  mode?: Modes;
  headerChildren?: ReactNode;
};
AccountPicker.Modes = Modes;

export const navigateCallback = getUrl => () =>
  API.auth
    .revokeAccountToken()
    .finally(() => (window.location.href = getUrl()));

export function AccountPicker({
  mode = Modes.FULL,
  headerChildren = null,
}: Props) {
  const { selectedAccountId } = useCore();
  const { toggleBlocked, setFilter, fetchMoreData, state, isLoading } =
    useAccountsList();

  return (
    <>
      <FilterInput
        name="filter"
        chakra
        placeholder="Search Account"
        onChange={setFilter}
      />
      <HStack justifyContent="space-between" mt={1} pl={1}>
        <RiveryCheckbox
          name="inactive-accounts"
          label="Show inactive accounts"
          id="hide-blocked-accounts"
          onChange={() => toggleBlocked()}
        />
        {headerChildren}
      </HStack>

      <Box>
        <InfiniteScrollComponent
          fetchMoreData={fetchMoreData}
          list={state.data}
          hasMore={Boolean(state.next_token)}
          isFetching={isLoading}
          listHeight="calc(100vh - 240px)"
          ariaLabel="accounts list"
          component={({ item }) => (
            <AccountBox
              item={item}
              selectedAccountId={selectedAccountId}
              mode={mode}
            />
          )}
          rowHeight={80}
        />
      </Box>
    </>
  );
}

function AccountBox({
  item: { account_id = '', account_name, _id, is_active, ...account },
  selectedAccountId,
  mode,
}) {
  const { createUrl } = useNextRouteResolver();
  const getAccountUrl = (account, env) => () =>
    mode === Modes.MINIMAL
      ? getHomedUrl(account, env)
      : createUrl(account, env);

  return (
    <Box
      key={`account-selector-${getOId(_id)}`}
      borderBottom="1px solid"
      borderBottomColor="gray.300"
      overflow="hidden"
      {...{ mt: '0rem!important' }}
    >
      <RiveryButton
        isActive={selectedAccountId === getOId(_id)}
        variant="accountSelector"
        aria-label={account_name}
        justifyContent="start"
        w="full"
        height="60px"
        p={2}
        my={2}
        opacity={is_active ? 1 : 0.2}
        label={
          <Flex gap={2} flexDir="column" textAlign="left">
            <Text
              maxW={mode === Modes.FULL ? '500px' : '250px'}
              fontSize="md"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
              overflow="hidden"
              fontWeight="medium"
            >
              {account_name}
            </Text>
            <Text fontWeight="normal">
              {account?.owner_email
                ? account.owner_email
                : account_id.toUpperCase()}
            </Text>
          </Flex>
        }
        onClick={navigateCallback(
          getAccountUrl(getOId(_id), EnvironmentDefault.DEFAULT),
        )}
      />
    </Box>
  );
}

const getHomedUrl = (account, env) => {
  return RoutesBuilder.home({
    account,
    env: env || 'none',
  });
};

export const useNextRouteResolver = () => {
  // enable commented lines if required to support any non-existing url
  // const location = useLocation<{ from: string }>();
  const { selectedAccountId, envId } = useCore();
  // const fromUrl = location.state?.from;

  const createFromCurrentUrl = (url, account, env) =>
    url
      .replace(`/${selectedAccountId}`, `/${account}`)
      .replace(`/${envId}`, `/${env}`);

  const createUrl = (account, env) => {
    const url = (window as Window).location.pathname;
    // if no envid or nor environment in url move to home
    return !envId || url.indexOf(envId) < 0
      ? RoutesBuilder.home({
          account,
          env: env || 'none',
        })
      : createFromCurrentUrl(url, account, env);
  };
  return { createUrl };
};

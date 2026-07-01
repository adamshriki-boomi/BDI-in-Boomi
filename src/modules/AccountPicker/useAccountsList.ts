import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import {
  useGetAccountsNextPageQuery,
  useGetAccountsQuery,
} from './accounts.query';

export function useAccountsList() {
  const [filter, setFilter] = useState('');
  const [shouldDisplayBlockedAccounts, toggleBlocked] = useToggle(false);
  const [fetchNext, toggleFetchNext] = useToggle(false);
  const { user } = useCore();

  const [state, setState] = useState<{
    data: any[];
    next_token: string;
  }>({ data: [], next_token: null });

  const filters = useMemo(
    () => ({
      ...(shouldDisplayBlockedAccounts && { include_blocked: true }),
      search: filter,
    }),
    [filter, shouldDisplayBlockedAccounts],
  );

  const { data: accounts, isLoading } = useGetAccountsQuery(
    {
      queryString: Object.keys(filters)
        .map(key => key + '=' + filters[key])
        .join('&'),
      token: user?.refresh_token,
    },
    { skip: !user?.refresh_token, refetchOnMountOrArgChange: true },
  );

  const { data: next_accounts } = useGetAccountsNextPageQuery(
    { url: state.next_token, token: user?.refresh_token },
    { skip: !fetchNext, refetchOnMountOrArgChange: true },
  );

  useEffect(() => {
    if (accounts) {
      setState({ data: accounts.items, next_token: accounts.next_page });
    }
  }, [accounts]);

  useEffect(() => {
    if (next_accounts && state.data && toggleFetchNext) {
      setState(state => {
        const currState = [...state.data];
        return {
          next_token: next_accounts.next_page,
          data: currState.concat(next_accounts.items),
        };
      });
      toggleFetchNext(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [next_accounts, toggleFetchNext]);

  const fetchMoreData = useCallback(() => {
    if (Boolean(state?.next_token)) {
      toggleFetchNext(true);
    }
  }, [state?.next_token, toggleFetchNext]);

  return {
    fetchMoreData,
    toggleBlocked,
    setFilter,
    state,
    isLoading,
  };
}

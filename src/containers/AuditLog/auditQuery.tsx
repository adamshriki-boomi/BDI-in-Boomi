import { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { createRiveryApiV1AccountEnv } from 'store/createRiveryApi';
import { getTimeNow } from 'utils/date.utils';
import { createSearchParam, parseSearchParams } from 'utils/searchParams';

export const auditApi = createRiveryApiV1AccountEnv
  .enhanceEndpoints({
    addTagTypes: ['AuditLogs'],
  })
  .injectEndpoints({
    endpoints: builder => ({
      getAuditLogs: builder.query<any, any>({
        providesTags: ['AuditLogs'],
        query: url => url,
      }),
    }),
  });

export const { useLazyGetAuditLogsQuery } = auditApi;

const createDefaultParams = () => ({
  entity_type: [],
  event_type: [],
  ...getTimeNow(),
});

export const useAuditLogFilters = (onChange = undefined) => {
  const { replace } = useHistory();
  const [params, setParams] = useState<any>(
    window.location.search.length
      ? { ...getTimeNow(), ...parseSearchParams() }
      : getTimeNow(),
  );

  const api = useMemo(
    () => ({
      setParam: (props: Record<string, any>) => {
        onChange && onChange();
        replace({
          search: createSearchParam({ ...params, ...props }, true),
        });
        setParams(state => ({ ...state, ...props }));
      },
      resetParams: () => {
        onChange && onChange();
        replace({
          search: createSearchParam(createDefaultParams()),
        });
        setParams(createDefaultParams());
      },
    }),
    [replace, params, onChange],
  );
  return {
    params,
    api,
  };
};

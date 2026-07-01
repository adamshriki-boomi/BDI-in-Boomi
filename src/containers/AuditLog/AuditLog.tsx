import { Box, Flex, Text } from '@chakra-ui/react';
import {
  Breadcrumbs,
  GridBox,
  InfiniteScrollComponent,
  NoResults,
  PageOverlaySpinner,
} from 'components';
import { EnableFeatureModal } from 'containers/Login/components/EnableFeatureModal';
import { useToastComponent } from 'hooks/useToast';
import React, { useCallback, useEffect, useState } from 'react';
import { useEffectOnce, useToggle } from 'react-use';
import { useAccount, useCore } from 'store/core';
import { getTimeNow } from 'utils/date.utils';
import { stringifyParams } from 'utils/searchParams';
import { AuditLogItem } from './AuditLogEntry';
import AuditLogFilters from './AuditLogFilters';
import { useAuditLogFilters, useLazyGetAuditLogsQuery } from './auditQuery';

const stringifyUrlParams = (url, params) => `${url}?${stringifyParams(params)}`;

export interface IAuditLogItem {
  account: string;
  entity_logical_key: string;
  entity_type: string;
  entity_name: string;
  entity_subtype: string;
  env_id: string;
  event_id: string;
  event_initiator: string;
  event_result_status: number;
  event_datetime: string;
  event_type: string;
  user_id: string;
  version_id: string | null;
  user_name: string;
  additional_info: string;
}
enum LogsActionType {
  REPLACE = 'replace',
  CONCAT = 'concat',
  DEFAULT = 'default',
}

export default function AuditLog() {
  const { error } = useToastComponent();
  const { params, api } = useAuditLogFilters();
  const { isSuperAdminUser } = useCore();
  const { isSettingOn } = useAccount();
  const showAuditLog = isSettingOn('allow_audit_log') || isSuperAdminUser;
  const [state, setState] = useState<{
    data: IAuditLogItem[];
    next_token: string;
  }>({ data: null, next_token: null });

  const [getLogs, { isFetching, isLoading, error: fetchLogsFailed }] =
    useLazyGetAuditLogsQuery();
  const isPageLoading = isLoading || isFetching;

  const getFunction = useCallback(
    action =>
      getLogs(
        action === LogsActionType.DEFAULT
          ? stringifyUrlParams(`audit_events`, getTimeNow())
          : action === LogsActionType.REPLACE
          ? stringifyUrlParams(`audit_events`, params)
          : state.next_token,
      )
        .then(logs => {
          const items = logs?.data?.items;
          setState(state => {
            const currState = state?.data ? [...state.data] : [];

            return {
              data:
                action === LogsActionType.CONCAT
                  ? currState.concat(items)
                  : items,
              next_token: logs?.data?.next_page,
            };
          });
        })
        .catch(e => {
          throw e;
        }),
    [getLogs, params, state.next_token],
  );

  if (fetchLogsFailed) {
    error({
      duration: 30000,
      description:
        (fetchLogsFailed as any)?.data?.detail ?? 'Failed to fetch audit logs',
    });
  }

  const fetchLogs = useCallback(
    async (action: LogsActionType) => {
      await getFunction(action);
    },
    [getFunction],
  );

  useEffectOnce(() => {
    if (showAuditLog) {
      fetchLogs(LogsActionType.REPLACE);
    }
  });

  const fetchMoreData = useCallback(() => {
    if (state.next_token && state.next_token !== '') {
      fetchLogs(LogsActionType.CONCAT);
    }
  }, [fetchLogs, state.next_token]);

  const [openUpgradeModal, toggleUpgradeModal] = useToggle(!showAuditLog);
  useEffect(() => {
    fetchLogs(LogsActionType.REPLACE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <GridBox
      backgroundColor="white"
      m={3}
      p={4}
      h="full"
      overflow="hidden"
      gridTemplateRows="min-content 1fr"
    >
      <Breadcrumbs links={auditLinks} />

      <Flex flexDirection="column" gap={3} overflow="auto">
        <Flex borderBottom="1px solid #E4E5E6" pt={4} pb={2} mb={2}>
          <Text fontSize={24} fontWeight="medium">
            Audit Log
          </Text>
        </Flex>
        {isPageLoading ? <PageOverlaySpinner /> : null}
        <AuditLogFilters
          params={params}
          onChange={api.setParam}
          resetFilters={() => {
            api.resetParams();
            fetchLogs(LogsActionType.DEFAULT);
          }}
        />
        {state?.data?.length === 0 ? (
          <Box mt={8}>
            <NoResults />
          </Box>
        ) : (
          <InfiniteScrollComponent
            ariaLabel="audit log list"
            fetchMoreData={fetchMoreData}
            list={state.data}
            component={AuditLogItem}
            rowHeight={60}
            hasMore={Boolean(state.next_token)}
            isFetching={isPageLoading}
          />
        )}
      </Flex>
      <EnableFeatureModal
        feature="audit"
        show={openUpgradeModal}
        toggle={toggleUpgradeModal}
      />
    </GridBox>
  );
}
const auditLinks = [{ label: 'Settings' }, { label: 'Audit Log' }];

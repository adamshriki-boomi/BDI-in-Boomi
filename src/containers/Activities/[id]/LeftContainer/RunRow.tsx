import { StatusTypes } from 'api/types';
import {
  Flex,
  HStack,
  Icon,
  ListItem,
  RiveryOverlay,
  StatusWithTooltip,
  Text,
  UnorderedList,
} from 'components';
import { ExclamationCircle } from 'components/Icons/components';
import { Tagger } from 'components/Tracking/Tagger';
import { RPUDisplay } from 'containers/Activities/components/RPUDisplay';
import {
  CancelRunButton,
  displayCancelButton,
} from 'containers/Activities/[id]/components/CancelRunButton';
import { useSearchParam } from 'react-use';
import {
  displayDate,
  durationFromMilSeconds,
  patternDate,
} from 'utils/date.utils';
import { ActivitiesTags } from 'utils/tracking.tags';
import { useViewParamResolver } from '../components/ViewRadios';
import { RUN_ID_PARAM } from '../params';
import { gridTemplateColumns } from './RiverRuns';
import { RowLink } from './RowLink';

export function RunRow({ item: run, index }) {
  const runId = useSearchParam(RUN_ID_PARAM);
  // const { activityPageType } = useActivityPageType();

  const { isRunsView } = useViewParamResolver();
  // const showRetryButton =
  //   run.status === StatusTypes.FAILED &&
  //   activityPageType !== ActivityPageTypes.MULTI;
  const isRunSkipped = run.status === StatusTypes.SKIPPED;
  return (
    <RowLink
      aria-label={`run-${index}`}
      enabled={runId === run?.run_group_id}
      templateColumns={gridTemplateColumns(isRunsView)}
      to={run?.run_group_id}
    >
      <HStack>
        <StatusWithTooltip value={run?.status} />
        <Flex minW="135px">
          {displayDate(run?.run_date_epoch_milliseconds, patternDate)}
        </Flex>
      </HStack>
      <Flex minW="130px">
        {durationFromMilSeconds(run?.max_duration_in_milliseconds)}
      </Flex>
      <Flex minW="50px">
        <Flex m={1} minW="50px">
          <RPUDisplay value={run?.rpu} />
        </Flex>
      </Flex>
      <Flex minW="70px" mx={2} alignItems="center">
        {isRunSkipped ? (
          <RiveryOverlay
            portal
            description={
              <Flex flexDir="column" p={2} gap={1}>
                <Text fontWeight="medium">Data Flow was already running.</Text>
                <Text>
                  To avoid any further issues, <br />
                  please check the following: <br />
                </Text>
                <UnorderedList>
                  <ListItem>Data Flow Scheduling</ListItem>
                  <ListItem>Manual Operation</ListItem>
                  <ListItem>API Configuration</ListItem>
                </UnorderedList>
              </Flex>
            }
          >
            <HStack color="font" fontWeight="medium" fontSize="xs">
              <Text>Run Skipped</Text>
              <Icon as={ExclamationCircle} />
            </HStack>
          </RiveryOverlay>
        ) : null}
        {/* {showRetryButton ? (
          <Tagger tags={ActivitiesTags.RETRY_BUTTON_CLICKED}>
            <RetryButton _id={run.run_group_id} ariaLabel="retry run" />
          </Tagger>
        ) : null} */}
        {displayCancelButton(run) ? (
          <Tagger tags={ActivitiesTags.CANCEL_BUTTON_CLICKED}>
            <CancelRunButton run_group_id={run.run_group_id} />
          </Tagger>
        ) : null}
      </Flex>
    </RowLink>
  );
}

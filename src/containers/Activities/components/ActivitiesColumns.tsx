import { RiverTypes } from 'api/types';
import { AppRoutes, LegacyRoutes } from 'app/routes';
import {
  Center,
  DvrIcon,
  Grid,
  HStack,
  Icon,
  Image,
  InfoTooltip,
  RiveryInfoTooltip,
  RiveryOverlay,
  ScheduleIcon,
  Text,
} from 'components';
import Dot from 'components/Dot/Dot';
import { Tagger } from 'components/Tracking/Tagger';
import { useGroups } from 'containers/River/components/Groups/useGroups';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import { useSourceByType } from 'modules/Datasources/useSourceByType';
import { useEffect, useState } from 'react';
import { MdOpenInNew } from 'react-icons/md';
import { generatePath, Link, useParams } from 'react-router-dom';
import { Column } from 'react-table';
import { getOId } from 'utils/api.sanitizer';
import { displayDate, getTimeZone } from 'utils/date.utils';
import { ActivitiesTags } from 'utils/tracking.tags';
import { pickQueryParams } from 'utils/searchParams';
import { useFetchActivities } from '../useFetchActivities';
import { RPUDisplay } from './RPUDisplay';
import { RunsBarCharts } from './RunsBarCharts';
import { StatusDisplay } from './StatusDisplay';

const ICON_SIZE = 4;
export const activitiesColumns: Column[] = [
  {
    Header: ScheduledFilterHeader,
    styleProps: { pl: 4 },
    accessor: 'is_scheduled',
    Cell: ({ value }) => (
      <RiveryInfoTooltip
        buttonProps={{ cursor: 'default' }}
        icon={
          <Icon
            as={ScheduleIcon}
            color={value ? 'primary' : 'font-secondary'}
            boxSize={ICON_SIZE}
          />
        }
        description={value ? 'Scheduled Data Flow' : 'Unscheduled Data Flow'}
      />
    ),
    weight: 'min-content',
  },
  {
    Header: () => (
      <Tagger tags={ActivitiesTags.SORT_BY_NAME}>
        <Text>Data Flow Name</Text>
      </Tagger>
    ),
    accessor: 'river_name',
    Cell: RiverName,
    sortBy: 'river_name',
    weight: 'minmax(320px, 1fr)',
    styleProps: { py: '0px!important' },
  },
  {
    Header: 'Data Flow Group',
    accessor: 'group_id',
    Cell: RiverGroup,
    weight: '250px',
  },
  {
    Header: LastRunTime,
    Cell: ({ value }) => <Text>{displayDate(value, 'dd-MMM-yy, HH:mm')}</Text>,
    accessor: 'last_run',
    sortBy: 'last_run',
    weight: '150px',
  },
  {
    Header: 'Activity Stats',
    Cell: ActivitiesStatusDisplay,
    weight: '250px',
    headerProps: {
      paddingLeft: 4,
    },
    styleProps: {
      p: 4,
      pr: 8,
    },
  },
  {
    Header: () => (
      <Tagger tags={ActivitiesTags.SORT_BY_RPU}>
        <Text>BDU</Text>
      </Tagger>
    ),
    accessor: 'units',
    Cell: RPUDisplay,
    weight: 'max-content',
    sortBy: 'units',
    styleProps: { whiteSpace: 'nowrap', pr: 12 },
  },
  {
    Header: LastRunsHeader,
    accessor: 'last_runs',
    Cell: RunsBarCharts,
    styleProps: { whiteSpace: 'nowrap' },
    weight: '260px',
  },
  {
    id: 'actions',
    Cell: Actions,
    weight: 'min-content',
  },
];

function LastRunTime() {
  return (
    <RiveryOverlay
      placement="auto"
      description={`Local Time (UTC ${getTimeZone()})`}
    >
      <HStack>
        <Text>Last Run Time</Text>
        <Icon as={InfoTooltip} />
      </HStack>
    </RiveryOverlay>
  );
}

function LastRunsHeader() {
  return (
    <RiveryOverlay
      placement="auto"
      description="Latest 30 runs from last 7 days"
    >
      <Text>Runs Segmentation</Text>
    </RiveryOverlay>
  );
}

function RiverName({
  value,
  row: {
    original: { datasource_id, cross_id },
  },
}) {
  const target = generatePath(AppRoutes.ACTIVITIES_RIVER_VIEW, {
    river: cross_id,
    ...useParams(),
  });

  return (
    <Tagger tags={{ 'river-name': value }}>
      <Grid
        w="full"
        h="full"
        alignItems="center"
        as={Link}
        gap={4}
        to={{
          pathname: target,
          search: pickQueryParams(['start_time', 'end_time', 'status']),
        }}
        templateColumns="max-content 1fr"
      >
        <DataSourceIcon type={datasource_id} boxWidth={12} />
        <RiveryOverlay placement="auto" description={value}>
          <Text
            textStyle="R7"
            aria-label={value}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
            color="var(--chakra-colors-font-link)"
            textDecoration="underline"
            _hover={{
              color: 'font-link-hover',
              textDecoration: 'underline',
            }}
          >
            {' '}
            {value}
          </Text>
        </RiveryOverlay>
      </Grid>
    </Tagger>
  );
}

export function RiverGroup({ value }) {
  const { groups } = useGroups();
  const group = groups.find(({ cross_id }) => getOId(cross_id) === value);
  return (
    <HStack>
      <Dot boxSize={5} color={group?.color} icon={group?.icon} />
      <RiveryOverlay description={group?.name}>
        <Text
          noOfLines={1}
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          maxWidth="200px"
          display="block"
        >
          {group?.name}
        </Text>
      </RiveryOverlay>
    </HStack>
  );
}

export function DataSourceIcon({ type, boxWidth = null }) {
  const sources = useSourceByType();
  const source = sources.get(type);
  return (
    <Center w={boxWidth ?? 'full'} h="full">
      <Image
        title={type}
        role="figure"
        aria-label={type}
        src={source?.icon}
        showSpinnerBefore={false}
        m="auto"
      />
    </Center>
  );
}

export const StatusIcon = props => <Icon boxSize={ICON_SIZE} {...props} />;
export function ActivitiesStatusDisplay({
  row: {
    original: { running, pending, succeeded, failed, canceled },
  },
}) {
  return (
    <StatusDisplay
      running={running}
      // TODO api returns waiting OR pending - this should be consistent accross
      pending={pending}
      succeeded={succeeded}
      failed={failed}
      canceled={canceled}
    />
  );
}

function ScheduledFilterHeader() {
  const [scheduled] = useState(null);
  const { api } = useFetchActivities();
  useEffect(() => {
    api.setParam({ is_scheduled: scheduled });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduled]);

  return (
    <Center w="full" h="full" pl={2} py={2} pr={0}>
      <Icon
        as={ScheduleIcon}
        color={
          scheduled === 'true'
            ? 'primary'
            : scheduled === 'false'
            ? 'icon-disabled'
            : 'unset'
        }
        boxSize={ICON_SIZE}
      />
    </Center>
  );
}

function Actions({
  row: {
    original: { datasource_id, cross_id, is_deleted },
  },
}) {
  const pattern =
    datasource_id === RiverTypes.LOGIC ? AppRoutes.RIVER : LegacyRoutes.RIVER;
  const riverURL = generatePath(pattern, {
    ...useParams(),
    river: cross_id,
  });
  const activitiesURL = generatePath(AppRoutes.ACTIVITIES_RIVER_VIEW, {
    river: cross_id,
    ...useParams(),
  });
  const items = [
    !is_deleted && {
      value: (
        <Tagger tags={ActivitiesTags.GO_TO_RIVER_ACTION}>
          <Text>Go to Data Flow</Text>
        </Tagger>
      ),
      icon: <Icon mt={1} boxSize={4} as={MdOpenInNew} />,
      href: riverURL,
      target: '_blank',
    },
    {
      value: (
        <Tagger tags={ActivitiesTags.GO_TO_ACTIVITIES_ACTION}>
          <Text>View Activities</Text>
        </Tagger>
      ),
      icon: <Icon mt={1} as={DvrIcon} color="brand" boxSize={4} />,
      href: `${activitiesURL}${window.location.search}`,
    },
  ];
  return <RiveryDropdown menuItems={items} />;
}

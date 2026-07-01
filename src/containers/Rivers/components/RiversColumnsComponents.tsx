import { useGenerateRiverPathByType } from 'app/routers/useGenerateRiverPathByType';
import { RoutesBuilder } from 'app/routes';
import {
  Box,
  HStack,
  Icon,
  Image,
  InfoTooltip,
  RenderGuard,
  RiveryInfoTooltip,
  RiveryOverlay,
  ScheduleIcon,
  Text,
} from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import Dot from 'components/Dot/Dot';
import { CustomSelectForm, SelectOptionType } from 'components/Form';
import {
  RiverGroupsQuerySelect,
  RiverTypeQuerySelect,
} from 'components/Form/components/FrequentComponents';
import SvgApiRiverTag from 'components/Icons/components/ApiRiverTag';
import { Tagger } from 'components/Tracking/Tagger';
import { useGroups } from 'containers/River/components/Groups/useGroups';
import { RiversTags } from 'utils/tracking.tags';
import { shouldAllowNewStt } from 'containers/River/RiverSourceToTarget/utils/stt.helper';
import { getScheduleText } from 'containers/River/Settings/components/ScheduleEditor';
import { getQueryParams } from 'hooks/router';
import { Link } from 'react-router-dom';
import { useCore } from 'store/core';
import { useGroupsState } from 'store/groups';
import { useRiverTypes } from 'store/riverTypes';
import { getCrossId, getOId } from 'utils/api.sanitizer';
import { compare, pluck } from 'utils/array.utils';
import { useIsNewInterface } from '../LegacyRiver';

const ICON_SIZE = 5;

export function RiverName({
  value,
  row: {
    original: {
      cross_id,

      river_definitions: { river_type_id, source, target },
      river_definitions,
    },
  },
  nameStyle = {},
}) {
  const sourceName = source?.name;
  const targetName = target?.name;
  const isNewInterface = useIsNewInterface(sourceName, targetName);
  const enableAppRoute =
    shouldAllowNewStt(river_type_id, river_definitions) && isNewInterface;
  const to = useGenerateRiverPathByType(
    river_type_id,
    cross_id,
    enableAppRoute,
  );
  const { name, icon } = source ?? {
    name: null,
    icon: 'dist/images/dataSources/missing_source.svg',
  };

  return (
    <Tagger tags={{ 'river-name': value }}>
      <HStack
        aria-label={value}
        title={value}
        w="full"
        h="full"
        alignItems="center"
        as={Link}
        to={to}
        {...nameStyle}
      >
        <Box w={14}>
          <Image
            src={icon}
            title={name}
            alt={name}
            height={ICON_SIZE}
            width="auto"
            m="auto"
            showSpinnerBefore={false}
          />
        </Box>
        <Text
          textStyle="R7"
          overflow="hidden"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
          color="var(--chakra-colors-font-link)"
          textDecoration="underline"
          _hover={{
            color: 'font-link-hover',
            textDecoration: 'underline',
          }}
        >
          {value}
        </Text>
      </HStack>
    </Tagger>
  );
}

export function RiverTypeSelect({ setFilter, column }) {
  const { river_type } = getQueryParams(['river_type']);
  const { riverTypes } = useRiverTypes();
  const options = riverTypes.map(({ type: value, title: label }) => ({
    value,
    label,
  }));
  const value = options?.find(compare('value', column.filterValue));
  return (
    <Tagger tags={RiversTags.RIVER_TYPE_DROPDOWN}>
      <RiverTypeQuerySelect
        value={river_type ? value : []}
        onChange={option =>
          setFilter(column.id, option ? (option as any).value : null)
        }
        isMulti={false}
      />
    </Tagger>
  );
}

const selectProps = {
  getOptionLabel: pluck<any, string>('name'),
  getOptionValue: getCrossId,
};

export function GroupsSelect({ setFilter, column }) {
  const { group_id } = getQueryParams(['group_id']);
  const { groups } = useGroupsState();
  const value =
    column.filterValue &&
    groups.find(compare('cross_id', column.filterValue, getOId));

  return (
    <Tagger tags={RiversTags.RIVER_GROUP_DROPDOWN}>
      <RiverGroupsQuerySelect
        label="Data Flow Group"
        value={group_id ? value : []}
        onChange={option =>
          setFilter(column.id, option ? getOId((option as any).cross_id) : null)
        }
        selectProps={selectProps}
        isMulti={false}
      />
    </Tagger>
  );
}

export function RiverGroup({
  row: {
    original: {
      river_definitions: {
        group_id: { _id },
      },
    },
  },
}) {
  const { groups } = useGroups();
  const group = groups.find(({ cross_id }) => getOId(cross_id) === getOId(_id));
  return (
    <HStack w="100%">
      <Dot boxSize={5} color={group?.color} icon={group?.icon} />
      <RiveryOverlay description={group?.name}>
        <Text
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          maxW="100%"
          display="block"
        >
          {group?.name}
        </Text>
      </RiveryOverlay>
    </HStack>
  );
}

export const ScheduleIndicator = ({
  value: is_scheduled,
  row: {
    original: {
      cross_id,
      river_definitions: { scheduled_time, river_type_id },
    },
  },
}) => {
  const { activeAccountId: account, envId: env } = useCore();

  const schedulePath =
    river_type_id === 'logic'
      ? RoutesBuilder.riverSettings({ account, env, river: getOId(cross_id) })
      : RoutesBuilder.legacyRiverSettings({
          accountId: account,
          envId: env,
          river: getOId(cross_id),
        });

  const value = (truncate = true) =>
    is_scheduled ? (
      <Text
        fontWeight="normal"
        overflow={truncate ? 'hidden' : 'none'}
        whiteSpace={truncate ? 'nowrap' : 'normal'}
        textOverflow={truncate ? 'ellipsis' : 'none'}
      >
        {getScheduleText(scheduled_time, scheduled_time, true)}
      </Text>
    ) : truncate ? (
      <Text color="font-secondary" />
    ) : null;

  return !Boolean(getScheduleText(scheduled_time, scheduled_time, true)) ? (
    <Icon as={ScheduleIcon} color="font-secondary" boxSize={4} mr={2} />
  ) : (
    <RiveryInfoTooltip
      extraProps={{ placement: 'top' }}
      icon={
        <RiveryButton
          paddingInlineStart="0px !important"
          justifyContent="start"
          as={Link}
          w="full"
          variant="text-link"
          to={schedulePath}
          title={
            is_scheduled
              ? getScheduleText(scheduled_time, scheduled_time)
              : 'click to schedule'
          }
          label={value()}
        />
      }
      description={value(false)}
    />
  );
};

export function ScheduledSelector({ setFilter, column }) {
  const { is_scheduled } = getQueryParams(['is_scheduled']);

  const options = [
    { label: 'Scheduled', value: 'true' },
    { label: 'Unscheduled', value: 'false' },
  ];
  const value =
    (column.filterValue &&
      options.find(compare('value', String(column.filterValue)))) ??
    [];
  return (
    <Tagger tags={RiversTags.SCHEDULED_DROPDOWN}>
      <CustomSelectForm
        label="Scheduled"
        aria-label="Scheduled"
        controlId="scheduled select"
        options={options}
        value={is_scheduled ? value : []}
        onChange={(option: SelectOptionType) =>
          setFilter(column.id, option ? String(option.value) : null)
        }
        chakra
        isClearable
        isMulti={false}
      />
    </Tagger>
  );
}

export function ScheduledV1Selector({ column: { getProps } }) {
  const { schedule } = getQueryParams(['schedule']);
  const { api } = getProps?.filtersApi;
  const options = [
    { label: 'Scheduled', value: 'scheduled' },
    { label: 'Unscheduled', value: 'unscheduled' },
  ];

  const selectedValue = options?.filter(({ value }) => schedule === value);
  const handleChange = option =>
    api.setParam({ schedule: option ? option.value : null });

  return (
    <Tagger tags={RiversTags.SCHEDULED_DROPDOWN}>
      <CustomSelectForm
        label="Scheduled"
        aria-label="Scheduled"
        controlId="scheduled select"
        options={options}
        onChange={handleChange}
        value={selectedValue}
        chakra
        isClearable
        isMulti={false}
      />
    </Tagger>
  );
}

export function RiverDescription({ value }) {
  return Boolean(value) ? (
    <RiveryInfoTooltip
      description={value}
      icon={<Icon as={InfoTooltip} color="font-secondary" />}
    />
  ) : null;
}

export function ApiTag({ value }) {
  return (
    <RenderGuard condition={value}>
      <RiveryInfoTooltip
        ariaLabel="apiV2"
        description="This Data Flow is managed by API"
        icon={
          <Icon as={SvgApiRiverTag} color="font-secondary" boxSize="auto" />
        }
      />
    </RenderGuard>
  );
}

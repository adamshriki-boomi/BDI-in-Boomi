import { GridProps } from '@chakra-ui/react';
import {
  Box,
  Flex,
  Grid,
  RiveryLogoCircleIcon,
  StatusIsRunning,
  Text,
  XCircle,
} from 'components';
import { spinAnimation } from 'containers/River/RiverLogic/Logic/components/ScriptEditor/EditorLayout';
import { getQueryParams } from 'hooks/router';
import { useCallback } from 'react';
import {
  HiOutlineCheckCircle,
  HiOutlineDotsCircleHorizontal,
} from 'react-icons/hi';
import { ActivitiesStatsResponse } from '../store/activities.types';
import { StatusIcon } from './ActivitiesColumns';
import { formatRpu } from './RPUDisplay';

enum StatusDisplayMode {
  MINI = 'mini',
  LARGE = 'large',
}
interface StatusDisplayProps
  extends Omit<ActivitiesStatsResponse, 'total_rpu' | 'account' | 'env_id'> {
  rpu?: number;
  mode?: StatusDisplayMode;
  api?: any;
}
StatusDisplay.Mode = StatusDisplayMode;
export function StatusDisplay({
  running,
  pending,
  succeeded,
  failed,
  rpu = null,
  mode = StatusDisplayMode.MINI,
  api = null,
}: StatusDisplayProps) {
  const isLarge = mode === StatusDisplayMode.LARGE;
  const displayRPU = rpu || rpu === 0;
  return (
    <Box
      gap={isLarge ? 4 : 1}
      gridTemplateColumns={
        isLarge ? 'repeat(auto-fit, minmax(150px, 1fr))' : 'unset'
      }
      as={isLarge ? Grid : Flex}
    >
      <StatBox
        icon={StatusIsRunning}
        value={running}
        colors={{ hasValue: 'background-brand', noValue: 'font-secondary' }}
        isLarge={isLarge}
        largeLabel="Running"
        api={api}
      />
      <StatBox
        icon={HiOutlineCheckCircle}
        value={succeeded}
        colors={{
          hasValue: 'background-success-strong',
          noValue: 'font-secondary',
        }}
        isLarge={isLarge}
        largeLabel="Succeeded"
        api={api}
      />
      <StatBox
        icon={XCircle}
        value={failed}
        colors={{
          hasValue: 'background-danger-strong',
          noValue: 'font-secondary',
        }}
        isLarge={isLarge}
        largeLabel="Failed"
        api={api}
      />
      <StatBox
        icon={HiOutlineDotsCircleHorizontal}
        value={pending}
        colors={{
          hasValue: 'background-deselected',
          noValue: 'font-secondary',
        }}
        isLarge={isLarge}
        largeLabel="Pending"
        api={api}
      />
      {/* <RenderGuard condition={!isLarge}>
        <StatBox
          icon={RdsSkipped}
          value={skipped}
          colors={{ hasValue: 'tagOrange', noValue: 'gray.300' }}
          isLarge={false}
          largeLabel="Skipped"
          api={api}
        />
      </RenderGuard> */}
      {/* <StatBox
        icon={MdOutlineDoNotDisturbAlt}
        value={canceled}
        colors={{ hasValue: 'gray.800', noValue: 'gray.300' }}
        isLarge={isLarge}
        largeLabel="Canceled"
      /> */}
      {displayRPU ? (
        <StatBox
          icon={RiveryLogoCircleIcon}
          value={formatRpu(rpu)}
          colors={{
            hasValue: 'background-selected',
            noValue: 'font-secondary',
          }}
          isLarge={isLarge}
          largeLabel="BDU"
        />
      ) : null}
    </Box>
  );
}

interface StatBoxProps extends GridProps {
  value: number;
  isLarge: boolean;
  largeLabel: string;
  icon: any;
  colors: Record<string, string>;
  api?: any;
}

function StatBox({
  value,
  isLarge,
  largeLabel,
  icon,
  colors,
  api = null,
}: StatBoxProps) {
  const isKValue = value > 999;
  const isMValue = value > 999999;
  const number = isLarge
    ? value?.toLocaleString('en')
    : isKValue
    ? `${(value / 1000).toFixed(1)}K`
    : isMValue
    ? `${(value / 1000000).toFixed(2)}M`
    : value;

  return isLarge ? (
    <LargeStatBox
      largeLabel={largeLabel}
      colors={colors}
      icon={icon}
      number={number}
      api={api}
    />
  ) : (
    <SmallStatBox value={value} icon={icon} number={number} colors={colors} />
  );
}

function LargeStatBox({ largeLabel, colors, icon, number, api }) {
  const buttonEffect = largeLabel !== 'BDU';
  const { status: statusFromUrl } = getQueryParams(['status']);
  const isStatusSelected =
    statusFromUrl === largeLabel.toLowerCase() ||
    statusFromUrl?.includes(largeLabel.toLowerCase());
  const onStatusFilter = useCallback(
    value => {
      if (buttonEffect) {
        if (!statusFromUrl) {
          api.setParam({ status: value });
          return;
        }
        if (typeof statusFromUrl == 'string') {
          if (statusFromUrl === value) {
            api.setParam({ status: '' });
            return;
          }
          const statusArray = [statusFromUrl];
          statusArray.push(value);
          api.setParam({ status: statusArray });
          return;
        }
        if (statusFromUrl.includes(value)) {
          const newArray = [...statusFromUrl.filter(s => s !== value)];
          api.setParam({ status: newArray });
          return;
        }
        const statusArray = [...statusFromUrl];
        statusArray.push(value);
        api.setParam({ status: statusArray });
        return;
      }
    },
    [api, buttonEffect, statusFromUrl],
  );

  return (
    <Grid
      gridTemplateColumns="1fr"
      alignItems="center"
      border="1px solid"
      borderColor={
        isStatusSelected ? 'background-selected' : 'border-secondary'
      }
      borderRadius="4"
      p={2}
      cursor={buttonEffect ? 'pointer' : 'default'}
      _hover={{
        bg: buttonEffect ? 'background-action-hover-weak' : 'transparent',
        borderColor: buttonEffect ? 'border' : 'border-secondary',
      }}
      bg={isStatusSelected ? 'background-selected-weak' : 'background'}
      onClick={() => onStatusFilter(largeLabel.toLowerCase())}
      aria-label={`${largeLabel.toLowerCase()}-status-box`}
    >
      <Flex mx="auto" alignItems="center">
        <StatusIcon
          as={icon}
          animation={
            icon === StatusIsRunning && number > 0
              ? `${spinAnimation} 2s linear infinite`
              : null
          }
          color={colors.hasValue}
        />
        <Text ml="1" mt="1px" fontWeight="medium">
          {largeLabel}
        </Text>
      </Flex>
      <Text
        mx="auto"
        color={colors.hasValue}
        fontSize="xx-large"
        fontWeight="bolder"
        noOfLines={1}
        textAlign="center"
        w="full"
      >
        {number}
      </Text>
    </Grid>
  );
}

function SmallStatBox({ value, icon, number, colors }) {
  return (
    <Grid gridTemplateColumns="16px 1fr" alignItems="center" p={0} w="50px">
      <Flex mx="auto" alignItems="center">
        <StatusIcon
          as={icon}
          animation={
            icon === StatusIsRunning && number > 0
              ? `${spinAnimation} 2s linear infinite`
              : null
          }
          color={value ? colors.hasValue : colors.noValue}
        />
      </Flex>
      <Text mx="auto" color={value ? colors.hasValue : colors.noValue} w="full">
        {number}
      </Text>
    </Grid>
  );
}

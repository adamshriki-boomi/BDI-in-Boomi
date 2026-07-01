import { Box, Center, Flex, Icon } from '@chakra-ui/react';
import { ExLoader, LoaderSize } from '@boomi/exosphere';
import { ExIcon, IconSize } from '@boomi/exosphere/dist/react/icon';
import { ExoText } from '../../components/Exosphere/ExoText';
import { InfoTooltip, RiveryInfoTooltip } from 'components';

function parseDisplayValue(s: string): number {
  const cleaned = String(s).replace(/,/g, '').replace(/%/g, '').trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function getChangePercent(current: string, previous: string): number {
  const curr = parseDisplayValue(current);
  const prev = parseDisplayValue(previous);
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
}

/** Small badge showing previous period percentage change. Shown inside KPI card. */
export function PreviousKpiChangeBadge({
  currentPeriodValue,
  previousPeriodValue,
}: {
  currentPeriodValue: string;
  previousPeriodValue: string;
}) {
  const changePercent = getChangePercent(
    currentPeriodValue,
    previousPeriodValue,
  );
  const isPositive = changePercent >= 0;
  const changeLabel =
    changePercent > 0
      ? `+${changePercent.toFixed(1)}%`
      : changePercent < 0
      ? `${changePercent.toFixed(1)}%`
      : '0%';

  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      gap={1}
      h="32px"
      padding="var(--exo-spacing-2x-small, 4px) var(--exo-spacing-x-small, 8px)"
      borderRadius={4}
      border="1px solid var(--exo-color-border-secondary)"
      bg="var(--exo-color-background)"
    >
      <ExIcon
        icon={isPositive ? 'direction-caret-up' : 'direction-caret-down'}
        size={IconSize.XS}
      />
      <ExoText
        styleName="Body Small 1 SemiBold UI"
        color="var(--exo-color-font)"
      >
        {changeLabel}
      </ExoText>
      <Box onClick={e => e.stopPropagation()}>
        <RiveryInfoTooltip
          description={
            <>
              {changeLabel} vs previous period
              <br />
              Previous period: {previousPeriodValue}
              <br />
              Current period: {currentPeriodValue}
            </>
          }
          buttonProps={{ minW: 0, p: 0 }}
          icon={
            <Icon
              as={InfoTooltip}
              boxSize="12px"
              color="var(--exo-color-font-secondary)"
            />
          }
        />
      </Box>
    </Flex>
  );
}

interface MetricBoxProps {
  label: string;
  value: string;
  selected?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
  showPreviousKpiChange?: boolean;
  previousPeriodValue?: string;
  'data-pendo-id'?: string;
}

export function MetricBox({
  label,
  value,
  selected,
  onClick,
  isLoading,
  showPreviousKpiChange,
  previousPeriodValue = '0',
  ...rest
}: MetricBoxProps) {
  return (
    <Box
      as="button"
      type="button"
      w="100%"
      h="104px"
      minH="104px"
      p={6}
      borderRadius="var(--exo-spacing-x-small, 8px)"
      border="var(--exo-spacing-4x-small, 1px) solid"
      borderColor={selected ? 'background-selected' : 'border-secondary'}
      bg={selected ? 'background-selected-weak' : 'background-secondary'}
      textAlign="left"
      cursor="pointer"
      transition="background-color 0.1s ease, border-color 0.1s ease"
      _hover={{
        bg: 'exo-color-background-secondary',
        borderColor: 'exo-color-border',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.15)',
      }}
      _active={{
        bg: selected
          ? 'background-selected-weak'
          : 'background-tertiary-selected-weak',
      }}
      _focusVisible={{
        outline: 'none',
        border: '2px solid',
        borderColor: 'background-action-hover',
      }}
      onClick={onClick}
      {...rest}
    >
      {isLoading ? (
        <Center h="100%">
          <ExLoader size={LoaderSize.MEDIUM} />
        </Center>
      ) : (
        <Box>
          <Flex alignItems="flex-start" justifyContent="space-between" gap={2}>
            <ExoText
              styleName="Headline 1 Bold"
              {...(selected && { color: 'var(--exo-color-font-link-hover)' })}
            >
              {value}
            </ExoText>
            {showPreviousKpiChange && (
              <PreviousKpiChangeBadge
                currentPeriodValue={value}
                previousPeriodValue={previousPeriodValue}
              />
            )}
          </Flex>
          <ExoText
            styleName="Body Small 1 UI"
            {...(selected && { color: 'var(--exo-color-font-link-hover)' })}
          >
            {label}
          </ExoText>
        </Box>
      )}
    </Box>
  );
}

/**
 * Presentational components for DashboardActivityD3Chart.
 * Contains isolated rendering logic with no state management, positioning calculations, or D3 dependencies.
 */

import { Box, Flex } from '@chakra-ui/react';
import type {
  TooltipState,
  TooltipStateGeneral,
  TooltipStateSource,
} from './DashboardActivityD3ChartTypes';
import { VIEWS } from './dashboard.query';
import { ExoText } from 'components/Exosphere/ExoText';

// ============================================================================
// Tooltip Component
// ============================================================================

interface DashboardActivityChartTooltipProps {
  tooltip: TooltipState;
  tooltipSubheader?: string;
  formatXLabel: (label: string) => string;
  formatValue: (value: number) => string;
  tooltipLeft: number;
  tooltipPointerLeft: string;
  maxWidth: number;
  generalViewColor?: string;
}

/**
 * Renders the interactive tooltip for the chart.
 * Displays either a single data point (general view) or a list of sources (source view).
 * This component is purely presentational — it receives all positioning, formatting,
 * and data via props and does not manage state, compute layout, or interact with D3.
 */
export function DashboardActivityChartTooltip({
  tooltip,
  tooltipSubheader,
  formatXLabel,
  formatValue,
  tooltipLeft,
  tooltipPointerLeft,
  maxWidth,
  generalViewColor = 'var(--exo-palette-green-40)',
}: DashboardActivityChartTooltipProps) {
  const sourceRows =
    tooltip.kind === VIEWS.SOURCE ? (tooltip as TooltipStateSource).rows : [];
  const numSources = sourceRows.length;
  const maxPerColumn = 6;
  const numColumns = Math.ceil(numSources / maxPerColumn);
  const tooltipWidth = numColumns > 1 ? maxWidth * numColumns : maxWidth;

  const columns: typeof sourceRows[] = [];
  if (numColumns > 1) {
    for (let i = 0; i < numColumns; i++) {
      columns.push(sourceRows.slice(i * maxPerColumn, (i + 1) * maxPerColumn));
    }
  }

  return (
    <Box
      position="absolute"
      left={tooltipLeft}
      top={tooltip.top - 16}
      transform="translate(-50%, -100%)"
      bg="var(--exo-palette-gray-80)"
      color="white"
      px={4}
      py={3}
      borderRadius="lg"
      fontSize="sm"
      zIndex={1}
      pointerEvents="none"
      w={`${tooltipWidth}px`}
      maxW={`${tooltipWidth}px`}
      boxShadow="lg"
      _after={{
        content: '""',
        position: 'absolute',
        left: tooltipPointerLeft,
        bottom: '-7px',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '8px solid transparent',
        borderRight: '8px solid transparent',
        borderTop: '8px solid var(--exo-palette-gray-80)',
      }}
    >
      <ExoText styleName="Subhead 2 Bold" color="white">
        {tooltip.kind === VIEWS.GENERAL
          ? formatXLabel((tooltip as TooltipStateGeneral).point.xLabel)
          : formatXLabel((tooltip as TooltipStateSource).xLabel)}
      </ExoText>
      {tooltipSubheader && tooltip.kind === VIEWS.SOURCE && (
        <ExoText styleName="Body Small 1 UI" color="white">
          {tooltipSubheader}
        </ExoText>
      )}
      {tooltip.kind === VIEWS.GENERAL ? (
        <Flex alignItems="center" justifyContent="space-between">
          <Flex alignItems="center" gap={2}>
            <Box
              boxSize="10px"
              borderRadius="2px"
              bg={generalViewColor}
              flexShrink={0}
            />
            <ExoText styleName="Body Small 1 UI" color="white">
              {(tooltip as TooltipStateGeneral).point.z || 'Series'}
            </ExoText>
          </Flex>
          <ExoText styleName="Body Small 1 Bold" color="white">
            {formatValue((tooltip as TooltipStateGeneral).point.y)}
          </ExoText>
        </Flex>
      ) : numColumns > 1 ? (
        <Box
          display="grid"
          gridTemplateColumns={`repeat(${numColumns}, 1fr)`}
          gap={4}
        >
          {columns.map((column, colIndex) => (
            <Box key={colIndex}>
              {column.map(r => (
                <Box
                  key={r.source}
                  display="grid"
                  gridTemplateColumns="auto 1fr auto"
                  gridTemplateRows="auto"
                  alignItems="center"
                  gap={2}
                  minH="32px"
                  mb={1}
                  bg={
                    (tooltip as TooltipStateSource).activeSource === r.source
                      ? 'exo-gray-60'
                      : 'transparent'
                  }
                  p={1}
                  borderRadius="md"
                  border="1px solid"
                  borderColor={
                    (tooltip as TooltipStateSource).activeSource === r.source
                      ? 'whiteAlpha.500'
                      : 'transparent'
                  }
                >
                  <Box
                    boxSize="10px"
                    borderRadius="2px"
                    bg={r.color}
                    flexShrink={0}
                  />
                  <Box
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    <ExoText styleName="Body Small 1 UI" color="white">
                      {r.source}
                    </ExoText>
                  </Box>
                  <Box textAlign="right" whiteSpace="nowrap">
                    <ExoText styleName="Body Small 1 Bold" color="white">
                      {formatValue(r.value)}
                    </ExoText>
                  </Box>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      ) : (
        <Box>
          {sourceRows.map(r => (
            <Box
              key={r.source}
              display="grid"
              gridTemplateColumns="auto 1fr auto"
              gridTemplateRows="auto"
              alignItems="center"
              gap={2}
              minH="32px"
              mb={1}
              bg={
                (tooltip as TooltipStateSource).activeSource === r.source
                  ? 'exo-gray-60'
                  : 'transparent'
              }
              p={1}
              borderRadius="md"
              border="1px solid"
              borderColor={
                (tooltip as TooltipStateSource).activeSource === r.source
                  ? 'whiteAlpha.500'
                  : 'transparent'
              }
            >
              <Box
                boxSize="10px"
                borderRadius="2px"
                bg={r.color}
                flexShrink={0}
              />
              <Box
                overflow="hidden"
                textOverflow="ellipsis"
                whiteSpace="nowrap"
              >
                <ExoText styleName="Body Small 1 UI" color="white">
                  {r.source}
                </ExoText>
              </Box>
              <Box textAlign="right" whiteSpace="nowrap">
                <ExoText styleName="Body Small 1 Bold" color="white">
                  {formatValue(r.value)}
                </ExoText>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

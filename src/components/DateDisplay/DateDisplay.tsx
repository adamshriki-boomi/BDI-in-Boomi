import { Flex, ResponsiveValue, Text } from '@chakra-ui/react';
import * as React from 'react';
import {
  displayDate,
  durationFromMilSeconds,
  patternDate,
} from 'utils/date.utils';

type DateDisplayProps = {
  /**
   * date in ms
   */
  value: number | string;
  display?: ResponsiveValue<any>;
};

export function DateDisplay({ value, display = 'flex' }: DateDisplayProps) {
  return <Flex display={display}>{displayDate(value, patternDate)}</Flex>;
}

export function DurationDisplay({ ms }: { ms: number }) {
  return <Text>{ms ? durationFromMilSeconds(ms) : 0}</Text>;
}

import {
  Flex,
  GridBox,
  HStack,
  Icon,
  InfoIcon,
  RiveryOverlay,
  Text,
} from 'components';
import React from 'react';

type ResultsStatsProps = {
  rows?: number;
  columns?: number;
  limit: number;
};
export const ResultsStats = ({ rows, columns, limit }: ResultsStatsProps) => {
  const isLimited = limit > 0 && rows >= limit;
  const textColor = rows === 0 ? 'gray.400' : undefined;

  return (
    <GridBox
      px={4}
      ml="auto"
      alignContent="center"
      justifyContent="center"
      className="results-stats"
    >
      <HStack gap={2}>
        <Flex>
          <Text mr="2px" color={textColor}>
            #Rows: {isLimited ? limit : rows}
          </Text>
          {isLimited ? (
            <RiveryOverlay
              description={`Results preview is limited to ${limit} rows`}
            >
              <Flex alignItems="center" flexWrap="wrap" gap={1}>
                (Limited)
                <Icon as={InfoIcon} />
              </Flex>
            </RiveryOverlay>
          ) : null}
        </Flex>
        <Text color={textColor} ml="3">
          #Columns: {columns}
        </Text>
      </HStack>
    </GridBox>
  );
};

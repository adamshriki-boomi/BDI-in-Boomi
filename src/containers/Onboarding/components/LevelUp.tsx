import { Flex, Grid, Text } from 'components';
import React from 'react';
import { LevelBox, LEVEL_UPS } from '../components/LevelBox';

export function LevelUp() {
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  return (
    <Flex
      flexDir="column"
      boxShadow="0px 4px 8px 0px rgba(0, 0, 0, 0.15)"
      px={6}
      py={4}
      gap={2}
      w="1100px"
      borderRadius={4}
      zIndex={1}
      bg="white"
      {...(!exoTheme && { bg: 'background-secondary' })}
    >
      <Text textStyle="M5">Leveling Up</Text>
      <Grid templateColumns="repeat(4, 1fr)" gap={2}>
        {Object.values(LEVEL_UPS).map((item, idx) => (
          <LevelBox key={idx} {...item} />
        ))}
      </Grid>
    </Flex>
  );
}

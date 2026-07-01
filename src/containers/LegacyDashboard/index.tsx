import { Flex, Grid } from 'components';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import React from 'react';
import { Welcome } from './components';
import { CreateSection } from './CreateSection';
import { RightSideHomePage } from './RightSection';

export default function HomePage() {
  useDocumentTitle('Home');
  return (
    <Flex
      flex={1}
      bg="background-secondary"
      flexDir="column"
      px={20}
      py={10}
      overflow="auto"
    >
      <Welcome />
      <Grid
        w="full"
        maxW="1800px"
        templateColumns="5fr minmax(400px, 2fr)"
        h="100vh"
        gap={8}
      >
        <CreateSection />
        <RightSideHomePage />
      </Grid>
    </Flex>
  );
}

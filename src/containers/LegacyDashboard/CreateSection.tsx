import { RoutesBuilder } from 'app/routes';
import {
  Box,
  Center,
  Flex,
  Grid,
  Icon,
  Kits,
  RiveryButton,
  Text,
} from 'components';
import { Tagger } from 'components/Tracking/Tagger';
import { RiverTypeBoxes } from 'containers/Onboarding/components/Steps/Step1';
import React from 'react';
import { Link } from 'react-router-dom';
import { useCore } from 'store/core';
import {
  getRiverCreationTag,
  RIVER_CREATION_TAG_ACTIONS,
} from 'utils/tracking.tags';

export function CreateSection() {
  return (
    <Center alignItems="baseline">
      <Flex maxW="782px" flexDir="column" gap={8} pt={6}>
        <Flex flexDir="column" gap={2}>
          <Text textStyle="M7">Create Your Data Pipelines & Workflows</Text>
          <RiverTypeBoxes />
        </Flex>
        <KitsSection />
      </Flex>
    </Center>
  );
}

function KitsSection() {
  const { selectedAccountId: accountId, envId } = useCore();
  return (
    <Grid
      alignItems="center"
      templateColumns="1fr 4fr"
      bg="white"
      border="1px solid"
      borderColor="gray.300"
      borderRadius={4}
      mr={4}
      w="full"
      pl={4}
    >
      <Icon as={Kits} boxSize="140px" color="primary" />
      <Flex flexDir="column" py={8} pl={2} pr={16} gap={1}>
        <Text textStyle="M6">Want to Move Faster? Pick a Kit</Text>
        <Text textStyle="R8" color="font-secondary">
          Data Integration Kits are pre-built data workflow templates, which
          include: data models, pipelines, transformations, table schemas, and
          orchestration logic, all based on data engineering best practices,
          that can be deployed in minutes.
        </Text>
        <Box>
          <Tagger
            tags={getRiverCreationTag('home', RIVER_CREATION_TAG_ACTIONS.KITS)}
          >
            <RiveryButton
              size="small"
              mt={2}
              label="Browse Kits"
              variant="outlined-primary"
              to={RoutesBuilder.kits({ accountId, envId })}
              as={Link}
            />
          </Tagger>
        </Box>
      </Flex>
    </Grid>
  );
}

import {
  Box,
  Flex,
  Grid,
  Icon,
  RiveryButton,
  SearchIcon,
  Text,
} from 'components';
import { ComplexInputField } from 'components/Form';
import React, { useState } from 'react';

const PopularSearches = [
  {
    label: 'Getting Started',
    section: 'docs/Atomsphere/Data_Integration/GettingStarted/start-here',
  },
  {
    label: 'Sources',
    section: 'docs/Atomsphere/Data_Integration/Sources/sources-overview',
  },
  {
    label: 'Targets',
    section:
      'https://help.boomi.com/docs/Atomsphere/Data_Integration/Targets/targets-overview',
  },
  {
    label: 'Kits',
    section: 'docs/Atomsphere/Data_Integration/GettingStarted/kits-overview',
  },
  {
    label: 'API Docs',
    section:
      'docs/Atomsphere/Data_Integration/RESTAPI/dataintegration-api-overview',
  },
  {
    label: 'Release Notes',
    section: 'docs/Atomsphere/Release_Notes/Data_Integration/',
  },
];

export function DocsSearchSection() {
  const docLink = 'https://help.boomi.com/';
  const [filter, setFilter] = useState(null);
  return (
    <Flex flexDir="column" gap={1} pb={4}>
      <ComplexInputField
        size="md"
        inputProps={{
          type: 'search',
          icon: <Icon as={SearchIcon} boxSize={4} mx={2} />,
          placeholder: 'Search our documentation...',
          size: 'md',
          pl: 8,
          bg: 'gray.50',
          value: filter,
          onChange: ev => setFilter(ev.target.value),
        }}
        buttonProps={{
          label: 'Search',
          variant: 'default',
          onClick: () =>
            window.open(`${docLink}searchResults?q=${filter}`, '_blank'),
        }}
      />
      <Box>
        <Grid
          fontSize="xs"
          templateColumns={`max-content repeat(${PopularSearches.length}, min-content)`}
        >
          <Text pr={1}>Popular searches:</Text>
          {PopularSearches.map(({ label, section }, idx) => (
            <Flex alignItems="center" key={label}>
              <RiveryButton
                label={label}
                variant="link"
                size="sm"
                fontWeight="normal"
                fontSize="xs"
                minW={0}
                maxW="fit-content"
                href={`${docLink}${section}`}
                target="_blank"
              />
              {idx !== PopularSearches.length - 1 && <Text mr={1}>,</Text>}
            </Flex>
          ))}
        </Grid>
      </Box>
    </Flex>
  );
}

import {
  Box,
  Button,
  Grid,
  Heading,
  Icon,
  useClipboard,
} from '@chakra-ui/react';
import React from 'react';

export function ComponentsPackage({ filter, icons, path }) {
  return (
    <Box>
      <Heading
        color="purple.600"
        position="sticky"
        top="0"
        py="4"
        bgColor="whiteAlpha.800"
        zIndex="10"
        shadow="lg"
      >
        {path}
      </Heading>
      <Grid
        gridTemplateColumns="repeat( auto-fit, minmax(180px, 1fr) )"
        gridGap="10"
      >
        {Object.entries(icons).map(([key, Component]) =>
          key.toLowerCase().includes(filter.toLowerCase()) ? (
            <Grid
              key={key}
              position="relative"
              justifyItems="center"
              borderRadius="sm"
              shadow="lg"
              p="3"
            >
              <Icon as={Component as any} boxSize="14" />
              <ButtonCopy label={key} />
            </Grid>
          ) : null,
        )}
      </Grid>
    </Box>
  );
}

function ButtonCopy({ label }) {
  const { onCopy, hasCopied } = useClipboard(label);
  return (
    <Button onClick={onCopy}>
      {label}
      {hasCopied ? ' ...COPIED!' : ''}
    </Button>
  );
}

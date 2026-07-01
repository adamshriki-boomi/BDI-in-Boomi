import { Box, Center, Grid } from '@chakra-ui/react';
import { Plus } from 'components/Icons';
import { Flex, Icon, Text } from 'components/index';
import { VIcon } from 'modules/Billing/icons';
import React from 'react';

export function UpgradeModal({
  title,
  leftImage,
  features,
  moreFeaturesTitle,
  moreFeatures,
  Action,
}) {
  return (
    <Grid
      color="font"
      gap={6}
      px={6}
      alignItems="center"
      templateColumns="375px 1fr"
    >
      <Center>{leftImage}</Center>
      <Flex gap={4} flexDir="column">
        <Text
          className="brand-title"
          textStyle="M3"
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <Box>
          {features.map(feature => (
            <Flex lineHeight={2} key={feature}>
              <Icon
                color="background-selected"
                as={VIcon}
                w={13}
                h={13}
                m={2}
              />
              {feature}
            </Flex>
          ))}
        </Box>
        <Box
          borderRadius={4}
          borderWidth="1px"
          borderColor="yellow.200"
          mt={1}
          px={2}
          py={1}
          width="fit-content"
          minW="400px"
        >
          <Text
            textStyle="R7"
            px={2}
            mx={2}
            bg="background-secondary"
            mt="-11px"
            width="fit-content"
            dangerouslySetInnerHTML={{ __html: moreFeaturesTitle }}
          />
          <Box>
            {moreFeatures.map(feature => (
              <Flex lineHeight={2} key={feature}>
                <Icon color="yellow.200" as={Plus} w={13} h={13} m={2} />
                {feature}
              </Flex>
            ))}
          </Box>
        </Box>
        <Action />
      </Flex>
    </Grid>
  );
}

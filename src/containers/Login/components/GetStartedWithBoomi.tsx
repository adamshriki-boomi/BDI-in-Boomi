import React from 'react';
import { RiveryLogoIcon, Box, Flex, Icon, Text } from 'components';
import { InputLabel } from '../../../components/Form';
import { Link } from '@chakra-ui/react';

export function GetStartedWithBoomi() {
  const subject = encodeURIComponent('Access Request: Boomi Data Integration');
  const body = encodeURIComponent(
    `Hi Boomi Team,\n\nI have a Boomi account and would like access to the Data Integration feature.\n\nThanks,\n`,
  );
  const mailto = `mailto:sales@boomi.com?subject=${subject}&body=${body}`;

  return (
    <Box
      w={'436px'}
      h={'76px'}
      bgColor="exo-color-background-warning"
      borderRadius={5}
      border="1px solid"
      borderColor="exo-color-background-warning-strong"
    >
      <Flex
        gap="6"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        h="100%"
      >
        <Icon as={RiveryLogoIcon} h="40px" w="40px" />
        <Flex flexDir="column" alignItems="flex-start" justifyContent="center">
          <InputLabel label="Have a Boomi account?" variant="semibold" />
          <Text fontSize="14px">
            Email{' '}
            <Link color="font-link" href={mailto}>
              sales@boomi.com
            </Link>{' '}
            to get started
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}

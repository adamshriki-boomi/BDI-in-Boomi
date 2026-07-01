import {
  Button,
  forwardRef,
  HStack,
  MenuButton,
  useStyleConfig,
} from '@chakra-ui/react';
import { Box, ChevronDown, Flex, Icon, PlusIcon, Text } from 'components';
import { riverItemsSmall } from 'containers/Onboarding/components/Steps/Step1';
import RiveryDropdown from 'containers/River/RiverLogic/Logic/components/RiveryChakraMenu';
import { FeatureEnabler } from 'modules';
import { Link } from 'react-router-dom';
import { useAccount, useCore } from 'store/core';
import { useRiverRouteBuilder } from 'utils/create-river.helpers';
import { RiversTags } from 'utils/tracking.tags';

const CreateRiversMenuButton = forwardRef((props, ref) => {
  const { isAccountBlocked, isAccountActive } = useCore();
  const { isViewerRole } = useAccount();
  const buttonStyles = useStyleConfig('Button', {
    variant: 'primary',
    size: 'base',
  });
  return (
    <FeatureEnabler scope="river:edit">
      <MenuButton
        ref={ref}
        w="175px"
        {...props}
        as={Button}
        __css={buttonStyles}
        fontWeight="medium"
        aria-label="New Data Flow"
        data-pendo-id={RiversTags.ADD_RIVER_BUTTON}
        px={2.5}
        py={2}
        borderRadius={4}
        pointerEvents={
          isAccountBlocked || !isAccountActive || isViewerRole ? 'none' : 'all'
        }
      >
        <Flex alignItems="center" gap={2}>
          <Icon as={PlusIcon} color="white" boxSize="18px" />
          Add Data Flow
          <Icon as={ChevronDown} color="white" boxSize={4} />
        </Flex>
      </MenuButton>
    </FeatureEnabler>
  );
});

export function CreateRiverDropdown() {
  const items = riverItemsSmall.map((river, idx) => ({
    value: <RiverItem key={idx} {...river} />,
    p: '0px!important',
    divider: true,
  }));

  return (
    <RiveryDropdown
      menuItems={items}
      customMenuButton={CreateRiversMenuButton}
      menuListStyle={{
        p: '0px!important',
        boxShadow: '0px 6px 16px 0px rgba(0, 0, 0, 0.12)',
      }}
    />
  );
}

function RiverItem({ icon, type, description, title }) {
  const { createLinkByRiverType } = useRiverRouteBuilder();
  return (
    <Flex
      flexDir="column"
      cursor="pointer"
      as={Link}
      to={createLinkByRiverType({ type })}
      aria-label={type}
      role="link"
    >
      <Flex flexDir="column" mt={1} gap={2} py={2}>
        <Box color="font">
          <HStack color="inherit" pl={4}>
            <Icon boxSize="18px" as={icon} color="inherit" />
            <Text fontWeight="medium" fontSize="sm" color="inherit">
              {title}
            </Text>
          </HStack>
        </Box>
        <Box w="270px" overflow="hidden" color="font-secondary" mx={4}>
          <Text color="inherit" fontSize="xs">
            {description}
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
}

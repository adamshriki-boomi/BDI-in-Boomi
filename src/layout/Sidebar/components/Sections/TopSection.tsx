import { RoutesBuilder } from 'app/routes';
import {
  ChevronLeft,
  ChevronRight,
  Flex,
  Icon,
  IconButton,
  RiveryLogoIcon,
  RTextLogo,
} from 'components';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCore } from 'store/core';
import { CreateRiver } from '../CreateRiver';
import { EnvironmentView } from '../EnvironmentsView';

export function HeaderSection({ isOpen, setOpen, setDrawer, drawerType }) {
  const { envId, selectedAccountId: accountId } = useCore();
  const toggleAll = useCallback(() => {
    setOpen(state => !state);
  }, [setOpen]);

  return (
    <Flex
      onClick={e => e.stopPropagation()}
      overflow="hidden"
      flexDir="column"
      borderBottom="1px solid"
      borderBottomColor="purple.400"
    >
      <Flex
        height="60px"
        bg="brand"
        p={1}
        pl={isOpen ? 6 : 4}
        position="relative"
      >
        <Flex
          cursor="pointer"
          as={Link}
          to={RoutesBuilder.home({ accountId, envId })}
          alignItems="center"
          onClick={() => setDrawer(null)}
        >
          {isOpen ? (
            <Icon as={RTextLogo} height="50px" width="155px" />
          ) : (
            <Icon mx={2} as={RiveryLogoIcon} boxSize={8} />
          )}
        </Flex>
        <IconButton
          _hover={{ bg: 'primaryLighter' }}
          borderRadius="4px 0px 0px 4px"
          size="xxs"
          position="absolute"
          right={0}
          top={4}
          bg="purple.500"
          icon={
            <Icon
              as={isOpen ? ChevronLeft : ChevronRight}
              boxSize={3}
              color="background-secondary"
            />
          }
          aria-label="expand"
          onClick={toggleAll}
        />
      </Flex>
      <EnvironmentView
        isOpen={isOpen}
        setDrawer={setDrawer}
        drawerType={drawerType}
      />
      <CreateRiver
        isOpen={isOpen}
        setDrawer={setDrawer}
        drawerType={drawerType}
      />
    </Flex>
  );
}

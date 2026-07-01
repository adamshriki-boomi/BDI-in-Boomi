import {
  CloseIconSmall,
  ContainerSplitter,
  Flex,
  HStack,
  Icon,
  RdsActivities,
  Text,
  TransparentIconButton,
  View,
} from 'components';
import { useDismissDrawer, useIsInsideRiver } from 'modules/RiverRightBar';
import { useRiver } from 'store/river';
import { RiverHeader } from './components/RiverHeader';
import { LeftContainer } from './LeftContainer';
import { RightContainer } from './RightContainer';
import { SearchComponent } from './SearchComponent';

export default function ActivitiesRiverView() {
  const inRiver = Boolean(useIsInsideRiver());
  return (
    <View as={Flex} p={3} flexDir="column" gap="4" overflow="hidden" h="full">
      <RiverActivityShell showHeader={!inRiver}>
        <RightContainer />
      </RiverActivityShell>
    </View>
  );
}

function RiverActivityShell({ children = null, showHeader }) {
  return (
    <Flex flexDir="column" gap={2} h="full">
      {showHeader ? <RiverHeader /> : <ActivitiesDrawerHeader />}
      <Flex flexDir="column" gap={2} p={2} h="full" overflow="hidden">
        <SearchComponent />
        <ContainerSplitter
          orientation="vertical"
          firstChildProps={{
            size: 460,
            height: 'calc(100vh - 250px)!important',
          }}
          overflow="hidden"
        >
          <LeftContainer />
          {children}
        </ContainerSplitter>
      </Flex>
    </Flex>
  );
}

function ActivitiesDrawerHeader() {
  const onDeleteAllSearchParams = useDismissDrawer(true);
  const { selectedRiverName } = useRiver();
  return (
    <HStack
      ml={2}
      pb={2}
      borderBottom="1px"
      borderColor="gray.300"
      justify="space-between"
    >
      <HStack>
        <Icon
          as={RdsActivities}
          boxSize={5}
          mt={1}
          color="background-selected"
        />
        <Text textStyle="M4">{selectedRiverName} Activity</Text>
      </HStack>
      <TransparentIconButton
        aria-label="close-drawer"
        icon={
          <Icon
            as={CloseIconSmall}
            color="background-action"
            _hover={{ color: 'background-action-hover' }}
          />
        }
        onClick={onDeleteAllSearchParams}
      />
    </HStack>
  );
}

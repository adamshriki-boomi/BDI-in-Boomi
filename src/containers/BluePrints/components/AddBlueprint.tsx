import {
  ButtonCreate,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  RdsRecipeFile,
  RenderGuard,
  Text,
} from 'components';
import { getQueryParams } from 'hooks/router';
import { useEffect } from 'react';
import { useToggle } from 'react-use';
import { useGetBlueprint } from '../helpers';
import { BlueprintsTags } from 'utils/tracking.tags';
import { BlueprintForS2t } from './AIAssistant';
import BlueprintCreation from './BlueprintCreation';

export default function BlueprintFileEditor({
  setSelectedBlueprint,
  showRedirectToRiver,
}) {
  const [show, toggle] = useToggle(false);
  const { blueprint: selectedBlueprint } = getQueryParams(['blueprint']);
  useEffect(() => {
    if (selectedBlueprint) {
      toggle(true);
    }
  }, [selectedBlueprint, show, toggle]);
  return (
    <>
      <ButtonCreate
        mr={1}
        my={0.5}
        ml="auto"
        aria-label="add blueprint"
        onClick={toggle}
        data-pendo-id={BlueprintsTags.ADD_BLUEPRINT_BUTTON}
      >
        Add Blueprint
      </ButtonCreate>
      <Drawer
        variant="semifull"
        isOpen={show}
        placement="right"
        onClose={() => {
          setSelectedBlueprint(null);
          toggle(false);
        }}
        onOverlayClick={() => setSelectedBlueprint(null)}
      >
        <DrawerOverlay />
        <AddBlueprintContent
          selectedBlueprint={selectedBlueprint}
          setSelectedBlueprint={setSelectedBlueprint}
          toggle={toggle}
          showRedirectToRiver={showRedirectToRiver}
        />
      </Drawer>
    </>
  );
}

export function AddBlueprintContent({
  selectedBlueprint,
  setSelectedBlueprint,
  toggle,
  showRedirectToRiver,
}) {
  return (
    <DrawerContent h="full">
      <DrawerHeader
        px={6}
        marginInlineStart={0}
        marginInlineEnd={0}
        borderBottom="1px"
        borderBottomColor="gray.300"
        pb={2}
      >
        <HStack>
          <Icon as={RdsRecipeFile} boxSize={5} color="background-selected" />
          <Text textStyle="M4">
            {selectedBlueprint ? 'Edit Blueprint' : 'Add Blueprint'}
          </Text>
        </HStack>
      </DrawerHeader>
      <DrawerBody py={0} px={0} h="full">
        <BlueprintBody
          selectedBlueprint={selectedBlueprint}
          toggle={() => {
            setSelectedBlueprint(null);
            toggle(false);
          }}
          showRedirectToRiver={showRedirectToRiver}
        />
      </DrawerBody>
    </DrawerContent>
  );
}

export function BlueprintBody({
  s2t = false,
  showRedirectToRiver = true,
  selectedBlueprint = null,
  toggle = null,
  chatId = null,
}) {
  const { file, formApi, loading } = useGetBlueprint(selectedBlueprint);
  return (
    <Flex h="full" w="full" flexDir="column">
      <RenderGuard
        condition={!s2t}
        fallback={<BlueprintForS2t chatId={chatId} />}
      >
        <BlueprintCreation
          selectedBlueprint={selectedBlueprint}
          toggle={toggle}
          file={file}
          formApi={formApi}
          loading={loading}
          showRedirectToRiver={showRedirectToRiver}
        />
      </RenderGuard>
    </Flex>
  );
}

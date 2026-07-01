import { Center, HStack, Icon } from '@chakra-ui/react';
import { RoutesBuilder } from 'app/routes';
import { RiveryButton, RiveryModal, Text } from 'components';
import SvgRedirectToRiver from 'components/Icons/components/RedirectToRiver';
import { getQueryParams } from 'hooks/router';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { BlueprintsTags } from 'utils/tracking.tags';

export default function BlueprintDrawerFooter({
  selectedBlueprint = null,
  saveBlueprint,
  newBlueprint,
  loading,
  error = false,
  file = null,
  toggle,
  showRedirectToRiver,
}) {
  const { envId, activeAccountId: accountId } = useCore();
  const useForm = useFormContext();
  const { blueprint } = getQueryParams(['blueprint']);
  const [riderectToRiver, showRiderectToRiverPrompt] = useToggle(false);
  const { push } = useHistory();
  const onSaveBlueprint = useCallback(async () => {
    if (file) {
      const ok = await saveBlueprint(
        useForm?.watch('yaml'),
        useForm?.watch('name'),
        useForm?.watch('description'),
        file,
        selectedBlueprint,
      );
      if (ok) toggle(false);
    } else {
      await saveBlueprint(
        useForm?.watch('yaml'),
        useForm?.watch('name'),
        useForm?.watch('description'),
        null,
        null,
      );
      if (showRedirectToRiver) {
        showRiderectToRiverPrompt(true);
      } else {
        toggle(false);
      }
    }
  }, [
    file,
    saveBlueprint,
    selectedBlueprint,
    showRedirectToRiver,
    showRiderectToRiverPrompt,
    toggle,
    useForm,
  ]);

  return (
    <>
      <HStack
        px={8}
        justify="space-between"
        w="full"
        h="62px"
        bg="white"
        borderTop="1px"
        borderTopColor="gray.300"
        zIndex={10000}
      >
        <RiveryButton
          label="Cancel"
          variant="default"
          onClick={() => toggle(false)}
          isDisabled={loading}
          data-pendo-id={BlueprintsTags.EDIT_CANCEL_BUTTON}
        />
        <RiveryButton
          label={
            selectedBlueprint || blueprint ? 'Apply Changes' : 'Add Blueprint'
          }
          isDisabled={
            !useForm?.watch('yaml') || Boolean(useForm?.formState?.errors?.name)
          }
          isLoading={loading}
          onClick={onSaveBlueprint}
          data-pendo-id={BlueprintsTags.EDIT_APPLY_CHANGES_BUTTON}
        />
      </HStack>
      <RiveryModal
        modalProps={{ closeOnOverlayClick: false }}
        headerLess
        show={riderectToRiver && !error}
        onClose={() => {
          showRiderectToRiverPrompt(false);
          toggle(false);
        }}
        style={{ content: { maxW: '405px' } }}
      >
        <Center flexDir="column" p={6} gap={4}>
          <Text textAlign="center">
            <strong>Great job!</strong> Would you like to create <br /> Source
            to Target Flow using this Blueprint?
          </Text>
          <Icon as={SvgRedirectToRiver} w="245px" h="120px" color="font" />
          <HStack pt={4}>
            <RiveryButton
              label="Do It Later"
              variant="default"
              onClick={() => {
                showRiderectToRiverPrompt(false);
                toggle(false);
              }}
              data-pendo-id={BlueprintsTags.DO_IT_LATER_BUTTON}
            />
            <RiveryButton
              label="Create Source To Target Flow"
              data-pendo-id={BlueprintsTags.CREATE_SOURCE_TO_TARGET_BUTTON}
              onClick={() => {
                push({
                  pathname: RoutesBuilder.sourceToTarget({
                    env: envId,
                    account: accountId,
                  }),
                  search: `?selected_source=blueprint&blueprint_id=${newBlueprint.cross_id}`,
                });
              }}
            />
          </HStack>
        </Center>
      </RiveryModal>
    </>
  );
}

import { Box, ConfirmationModal, Flex, Text } from 'components';
import { RiveryCheckbox } from 'components/Form';
import { useSttFormContext } from 'modules/SourceTarget';
import { ChangeConnectionConfirmation } from 'modules/SourceTarget/components/ConnectionSetup/ConfirmChangeConnection';
import { useToggle } from 'react-use';

export default function ReactivationConfirmation({
  show,
  onCancel,
  onConfirm,
  onDontShowAgain,
}) {
  const formApi = useSttFormContext();
  const [showConnectionConfirmationModal, toggleConnectionsConfirmationModal] =
    useToggle(false);
  return (
    <>
      <ConfirmationModal
        closeOnOverlayClick={false}
        show={show}
        title="Applying Changes to an Active Data Flow"
        variant="info"
        onCancel={onCancel}
        confirmLabel="Continue"
        onConfirm={() => {
          onConfirm();
          if (
            formApi?.formState?.dirtyFields?.river?.properties?.source
              ?.connection_id
          ) {
            toggleConnectionsConfirmationModal(true);
          }
        }}
      >
        <Flex gap={4} flexDir="column">
          <Box>
            <Text>
              To apply some changes, Data Flow must be temporarily disabled and
              re-activated.
            </Text>
            <Text>You can continue editing and re-activate it once done.</Text>
          </Box>
          <RiveryCheckbox
            name="applyChanges"
            label="Don't show this message again"
            colorScheme="primary"
            size="md"
            onChange={onDontShowAgain}
          />
        </Flex>
      </ConfirmationModal>
      <ChangeConnectionConfirmation
        showConfirmation={showConnectionConfirmationModal}
        toggleConfirmation={toggleConnectionsConfirmationModal}
        onChange={() => toggleConnectionsConfirmationModal(false)}
        onDismiss={onCancel}
      />
    </>
  );
}

import { Flex } from '@chakra-ui/react';
import { Text } from 'components';
import { RiveryButton } from 'components/Buttons';
import { ConfirmationModal } from 'components/ConfirmationModal/ConfirmationModal';

export type MergeReplaceAction = 'merge' | 'replace' | 'cancel';

interface MergeReplaceModalProps {
  show: boolean;
  onAction: (action: MergeReplaceAction) => void;
}

/**
 * Modal to let users choose between merging or replacing existing mapping
 * when running mapping on an already mapped query.
 */
export function MergeReplaceModal({ show, onAction }: MergeReplaceModalProps) {
  return (
    <ConfirmationModal
      show={show}
      title="Merge or Replace?"
      variant="info"
      cancelLabel="Cancel"
      onCancel={() => onAction('cancel')}
      onClose={() => onAction('cancel')}
      confirmLabel="Merge"
      onConfirm={() => onAction('merge')}
      footerExtraButtons={
        <RiveryButton
          label="Replace"
          variant="outlined-primary"
          onClick={() => onAction('replace')}
        />
      }
    >
      <Flex flexDir="column" gap={4}>
        <Text>
          <Text as="span" fontWeight="bold">
            Merge
          </Text>{' '}
          adds any new columns from your query while keeping your existing
          columns and changes intact.
        </Text>
        <Text>
          <Text as="span" fontWeight="bold">
            Replace
          </Text>{' '}
          removes all current columns and replaces them with the results of your
          new query. This will permanently delete any manual changes.
        </Text>
        <Text>This action can't be undone.</Text>
      </Flex>
    </ConfirmationModal>
  );
}

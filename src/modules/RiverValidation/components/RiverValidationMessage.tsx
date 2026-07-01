import { Box, Center, RiveryModal, Text } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { SaveRiverButton } from 'containers/River/components/RiverFooter/SaveRiverButton';
import * as React from 'react';
import { useRiver } from 'store/river';

/**
 * displays an error message when there are errors
 */
type RiverValidationMessageProps = {
  onSave: () => any;
  show: boolean;
  onClose: () => any;
  loading: boolean;
};
export function RiverValidationMessage({
  onSave,
  show,
  onClose,
  loading,
}: RiverValidationMessageProps) {
  const {
    isRiverValid,
    selectedRiver: {
      river_definitions: { is_api_v2 },
    },
  } = useRiver();

  return !isRiverValid ? (
    <RiveryModal
      show={show}
      onClose={onClose}
      title="Something is not right"
      body={
        is_api_v2 ? (
          <>
            <Text mb={3}>
              Error: Missing Required Fields. <br />
              Please ensure all mandatory fields are completed before saving the
              Data Flow. Review the form and fill in the highlighted fields.
            </Text>
            <Box ml="auto">
              <RiveryButton
                label="Fix The Data Flow"
                variant="primary"
                onClick={onClose}
              />
            </Box>
          </>
        ) : (
          <>
            <Text mb={3}>
              Some steps are not valid. Are you sure you want to save this data
              flow?
            </Text>
            <Center gap={4} mt={3}>
              <RiveryButton
                label="Cancel"
                variant="default"
                onClick={onClose}
              />
              <SaveRiverButton
                label="Save Anyway"
                variant="primary"
                onSave={onSave}
                loading={loading}
                disabled={loading}
              />
            </Center>
          </>
        )
      }
    />
  ) : null;
}

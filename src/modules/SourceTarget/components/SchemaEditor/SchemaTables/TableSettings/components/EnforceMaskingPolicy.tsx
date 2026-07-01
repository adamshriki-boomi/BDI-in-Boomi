import { useBoolean } from '@chakra-ui/react';
import { Box, ConfirmationModal, Flex, HStack } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { RiverySwitch, SwitchComplexLabel } from 'components/Form';
import * as React from 'react';
import { useTableSettings } from '../form.hooks';

const maskingPolicyOff =
  'Before enforcing masking policy, make sure you have copy permission of the masking policy and there’s at least one column with active masking policy in the Target table; otherwise, the Data Flow run will fail.';

const maskingPolicyOn =
  'Disabeling this option may cause your Target Table to contain data without any masking policies.';

export function EnforceMaskingPolicy() {
  const [showConfirmationMasking, toggleShowConfirmationMasking] = useBoolean();
  const enforceControlName =
    'additional_target_settings.enforce_masking_policy';
  const { value, update } = useTableSettings(enforceControlName);
  return (
    <>
      <Flex flexDir="column">
        <HStack>
          <RiverySwitch
            name={enforceControlName}
            isChecked={Boolean(value)}
            onChange={e =>
              !e.target.checked
                ? toggleShowConfirmationMasking.toggle()
                : update(e.target.checked)
            }
            label={
              <SwitchComplexLabel
                label="Enforce Masking Policy"
                description="Preserve the data masking policy that is applied on the column
            level in your Target table"
              />
            }
            leftLabel
            formControlStyle={{ alignItems: 'baseline' }}
            ml="auto"
          />
        </HStack>
        <Box mt={2}>
          <RiveryAlert
            variant="warning-light"
            title={
              value ? 'Disabling Masking Policy' : 'Enabling Masking Policy'
            }
            description={value ? maskingPolicyOn : maskingPolicyOff}
          />
        </Box>
      </Flex>

      <ConfirmationModal
        show={showConfirmationMasking}
        onClose={toggleShowConfirmationMasking.off}
        onConfirm={() => update(!Boolean(value))}
        onCancel={() => update(Boolean(value))}
        title="Warning"
        description="Please be aware that if you disable the masking policy, 
        your target table may contain data without any masking policies being applied."
        variant="warning"
        confirmLabel="Apply"
      />
    </>
  );
}

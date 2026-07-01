import { Flex } from '@chakra-ui/react';
import { InfoTooltip, Text } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { RiverySwitch } from 'components/Form';
import { RiveryRadioGroup } from 'components/Form/components/RiveryRadioGroup';
import { useController, useFormContext } from 'react-hook-form';
import {
  BulkCDCExtractionModeLabels,
  BulkCDCExtractionModeValues,
} from '../../consts';

export const BulkCDCExtractionMode = () => {
  const formApi = useFormContext();
  const { field: initialMigration } = useController({
    name: 'actions.initialMigration',
    control: formApi.control,
  });
  const { field: migrationMode } = useController({
    name: 'actions.migrationMode',
    control: formApi.control,
  });

  return (
    <Flex w="450px" flexDir="column" gap={2}>
      <Flex flexDir="column" gap={2}>
        <Text textStyle="M6" color="primary">
          Extraction Mode
        </Text>
        <RiverySwitch
          label="Perform Initial Migration"
          leftLabel
          ml="auto"
          isChecked={initialMigration.value}
          onChange={initialMigration.onChange}
        />
        <RiveryAlert
          variant="info"
          icon={InfoTooltip}
          description="The initial migration is a one-time process. When enabled, it will stay active until the Data Flow runs, after which it will deactivate automatically."
        />
      </Flex>
      <Flex w="450px" position="relative">
        <Flex ml={2} flexDir="column" gap={2}>
          <Text>Choose Loading mode for the Initial Migration results:</Text>
          <RiveryRadioGroup
            defaultValue={
              migrationMode.value ? BulkCDCExtractionModeValues.OVERWRITE : null
            }
            value={migrationMode.value}
            onChange={migrationMode.onChange}
            values={[
              {
                label: BulkCDCExtractionModeLabels.OVERWRITE,
                value: BulkCDCExtractionModeValues.OVERWRITE,
                isDisabled: !Boolean(initialMigration.value),
              },
              {
                label: BulkCDCExtractionModeLabels.MERGE,
                value: BulkCDCExtractionModeValues.MERGE,
                isDisabled: !Boolean(initialMigration.value),
              },
            ]}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

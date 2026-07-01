import { Flex } from 'components';
import { RiverySwitch, SwitchComplexLabel } from 'components/Form';
import { useController, useFormContext } from 'react-hook-form';
import { IncludeDeletedRows } from './IncludeDeletedRows';

export default function SalesforceV3Source() {
  const formApi = useFormContext();
  useController({
    name: 'river.properties.source.additional_settings.auto_detect_new_fields',
    control: formApi.control,
    defaultValue: true,
  });

  return (
    <Flex flexDir="column" gap={3} w="full">
      <RiverySwitch
        formControlStyle={{ alignItems: 'baseline' }}
        label={
          <SwitchComplexLabel
            label="Auto Detect New Fields In Each Run"
            description="Disable this option to track metadata changes manually."
          />
        }
        leftLabel
        ml="auto"
        api={formApi}
        name="river.properties.source.additional_settings.auto_detect_new_fields"
      />
      <IncludeDeletedRows formApi={formApi} />
    </Flex>
  );
}

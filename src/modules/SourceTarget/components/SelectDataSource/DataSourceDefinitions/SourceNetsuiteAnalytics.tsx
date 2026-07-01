import { Flex } from 'components';
import { RiverySwitch, SwitchComplexLabel } from 'components/Form';
import { useController, useFormContext } from 'react-hook-form';

const AUTO_DETECT_PATH =
  'river.properties.source.additional_settings.auto_detect_new_fields';
const AUTO_DETECT_TABLES_PATH =
  'river.properties.source.additional_settings.auto_detect_tables_relations';

export default function NetsuiteAnalyticsSource() {
  const formApi = useFormContext();

  useController({
    name: AUTO_DETECT_PATH,
    control: formApi.control,
    defaultValue: true,
  });
  useController({
    name: AUTO_DETECT_TABLES_PATH,
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
        name={AUTO_DETECT_PATH}
      />
      <RiverySwitch
        formControlStyle={{ alignItems: 'baseline' }}
        label={
          <SwitchComplexLabel
            label="Auto Detect Tables Relations"
            description="Automatically detects table relationships using foreign key metadata."
          />
        }
        leftLabel
        ml="auto"
        api={formApi}
        name={AUTO_DETECT_TABLES_PATH}
      />
    </Flex>
  );
}

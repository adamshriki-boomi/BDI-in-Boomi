import { Box } from '@chakra-ui/react';
import { RenderGuard } from 'components';
import {
  CustomSelectForm,
  Input,
  RiverySwitch,
  SwitchComplexLabel,
} from 'components/Form';
import { useController } from 'react-hook-form';

export function ReplaceNewlineCharacters({ formApi }) {
  const isReplaceNewlineEnabled = formApi.watch(
    'river.properties.source.additional_settings.replace_newline_characters',
  );
  const selectedNewlineReplacement = formApi.watch(
    'river.properties.source.additional_settings.newline_replacement_char',
  );
  const { field: newLineCharacterField } = useController({
    name: 'river.properties.source.additional_settings.newline_replacement_char',
    control: formApi?.control,
    defaultValue: ' ',
  });

  const { field: customNewlineCharacter } = useController({
    name: 'river.properties.source.additional_settings.custom_field_new_line_char',
    control: formApi?.control,
  });

  const isCustomValueSelected = selectedNewlineReplacement === 'custom';

  const NewLineOptions = [
    { label: 'Space " "', value: ' ' },
    { label: 'Comma ","', value: ',' },
    { label: 'Semicolon ";"', value: ';' },
    { label: 'Custom value', value: 'custom' },
  ];

  return (
    <>
      <RiverySwitch
        formControlStyle={{ alignItems: 'baseline' }}
        leftLabel
        ml="auto"
        name="river.properties.source.additional_settings.replace_newline_characters"
        api={formApi}
        label={
          <SwitchComplexLabel
            label="Replace Newline Characters"
            description={
              <Box>
                This will replace newline characters with a selected replacement
                value or a custom value you specify. If this option is not
                enabled, they will be replaced with spaces by default.
              </Box>
            }
          />
        }
      />
      <RenderGuard condition={isReplaceNewlineEnabled}>
        <CustomSelectForm
          api={formApi}
          name="river.properties.source.additional_settings.newline_replacement_char"
          label="Replacement Character"
          chakra
          options={NewLineOptions}
          isMulti={false}
          value={NewLineOptions.find(
            opt => opt.value === newLineCharacterField.value,
          )}
          onChange={newValue => {
            if (newValue !== 'custom') {
              customNewlineCharacter.onChange(undefined);
            }
          }}
          controlId="newline-replacement-selector"
          customStyles={{
            container: () => ({
              width: '400px',
            }),
          }}
        />
        <RenderGuard condition={isCustomValueSelected}>
          <Box ml={5} w={380}>
            <Input
              type="Enter value"
              hideLabel
              api={formApi}
              name="river.properties.source.additional_settings.custom_field_new_line_char"
              value={customNewlineCharacter.value}
              chakra
              label="Custom Newline Character Value"
              size="md"
            />
          </Box>
        </RenderGuard>
      </RenderGuard>
    </>
  );
}

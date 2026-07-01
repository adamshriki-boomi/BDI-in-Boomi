import { RiverySwitch, SwitchComplexLabel } from 'components/Form';

export function IncludeDeletedRows({ formApi }) {
  return (
    <RiverySwitch
      formControlStyle={{ alignItems: 'baseline' }}
      label={
        <SwitchComplexLabel
          label="Include Deleted Rows"
          description="This option will also pull deleted rows. The rows key fields will remain the same, and the rest of the fields will be NULL."
        />
      }
      leftLabel
      ml="auto"
      api={formApi}
      name="river.properties.source.additional_settings.include_deleted_rows"
    />
  );
}

import { RadioGroup } from '@chakra-ui/react';
import { ConfirmationModal, Flex, Radio, Text } from 'components';
import { useSttFormContext } from 'modules/SourceTarget';
import { RunType } from 'modules/SourceTarget/components/form/form.consts';
import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';

enum MetadataOnChange {
  KEEP = 'keep',
  RELOAD = 'reload',
}

export function ChangeConnectionConfirmation({
  showConfirmation,
  toggleConfirmation,
  onChange,
  onDismiss,
  entity = 'Connection',
}) {
  const formApi = useFormContext();
  const context = useSttFormContext();
  // Derived from `context` (not the useIsCustomQuery hook) so it stays null-safe
  // when this dialog renders outside a river form, e.g. the blueprint flow.
  const isCustomQuery =
    context?.watch('river.properties.source.run_type') === RunType.CUSTOM_QUERY;
  const [metadataOnChangeMethod, setMetadataOnchangeMethod] =
    useState<MetadataOnChange>(MetadataOnChange.RELOAD);

  const onConfirm = useCallback(() => {
    if (metadataOnChangeMethod === MetadataOnChange.RELOAD) {
      const properties = formApi?.watch('river.properties');
      context?.setValue('river.properties', { ...properties, schemas: {} });
      // In custom query mode there is no schema; the equivalent metadata is the
      // query and its resulting mapping. Reset both so they get rebuilt against
      // the new connection.
      if (isCustomQuery) {
        context?.setValue(
          'river.properties.source.custom_query_source_settings.query' as any,
          '',
        );
        context?.setValue(
          'river.properties.target.single_table_settings.mapping',
          [],
        );
      }
    }
    onChange();
    toggleConfirmation(false);
  }, [
    metadataOnChangeMethod,
    formApi,
    onChange,
    toggleConfirmation,
    context,
    isCustomQuery,
  ]);
  return (
    <ConfirmationModal
      variant="warning"
      confirmColorScheme="purple"
      title={`Change ${entity}`}
      ariaLabel="change connection confirm"
      confirmLabel={`Change ${entity}`}
      onConfirm={onConfirm}
      onClose={() => toggleConfirmation(false)}
      show={showConfirmation}
      onCancel={onDismiss}
    >
      <Flex flexDir="column" gap={2}>
        <Text>
          Changing a {entity} might impact your schema mapping. Please select
          the change you wish to perform:
        </Text>
        <RadioGroup
          defaultValue={metadataOnChangeMethod}
          onChange={e => setMetadataOnchangeMethod(e as MetadataOnChange)}
        >
          <Flex flexDir="column" gap={2}>
            <ChangeConnectionOption
              metadataOnChangeMethod={metadataOnChangeMethod}
              type={MetadataOnChange.RELOAD}
              label={`Change ${entity} & reset schema metadata`}
              description="This change will reload metadata and will lead to schema
                  mapping reconfiguration."
            />
            <ChangeConnectionOption
              metadataOnChangeMethod={metadataOnChangeMethod}
              type={MetadataOnChange.KEEP}
              label={`Change ${entity} & keep existing mapping`}
              description={`Mapping could be kept only if the selected ${entity}
                  structure is similar to the previous one.`}
            />
          </Flex>
        </RadioGroup>
      </Flex>
    </ConfirmationModal>
  );
}

function ChangeConnectionOption({
  metadataOnChangeMethod,
  type,
  label,
  description,
}) {
  const color = metadataOnChangeMethod === type ? 'font' : 'font-secondary';
  return (
    <Flex alignItems="start" gap={2}>
      <Radio name={type} value={type} mt={1} />
      <Flex flexDir="column">
        <Text textStyle="M7" color={color}>
          {label}
        </Text>
        <Text textStyle="R8" color={color}>
          {description}
        </Text>
      </Flex>
    </Flex>
  );
}

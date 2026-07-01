import { RiveryCheckbox } from 'components/Form';
import { useTableSettings } from '../form.hooks';
import { useToastComponent } from 'hooks/useToast';
import {
  useIsCustomQuery,
  useSttFormContext,
} from 'modules/SourceTarget/components/form';

export function DistRadio({
  row: { original },
  column: {
    getProps: {
      modifiedColumnsMap,
      updateColumn,
      distValues: { dist_key },
    },
  },
}) {
  const toast = useToastComponent().info;
  const columns = Array.from(modifiedColumnsMap.values());
  const isDistKeySelected = columns.filter(
    (column: any) => column?.is_dist_key,
  );
  const { update: updateDistributionMethod } = useTableSettings(
    'additional_target_settings.distribution_method',
  );
  const mainFormApi = useSttFormContext();
  const isCustomQuery = useIsCustomQuery();

  return (
    <RiveryCheckbox
      onChange={({ target }) => {
        updateColumn(original.name, {
          ...original,
          is_dist_key: target.checked,
        });
        const dist = Boolean(target.checked) ? dist_key : null;
        if (dist) {
          updateDistributionMethod(dist);
          // Update the main river form's single_table_settings.distribution_method
          // For custom query, this is the primary location where distribution method is stored
          if (isCustomQuery) {
            mainFormApi?.setValue(
              'river.properties.target.single_table_settings.distribution_method',
              dist,
              { shouldDirty: true },
            );
          }
          toast({
            duration: 10000,
            description: `Distribution method changed to: ${dist}`,
          });
        }
      }}
      name="is_dist_key"
      label={null}
      isDisabled={Boolean(
        isDistKeySelected?.find(({ name }) => name !== original.name),
      )}
      isChecked={Boolean(original.is_dist_key)}
    />
  );
}

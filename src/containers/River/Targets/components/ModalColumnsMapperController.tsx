import { ILogicStep, SourceType } from 'api/types';
import { ModalColumnsMapper } from 'components/Form/ColumnsMapper';
import { useController, UseFormReturn } from 'react-hook-form';

type ModalColumnsMapperControllerProps = {
  api: Partial<UseFormReturn>;
  control: any;
  step: ILogicStep;
  onChange?: (fields: any[], useFormApi: any) => any;
  type: any;
};
export function ModalColumnsMapperController({
  step,
  control,
  api,
  onChange,
  type,
}: ModalColumnsMapperControllerProps) {
  const sourceType = step?.content?.source_type;
  const showMappingButton = sourceType !== SourceType.DATAFRAME;

  const { field: fields } = useController({
    name: 'content.fields',
    control,
  });
  const { field: mappingOrder } = useController({
    name: 'content.mapping_order',
    control,
  });

  const onCustomOnChange = (fields, api) => {
    onChange && onChange(fields, api);
  };

  return showMappingButton ? (
    <ModalColumnsMapper
      data={fields.value}
      sortMapping={mappingOrder.value}
      onChange={({ mapping, sortMapping }) => {
        fields.onChange(mapping);
        mappingOrder.onChange(sortMapping);
        onCustomOnChange(mapping, api);
      }}
      step={step}
      type={type}
    />
  ) : null;
}

export const updateDistMethod = (key: string) => (fields, api) => {
  const distExist = fields.find(({ dist }) => dist);
  if (distExist)
    api.setValue('content.distribution_method', key, {
      shouldDirty: true,
    });
};

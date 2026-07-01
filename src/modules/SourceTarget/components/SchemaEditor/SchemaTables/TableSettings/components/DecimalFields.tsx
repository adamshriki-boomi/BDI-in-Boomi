import { TargetTypesV1 } from 'api/types';
import { RenderGuard } from 'components';
import { InputNumber } from 'components/Form/components/Input/InputNumber';

export function DecimalField({
  value,
  row: { original },
  column: { id, getProps },
}) {
  const { updateColumn } = getProps;
  const shouldShow =
    (id === 'length' && original.type === 'VARCHAR') ||
    (['precision', 'scale'].includes(id) && original.type === 'DECIMAL');

  return (
    <RenderGuard condition={shouldShow}>
      <InputNumber
        value={value ?? 0}
        name={id}
        onChange={v =>
          updateColumn(original.name, { ...original, [id]: Number(v) })
        }
        {...([TargetTypesV1.REDSHIFT, TargetTypesV1.AZURE_SQL_DWH].includes(
          getProps?.targetType,
        ) && {
          inputProps: {
            min: 0,
            max: id === 'length' ? 65535 : 38,
          },
        })}
      />
    </RenderGuard>
  );
}

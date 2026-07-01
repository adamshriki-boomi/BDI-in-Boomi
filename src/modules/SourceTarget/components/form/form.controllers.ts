import { RiverForm } from 'containers/River/new/source-to-target/form.hooks';
import { useCallback } from 'react';
import { FieldPath, useController, UseControllerProps } from 'react-hook-form';
import { ISelectedTable, RiverSchedule, Schema } from '../../store';
import { useGetSchemaTable } from '../SchemaEditor/SchemaTables/rows.state.api';
import { useSttFormContext } from './form.hooks';

// Context Based Hooks
/**
 * these hooks are useful for displaying and updating form fields
 */
export const useSchemaField = <T = Schema>(schemaName: string) => {
  const context = useSttFormContext();
  const schemaPath = `river.properties.schemas.${schemaName}`;

  const value = context?.watch(schemaPath as any) as T;
  const update = useCallback(
    (data: T) => {
      context?.setValue(schemaPath as any, data, {
        shouldDirty: true,
        shouldValidate: true,
        shouldTouch: true,
      });
    },
    [context, schemaPath],
  );
  return { value, update };
};

export const useTableField = <T = ISelectedTable>(
  schemaName: string,
  tableName: string,
) => {
  const { value, update } = useSchemaField<T>(`${schemaName}.${tableName}`);
  return { value, update };
};

export const useTablePropField = <TValue = unknown>(
  original: {
    id: string;
    schema_name: string;
  },
  prop: FieldPath<ISelectedTable>,
  source,
  isPredefined,
) => {
  const { schemaName, tableName } = useGetSchemaTable(
    original,
    source,
    isPredefined,
  );
  return useTableField<TValue>(schemaName, `${tableName}.${prop}`);
};

export const useSchedulers = <T = RiverSchedule>(index: number) => {
  const { watch, control } = useSttFormContext();
  const { field } = useController({
    name: 'river.schedulers',
    control,
  });
  const path = `river.schedulers`;
  const value = watch(path as any) as T[];
  const update = useCallback(
    (data: T) => {
      const totalSchedulers = value.length;
      const shouldCreateNewScheduler = totalSchedulers <= 1;
      const newValue = shouldCreateNewScheduler
        ? [{ is_enabled: true, ...data }]
        : value.map((config, configIndex) =>
            configIndex === index ? data : config,
          );
      field.onChange(newValue);
    },
    [value, field, index],
  );
  return { value: value?.[0], update };
};

// Controller Based (prefer using the above as Controller optimize re-render)
export const useSttController = (props: UseControllerProps<RiverForm>) => {
  const { control } = useSttFormContext();
  return useController({ control, ...props });
};

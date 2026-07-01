import { TargetTypesV1 } from 'api/types';
import { SelectFormGroup } from 'components/Form';
import { Controller, useFormContext } from 'react-hook-form';
import { compare } from 'utils/array.utils';

export function TypeSelect({ name = 'type', label = 'Data Type', target }) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => (
        <SelectFormGroup
          label={label}
          options={typeOptions[target]}
          controlId={`type-select`}
          onChange={option => onChange(option.value)}
          value={typeOptions[target].find(compare('value', value))}
          chakra
          isRequired
          required
        />
      )}
    />
  );
}

const typeOptions = {
  [TargetTypesV1.SNOWFLAKE]: [
    'INTEGER',
    'TIMESTAMP',
    'FLOAT',
    'STRING',
    'BOOLEAN',
    'RECORD',
    'NUMERIC',
    'VARIANT',
    'TIME',
  ].map(value => ({ label: value, value })),
  [TargetTypesV1.ONELAKE]: [
    'INTEGER',
    'TIMESTAMP',
    'FLOAT',
    'STRING',
    'BOOLEAN',
    'RECORD',
    'NUMERIC',
  ].map(value => ({ label: value, value })),
  [TargetTypesV1.BIG_QUERY]: [
    'STRING',
    'BIGINT',
    'FLOAT',
    'BOOLEAN',
    'TIMESTAMP',
    'DATETIME',
    'TIME',
    'INTEGER',
    'SMALLINT',
    'TINYINT',
    'DOUBLE',
    'DATE',
    'BINARY',
    'NUMERIC',
    'JSON',
  ].map(value => ({ label: value, value })),
  [TargetTypesV1.REDSHIFT]: [
    'INTEGER',
    'FLOAT',
    'BIGINT',
    'SMALLINT',
    'DECIMAL',
    'REAL',
    'DOUBLE PRECISION',
    'BOOLEAN',
    'CHAR',
    'VARCHAR',
    'DATE',
    'TIMESTAMP',
    'JSON',
    'OBJECT',
    'SUPER',
  ].map(value => ({ label: value, value })),
  [TargetTypesV1.ATHENA]: [
    'STRING',
    'VARCHAR',
    'TINYINT',
    'SMALLINT',
    'BIGINT',
    'INTEGER',
    'BOOLEAN',
    'DOUBLE',
    'FLOAT',
    'DECIMAL',
    'DATE',
    'TIMESTAMP',
    'CHAR',
  ].map(value => ({ label: value, value })),
  [TargetTypesV1.AZURE_SQL]: [
    'VARCHAR',
    'NVARCHAR',
    'INTEGER',
    'FLOAT',
    'TIMESTAMP',
    'BIGINT',
  ].map(value => ({ label: value, value })),
  [TargetTypesV1.POSTGRES]: [
    'INTEGER',
    'NUMERIC',
    'BIGINT',
    'SMALLINT',
    'DECIMAL',
    'REAL',
    'TEXT',
    'DOUBLE PRECISION',
    'MONEY',
    'BOOLEAN',
    'CHAR',
    'VARCHAR',
    'DATE',
    'TIMESTAMP',
    'TIME',
    'JSON',
    'BIT',
  ].map(value => ({ label: value, value })),
  [TargetTypesV1.AZURE_SQL_DWH]: [
    'INTEGER',
    'FLOAT',
    'BIGINT',
    'SMALLINT',
    'DECIMAL',
    'REAL',
    'DOUBLE PRECISION',
    'BOOLEAN',
    'CHAR',
    'VARCHAR',
    'NVARCHAR',
    'DATE',
    'TIMESTAMP',
    'OBJECT',
    'VARIANT',
  ].map(value => ({ label: value, value })),
  [TargetTypesV1.DATABRICKS]: [
    'STRING',
    'BIGINT',
    'FLOAT',
    'BOOLEAN',
    'TIMESTAMP',
    'TIME',
    'INTEGER',
    'SMALLINT',
    'TINYINT',
    'DOUBLE',
    'DATE',
    'BINARY',
    'NUMERIC',
    'JSON',
  ].map(value => ({ label: value, value })),
};

import { MetadataType as MetadataTypeEnum } from 'api/endpoints/metadata.api';
import { ILogicStep } from 'api/types';
import {
  CustomSelectForm,
  FormSelectProps,
  SelectOptionType,
} from 'components/Form';
import { isVariableString } from 'containers/River/hooks/useAsyncMetadata';
import { UseFormReturn } from 'react-hook-form';
import { useGetMetadataQuery } from 'store/metadata';
import { TaskType } from 'store/metadata/metadata.types';
import { CallType } from 'store/river/hooks/useRiverForMetadataCall';

interface DataBaseSelectProps extends Partial<FormSelectProps> {
  connectionId: string;
  step?: ILogicStep;
  useFormApi: Partial<UseFormReturn>;
  value?: string | SelectOptionType;
  type?: MetadataTypeEnum;
  task_type?: TaskType;
  datasource_id?: string;
  isV1?: boolean;
}

export function DataBaseSelect({
  connectionId,
  step,
  useFormApi,
  value,
  name,
  type = MetadataTypeEnum.DATABASES,
  task_type,
  label = 'Database',
  datasource_id = '',
  ...props
}: DataBaseSelectProps) {
  const databaseMetaConfig = toDatabaseMetaQueryConfig(
    connectionId,
    step,
    type,
  );
  const databaseResponse = useGetMetadataQuery(databaseMetaConfig);

  return (
    <CustomSelectForm
      label={label}
      name={name}
      metadataResponse={databaseResponse}
      options={databaseResponse.data}
      isValidNewOption={isVariableString}
      controlId="database"
      api={useFormApi}
      value={value}
      editableCreate
      defaultCreateLabel=""
      placeholder="Select database or use a variable"
      hideErrorTitle
      isClearable
      withCreate
      isMulti={false}
      {...props}
    />
  );
}

const toDatabaseMetaQueryConfig = (connectionId: string, step: any, type) => {
  const id = connectionId;
  const databasesMetaConfig = {
    id,
    step: { isEnabled: true, ...step },
    type,
    callType: CallType.LOGIC,
  };
  return databasesMetaConfig;
};

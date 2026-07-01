import { MetadataType as MetadataTypeEnum } from 'api/endpoints/metadata.api';
import { ILogicStep } from 'api/types';
import { Grid } from 'components';
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
import { getOId } from 'utils/api.sanitizer';

interface SchemaSelectProps extends Partial<FormSelectProps> {
  useFormApi: Partial<UseFormReturn>;
  value?: string | SelectOptionType;
  step?: ILogicStep;
  errorPrompt?: boolean;
  connectionId?: string;
  databaseName?: string;
  datasource_id?: string;
  task_type?: TaskType;
  type?: MetadataTypeEnum;
}

export function SchemaSelect({
  step,
  useFormApi,
  value,
  name,
  errorPrompt,
  type = MetadataTypeEnum.SCHEMAS,
  ...props
}: SchemaSelectProps) {
  const databaseMetaConfig = toSchemaMetaQueryConfig(step);
  const schemasResponse = useGetMetadataQuery(databaseMetaConfig);

  return (
    <Grid templateColumns="1fr auto" alignItems="start" gap={3}>
      <CustomSelectForm
        label="Schema"
        name={name}
        options={schemasResponse?.data ?? []}
        error={
          schemasResponse?.error?.['message'] ||
          (errorPrompt ? null : 'Need to select database first')
        }
        isValidNewOption={isVariableString}
        metadataResponse={schemasResponse}
        controlId="schema_id"
        api={useFormApi}
        value={value}
        editableCreate
        defaultCreateLabel=""
        placeholder="Select schema or use a variable"
        hideErrorTitle
        isClearable
        isMulti={false}
        withCreate
        {...props}
      />
    </Grid>
  );
}
const toSchemaMetaQueryConfig = (step: any) => {
  const id = getOId(step?.content?.gConnection);
  const database = step?.content?.database;
  const schemaId = id && database && `${id}.${database}`;
  const schemasMetaConfig = {
    id: schemaId,
    step,
    type: MetadataTypeEnum.SCHEMAS,
    callType: CallType.LOGIC,
  };

  return schemasMetaConfig;
};

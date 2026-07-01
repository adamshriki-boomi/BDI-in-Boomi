import { TargetTypesV1 } from 'api/types';
import {
  useIsDisabledRiverForm,
  useMainFormColumnsDefinitions,
} from 'modules/SourceTarget/components/form';
import { AmazonS3Mapping } from './Targets/AmazonS3/AmazonS3';
import { AthenaMapping } from './Targets/Athena/Athena';
import { AzureBlobMapping } from './Targets/AzureBlob/AzureBlob';
import { AzureSQLMApping } from './Targets/AzureSQL/AzureSQL';
import { AzureSynapseMapping } from './Targets/AzureSynapse/AzureSynapse';
import { BiqQueyMapping } from './Targets/BigQuery/BigQuery';
import { DatabricksMapping } from './Targets/Databricks/Databricks';
import { EmailMapping } from './Targets/Email/Email';
import { GSCMapping } from './Targets/GCS/GCS';
import { PostgresMapping } from './Targets/Postgres/Postgres';
import { RedshiftMapping } from './Targets/Redshift/Redshift';
import { SnowflakeMapping } from './Targets/Snowflake/Snowflake';
import { OneLakeMapping } from './Targets/OneLake/OneLake';

export const SelectedTarget = {
  [TargetTypesV1.SNOWFLAKE]: SnowflakeMapping,
  [TargetTypesV1.ONELAKE]: OneLakeMapping,
  [TargetTypesV1.BIG_QUERY]: BiqQueyMapping,
  [TargetTypesV1.AMAZON_S3]: AmazonS3Mapping,
  [TargetTypesV1.EMAIL]: EmailMapping,
  [TargetTypesV1.AZURE_BLOB]: AzureBlobMapping,
  [TargetTypesV1.REDSHIFT]: RedshiftMapping,
  [TargetTypesV1.ATHENA]: AthenaMapping,
  [TargetTypesV1.GOOGLE_CLOUD_STORAGE]: GSCMapping,
  [TargetTypesV1.AZURE_SQL]: AzureSQLMApping,
  [TargetTypesV1.POSTGRES]: PostgresMapping,
  [TargetTypesV1.AZURE_SQL_DWH]: AzureSynapseMapping,
  [TargetTypesV1.DATABRICKS]: DatabricksMapping,
  // KH uses S3 as its file zone — same column mapping UI applies
  [TargetTypesV1.KNOWLEDGE_HUB]: AmazonS3Mapping,
};
export function Mapping() {
  const { targetType } = useMainFormColumnsDefinitions();
  const isDisabled = useIsDisabledRiverForm();
  const Component = SelectedTarget?.[targetType];
  return <Component isDisabled={isDisabled} />;
}

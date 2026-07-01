import { TargetTypesV1 } from 'api/types';
import { Grid, RenderGuard, Text } from 'components';
import * as React from 'react';
import { useTableSettingsFormContext } from '../form.hooks';
import { AthenaSettings } from './AthenaSettings';
import { AzureSQLSettings } from './AzureSQLSettings';
import { AzureSynapseSettings } from './AzureSynapseSettings';
import { BigQuerySettings } from './BigQuerySettings';
import { TargetTableName } from './commonSettings';
import { DatabricksSettings } from './DatabricksSettings';
import { PostgresSettings } from './PostgresSettings';
import { RedshiftSettings } from './RedshiftSettings';
import { KnowledgeHubSettings } from './KnowledgeHubSettings';
import { SnowflakeSettings } from './SnowflakeSettings';
import { OneLakeSettings } from './OneLakeSettings';

export const SelectedTarget = {
  [TargetTypesV1.SNOWFLAKE]: SnowflakeSettings,
  [TargetTypesV1.ONELAKE]: OneLakeSettings,
  [TargetTypesV1.BIG_QUERY]: BigQuerySettings,
  [TargetTypesV1.AMAZON_S3]: TableNameOnly,
  [TargetTypesV1.EMAIL]: TableNameOnly,
  [TargetTypesV1.AZURE_BLOB]: TableNameOnly,
  [TargetTypesV1.REDSHIFT]: RedshiftSettings,
  [TargetTypesV1.ATHENA]: AthenaSettings,
  [TargetTypesV1.GOOGLE_CLOUD_STORAGE]: TableNameOnly,
  [TargetTypesV1.AZURE_SQL]: AzureSQLSettings,
  [TargetTypesV1.POSTGRES]: PostgresSettings,
  [TargetTypesV1.AZURE_SQL_DWH]: AzureSynapseSettings,
  [TargetTypesV1.DATABRICKS]: DatabricksSettings,
  [TargetTypesV1.KNOWLEDGE_HUB]: KnowledgeHubSettings,
};

export default function TableTarget({ targetDefinition }) {
  const Component = SelectedTarget?.[targetDefinition?.name];
  return (
    <RenderGuard condition={targetDefinition?.name}>
      <Component targetDefinition={targetDefinition} />
    </RenderGuard>
  );
}

function TableNameOnly() {
  const formApi = useTableSettingsFormContext();
  return (
    <Grid gap="3">
      <Text textStyle="R7" color="font-secondary" gridColumn="1">
        Set up the setting to your Target Data.
      </Text>
      <Grid gap="6" maxW="450px">
        <TargetTableName formApi={formApi} />
      </Grid>
    </Grid>
  );
}

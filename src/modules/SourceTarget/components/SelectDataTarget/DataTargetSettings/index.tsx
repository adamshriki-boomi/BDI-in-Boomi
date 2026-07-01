import { Flex } from '@chakra-ui/react';
import { RunStatus, TargetTypesV1 } from 'api/types';
import { TargetAthena } from './TargetAthena';
import { TargetAzureSQL } from './TargetAzureSQL';
import { TargetAzureSynapse } from './TargetAzureSynapse';
import { TargetBigQuery } from './TargetBigQuery';
import TargetBlob from './TargetBlob';
import { TargetDatabaricks } from './TargetDatabricks';
import { TargetGCS } from './TargetGCS';
import { TargetPostgres } from './TargetPostgres';
import { TargetRedshift } from './TargetRedshift';
import TargetS3 from './TargetS3';
import { TargetSnowflake } from './TargetSnowflake';
import { TargetKnowledgeHub } from './TargetKnowledgeHub';
import { TargetOneLake } from './TargetOneLake';
const TargetNotSupported = () => <>Target Not Supported Yet.</>;
const Targets = {
  [TargetTypesV1.SNOWFLAKE]: TargetSnowflake,
  [TargetTypesV1.ONELAKE]: TargetOneLake,
  [TargetTypesV1.BIG_QUERY]: TargetBigQuery,
  [TargetTypesV1.AMAZON_S3]: TargetS3,
  [TargetTypesV1.AZURE_DATALAKE]: TargetNotSupported,
  [TargetTypesV1.AZURE_SQL_DWH]: TargetAzureSynapse,
  [TargetTypesV1.POSTGRES]: TargetPostgres,
  [TargetTypesV1.AZURE_SQL]: TargetAzureSQL,
  [TargetTypesV1.REDSHIFT]: TargetRedshift,
  [TargetTypesV1.DATABRICKS]: TargetDatabaricks,
  [TargetTypesV1.FIREBOLT]: TargetNotSupported,
  [TargetTypesV1.AZURE_BLOB]: TargetBlob,
  [TargetTypesV1.ATHENA]: TargetAthena,
  [TargetTypesV1.GOOGLE_CLOUD_STORAGE]: TargetGCS,
  [TargetTypesV1.KNOWLEDGE_HUB]: TargetKnowledgeHub,
};

export default function DataTargetSettings({
  type,
  testConnectionResult = null,
}) {
  const Component = Targets?.[type] || null;
  return Component ? (
    <Flex w="full" justify="center">
      <Flex w="440px" gap={3} flexDir="column">
        <Component connectionReady={testConnectionResult === RunStatus.DONE} />
      </Flex>
    </Flex>
  ) : null;
}

import { TargetTypesV1 } from 'api/types';
import { EditableText, Flex, Image, Text } from 'components';
import { useGetTarget } from 'modules/Datasources/useLogicTargets';
import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

/**
 * Configuration for each target type's path fields
 * pathFields: fields that make up the "loading to" path
 * requiresTableName: whether the target needs a table name
 * tableNamePlaceholder: custom placeholder text for table name input
 */
/**
 * Targets that require table name and their path fields
 */
const TARGET_PATH_CONFIG: Record<
  string,
  {
    pathFields: string[];
    requiresTableName: boolean;
  }
> = {
  // Amazon Redshift - schema only
  [TargetTypesV1.REDSHIFT]: {
    pathFields: ['schema_name'],
    requiresTableName: true,
  },
  // Postgres - schema only
  [TargetTypesV1.POSTGRES]: {
    pathFields: ['schema_name'],
    requiresTableName: true,
  },
  // Snowflake - database + schema
  [TargetTypesV1.SNOWFLAKE]: {
    pathFields: ['database_name', 'schema_name'],
    requiresTableName: true,
  },
  // Databricks - catalog + schema
  [TargetTypesV1.DATABRICKS]: {
    pathFields: ['catalog_name', 'schema_name'],
    requiresTableName: true,
  },
  // BigQuery - dataset only
  [TargetTypesV1.BIG_QUERY]: {
    pathFields: ['dataset_id'],
    requiresTableName: true,
  },
  // Azure Synapse - schema only
  [TargetTypesV1.AZURE_SQL_DWH]: {
    pathFields: ['schema_name'],
    requiresTableName: true,
  },
  // Azure SQL - schema only
  [TargetTypesV1.AZURE_SQL]: {
    pathFields: ['schema_name'],
    requiresTableName: true,
  },
};

// Default config for targets not in the list (file zone targets, etc.)
// These don't require table name
const DEFAULT_CONFIG = {
  pathFields: ['bucket_name', 'path'],
  requiresTableName: false,
};

/**
 * Compact FlowChart bar showing:
 * LOADING TO (path based on target type) | TARGET TABLE (editable, if required)
 */
export function CustomQueryFlowChart() {
  const formApi = useFormContext();

  const targetName = useWatch({
    control: formApi.control,
    name: 'river.properties.target.name',
  });
  const target = useGetTarget(targetName);

  // Get config for current target type
  const config = TARGET_PATH_CONFIG[targetName] || DEFAULT_CONFIG;

  // Watch all possible path fields
  const databaseName = useWatch({
    control: formApi.control,
    name: 'river.properties.target.database_name',
  });
  const schemaName = useWatch({
    control: formApi.control,
    name: 'river.properties.target.schema_name',
  });
  const datasetId = useWatch({
    control: formApi.control,
    name: 'river.properties.target.dataset_id',
  });
  const catalogName = useWatch({
    control: formApi.control,
    name: 'river.properties.target.catalog_name',
  });
  const bucketName = useWatch({
    control: formApi.control,
    name: 'river.properties.target.bucket_name',
  });
  const containerName = useWatch({
    control: formApi.control,
    name: 'river.properties.target.container_name',
  });
  const path = useWatch({
    control: formApi.control,
    name: 'river.properties.target.path',
  });
  const tableName = useWatch({
    control: formApi.control,
    name: 'river.properties.target.table_name',
  });
  const emailList = useWatch({
    control: formApi.control,
    name: 'river.properties.target.email_list',
  });

  // Check if target is email
  const isEmailTarget = targetName === TargetTypesV1.EMAIL;

  // Parse email list (can be string or array)
  const emailAddresses = useMemo(() => {
    if (!emailList) return [];
    if (Array.isArray(emailList)) return emailList;
    // If string, split by comma and trim
    return String(emailList)
      .split(',')
      .map(email => email.trim())
      .filter(Boolean);
  }, [emailList]);

  // Build the "loading to" path based on target config
  const loadingTo = useMemo(() => {
    const fieldValues: Record<string, string | undefined> = {
      database_name: databaseName,
      schema_name: schemaName,
      dataset_id: datasetId,
      catalog_name: catalogName,
      bucket_name: bucketName,
      container_name: containerName,
      path: path,
    };
    const values = config.pathFields
      .map(field => fieldValues[field])
      .filter(Boolean);
    return values.join('.');
  }, [
    config.pathFields,
    databaseName,
    schemaName,
    datasetId,
    catalogName,
    bucketName,
    containerName,
    path,
  ]);

  const handleTableNameChange = (value: string) => {
    formApi.setValue('river.properties.target.table_name', value, {
      shouldDirty: true,
    });
  };

  const separator = config.requiresTableName && loadingTo ? '.' : '';

  return (
    <Flex flexDir="column">
      <Text textStyle="M7" color="primary">
        Loading To
      </Text>
      <Flex
        border="1px solid"
        borderColor="border"
        borderRadius="md"
        px={4}
        pb={3}
        pt={2}
        alignItems="center"
        gap={2}
      >
        {target?.icon && (
          <Image src={target.icon} h="18px" w="42px" objectFit="contain" />
        )}

        {isEmailTarget ? (
          // Email target: show list of email addresses
          <EmailTargets emailAddresses={emailAddresses} />
        ) : (
          // Database/Storage targets: show path and table name
          <TargetPath
            loadingTo={loadingTo}
            separator={separator}
            config={config}
            tableName={tableName}
            handleTableNameChange={handleTableNameChange}
          />
        )}
      </Flex>
    </Flex>
  );
}

function EmailTargets({ emailAddresses }: { emailAddresses: string[] }) {
  return (
    <Flex gap={1} flex={1}>
      {emailAddresses.length > 0 ? (
        emailAddresses.map((email, index) => (
          <Text
            key={index}
            textStyle="M7"
            color="primary"
            display="inline-block"
          >
            {email}
            {index < emailAddresses.length - 1 && ', '}
          </Text>
        ))
      ) : (
        <Text textStyle="M7" color="primary">
          -
        </Text>
      )}
    </Flex>
  );
}

function TargetPath({
  loadingTo,
  separator,
  config,
  tableName,
  handleTableNameChange,
}: {
  loadingTo: string;
  separator: string;
  config: any;
  tableName: string;
  handleTableNameChange: (value: string) => void;
}) {
  return (
    <>
      <Text textStyle="M7" color="primary" whiteSpace="nowrap">
        {loadingTo || '-'}
        {separator}
      </Text>

      {config.requiresTableName && (
        <>
          {!tableName && (
            <Text color="red.100" pr="2px">
              *
            </Text>
          )}
          <EditableText
            text={tableName || ' '}
            onChange={handleTableNameChange}
            textStyle={
              {
                textStyle: 'M7',
                _before: !tableName
                  ? {
                      textStyle: 'R7',
                      content: '"Enter table name"',
                      color: 'font-secondary',
                    }
                  : undefined,
              } as any
            }
            textColor="primary"
            iconColor="font-secondary"
            hideIcon={!tableName}
            allowEmpty
            inputProps={{
              placeholder: 'Enter table name',
              maxW: '200px',
            }}
            wrapperStyle={{
              marginLeft: '-8px',
            }}
            previewStyle={
              {
                m: 0,
                p: 0,
                ...(tableName
                  ? {}
                  : {
                      borderBottom: '1px solid',
                      borderBottomColor: 'gray.300',
                      borderRadius: '0',
                      px: 4,
                      py: 1,
                      h: '32px',
                      minW: '200px',
                    }),
                sx: {
                  '[data-icon]': {
                    visibility: 'visible',
                  },
                },
              } as any
            }
          />
        </>
      )}
    </>
  );
}

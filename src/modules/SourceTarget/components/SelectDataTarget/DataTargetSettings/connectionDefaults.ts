import { TargetTypesV1 } from 'api/types';
import { getMergeMethods } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/commonMergeMethod';
import { getOId } from 'utils/api.sanitizer';

export function findDefaultValues(fields, connection, targetName) {
  let defaultValues = {};
  fields?.forEach(field => {
    defaultValues[field] = connection[`default_${field}`];

    //This is a special case for GCS target where the default value in the connection is called default_bucket and not default_bucket_name
    if (
      targetName === TargetTypesV1.GOOGLE_CLOUD_STORAGE &&
      field === 'bucket_name'
    ) {
      if (connection[`default_bucket`]) {
        defaultValues[field] = connection[`default_bucket`];
      } else {
        //This is a special case for GCS target where the default value fallback should be null to inherit from file zone settings
        defaultValues[field] = null;
      }
    }
  });
  return defaultValues;
}

export default function setConnectionDefaults(connection, formApi, targetName) {
  const fields = TargetConnectionSettings[targetName];
  const defaultValuesFromConnection = findDefaultValues(
    fields,
    connection,
    targetName,
  );
  const mergeMethods = getMergeMethods(targetName);
  const defaultMergeMethod =
    mergeMethods?.length > 0 ? mergeMethods[0].value : undefined;

  formApi.clearErrors('river.properties.target');
  return {
    name: targetName,
    merge_method: defaultMergeMethod,
    loading_method: formApi.watch('river.properties.target.loading_method'),
    additional_settings: formApi.watch(
      'river.properties.target.additional_settings',
    ),
    connection_id: getOId(connection.cross_id),
    ...defaultValuesFromConnection,
  };
}

//List of fields that are effected from connection change for each target
const TargetConnectionSettings = {
  [TargetTypesV1.SNOWFLAKE]: ['database_name', 'schema_name'],
  [TargetTypesV1.ONELAKE]: ['database_name', 'schema_name'],
  [TargetTypesV1.BIG_QUERY]: ['dataset_id'],
  [TargetTypesV1.DATABRICKS]: ['catalog_name', 'schema_name'],
  [TargetTypesV1.POSTGRES]: ['schema_name'],
  [TargetTypesV1.REDSHIFT]: ['schema_name'],
  [TargetTypesV1.GOOGLE_CLOUD_STORAGE]: ['bucket_name'],
};

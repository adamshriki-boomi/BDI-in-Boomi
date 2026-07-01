import { API } from 'api';
import { MetadataType } from 'api/endpoints/metadata.api';
import { ConnectionTypes } from 'api/types';
import { Alert, Box, Flex, RenderGuard } from 'components';
import {
  Content,
  createOption,
  Input,
  RiverySwitch,
  SelectFormGroup,
  UploadFile,
} from 'components/Form/components';
import { Definition } from 'components/Form/components/Definition';
import { SelectSingle } from 'components/Form/components/SelectSingle';
import { SmallTitle } from 'components/Form/components/Title';
import { useToastComponent } from 'hooks/useToast';
import * as React from 'react';
import { useEffect } from 'react';
import { useController } from 'react-hook-form';
import { useCore } from 'store/core/hooks';
import { useGetMetadataQuery } from 'store/metadata';
import { CallType } from 'store/river/hooks/useRiverForMetadataCall';
import { getOId } from 'utils/api.sanitizer';

const TARGET = 'gcs';
const grantPermissions =
  'When choosing custom file zone, please grant permissions to Google Cloud Storage as well.';

const PermissionsGCS = ({ to, children = null }) => {
  return (
    <Alert
      status="info"
      my="4"
      display="flex"
      flexDir="column"
      alignItems="flex-start"
    >
      For connection to Google BigQuery, please grant permission in your Google
      Cloud Platform to {to} service account. {children}
      {grantPermissions}
    </Alert>
  );
};

export function GCloudConnection({ api, options }) {
  const isCustomFz = api.watch('custom_fz');
  const crossId = api.watch('cross_id');
  const connectionType = api.watch('connection_type');
  const { field: defaultBucketField } = useController({
    name: 'default_bucket',
    control: api.control,
  });
  const selectedDefaultBucket = createOption(defaultBucketField.value || '');
  useKeyPairGenerator(connectionType, api?.watch('region'));
  const bucketsResponse = useFetchBuckets(api.getValues, crossId);
  return (
    <Flex flexDir="column" w="100%">
      <SelectSingle
        name="region"
        display_name="Region"
        options={options}
        api={api}
      />
      <RenderGuard condition={connectionType !== ConnectionTypes.BQ_SRC}>
        <Flex mt={4} flexDir="column" gap={3}>
          <SmallTitle display_name="Default Target Settings" />
          <Content
            content={''}
            display_name="Choose the defaults for Data Flows using this connection. </br> The values will be pre-populated but can be overridden anytime if needed."
          />
          <Flex flexDir="column">
            <Input
              name="default_dataset_id"
              api={api}
              label="Default Dataset"
              // helpText="The dataset where new tables will be created by default for this connection"
            />
            <Definition>
              The dataset where new tables will be created by default for this
              connection
            </Definition>
          </Flex>
        </Flex>
      </RenderGuard>
      <Box mt={4}>
        <RiverySwitch label="Custom File Zone" name="custom_fz" api={api} />
      </Box>
      {!isCustomFz ? (
        <>
          <PermissionsGCS to="Boomi Data Integration’s">
            <ServiceAccount />
          </PermissionsGCS>
        </>
      ) : (
        <>
          <PermissionsGCS to="your" />
          <Flex flexDir="column" ml={4} gap={4}>
            <UploadFile
              api={api}
              label="Service Account Private key (JSON)"
              display_name="Service Account Private key (JSON)"
              name="key_file_path"
              onBeforeUpload={files => {
                new Response(files[0]).text().then(text => {
                  const email = JSON.parse(text)?.client_email;
                  const project = JSON.parse(text)?.project_id;
                  api.setValue('service_account_email', email);
                  if (connectionType === ConnectionTypes.BQ_SRC) {
                    api.setValue('buckets_project_id', project);
                  }
                });
              }}
            />
            <Input
              api={api}
              label="Service account email"
              name="service_account_email"
              flex="1 1 auto"
              readOnly
            />
            <RenderGuard condition={connectionType === ConnectionTypes.BQ_SRC}>
              <Input
                api={api}
                label="Project Id"
                name="buckets_project_id"
                helpText="Your Project Id (based on the key file definition)."
                flex="1 1 auto"
                readOnly
              />
            </RenderGuard>
            <SelectFormGroup
              label={
                connectionType === ConnectionTypes.BQ_SRC
                  ? 'Bucket Name'
                  : 'Default Bucket'
              }
              options={bucketsResponse?.data}
              onRefresh={bucketsResponse.refetch}
              isLoading={bucketsResponse.isFetching}
              error={bucketsResponse.error?.['message']}
              pullRequestId={bucketsResponse.error?.['pullRequestId']}
              value={selectedDefaultBucket}
              onChange={bucket => {
                defaultBucketField.onChange(bucket?.value);
              }}
              helpText={
                connectionType === ConnectionTypes.BQ_SRC
                  ? 'Specify the name of your Google Cloud Storage bucket that will be used for exporting your query results.'
                  : ''
              }
              placeholder="Select Default Bucket"
              controlId="select default bucket"
              withCreate
              editableCreate
              defaultCreateLabel=""
              isClearable
            />
          </Flex>
        </>
      )}
    </Flex>
  );
}
const creteGCloudKey = (connectionType, region_id = null, error) => {
  API.connections
    .createKeyPair({
      connectionType,
      ...(region_id &&
        ConnectionTypes.BQ_SRC === connectionType && { region_id }),
    })
    .then(
      data => data,
      () => {
        error({
          duration: 15000,
          description:
            'We are experiencing an outage with our Google cloud default file zone services, If you are using this connection as a target please use custom file zone instead and contact support for more information',
        });
      },
    );
};
function useKeyPairGenerator(connectionType, region_id = null) {
  const { error } = useToastComponent();
  useEffect(() => {
    if (
      [ConnectionTypes.GCLOUD, ConnectionTypes.BQ_SRC].some(
        value => value === connectionType,
      )
    ) {
      creteGCloudKey(connectionType, region_id, error);
    }
  }, [connectionType, error, region_id]);
}
function useFetchBuckets(getValues, crossId) {
  const connection_details = getValues();
  const id =
    connection_details?.connection_type &&
    connection_details?.service_account_email &&
    connection_details?.key_file_path &&
    `${getOId(crossId)}_bq_${connection_details.service_account_email}_${
      connection_details.key_file_path
    }`;
  const callFields = {
    target_type: TARGET,
    connection_details,
  };
  if (Boolean(crossId)) {
    callFields['connection_id'] = crossId;
  }
  return useGetMetadataQuery({
    id,
    type: MetadataType.BUCKETS,
    callType: CallType.CALL_FIELDS,
    callFields,
  });
}
const ServiceAccount = () => {
  const { activeAccountId } = useCore();
  const serviceAccount = `rivery${activeAccountId}@rivery-cloud-2017.iam.gserviceaccount.com`;
  return <strong>{serviceAccount}</strong>;
};

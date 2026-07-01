import { MetadataType } from 'api/endpoints/metadata.api';
import { ConnectionTypes, TargetTypesV1 } from 'api/types/rivers.types';
import { HStack, RiveryButton } from 'components';
import { createOption, FormSelect } from 'components/Form';
import { isVariableString } from 'containers/River/hooks/useAsyncMetadata';
import React from 'react';
import { useController } from 'react-hook-form';
import { useGetMetadataQuery } from 'store/metadata';
import { CallType } from 'store/river/hooks/useRiverForMetadataCall';
import { getOId } from 'utils/api.sanitizer';
export function FZBucket({ api, connId, dsId, connectionType }) {
  const response = useGetMetadataQuery({
    id: connId ? `${connId}_${MetadataType.BUCKETS}` : null,
    type: MetadataType.BUCKETS,
    callType: CallType.CONNECTION,
    callFields: {
      dsId: dsId,
      connectionType: connectionType,
      connectionCrossId: connId,
    },
  });
  const { content } = api.watch();
  const selectedBucket = content?.bucket_name
    ? createOption(content?.bucket_name)
    : '';

  return (
    <FormSelect
      label="Bucket Name"
      name="content.bucket_name"
      controlId="bucket_name"
      placeholder="Define bucket name or use a variable"
      metadataResponse={response}
      options={response?.data}
      isValidNewOption={isVariableString}
      withCreate
      editableCreate
      isClearable
      api={api}
      value={selectedBucket}
      defaultCreateLabel=""
    />
  );
}

export function FZBucketTarget({
  api,
  targetConnection,
  name,
  fzConnectionType,
  placeholder = 'Define bucket or use variable',
  defaultValue = '',
}) {
  const { field } = useController({
    name,
    control: api.control,
  });
  const connId = getOId(targetConnection?.fz_connection_id);
  const cross_id = getOId(targetConnection?.cross_id);
  const selectedBucket = field?.value ? createOption(field?.value) : '';

  const bqTarget = fzConnectionType === ConnectionTypes.GCLOUD;
  const response = useGetMetadataQuery({
    id:
      fzConnectionType && (connId || cross_id)
        ? `${bqTarget ? cross_id : connId}_${fzConnectionType}_${
            MetadataType.BUCKETS
          }`
        : null,
    type: MetadataType.BUCKETS,
    callType: CallType.CONNECTION,
    callFields: {
      dsId: 's3',
      connectionType: bqTarget
        ? TargetTypesV1.GOOGLE_CLOUD_STORAGE.toLowerCase()
        : fzConnectionType,
      connectionCrossId: bqTarget ? cross_id : connId,
    },
  });

  return (
    <HStack alignItems="end" w="full">
      <FormSelect
        label="Bucket Name"
        name={name}
        controlId="bucket_name"
        placeholder={placeholder}
        metadataResponse={response}
        options={response?.data}
        isValidNewOption={isVariableString}
        withCreate
        editableCreate
        api={api}
        value={selectedBucket}
        defaultCreateLabel=""
        defaultValue={defaultValue}
        chakra
      />
      <RiveryButton
        label="Reset to Default"
        variant="outline"
        onClick={() => field?.onChange(defaultValue)}
        disabled={!field?.value}
      />
    </HStack>
  );
}

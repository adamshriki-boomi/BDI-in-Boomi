import { API } from 'api';
import { MetadataType } from 'api/endpoints/metadata.api';
import { FileZoneConnection, OID } from 'api/types';
import { Box, Flex, GridBox } from 'components';
import { isVariableString } from 'containers/River/hooks/useAsyncMetadata';
import * as React from 'react';
import { useEffect } from 'react';
import { useAsyncFn } from 'react-use';
import { useGetMetadataQuery } from 'store/metadata';
import { CallType } from 'store/river/hooks/useRiverForMetadataCall';
import { getCrossId, getOId } from 'utils/api.sanitizer';
import { compare, pluck } from 'utils/array.utils';
import { RadioGroup, RiverySwitch } from '..';
import { createOption, SelectFormGroup } from 'components/Form/components';
const selectProps = {
  getOptionLabel: pluck<any, string>('connection_name'),
  getOptionValue: getCrossId,
};

export type CustomFileZoneEventPayload = {
  id: OID;
  checked: boolean;
  defaultBucket: string;
  fzTargetTypeId: string;
};
type CustomFileZoneProps = {
  connectionType: string;
  // controls the switch on/off status
  name: string;
  value?: CustomFileZoneEventPayload;
  // triggers file zone id change event
  onChange?: (event: CustomFileZoneEventPayload) => any;
};

/**
 * A custom input for custom file zone
 */
export function CustomFileZone({
  name,
  connectionType,
  value: { id, checked, defaultBucket = null, fzTargetTypeId = null },
  onChange,
}: CustomFileZoneProps) {
  const {
    connections,
    connectionsOptions,
    defaultFZTargetsTypeId,
    fzConnection,
  } = useFZConnections(connectionType, checked, fzTargetTypeId);
  const selectedConnection =
    connections?.find(compare('cross_id', getOId(id), getOId)) || {};
  const selectedDefaultBucket = createOption(defaultBucket);
  const idMetadata = `${getOId(id)}_${fzConnection?.datasource_type_id}`;
  const bucketsResponse = useGetMetadataQuery({
    id: idMetadata,
    type: MetadataType.BUCKETS,
    callType: CallType.CONNECTION,
    callFields: {
      dsId: fzConnection?.datasource_type_id,
      connectionType: fzConnection?.connection_type,
      connectionCrossId: getOId(id),
    },
  });
  return (
    <GridBox>
      <Box mt={2}>
        <RiverySwitch
          label="Custom File Zone"
          name={name}
          isChecked={checked}
          onChange={() => {
            onChange({
              checked: !checked,
              id,
              fzTargetTypeId: checked ? fzTargetTypeId : null,
              defaultBucket: fzConnection?.fz_bucket,
            });
          }}
        />
      </Box>
      {checked && connectionsOptions ? (
        <Flex flexDir="column" my={6} gap="2">
          {connectionsOptions?.length > 1 && (
            <RadioGroup
              values={connectionsOptions}
              checked={fzTargetTypeId || defaultFZTargetsTypeId}
              name="target_type_fz"
              onChange={targetFz => {
                const fz = connectionsOptions.find(compare('value', targetFz));
                onChange({
                  checked: checked,
                  id: { $oid: null },
                  fzTargetTypeId: targetFz,
                  defaultBucket: fz?.defaultBucket,
                });
              }}
              aria-label="FZ Target Type"
            />
          )}

          <Flex flexDir="column" m="2" gap="2">
            <SelectFormGroup<FileZoneConnection>
              label="FileZone Connection"
              options={connections}
              placeholder="Select FileZone Connection"
              controlId="select custom filezone"
              value={selectedConnection}
              selectProps={selectProps}
              onChange={connection =>
                onChange({
                  id: connection.cross_id,
                  checked,
                  fzTargetTypeId,
                  defaultBucket: fzConnection?.fz_bucket,
                })
              }
            />
            {Boolean(selectedConnection) ? (
              <Box ml="4">
                <SelectFormGroup
                  label="Default Bucket"
                  options={bucketsResponse?.data}
                  onRefresh={bucketsResponse.refetch}
                  isLoading={bucketsResponse.isFetching}
                  error={bucketsResponse.error?.['message']}
                  pullRequestId={bucketsResponse.error?.['pullRequestId']}
                  isValidNewOption={isVariableString}
                  placeholder="Select Default Bucket"
                  controlId="select default bucket"
                  value={selectedDefaultBucket}
                  onChange={option =>
                    onChange({
                      id,
                      checked,
                      fzTargetTypeId,
                      defaultBucket: option?.value || option,
                    })
                  }
                  withCreate
                  editableCreate
                  isClearable
                  defaultCreateLabel=""
                />
              </Box>
            ) : null}
          </Flex>
        </Flex>
      ) : null}
    </GridBox>
  );
}

const useFZConnections = (
  connectionType: string,
  activate: boolean,
  fzTargetTypeId: string,
) => {
  const [state, getConnections] = useAsyncFn(async () => {
    const response = await API.connections.getFileZoneConnections(
      connectionType,
    );
    const fzConnectionType = response?.targets_list.find(
      compare('_id', fzTargetTypeId || response?.fz_target_type_id),
    );
    const connectionsOptions = response?.targets_list.map(
      ({ _id: value, name: label, fz_bucket: defaultBucket }) => ({
        value,
        label,
        defaultBucket,
      }),
    );
    const connections = await API.connections.fetchConnectionByType(
      fzConnectionType?.connection_type,
    );
    return { response, connections, connectionsOptions };
  }, [connectionType, fzTargetTypeId]);
  const targetsList = state?.value?.response?.targets_list;
  const defaultFZTargetsTypeId = state?.value?.response?.fz_target_type_id;
  const fzConnection = targetsList?.find(
    compare('_id', fzTargetTypeId || defaultFZTargetsTypeId),
  );
  const connections = state?.value?.connections;
  const connectionsOptions = state?.value?.connectionsOptions;

  useEffect(() => {
    if (activate) {
      getConnections();
    }
  }, [activate, getConnections]);

  return {
    state,
    connectionsOptions,
    defaultFZTargetsTypeId,
    fzConnection,
    connections,
    getConnections,
  };
};

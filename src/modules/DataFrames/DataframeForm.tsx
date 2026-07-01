import { Box, Grid } from '@chakra-ui/react';
import { MetadataType } from 'api/endpoints/metadata.api';
import { IDataTarget } from 'api/types';
import { ButtonCreate, RiveryModal } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { createOption, Input, SelectFormGroup } from 'components/Form';
import { RiverySwitch } from 'components/Form/components';
import { Tagger } from 'components/Tracking/Tagger';
import { isVariableString } from 'containers/River/hooks/useAsyncMetadata';
import { useFocusFirstField } from 'hooks/useFocusFirstField';
import { useToastComponent } from 'hooks/useToast';
import { ConnectionBarInput } from 'modules/ConnectionBar';
import { useTargetTypesFilter } from 'modules/Datasources/useLogicTargets';
import React, { useCallback } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useToggle } from 'react-use';
import { useGetMetadataQuery } from 'store/metadata';
import { CallType } from 'store/river/hooks/useRiverForMetadataCall';
import { createOId, getOId } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { useDataFrameNameValidator, useUpdateDataframeMutation } from './store';
import { ICustomLandingZone, IDataframe } from './store/dataframes.types';

enum DataFrameFormEditMode {
  CREATE,
  UPDATE,
}

export function DataFrameFormDialog({ onClick, onCancel, disabled, onSubmit }) {
  const [show, toggle] = useToggle(false);
  return (
    <>
      <ButtonCreate
        onClick={() => {
          toggle(true);
          onClick();
        }}
        fontWeight="bold"
        ml={2}
        disabled={disabled}
        aria-label="new DataFrame"
        size="small"
      >
        Add
      </ButtonCreate>

      <DataFramesFormModal
        show={show}
        toggle={useCallback(() => {
          toggle();
          onCancel();
        }, [toggle, onCancel])}
        onSubmit={onSubmit}
      />
    </>
  );
}
export function DataFrameEditFormDialog({ dataFrame, show, toggle }) {
  const [onUpdate] = useUpdateDataframeMutation();

  const updateDataFrame = useCallback(
    ({ name, ...rest }: IDataframe) => {
      onUpdate({
        name,
        connection_settings: rest?.connection_settings,
        // retention: rest?.retention,
      });
    },
    [onUpdate],
  );
  return (
    <DataFramesFormModal
      dataFrame={dataFrame}
      show={show}
      toggle={toggle}
      onSubmit={updateDataFrame}
      editMode={DataFrameFormEditMode.UPDATE}
    />
  );
}

const createDataFrame = () => ({
  name: '',
  connection_settings: {},
  // retention: { clear_river_end: RetentionTimes.DEFAULT },
});
export function DataFramesFormModal({
  dataFrame = createDataFrame(),
  show = true,
  toggle = null,
  onSubmit,
  editMode = DataFrameFormEditMode.CREATE,
}) {
  const title = `${
    editMode === DataFrameFormEditMode.CREATE ? 'Add' : 'Update'
  } DataFrame`;

  return (
    <RiveryModal
      show={show}
      onClose={toggle}
      onSuccess={toggle}
      centered
      ariaLabel={title}
      title={title}
    >
      <DataFrameForm
        onDone={toggle}
        dataFrame={dataFrame}
        onSubmit={onSubmit}
        editMode={editMode}
      />
    </RiveryModal>
  );
}

type DataFrameFormProps = {
  dataFrame?: Partial<IDataframe>;
  onDone: () => any;
  onSubmit?: (data: any) => any;
  editMode?: DataFrameFormEditMode;
};
function DataFrameForm({
  dataFrame,
  onDone,
  onSubmit,
  editMode = DataFrameFormEditMode.CREATE,
}: DataFrameFormProps) {
  const isDataFrameNameInvalid = useDataFrameNameValidator();
  const { error } = useToastComponent();
  const { handleSubmit, ...useFormApi } = useForm({
    defaultValues: dataFrame,
    mode: 'onChange',
  });
  const {
    formState: { isValid, isDirty },
  } = useFormApi;

  const onFormSubmit = async (formData: Partial<IDataframe>) => {
    const response =
      onSubmit && (await onSubmit({ ...dataFrame, ...formData }));
    const hasError = Boolean(response?.error);
    if (hasError) {
      error({ description: response.error.data });
      return;
    }
    onDone();
  };

  const isUpdateMode = editMode === DataFrameFormEditMode.UPDATE;

  useFocusFirstField(useFormApi, 'name');

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      <RiveryModal.Body>
        <Input
          label="Name"
          placeholder="Enter name..."
          name="name"
          disabled={isUpdateMode}
          api={useFormApi}
          required
          validate={name => {
            const validationResult =
              !isUpdateMode && isDataFrameNameInvalid(name);
            const messages = {
              nameExists: 'DataFrame exists already',
              containsInvalidChars:
                'Dataframe name must contain only letters, digits or underscores and begin with a letter',
              tooLong: 'The DataFrame name is too long',
            };
            return validationResult ? messages[validationResult] : true;
          }}
          chakra
        />
        {/* <Box mb={4}>
        <Controller
          control={useFormApi.control}
          name="retention.clear_river_end"
          render={({ field: { onChange, value } }) => (
            <RetentionTime
              value={value}
              onChange={onChange}
              isDisabled={isRetentionTimeDisabled}
            />
          )}
        />
      </Box> */}
        <Box marginTop="3">
          <Controller
            control={useFormApi.control}
            rules={{
              validate: settings => {
                return (
                  !Boolean(settings) || Object.values(settings).every(Boolean)
                );
              },
            }}
            name="connection_settings"
            render={({ field: { onChange, value } }) => (
              <CustomLandingZone value={value} onChange={onChange} />
            )}
          />
        </Box>
      </RiveryModal.Body>
      <RiveryModal.Footer>
        <Tagger tags="modal-cancel">
          <RiveryButton
            variant="default"
            label="Cancel"
            onClick={() => onDone()}
          />
        </Tagger>
        <RiveryButton
          type="submit"
          variant="primary"
          label={isUpdateMode ? 'Update' : 'Add'}
          aria-label={isUpdateMode ? 'Update' : 'Add'}
          disabled={!isValid || !isDirty}
        />
      </RiveryModal.Footer>
    </form>
  );
}

type CustomLandingZoneProps = {
  value?: ICustomLandingZone | Record<string, any>;
  onChange: (value: ICustomLandingZone | {}) => any;
};

// const retentionTimeOptions = [
//   {
//     label: 'Clear values after the river run completed',
//     value: RetentionTimes.ALWAYS,
//   },
//   {
//     label: 'Never clear data',
//     value: RetentionTimes.NEVER,
//   },
// ];

// function RetentionTime({ value, onChange, isDisabled }) {
//   const retentionValue = retentionTimeOptions.find(compare('value', value));

//   if (isDisabled) return null;

//   return (
//     <SelectFormGroup
//       label="Retention Time"
//       options={retentionTimeOptions}
//       controlId="retention"
//       value={retentionValue}
//       onChange={({ value }) => onChange(value)}
//     />
//   );
// }

function CustomLandingZone({ value, onChange }: CustomLandingZoneProps) {
  const checked = Boolean(value && Object.keys(value)?.length > 0);
  const onPropChange = (props: Partial<ICustomLandingZone>) => {
    onChange({
      ...value,
      ...props,
    });
  };

  const onCustomLandingToggle = () => {
    const payload = checked
      ? {}
      : {
          connection: null,
          default_bucket: '{aws_file_zone}',
          storage_type: 'aws',
          datasource_id: 's3', //default values for form
        };
    onChange(payload);
  };

  return (
    <Grid gap="4">
      <RiverySwitch
        name="Use Custom Landing Zone"
        label="Use Custom Landing Zone"
        isChecked={checked}
        onChange={() => {
          onCustomLandingToggle();
        }}
      />
      {checked ? (
        <>
          <CloudStorageType
            value={value.storage_type}
            onChange={storage => {
              onPropChange({
                storage_type: storage.value,
                default_bucket: storage.bucket,
                datasource_id: storage.datasource_id,
              });
            }}
          />
          <LandingZoneConnections
            value={value.connection}
            dataSourceId={value.datasource_id}
            onChange={connection => onPropChange({ connection })}
            connectionType={value.storage_type}
          />
          {Boolean(value.connection) ? (
            <DefaultBucket
              value={value}
              onChange={bucket =>
                onPropChange({ default_bucket: bucket?.value })
              }
            />
          ) : null}
        </>
      ) : null}
    </Grid>
  );
}

type LandingZoneConnectionsProps = {
  value: string;
  onChange: (value: string) => void;
  connectionType: string;
  dataSourceId: string;
};
function LandingZoneConnections({
  value,
  onChange,
  connectionType,
  dataSourceId,
}: LandingZoneConnectionsProps) {
  return (
    <ConnectionBarInput
      label="Select Landing Zone Connection"
      onChange={({ cross_id }) => onChange(getOId(cross_id))}
      value={createOId(value)}
      dataSourceId={dataSourceId}
      connectionType={connectionType}
      allowCreate={false}
      isRequired
    />
  );
}

function CloudStorageType({ value, onChange }) {
  const isDataframeLandingZone = (target: IDataTarget) => {
    return target?.target_settings?.dataframe_landing_zone;
  };

  const landingZones = useTargetTypesFilter(isDataframeLandingZone).map(
    (target: IDataTarget) => ({
      label: target?.name,
      value: target?.connection_type,
      datasource_id: target?.datasource_type_id,
      bucket: target?.file_zone_settings?.bucket,
    }),
  );

  return (
    <SelectFormGroup
      label="Cloud Storage Type"
      options={landingZones}
      controlId="cloud storage type"
      value={landingZones.find(compare('value', value))}
      isRequired
      onChange={option => {
        onChange(option);
        // onBucketChange(option?.bucket);
      }}
    />
  );
}

function DefaultBucket({ value, onChange }) {
  const bucketsResponse = useGetMetadataQuery({
    id: value?.connection,
    type: MetadataType.BUCKETS,
    callType: CallType.CONNECTION,
    callFields: {
      dsId: value?.datasource_id,
      connectionType: value?.storage_type,
      connectionCrossId: value?.connection,
    },
  });

  return (
    <SelectFormGroup
      label="Default Bucket"
      value={createOption(value.default_bucket)}
      onChange={onChange}
      onRefresh={bucketsResponse.refetch}
      error={bucketsResponse.error?.['message']}
      pullRequestId={bucketsResponse.error?.['pullRequestId']}
      isLoading={bucketsResponse.isFetching}
      metadataResponse={bucketsResponse}
      options={bucketsResponse?.data}
      isValidNewOption={isVariableString}
      placeholder="Select Default Bucket"
      controlId="select default bucket"
      withCreate
      editableCreate
      defaultCreateLabel=""
    />
  );
}

import { TargetTypesV1 } from 'api/types';
import {
  Box,
  ConfirmationModal,
  Divider,
  Flex,
  RenderGuard,
  RiveryButton,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { InputLabel, RadioGroup } from 'components/Form';
import { DataSetSelect } from 'containers/River/Targets/components/MetaQuery/DataSetSelect';
import { useController, useFormContext } from 'react-hook-form';
import { useToggle } from 'react-use';
import {
  CollapseWrap,
  RiveryMetadataField,
  SettingsHeader,
} from './commonTargetSettings';
import { CustomFzTarget } from './CustomFzTarget';

export enum SQLDialectsOptions {
  STANDARD = 'Standard SQL',
  LEGACY = 'Legacy SQL',
}

export enum SQLDialectsValues {
  STANDARD = 'standard',
  LEGACY = 'legacy',
}

export function TargetBigQuery({ connectionReady }) {
  const formApi = useFormContext();
  const { field: connectionIdField } = useController({
    name: 'river.properties.target.connection_id',
    control: formApi.control,
  });

  const { field: sqlDialect } = useController({
    name: 'river.properties.target.sql_dialect',
    control: formApi.control,
    defaultValue: SQLDialectsValues.STANDARD,
  });
  return (
    <>
      <SettingsHeader />
      <Box w="full">
        <DataSetSelect
          ariaLabel="dataset_id"
          isV1
          name="river.properties.target.dataset_id"
          connectionId={connectionIdField.value}
          useFormApi={formApi}
          datasource_id={TargetTypesV1.BIG_QUERY}
          task_type="target"
          required="DataSet is required"
          isCreatable
        />
      </Box>
      <CollapseWrap>
        <Flex flexDir="column" gap={4}>
          <SQLDialects
            value={sqlDialect.value}
            onChange={sqlDialect.onChange}
          />
          <RiveryMetadataField formApi={formApi} />
          <Divider />
          <CustomFzTarget connId={connectionIdField.value} api={formApi} bq />
        </Flex>
      </CollapseWrap>
    </>
  );
}

function PartiotioningLink() {
  return (
    <RiveryButton
      variant="link"
      label="this link"
      href="https://help.boomi.com/docs/Atomsphere/Data_Integration/Targets/GoogleBigQuery/partitioning-and-clustering-in-bigquery"
      target="_blank"
      mx={0.5}
    />
  );
}

const options = [
  { label: SQLDialectsOptions.STANDARD, value: SQLDialectsValues.STANDARD },
  {
    label: SQLDialectsOptions.LEGACY,
    value: SQLDialectsValues.LEGACY,
  },
];
const optionsLegacyDisabled = [options[0], { ...options[1], disabled: true }];

export function SQLDialects({ onChange, value, hideAlert = false }) {
  const [showConfirmation, toggleConfirmation] = useToggle(false);
  const currentOptions =
    value === SQLDialectsValues.LEGACY ? options : optionsLegacyDisabled;
  return (
    <Flex flexDir="column" gap={2}>
      <InputLabel variant="semibold" label="SQL Dialects" />
      <RadioGroup
        label=""
        name="sql dialects"
        values={currentOptions}
        checked={value}
        onChange={option => {
          if (option === SQLDialectsValues.LEGACY) {
            // remove the option to move to legacy as a part of the deprecation
            // toggleConfirmation(true);
            return;
          }
          onChange(SQLDialectsValues.STANDARD);
        }}
      />
      <RenderGuard condition={!Boolean(hideAlert) && !value}>
        <RiveryAlert
          variant="warning-light"
          description={
            <Box>
              If your Target table already exists, a problem may occur in
              updating your Table structure. Please visit <PartiotioningLink />{' '}
              before running the Data Flow and follow the instructions.
            </Box>
          }
        />
      </RenderGuard>
      <ConfirmationModal
        show={showConfirmation}
        title="Switch to Legacy SQL"
        variant="warning"
        confirmColorScheme="purple"
        confirmLabel="Switch"
        onConfirm={() => onChange(SQLDialectsValues.LEGACY)}
        onClose={() => toggleConfirmation(false)}
      >
        <Box>
          We highly recommend not switching to Legacy Mode if your Target Table
          already exists. By switching, there might be difficulties in
          supporting Append or Merge functions which could cause data loss. Note
          that this action will cause record columns to flatten. For more
          information, visit <PartiotioningLink /> before running the Data Flow
          and follow the instructions.
        </Box>
      </ConfirmationModal>
    </Flex>
  );
}

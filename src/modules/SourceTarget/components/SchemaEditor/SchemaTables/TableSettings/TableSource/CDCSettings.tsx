import { Flex, InfoTooltip, Text } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { RiverySwitch } from 'components/Form';
import { RiveryRadioGroup } from 'components/Form/components/RiveryRadioGroup';
import {
  CDCTableStatus,
  SyncOption,
} from 'modules/SourceTarget/components/form/form.consts';
import { ExportChunkSize } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/TableSource/SourceCommonSettings';
import { useCallback } from 'react';
import { FormProvider, useController } from 'react-hook-form';

export function CDCSettings({ table, source }) {
  const tableStatus = table.watch('table.table_status');
  const waitingForMigration =
    tableStatus === CDCTableStatus.WAITING_FOR_MIGRATION ||
    (source.additional_settings.default_sync_option ===
      SyncOption.RUN_INITIAL_MIGRATION &&
      !tableStatus);
  const { field: tableField } = useController({
    name: 'table',
    control: table?.control,
  });

  const { field: overwriteInMigration } = useController({
    name: 'table.cdc_settings.overwrite_table_in_migration',
    control: table?.control,
  });

  useController({
    name: 'table.exporter_chunk_size',
    control: table.control,
    defaultValue: 30000,
  });

  const changeStatus = useCallback(
    ({ target }) => {
      setTableStatus(target.checked, tableField, source);
    },
    [source, tableField],
  );
  return (
    <>
      <Flex w="450px" flexDir="column" gap={2}>
        <RiverySwitch
          label="Perform Initial Migration"
          leftLabel
          ml="auto"
          isChecked={Boolean(waitingForMigration)}
          onChange={changeStatus}
        />
        <RiveryAlert
          variant="info"
          icon={InfoTooltip}
          description="The initial migration is a one-time process. When enabled, it will stay active until the Data Flow runs, after which it will deactivate automatically."
        />
      </Flex>
      <Flex w="450px" position="relative">
        <Flex ml={2} flexDir="column" gap={2}>
          <Text>Choose Loading mode for the Initial Migration results:</Text>
          <RiveryRadioGroup
            defaultValue={
              Boolean(waitingForMigration)
                ? overwriteInMigration?.value === false
                  ? 'merge'
                  : 'overwrite'
                : null
            }
            onChange={option =>
              overwriteInMigration.onChange(Boolean(option === 'overwrite'))
            }
            values={[
              {
                label:
                  'Overwrite the existing Target Table with the initial migration results.',
                value: 'overwrite',
                isDisabled: !Boolean(waitingForMigration),
              },
              {
                label:
                  'Merge the Initial migration results into the Target Table, if exists.',
                value: 'merge',
                isDisabled: !Boolean(waitingForMigration),
              },
            ]}
            {...(!Boolean(waitingForMigration) && { value: null })}
          />
        </Flex>
      </Flex>
      <Flex w="450px" position="relative">
        <FormProvider {...table}>
          <ExportChunkSize />
        </FormProvider>
      </Flex>
    </>
  );
}

function setTableStatus(isChecked, table, source) {
  const tableStatus = table?.value?.table_status;

  const { table_status, cdc_settings, ...restSettings } = table.value;
  if (isChecked) {
    table.onChange({
      ...restSettings,
      table_status: CDCTableStatus.WAITING_FOR_MIGRATION,
      cdc_settings: {
        ...cdc_settings,
        overwrite_table_in_migration: true,
        initiate_table: true,
      },
    });
  } else {
    if (
      source.additional_settings.default_sync_option ===
        SyncOption.SKIP_INITIAL_MIGRATION &&
      !tableStatus
    ) {
      table.onChange({
        ...restSettings,
      });
    } else {
      table.onChange({
        ...restSettings,
        table_status: CDCTableStatus.LIVE,
        cdc_settings: {
          ...cdc_settings,
          initiate_table: false,
        },
      });
    }
  }
}

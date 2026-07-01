import { Flex, RiveryButton, RiveryModal, Text } from 'components';
import { RiveryRadioGroup } from 'components/Form/components/RiveryRadioGroup';
import { IRiverExtractMethod } from 'modules/SourceTarget/store';
import { useEffectOnce, useToggle } from 'react-use';
import { SYNC_OPTION, SyncOption } from '../form.consts';
import { useSttController } from '../form.controllers';
import { useGetSchemaTableNameCaption } from 'modules/SourceTarget/hooks';

const DEFAULT_OPTION = SyncOption.RUN_INITIAL_MIGRATION;

export function InitialMigrationModal({ extractMethod }) {
  const {
    field: { value: syncOption, onChange: onSyncOptionChange },
  } = useSttController({
    name: SYNC_OPTION,
  });
  useEffectOnce(() => {
    onSyncOptionChange(syncOption ?? DEFAULT_OPTION);
  });
  const [open, toggle] = useToggle(
    extractMethod === IRiverExtractMethod.LOG && !syncOption,
  );
  return (
    <RiveryModal
      title="Initial Migration Process Default Settings"
      variant="info"
      modalProps={{ closeOnOverlayClick: false, isClosable: false }}
      show={open}
      footer={{
        cancelLabel: null,
        saveLabel: (
          <RiveryButton
            label="Continue"
            variant="primary"
            onClick={() => {
              toggle(false);
            }}
          />
        ),
      }}
    >
      <InitialMigrationContent
        syncOption={syncOption}
        onSyncOptionChange={onSyncOptionChange}
      />
    </RiveryModal>
  );
}

export function InitialMigrationContent({
  syncOption,
  onSyncOptionChange,
  view = 'modal',
}) {
  const isModalView = view === 'modal';
  const { tableNameCaption } = useGetSchemaTableNameCaption();
  return (
    <Flex
      flexDir="column"
      gap={2}
      py={isModalView ? 5 : 2}
      px={isModalView ? 6 : 0}
    >
      <Text>
        Select the default data migration method for this Data Flow. This
        setting could also be adjusted per {tableNameCaption}.
      </Text>
      <RiveryRadioGroup
        defaultValue={syncOption}
        onChange={option => {
          onSyncOptionChange(option);
        }}
        value={syncOption}
        values={[
          {
            label: 'Enable Initial Migration',
            value: SyncOption.RUN_INITIAL_MIGRATION,
            description:
              'The initial migration is a one-time process for loading historical data. When enabled, it will stay active until the Data Flow runs, after which it will deactivate automatically.',
          },
          {
            label: 'Skip Initial Migration',
            value: SyncOption.SKIP_INITIAL_MIGRATION,
            description: `Retrieve changes in your data through CDC process, while skipping initial migration. Each selected ${tableNameCaption} will enter ”Waiting For Sync” status.`,
          },
        ]}
      />
    </Flex>
  );
}

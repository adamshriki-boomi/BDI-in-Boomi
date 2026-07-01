import { Flex, RenderGuard } from 'components';
import { Input, RiverySwitch, SwitchComplexLabel } from 'components/Form';
import { useSttFormContext } from 'modules/SourceTarget/components/form';
import { EXTRACT_API } from 'modules/SourceTarget/components/form/form.consts';
import { useEffectOnce } from 'react-use';
import { useTableSettings, useTableSettingsFormContext } from '../form.hooks';
import { DefaultSettings } from './DefaultSourceSettings';

const PK_CHUNKING_TABLE_NAMES = [
  'Account',
  'Campaign',
  'CampaignMember',
  'Case',
  'CaseHistory',
  'Contact',
  'Event',
  'EventRelation',
  'Lead',
  'LoginHistory',
  'Opportunity',
  'Task',
  'User',
];

function SalesforcePkChunking() {
  const mainFormApi = useSttFormContext();
  const formApi = useTableSettingsFormContext();
  const definitions = formApi?.watch('definitions');
  const tableName = definitions?.id;
  const isPkChunkingTable =
    tableName && PK_CHUNKING_TABLE_NAMES.includes(tableName);

  const extractApi = mainFormApi?.watch(EXTRACT_API);
  const isBulk = extractApi === 'bulk';

  const { value: pkChunking, update } = useTableSettings(
    'additional_source_settings.pk_chunking',
  );

  return (
    <RenderGuard condition={isPkChunkingTable && isBulk}>
      <Flex flexDir="column" w="450px" gap={2} my={4}>
        <Input
          type="number"
          label="PK chunking"
          inputProps={{ min: 100000, max: 250000 }}
          fieldHeight="30px"
          w="full"
          value={pkChunking != null ? Number(pkChunking) : undefined}
          onChange={(_valueAsString, valueAsNumber) =>
            update(Number.isNaN(valueAsNumber) ? undefined : valueAsNumber)
          }
          placeholder="Set a number between 100,000 and 250,000"
          name="table.additional_source_settings.pk_chunking"
          // api={formApi}
          helpText="Automatic primary key chunking splits bulk queries on very large
          tables into chunks based on the record IDs, or primary keys, of the
          queried records."
        />
      </Flex>
    </RenderGuard>
  );
}

function SalesforceIncludeDeletedRows({
  sourceIncludeDeletedRows,
}: {
  sourceIncludeDeletedRows?: boolean;
}) {
  const { value: tableIncludeDeletedRows, update } = useTableSettings(
    'additional_source_settings.include_deleted_rows',
  );

  useEffectOnce(() => {
    if (tableIncludeDeletedRows == null) {
      update(sourceIncludeDeletedRows ?? false);
    }
  });

  return (
    <Flex flexDir="column" w="450px" gap={2} mt={4}>
      <RiverySwitch
        formControlStyle={{ alignItems: 'baseline' }}
        label={
          <SwitchComplexLabel
            label="Include Deleted Rows"
            description="This option will also pull deleted rows. The rows key fields will remain the same, and the rest of the fields will be NULL."
          />
        }
        leftLabel
        ml="auto"
        isChecked={Boolean(tableIncludeDeletedRows) ?? false}
        onChange={({ target }) => update(target.checked)}
        name="table.additional_source_settings.include_deleted_rows"
      />
    </Flex>
  );
}

export function SalesforceV3Settings({ sourceDefinition, targetDefinition }) {
  return (
    <DefaultSettings
      sourceDefinition={sourceDefinition}
      targetDefinition={targetDefinition}
      additionalSourceSettingsTop={
        <Flex flexDir="column" gap={0}>
          <SalesforceIncludeDeletedRows
            sourceIncludeDeletedRows={
              sourceDefinition?.additional_settings?.include_deleted_rows
            }
          />
          <SalesforcePkChunking />
        </Flex>
      }
    />
  );
}

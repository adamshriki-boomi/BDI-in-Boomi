import { IDataSource, IDataSourceV1 } from 'api/types';
import { Flex } from 'components';
import { BlueprintBody } from 'containers/BluePrints/components/AddBlueprint';
import ConnectionsExplorer from 'containers/Connections/ConnectionsExplorer';
import { useDataSourcesSections } from 'modules/Datasources';
import { useIsInNewS2TRiver } from 'modules/RiverRightBar';
import { useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { getCrossId } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { createSourceLegacyRoute } from '../hooks';
import { IRiverExtractMethod } from '../store';
import { ConnectionSetup } from './ConnectionSetup';
import { ChangeConnectionConfirmation } from './ConnectionSetup/ConfirmChangeConnection';
import { useIsCustomQuery, useIsRiverActive } from './form';
import { EXTRACT_METHOD } from './form/form.consts';

// TODO should set source be a urlParam?
export function SetupDataSource({ reactivate = false }) {
  const isNewRiver = useIsInNewS2TRiver();
  const { sections, entities } = useDataSourcesSections('source');
  const history = useHistory();
  const { envId: env, selectedAccountId: account } = useCore();

  const formApi = useFormContext();
  const isCustomQuery = useIsCustomQuery();

  const { field: sourceField } = useController({
    name: 'river.properties.source.name',
    control: formApi.control,
  });
  const { field: schemas } = useController({
    name: 'river.properties.schemas',
    control: formApi.control,
  });
  const changeSource = (value: IDataSourceV1) => {
    if (value.status === 'enabled') {
      if (value.data_source_type_settings?.is_new_interface) {
        sourceField.onChange(value?.api_name ?? value?.id);
        schemas.onChange({});
        // In custom query mode the source change invalidates both the query
        // (written against the previous source) and its resulting mapping.
        if (isCustomQuery) {
          formApi.setValue(
            'river.properties.source.custom_query_source_settings.query',
            '',
            { shouldDirty: true },
          );
          formApi.setValue(
            'river.properties.target.single_table_settings.mapping',
            [],
            { shouldDirty: true },
          );
        }
      } else {
        history.push(
          createSourceLegacyRoute(account, env, `selected_source=${value.id}`),
        );
      }
    }
  };

  const isBlueprintCopilotView = sourceField.value === 'blueprint_copilot';

  const source = sourceField?.value
    ? isBlueprintCopilotView
      ? true
      : entities?.find(compare('api_name', sourceField.value)) ??
        entities?.find(compare('id', sourceField.value))
    : null;

  return isNewRiver && !source ? (
    <>
      <ConnectionsExplorer
        connections={entities}
        connectionSections={sections}
        type="Source"
        onSelect={changeSource}
      />
    </>
  ) : isBlueprintCopilotView ? (
    <BlueprintBody s2t />
  ) : (
    <ConnectionSetupControl
      formApi={formApi}
      source={source}
      reactivate={reactivate}
    />
  );
}

function ConnectionSetupControl({ formApi: { control }, source, reactivate }) {
  const isRiverActive = useIsRiverActive();
  const isCustomQuery = useIsCustomQuery();
  const [showConfirmation, toggleConfirmation] = useToggle(false);
  const { field: sourceIdField } = useController({
    name: 'river.properties.source.connection_id',
    control,
  });
  const { field: extractMethod } = useController({
    name: EXTRACT_METHOD,
    control,
  });
  const isCDCRiver = extractMethod?.value === IRiverExtractMethod.LOG;
  const [selectedConnection, setSelectedConnection] = useState(
    sourceIdField.value,
  );

  const { field: schemas } = useController({
    name: 'river.properties.schemas',
    control: control,
  });
  const { field: mapping } = useController({
    name: 'river.properties.target.single_table_settings.mapping',
    control: control,
  });

  // The metadata a connection change might invalidate differs by mode: the
  // schema in standard extraction, the mapping in custom query. Only prompt the
  // confirmation when there is something to lose.
  const hasMetadata = isCustomQuery
    ? Boolean(mapping.value?.length)
    : Boolean(Object.keys(schemas.value ?? {})?.length);

  return (
    <Flex
      flexDir="column"
      gap={8}
      height="full"
      w="full"
      overflow="auto"
      sx={{
        scrollbarGutter: 'stable',
      }}
    >
      <ConnectionSetup<IDataSource>
        datasource={source}
        value={sourceIdField.value}
        onChange={connection => {
          setSelectedConnection(getCrossId(connection));
          if (reactivate) {
            toggleConfirmation(true);
            return;
          } else if (
            !Boolean(sourceIdField.value) ||
            !hasMetadata ||
            (isCDCRiver && isRiverActive)
          ) {
            sourceIdField.onChange(getCrossId(connection));
            return;
          } else if (!isCDCRiver || (isCDCRiver && !isRiverActive)) {
            toggleConfirmation(true);
          }
        }}
        label="Source"
      />

      <ChangeConnectionConfirmation
        showConfirmation={showConfirmation}
        toggleConfirmation={toggleConfirmation}
        onChange={() => sourceIdField.onChange(selectedConnection)}
        onDismiss={() => sourceIdField.onChange(sourceIdField.value)}
      />
    </Flex>
  );
}

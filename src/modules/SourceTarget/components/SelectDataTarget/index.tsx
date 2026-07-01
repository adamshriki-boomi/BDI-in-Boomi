import { chakra } from '@chakra-ui/react';
import { IDataTarget } from 'api/types';
import { Flex, RenderGuard } from 'components';
import ConnectionsExplorer from 'containers/Connections/ConnectionsExplorer';
import {
  getSourceFromAPIName,
  useDataSourcesSections,
} from 'modules/Datasources';
import { useGetTarget } from 'modules/Datasources/useLogicTargets';
import { useIsInNewS2TRiver } from 'modules/RiverRightBar';
import { createSourceLegacyRoute } from 'modules/SourceTarget/hooks';
import { IRiverExtractMethod } from 'modules/SourceTarget/store';
import { useCallback, useEffect } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useHistory } from 'react-router-dom';
import { useCore } from 'store/core';
import { getCrossId } from 'utils/api.sanitizer';
import { ConnectionSetup } from '../ConnectionSetup';
import {
  useIsDisabledRiverForm,
  useShouldDisplayExtractMethod,
  useSttController,
} from '../form';
import { EXTRACT_METHOD } from '../form/form.consts';
import DataTargetSettings from './DataTargetSettings';
import setConnectionDefaults from './DataTargetSettings/connectionDefaults';
import { TargetEmail } from './DataTargetSettings/TargetEmail';

export function SelectDataTarget() {
  const isNewRiver = useIsInNewS2TRiver();
  const shouldDisableForm = useIsDisabledRiverForm();
  const { sections, entities } = useDataSourcesSections('target');
  const formApi = useFormContext();
  const history = useHistory();
  const { envId, selectedAccountId: accountId } = useCore();
  const { entities: entitiesSource } = useDataSourcesSections('source');
  const {
    field: { value: extractMethod, onChange: setExtractMethodInForm },
  } = useSttController({
    name: EXTRACT_METHOD,
  });
  const shouldDisplayExtractMethod = useShouldDisplayExtractMethod();

  const { field: sourceField } = useController({
    name: 'river.properties.source.name',
    control: formApi.control,
  });
  const { field: sourceConnection } = useController({
    name: 'river.properties.source.connection_id',
    control: formApi.control,
  });
  const { field: targetField } = useController({
    name: 'river.properties.target.name',
    control: formApi.control,
  });
  const { field: connectionIdField } = useController({
    name: 'river.properties.target.connection_id',
    control: formApi.control,
  });

  const target = useGetTarget(targetField.value);

  useEffect(() => {
    if (
      targetField.value &&
      !extractMethod &&
      shouldDisplayExtractMethod === false
    ) {
      setExtractMethodInForm(IRiverExtractMethod.ALL);
    }
  }, [
    targetField.value,
    shouldDisplayExtractMethod,
    extractMethod,
    setExtractMethodInForm,
  ]);
  const onConnectionChange = useCallback(
    connection => {
      const river = formApi.watch('river');
      const properties = river?.properties;
      const currentConnection = properties?.target?.connection_id;
      if (currentConnection !== getCrossId(connection)) {
        formApi.setValue(
          'river',
          {
            ...river,
            properties: {
              ...properties,
              target: {
                ...properties?.target,
                ...setConnectionDefaults(
                  connection,
                  formApi,
                  targetField.value,
                ),
              },
            },
          },
          { shouldDirty: true, shouldTouch: true, shouldValidate: true },
        );
      }
    },
    [formApi, targetField.value],
  );

  return isNewRiver && !target && !Boolean(targetField?.value) ? (
    <ConnectionsExplorer
      connections={entities}
      connectionSections={sections}
      type="Target"
      onSelect={value => {
        if (value.data_source_type_settings?.is_new_interface) {
          const selectedTarget = value?.api_name ?? value?.id;
          targetField.onChange(selectedTarget);
        } else {
          const source = getSourceFromAPIName(
            entitiesSource,
            sourceField?.value,
          )?.id;
          const additionalParams = `ds=${source}&target=${value.id}&source_connection=${sourceConnection?.value}`;
          history.push(
            createSourceLegacyRoute(accountId, envId, additionalParams),
          );
        }
      }}
    />
  ) : (
    <RenderGuard
      condition={targetField.value !== 'target_email'}
      fallback={<TargetEmail connection={target} />}
    >
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
        <ConnectionSetup<IDataTarget>
          datasource={target}
          value={connectionIdField.value}
          onChange={onConnectionChange}
          label="Target"
        />
        <chakra.fieldset disabled={shouldDisableForm}>
          <DataTargetSettings type={targetField.value} />
        </chakra.fieldset>
      </Flex>
    </RenderGuard>
  );
}

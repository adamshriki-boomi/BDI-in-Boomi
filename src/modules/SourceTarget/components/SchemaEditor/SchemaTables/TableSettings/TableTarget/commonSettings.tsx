import { chakra } from '@chakra-ui/react';
import { Box, Flex, Grid, RenderGuard, Text } from 'components';
import {
  Input,
  InputLabel,
  RiverySwitch,
  SwitchComplexLabel,
} from 'components/Form';
import { getMergeMethods } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/commonMergeMethod';
import { SingleTableTargetSettings } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/commonTargetDefinitions';
import { useToggle } from 'react-use';
import { useTableSettings, useTableSettingsFormContext } from '../form.hooks';

export function CommonTableSettings({
  targetDefinition,
  fieldNames,
  beforeOverrideOptions = null,
  afterOverrideOptions = null,
  targetOverrideOptions = null,
}) {
  const { value: tableTargetLoading } = useTableSettings(
    'additional_target_settings.target_loading',
  );
  const { value: tableMergeMethod } = useTableSettings(
    'additional_target_settings.merge_method',
  );
  const { value: tableOrderedMergeKey } = useTableSettings(
    'additional_target_settings.is_ordered_merge_key',
  );
  const formApi = useTableSettingsFormContext();
  const isNotDefaultLoadingMode =
    tableTargetLoading &&
    targetDefinition?.loading_method !== tableTargetLoading;
  const isNotDefaultMergeMethod =
    tableMergeMethod && targetDefinition?.merge_method !== tableMergeMethod;
  const isNotDefaultFilterLogicalKey =
    tableOrderedMergeKey &&
    targetDefinition?.is_ordered_merge_key !== tableOrderedMergeKey;
  const [view, setView] = useToggle(
    [
      isNotDefaultLoadingMode,
      isNotDefaultMergeMethod,
      isNotDefaultFilterLogicalKey,
    ].some(Boolean),
  );

  return (
    <Grid gap="3">
      <Text textStyle="R7" color="font-secondary" gridColumn="1">
        Set up the setting to your Target Data.
      </Text>
      <Grid gap="6" maxW="450px">
        <TargetTableName formApi={formApi} />
        {beforeOverrideOptions}
        <Grid gridColumn="1" gap="4" maxW="450px">
          <RiverySwitch
            label={
              <SwitchComplexLabel
                label="Override Default Target Settings"
                labelStyle={{ textStyle: 'M6', color: 'primary' }}
                description="Customize Table settings by overriding default Target definitions"
                descriptionStyle={{ textStyle: 'R8', color: 'font' }}
              />
            }
            leftLabel
            formControlStyle={{
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
            onChange={({ target }) => {
              if (
                [
                  isNotDefaultLoadingMode,
                  isNotDefaultMergeMethod,
                  isNotDefaultFilterLogicalKey,
                ].some(Boolean)
              ) {
                //There's no point in setting it to false if it's actualy on
                return;
              }
              setView(target.checked);
            }}
            isChecked={view}
          />
          <Box pl={4}>
            <OverlayDiv active={view}>
              <InputLabel variant="semibold" label="Table Loading Mode" />
              <Flex gap={3} flexDir="column" maxW="450px">
                <SingleTableTargetSettings
                  formApi={formApi}
                  targetField={targetDefinition}
                  fieldNames={fieldNames}
                  isTableView
                  children={targetOverrideOptions}
                  mergeMethods={getMergeMethods(targetDefinition.name)}
                />
              </Flex>
            </OverlayDiv>
          </Box>
        </Grid>
        {afterOverrideOptions}
      </Grid>
    </Grid>
  );
}

function OverlayDiv({ children, active = false }) {
  return active ? (
    children
  ) : (
    <Box opacity="0.5" zIndex="modal" bgColor="white" w="full">
      <chakra.fieldset
        disabled
        sx={{
          '& .select-form-group__control': {
            pointerEvents: 'none',
          },
        }}
      >
        {children}
      </chakra.fieldset>
    </Box>
  );
}

export function TargetTableName({
  formApi,
  name = 'table.target_table',
  isBlueprint = false,
}) {
  return (
    <Box gridColumn="1">
      <RenderGuard
        condition={!isBlueprint}
        fallback={
          <Text color="primary" display="inline">
            Target Table Name
          </Text>
        }
      >
        <InputLabel variant="semibold" label="Target Table Name" />
      </RenderGuard>
      <Input
        label="Set a name for the current Target table. The new one will replace the
  previous name only for this table."
        placeholder="Set Target Table Name"
        name={name}
        api={formApi}
        chakra
        optional
      />
    </Box>
  );
}

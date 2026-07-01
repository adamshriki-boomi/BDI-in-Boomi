import { Flex, Grid, StyleProps, Text } from '@chakra-ui/react';
import { ILogicStep, SourceType, TargetTypes } from 'api/types';
import {
  Box,
  ConfirmationModal,
  Image,
  RenderGuard,
  RiveryButton,
  RiveryInfoTooltip,
} from 'components';
import { RadioGroup, RiverySwitch } from 'components/Form/components';
import { Dataframe, DataframeKey } from 'modules/DataFrames';
import { useTargetByBlockType } from 'modules/Datasources/useLogicTargets';
import React from 'react';
import { useEffectOnce, useToggle } from 'react-use';
import { useAccount } from 'store/core/hooks';
import { AdvancedOptions } from './AdvancedOptions/AdvancedOptions';
import { Collapse, DisplayVariantProps } from './Collapse';
import { getSqlTitle, isExecute } from './hooks/useSqlEditorProps';
import { useTitles } from './hooks/useTitles';
import { ScriptEditorRenderer } from './ScriptEditor';

enum Mode {
  MINIMAL = 'minimal',
  DEFAULT = 'default',
}

interface SourceProps extends DisplayVariantProps, StyleProps {
  node: ILogicStep;
  mode?: Mode;
  onSourceTypeChange: (value: string, newContent: any) => void;
  onAutoCommitChange: (checked: boolean) => void;
}

Source.Mode = Mode;
export function Source({
  node,
  mode = Mode.DEFAULT,
  onSourceTypeChange,
  onAutoCommitChange,
  displayVariant = Collapse.DisplayVariant.DEFAULT,
  ...props
}: SourceProps) {
  const {
    content: { block_type },
    content,
    step_name,
  } = node;
  const { target } = useTitles(block_type);

  const isDefaultMode = Mode.DEFAULT === mode;

  if (displayVariant === Collapse.DisplayVariant.SUMMARY) {
    return (
      <>
        {content?.source_type === SourceType.DATAFRAME ? (
          <Dataframe
            node={node}
            dataframeKey={DataframeKey.SOURCE}
            displayVariant={Collapse.DisplayVariant.SUMMARY}
          />
        ) : (
          <>
            <Flex minW={14} justifyContent="center">
              <Image
                src={`${target?.icon}`}
                alt={`separator ${target?.name}`}
                size={Image.Size.XS}
              />
            </Flex>
            {content?.sql_query ? (
              <>
                <span>SQL:</span>
                <Text
                  flexShrink={1}
                  overflow="hidden"
                  whiteSpace="nowrap"
                  textOverflow="ellipsis"
                >
                  {content?.sql_query}
                </Text>
              </>
            ) : null}
          </>
        )}
      </>
    );
  }

  return (
    <Box {...props}>
      <SourceTypeComponent
        content={content}
        stepName={step_name}
        onSourceTypeChange={onSourceTypeChange}
      />
      {isDefaultMode && (
        <>
          {content.source_type === SourceType.DATAFRAME ? (
            <Dataframe node={node} dataframeKey={DataframeKey.SOURCE} />
          ) : (
            <>
              <ScriptEditorRenderer
                node={node}
                buttonVariant="light-transparent"
                title={`${getSqlTitle(isExecute(node))} - ${step_name}`}
                type="SQL"
              />
              <Box pt={4}>
                <RenderGuard
                  condition={
                    block_type === TargetTypes.SNOWFLAKE &&
                    content.source_type === SourceType.SQL_SCRIPT
                  }
                >
                  <AutoCommitToggle
                    checked={content.autocommit}
                    onAutoCommitChange={onAutoCommitChange}
                  />
                </RenderGuard>
              </Box>
              <AdvancedOptions node={node} />
            </>
          )}
        </>
      )}
    </Box>
  );
}

function AutoCommitToggle({ onAutoCommitChange, checked }) {
  const [showConfirmation, toggleConfirmation] = useToggle(false);
  useEffectOnce(() => {
    if (checked === undefined) {
      onAutoCommitChange(true);
    }
  });
  return (
    <>
      <Grid templateColumns="320px 1px" alignItems="center">
        <RiverySwitch
          label="AUTOCOMMIT transactions after execution"
          onChange={({ target: { checked } }) => {
            if (!checked) {
              toggleConfirmation(true);
              return;
            }
            onAutoCommitChange(checked);
          }}
          isChecked={checked}
        />
        <RiveryInfoTooltip
          description={
            <Box>
              Statements are automatically committed if they succeed, and
              automatically rolled back if fail. Statements inside an explicit
              transaction are not affected by AUTOCOMMIT. While disabled - the
              transactions should be fully managed in the Snowflake stored
              procedure. If the stored procedure’s active transaction was
              started and closed implicitly, Snowflake rolls back the active
              transaction and issues an error message.{' '}
              <RiveryButton
                label="Read More"
                variant="link"
                href="https://docs.snowflake.com/en/sql-reference/parameters#label-autocommit"
                target="_blank"
              />
            </Box>
          }
        />
      </Grid>
      <ConfirmationModal
        show={showConfirmation}
        onClose={() => toggleConfirmation(false)}
        title="Warning"
        variant="warning"
        onConfirm={() => {
          onAutoCommitChange(false);
        }}
        confirmLabel="Disable"
        cancelLabel="Cancel"
      >
        <Box>
          Make sure your stored procedure is managed properly, otherwise it may
          cause the data not to be fully updated or the run will fail.{' '}
          <RiveryButton
            label="Read More"
            variant="link"
            href="https://docs.snowflake.com/developer-guide/stored-procedure/stored-procedures-usage#transaction-management"
            target="_blank"
          />
        </Box>
      </ConfirmationModal>
    </>
  );
}

const SourceTypeComponent = ({ content, stepName, onSourceTypeChange }) => {
  const { source_type: sourceType } = content;
  const { isSettingOn } = useAccount();
  const selectedDataTarget = useTargetByBlockType(content?.block_type);

  const hasDataframes =
    isSettingOn('allow_logic_python') &&
    selectedDataTarget?.target_settings?.dataframe_as_source;

  const getSourceTypes = [
    {
      label: 'SQL Query',
      value: SourceType.SQL_QUERY,
      ariaLabel: 'Source Type SQL Query',
    },
    {
      label: 'SQL Script',
      value: SourceType.SQL_SCRIPT,
      ariaLabel: 'Source Type SQL Script',
    },
    hasDataframes && {
      label: 'DataFrame',
      value: SourceType.DATAFRAME,
      ariaLabel: 'Source Type DataFrame',
    },
  ].filter(Boolean);
  return (
    <RadioGroup
      values={getSourceTypes}
      checked={sourceType}
      name="source_type"
      onChange={onSourceTypeChange}
      aria-label={`Source Type ${stepName}`}
    />
  );
};

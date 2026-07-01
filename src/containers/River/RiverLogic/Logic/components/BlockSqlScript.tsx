import { Box } from '@chakra-ui/react';
import {
  ILogicStep,
  LogicTargetType,
  SourceType,
  TargetLoading,
} from 'api/types';
import { Tagger } from 'components/Tracking/Tagger';
import { ConnectionBarLogic } from 'containers/River/RiverLogic/Logic/components/ConnectionBarLogic';
import React from 'react';
import { useEffectOnce } from 'react-use';
import { useRiverActions } from 'store/river/hooks';
import { getHashKey } from 'utils/api.sanitizer';
import { Collapse } from './Collapse';
import { Source } from './Source';
import { TargetLogic } from './TargetLogic';

type BlockSqlScriptProps = {
  node: ILogicStep;
};

export function BlockSqlScript({ node }: BlockSqlScriptProps) {
  const {
    content: { execute_sql_command: hideTarget },
    step_name,
  } = node;
  const { setStepProps } = useRiverActions();
  const hash = getHashKey(node);
  const onSourceTypeChange = (
    value: string,
    newContent: any = node?.content,
  ) => {
    setStepProps({
      hash,
      content: {
        ...newContent,
        execute_sql_command: value === SourceType.SQL_SCRIPT,
        source_type: value,
        ...(value === SourceType.DATAFRAME
          ? {
              target_type: LogicTargetType.TABLE,
              target_loading: TargetLoading.APPEND,
              fields: [],
            }
          : {}),
        ...(value === SourceType.SQL_SCRIPT
          ? {
              fzConnection: {},
              target_type: LogicTargetType.TABLE,
              fields: [],
            }
          : {}),
      },
    });
  };

  const onAutoCommitChange = (
    checked: boolean,
    newContent: any = node?.content,
  ) => {
    setStepProps({
      hash,
      content: {
        ...newContent,
        autocommit: checked,
      },
    });
  };
  useEffectOnce(() => {
    if (!node?.content?.source_type) {
      onSourceTypeChange(
        node?.content?.execute_sql_command
          ? SourceType.SQL_SCRIPT
          : SourceType.SQL_QUERY,
        node?.content,
      );
    }
  });
  if (!node?.content?.block_type) {
    return null;
  }
  return (
    <Tagger tags="sql-block">
      <Box p={2}>
        <Box my="2">
          <ConnectionBarLogic node={node} />
        </Box>
        <Tagger tags="source">
          <Collapse header="Source" label={step_name} showSummary>
            <Source
              p={3}
              node={node}
              onSourceTypeChange={onSourceTypeChange}
              onAutoCommitChange={onAutoCommitChange}
            />
          </Collapse>
        </Tagger>
        {!hideTarget ? (
          <Tagger tags="target">
            <Collapse header="Target" label={step_name} showSummary>
              <TargetLogic node={node} />
            </Collapse>
          </Tagger>
        ) : null}
      </Box>
    </Tagger>
  );
}

import { ILogicStep } from 'api/types';
import { useStepPropValidationMessage } from 'modules';
import { useTargetByBlockType } from 'modules/Datasources/useLogicTargets';
import { getHashKey } from 'utils/api.sanitizer';
import { useStepActions } from './useStepActions';

export const useSqlEditorProps = (node: ILogicStep) => {
  const content = node?.content;
  const hash = getHashKey(node);
  const { updateContent } = useStepActions(hash);
  const sqlQueryMessage = useStepPropValidationMessage(
    hash,
    'content.sql_query',
  );
  const selectedDataTarget = useTargetByBlockType(content?.block_type);
  return {
    value: content?.sql_query,
    language: 'sql',
    title: 'SQL',
    path: hash,
    fileName: `${node?.step_name}.sql`,
    isExecute: isExecute(node),
    enableSqlResultsForTarget:
      selectedDataTarget?.target_settings?.enable_sql_results,
    validationMessage: sqlQueryMessage,
    onChange: value => updateContent({ sql_query: value }),
  };
};

export const isExecute = (node: ILogicStep) =>
  node?.content?.execute_sql_command;

export const getSqlTitle = (isExecute: boolean) =>
  `SQL ${isExecute ? 'Script' : 'Query'}`;

import { ListItem, OrderedList } from '@chakra-ui/react';
import { Flex, RiveryInfoTooltip, Text } from 'components';
import { InvalidFeedback } from 'components/Form/components';
import { getSqlTitle } from 'containers/River/RiverLogic/Logic/components/hooks/useSqlEditorProps';
import React from 'react';
import { useAccount, useCore } from 'store/core/hooks';
import { CodeEditor } from './CodeEditor';
import './ScriptEditor.scss';
import { ScriptEditorContentProps } from './ScriptEditorContent';

export interface EditorProps extends ScriptEditorContentProps {
  isExecute?: boolean;
  validationMessage?: string;
  enableSqlResultsForTarget?: boolean;
  hash: string;
  fileName?: string;
  type: string;
}
export const ScriptTooltip = () => (
  <RiveryInfoTooltip
    ariaLabel="Tooltip SQL Script"
    description={
      <OrderedList pl={4} mt={3}>
        <ListItem>
          The SQL script is not encrypted in any way. Please avoid using
          credentials in the script.
        </ListItem>
        <ListItem>
          The SQL script runs according to user configurations. Users are
          responsible for any changes to the table, schema, or data that occur
          due to the script.
        </ListItem>
      </OrderedList>
    }
  />
);
export function ScriptEditor(props: EditorProps) {
  const {
    path,
    title,
    fileName = `${title}.sql` as string,
    isExecute,
    enableSqlResultsForTarget,
  } = props;
  const { isAccountBlocked } = useCore();

  const { isViewerRole } = useAccount();
  const enableRunResult =
    !isExecute &&
    enableSqlResultsForTarget &&
    !isViewerRole &&
    !isAccountBlocked;

  const isInvalid = props?.validationMessage;
  return (
    <CodeEditor
      {...props}
      styleProps={{ mt: 3 }}
      title={
        <Flex alignItems="center">
          {getSqlTitle(isExecute)}
          {Boolean(isExecute) && <ScriptTooltip />}
        </Flex>
      }
      titleModal={title}
      titleOverlay={Boolean(isExecute) ? <ScriptTooltip /> : null}
      fileName={fileName}
      enableRun={enableRunResult}
      readOnly={isViewerRole}
      invalid={Boolean(isInvalid)}
      footer={
        <>
          {isInvalid ? (
            <InvalidFeedback.Wrapper>
              <InvalidFeedback message="This field is required" />
            </InvalidFeedback.Wrapper>
          ) : null}
          {sqlValidations?.map(({ message, validate }) =>
            props?.value?.includes(validate) ? (
              <ErrorMessage message={message} key={`${path}-${validate}`} />
            ) : null,
          )}
        </>
      }
    />
  );
}
const ErrorMessage = ({ message }) => {
  return (
    <Text fontSize="xs" color="background-danger-strong">
      * {message}
    </Text>
  );
};
const sqlValidations = [
  {
    validate: ';',
    message: (
      <>
        If you use a semicolon in a string, please use its HEX ASCII character{' '}
        <strong>\x3b</strong>
      </>
    ),
  },
  {
    validate: '--',
    message: (
      <>
        Please make sure that comments syntax is{' '}
        <strong>{'/*comment*/'}</strong> instead of <strong>--comment</strong>
      </>
    ),
  },
];

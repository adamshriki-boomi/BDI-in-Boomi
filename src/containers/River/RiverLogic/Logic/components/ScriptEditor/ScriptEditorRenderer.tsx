import { ILogicStep } from 'api/types';
import React from 'react';
import { isExecute, useSqlEditorProps } from '../hooks/useSqlEditorProps';
import { EditorProps, ScriptEditor } from './ScriptEditor';
import { ScriptEditorModal, ScriptEditorModalProps } from './ScriptEditorModal';

type ScriptEditorRendererProps = Partial<EditorProps> &
  Partial<ScriptEditorModalProps> &
  Pick<ScriptEditorModalProps, 'type'> & {
    node: ILogicStep;
    modal?: boolean;
  };
/**
 * renders a script editor component
 * @param modal (default: false) when "true", renders a script editor modal
 */
export const ScriptEditorRenderer = ({
  node,
  modal = false,
  ...scriptProps
}: ScriptEditorRendererProps) => {
  const props = useSqlEditorProps(node);
  const ScriptComponent = modal ? ScriptEditorModal : ScriptEditor;
  return (
    <ScriptComponent {...props} {...scriptProps} hash={node.hash_key_init} />
  );
};

export const ScriptEditorModalRenderer = (props: ScriptEditorRendererProps) => (
  <ScriptEditorRenderer modal {...props} enableRun={!isExecute(props.node)} />
);

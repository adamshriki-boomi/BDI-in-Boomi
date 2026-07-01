import { Flex, Grid } from 'components';
import { RadioGroup } from 'components/Form';
import { useState } from 'react';
import { ClusterEditor } from '../../components/ClusterEditor';
import { MatchKeyEditor } from '../../components/MatchKeyEditor';
import { titlesMap } from '../../components/Titles';
import { useEditorsMark } from '../../hooks/useEditorsMark';
import { AllColumns } from './mappingColumns';

export function DatabricksMapping({ isDisabled }) {
  const [editorType, setEditorType] =
    useState<keyof typeof editors>('All Columns');
  const { selectedMark, setSelectedMark, keyTypes } = useEditorsMark(
    editors,
    editorType,
  );
  const EditorComponent = editors[editorType];
  return (
    <Grid gridGap="4" gridTemplateRows="auto 1fr" h="full" overflow="hidden">
      <Flex justifyContent="space-between" gap="4">
        {titlesMap(editorType)()}
        <RadioGroup
          size="base"
          aria-label="type"
          name="key_type"
          values={keyTypes}
          checked={editorType}
          onChange={setEditorType}
        />
      </Flex>
      <EditorComponent
        isDisabled={isDisabled}
        setSelected={keyVal => setSelectedMark({ ...selectedMark, ...keyVal })}
      />
    </Grid>
  );
}

const editors = {
  'All Columns': AllColumns,
  'Match Key': MatchKeyEditor,
  Cluster: ClusterEditor,
};

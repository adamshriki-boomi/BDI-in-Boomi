import { Flex, Grid } from 'components';
import { RadioGroup } from 'components/Form';
import { useSttFormContext } from 'modules/SourceTarget/components/form';
import { SQLDialectsValues } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetSettings/TargetBigQuery';
import { useState } from 'react';
import { ClusterEditor } from '../../components/ClusterEditor';
import { MatchKeyEditor } from '../../components/MatchKeyEditor';
import { titlesMap } from '../../components/Titles';
import { useEditorsMark } from '../../hooks/useEditorsMark';
import { AllColumns } from './mappingColumns';

export function BiqQueyMapping({ isDisabled }) {
  const mainRiverFormContext = useSttFormContext();
  const targetDefinition: any = mainRiverFormContext?.watch(
    'river.properties.target',
  );
  const [editorType, setEditorType] =
    useState<keyof typeof editors>('All Columns');
  const { selectedMark, setSelectedMark, keyTypes } = useEditorsMark(
    editors,
    editorType,
  );
  const EditorComponent = editors[editorType];
  const isStandardSql =
    !targetDefinition?.sql_dialect ||
    SQLDialectsValues.STANDARD === targetDefinition?.sql_dialect;
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
        maxAllowed={4}
        isStandardSql={isStandardSql}
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

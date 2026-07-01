import { SelectFormGroup } from 'components/Form';
import { GridBox } from 'components/index';
import React, { useState } from 'react';
import { useToggle } from 'react-use';
import { createOId, getOId } from 'utils/api.sanitizer';
import { pluck } from 'utils/array.utils';
import { CreateKeyPairForm } from './CreateKeyPairForm';
import { useVariableEditor } from './useVariableEditor';
import { ValueCopier } from './ValueCopier';

const selectProps = {
  getOptionLabel: pluck<any, string>('key_name'),
  getOptionValue: option => getOId(option._id),
};

type VariableListProps = {
  value: string;
  connectionType: string;
  onChange: (value: string) => any;
};

export function VariableList({
  value,
  connectionType,
  onChange,
}: VariableListProps) {
  const { variables, selectedVariable, createKeyPair, keyState } =
    useVariableEditor(value, connectionType);
  const [draftVar, setDraftVar] = useState('');
  const [show, toggle] = useToggle(false);

  const onVariableChange = variable => {
    onChange(variable.key_file_name);
  };
  return (
    <GridBox gap={2}>
      <SelectFormGroup
        options={variables}
        controlId="ssh tunnel list"
        onChange={onVariableChange}
        selectProps={selectProps}
        value={selectedVariable}
        onAddOption={newKeyPair => {
          const key = newKeyPair?.trim();
          const keyPair = isPlaceholder(key) ? '' : key;
          setDraftVar(keyPair);
          toggle(true);
        }}
        withCreate
        createOption={createVariablePlaceholder}
      />
      {selectedVariable && (
        <ValueCopier value={keyState?.value} loading={keyState.loading} />
      )}
      {show && (
        <CreateKeyPairForm
          value={draftVar}
          onCreate={async value => {
            const newKeyPair = await createKeyPair(value);
            onVariableChange(newKeyPair);
            toggle();
          }}
        />
      )}
    </GridBox>
  );
}

// UTILS
const variablePlaceholderId = 'create-key-pair';
const isPlaceholder = value => value === variablePlaceholderId;
const createVariablePlaceholder = () => ({
  key_name: 'Create Key Pair',
  _id: createOId(variablePlaceholderId),
});

import { HStack } from '@chakra-ui/react';
import RiveryButton from 'components/Buttons/RiveryButton';
import { Input } from 'components/Form';
import * as React from 'react';
import { useEffect, useState } from 'react';

type CreateKeyPairFormProps = {
  value: string;
  onCreate: (value: string) => any;
};

export function CreateKeyPairForm({ value, onCreate }: CreateKeyPairFormProps) {
  const [newVar, setNewVar] = useState(value);
  const hasValue = newVar?.trim() !== '';

  useEffect(() => {
    setNewVar(value);
  }, [value, setNewVar]);

  const onCreateVariable = () => {
    onCreate(newVar);
  };

  return (
    <HStack gap={2} mt={3}>
      <Input
        value={newVar}
        onChange={({ target }) => setNewVar(target.value)}
        label="Key Pair Name"
        flex="auto"
        keepSpace={false}
        onKeyPress={(ev: KeyboardEvent) => {
          if (isEnterKey(ev.key)) {
            ev.preventDefault();
            onCreateVariable();
            return;
          }
        }}
      />
      <RiveryButton
        label="Create Key Pair"
        alignSelf="end"
        disabled={!hasValue}
        onClick={onCreateVariable}
      />
    </HStack>
  );
}
const isEnterKey = (key: string) => key === 'Enter';

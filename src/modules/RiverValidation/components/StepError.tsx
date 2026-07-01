import { CloseIcon, HStack, Icon, Text } from 'components';
import * as React from 'react';
import { useRiver } from 'store/river';

type StepErrorProps = {
  hash: string;
  type: string;
};

export function StepError({ hash, type }: StepErrorProps) {
  const { errors } = useRiver();
  const hasErrors = errors?.[hash];

  return hasErrors ? (
    <HStack justifyContent="flex-end" mb={2} color="red.200">
      <Icon as={CloseIcon} boxSize={4} />
      <Text>Please make sure this {type} is valid</Text>
    </HStack>
  ) : null;
}

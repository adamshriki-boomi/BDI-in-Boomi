import { HStack, Icon } from '@chakra-ui/react';
import { InvalidFeedback } from 'components/Form';
import { CloseBgSolid } from 'components/Icons';
import * as React from 'react';

type ValidationErrorProps = {
  message: string;
};

export function ValidationError({ message }: ValidationErrorProps) {
  return message ? (
    <InvalidFeedback.Wrapper>
      <HStack color="red.100" mt="6px">
        <Icon as={CloseBgSolid} boxSize={4} />
        {/* If the height is 0 - the form won't moove when thete's an error */}
        <InvalidFeedback h={0} message={message} />
      </HStack>
    </InvalidFeedback.Wrapper>
  ) : null;
}

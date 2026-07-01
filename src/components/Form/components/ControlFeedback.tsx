import {
  FormControl,
  FormErrorMessage,
  Text,
  TextProps,
} from '@chakra-ui/react';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';

type ControlFeedbackProps = {
  name: string;
  api?: Partial<UseFormReturn>;
};

interface HelpTextProps extends TextProps {
  message: string;
}

export const getError = (api, name) => {
  return name?.split('.').reduce((errors, current) => {
    return errors?.[current];
  }, api?.formState?.errors);
};

ControlFeedback.getError = getError;
export function ControlFeedback({ api, name }: ControlFeedbackProps) {
  const errorOption = getError(api, name);

  return errorOption?.message ? (
    <InvalidFeedback message={errorOption.message} />
  ) : null;
}

interface InvalidFeedbackProps extends TextProps {
  message: string;
}

InvalidFeedback.Wrapper = props => (
  <FormControl isInvalid {...props}></FormControl>
);
export function InvalidFeedback({ message, ...rest }: InvalidFeedbackProps) {
  return <FormErrorMessage {...rest}>{message}</FormErrorMessage>;
}
export function HelpText({ message, ...rest }: HelpTextProps) {
  return message ? (
    <Text fontSize="xs" color="exo-color-background-info-strong" {...rest}>
      {message}
    </Text>
  ) : null;
}

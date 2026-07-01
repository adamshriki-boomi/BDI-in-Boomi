import { InputProps as ChakraInputProps } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';

export enum InputTypes {
  TEXT = 'text',
  NUMBER = 'number',
  PASSWORD = 'password',
  EMAIL = 'email',
  FILE = 'file',
  COPY = 'copy',
  CHECKBOX = 'checkbox',
  SWITCH = 'switch',
  RADIO = 'radio',
}
export interface InputProps
  extends Pick<ChakraInputProps, 'size' | 'name' | 'placeholder'> {
  label: string;
  /**
   * this will be used as a label when label is empty
   */
  display_name?: string;
  type?: InputTypes;
  /**
   * render icon to the left of the input
   */
  icon?: ReactNode;
  iconRight?: ReactNode;
  hideLabel?: boolean;
  keepSpace?: boolean;
  allowReveal?: boolean;
  chakra?: boolean;
  api?: Partial<UseFormReturn>;
  pattern?: RegExp;
  // whne string, it is displayed as an error message for pattern validation
  required?: boolean | string;
  validate?: () => any | any;
  min?: number;
  max?: number;
  onChange?: (value?: any) => any;
  // useful for any input props
  [name: string]: any;
  // labelStyle?: StyleProps;
  tooltip?: string;
  helpText?: string;
}

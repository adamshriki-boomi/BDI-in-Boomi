import { StyleProps } from '@chakra-ui/react';
import { Box, Icon, Text } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { Input, InputTypes } from 'components/Form';
import * as React from 'react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { RiPencilFill } from 'react-icons/ri';
import { useClickAway, useToggle } from 'react-use';

export type EditableTextProps = {
  text: string;
  onChange: (value: string) => any;
  inputStyle?: StyleProps;
  previewStyle?: StyleProps;
  textColor?: string;
  textStyle?: StyleProps;
  iconColor?: string;
  allowEmpty?: boolean;
  hideIcon?: boolean;
  wrapperStyle?: StyleProps;
  inputProps?: any;
  'data-pendo-id'?: string;
};
const INPUT_NAME = InputTypes.TEXT;

export function EditableText({
  text,
  onChange,
  inputStyle,
  inputProps,
  textColor,
  iconColor = 'gray-100',
  textStyle,
  allowEmpty = false,
  hideIcon = false,
  previewStyle,
  wrapperStyle = null,
  ...rest
}: EditableTextProps) {
  const ref = useRef(null);
  useClickAway(ref, () => {
    if (showEditor) {
      onTextSave();
    }
  });
  const [showEditor, toggleEditor] = useToggle(false);
  const { getValues, setValue, ...formApi } = useForm({
    defaultValues: {
      [INPUT_NAME]: text,
    },
    shouldUnregister: false,
  });
  React.useEffect(() => {
    setValue(INPUT_NAME, text);
  }, [setValue, text]);

  useInputFocus(ref, showEditor);

  const closeEditor = () => toggleEditor(false);
  const openEditor = withStopPropagation(toggleEditor, true);
  const onTextSave = () => {
    const newText = getValues(INPUT_NAME)?.trim();
    if (allowEmpty || newText?.length) {
      setValue(INPUT_NAME, newText);
      const hasChanged = text !== newText;
      hasChanged && onChange(newText);
    }
    closeEditor();
  };

  return (
    <Box
      overflow="hidden"
      flexGrow={showEditor ? 1 : undefined}
      ref={ref}
      {...wrapperStyle}
      {...rest}
    >
      {showEditor ? (
        <Input
          hideLabel={true}
          label={`edit name ${text}`}
          name={INPUT_NAME}
          onClick={stopPropagation}
          api={formApi}
          color={textColor}
          flexGrow={1}
          {...inputStyle}
          {...inputProps}
        />
      ) : (
        <RiveryButton
          p="0"
          label={
            <Text
              as="h6"
              overflow="hidden"
              noOfLines={1}
              wordBreak="break-all"
              textAlign="left"
              color={textColor}
              {...textStyle}
            >
              {text}
            </Text>
          }
          w="full"
          sx={{
            '&:hover [data-icon]': {
              visibility: 'visible',
            },
          }}
          rightIcon={
            !hideIcon ? (
              <Icon
                as={RiPencilFill}
                size="10"
                marginLeft="2"
                visibility="hidden"
                data-icon
                color={iconColor}
              />
            ) : null
          }
          justifyContent="left"
          {...previewStyle}
          aria-label={`edit text ${text}`}
          variant="transparent"
          onClick={openEditor}
        />
      )}
    </Box>
  );
}

const stopPropagation = (ev: React.MouseEvent) => ev.stopPropagation();
const withStopPropagation = (handler, props = undefined) => {
  return (ev: React.MouseEvent) => {
    stopPropagation(ev);
    handler(props);
  };
};

// focus a ref's input child given activate is true
const useInputFocus = (
  ref: React.RefObject<HTMLElement>,
  activate: boolean,
) => {
  React.useEffect(() => {
    if (activate && ref?.current) {
      ref?.current?.querySelector('input')?.focus();
    }
  }, [activate, ref]);
};

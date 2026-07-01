import { useRadio } from '@chakra-ui/react';
import { Box, Center } from 'components';

export function InnerButtonGroup({
  idx,
  design = null,
  optionsLength = 0,
  ...props
}) {
  const { getInputProps, getCheckboxProps } = useRadio(props);
  const input = getInputProps();
  const checkbox = getCheckboxProps();
  const borderRadius =
    idx === 0
      ? '4px 0px 0px 4px'
      : idx !== optionsLength - 1 && optionsLength > 2
      ? '0px'
      : '0px 4px 4px 0px';
  return (
    <Box as="label" {...{ marginInlineStart: '0rem!important' }}>
      <input aria-label={`radio-${props.children}`} {...input} />
      <Center
        {...checkbox}
        height="28px"
        bg="white"
        cursor="pointer"
        borderWidth="1px"
        borderColor="border"
        borderRadius={borderRadius}
        textTransform="capitalize"
        _checked={{
          color: 'font',
          fontWeight: 400,
          bg: 'background-selected-weak',
          borderColor: 'background-action',
          transition: '1s',
          fontSize: 'sm',
        }}
        px={typeof props.children == 'string' ? 4 : 2}
        py={1}
        {...design}
      >
        {props.children}
      </Center>
    </Box>
  );
}

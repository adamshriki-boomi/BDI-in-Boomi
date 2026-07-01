import { Icon, IconButton } from '@chakra-ui/react';
import { Flex, RiveryButton } from 'components';
import { Input } from 'components/Form';
import { EditIcon } from 'components/Icons';
import { useToggle } from 'react-use';
import { CustomSelectForm } from './SelectFormGroup';
import { useSelectFormStyles } from './SelectFormGroup/select.styles';

const ButtonHeight = {
  sm: '32px',
  md: '36px',
};

export function ComplexInputField({ inputProps, buttonProps, size = 'sm' }) {
  return (
    <Flex boxSizing="border-box">
      <Input hideLabel chakra borderRadius="4px 0px 0px 4px" {...inputProps} />
      <RiveryButton
        height={ButtonHeight[size]}
        marginInlineStart="0px!important"
        borderRadius="0px 4px 4px 0px"
        {...buttonProps}
      />
    </Flex>
  );
}

export function ComplexSelectField({ selectProps, buttonProps, size = 'sm' }) {
  const baseSelectStyle = useSelectFormStyles(true);
  return (
    <Flex boxSizing="border-box">
      <CustomSelectForm
        customStyles={{
          control: (styles, props) => ({
            ...styles,
            ...baseSelectStyle.control(styles, props),
            borderRadius: '4px 0px 0px 4px',
          }),
        }}
        {...selectProps}
      />
      <RiveryButton
        height={ButtonHeight[size]}
        marginInlineStart="0px!important"
        borderRadius="0px 4px 4px 0px"
        {...buttonProps}
      />
    </Flex>
  );
}

export function GenericComplexField({ ...inputProps }) {
  const [inputEnabled, setInputState] = useToggle(false);
  return (
    <Flex boxSizing="border-box" alignItems="end">
      <Input
        chakra
        borderRadius="4px 0px 0px 4px"
        {...inputProps}
        disabled={!inputEnabled}
      />
      <IconButton
        aria-label="edit_input"
        height={ButtonHeight['sm']}
        marginInlineStart="0px!important"
        borderRadius="0px 4px 4px 0px"
        bg="gray.200"
        icon={<Icon as={EditIcon} boxSize={4} color="icon-tertiary" />}
        onClick={setInputState}
      />
    </Flex>
  );
}

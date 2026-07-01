import {
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import { IconButton, RenderGuard, RiveryInfoTooltip, Text } from 'components';
import * as React from 'react';
import { useState } from 'react';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useEffectOnce, useToggle } from 'react-use';
import { ControlFeedback, getError } from '../ControlFeedback';
import { CopyToClipboard } from './CopyToClipboard';
import { InputProps, InputTypes } from './Input.types';
import { InputRenderer } from './InputRenderer';

export * from './Input.types';

type InputRef = HTMLInputElement | any;

export const Input = React.forwardRef<InputRef, InputProps>(function Input(
  {
    display_name,
    label = display_name,
    name,
    type = InputTypes.TEXT,
    icon,
    iconRight,
    hideLabel = false,
    keepSpace = true,
    allowReveal = true,
    api,
    tooltip,
    helpText = null,
    size = 'sm',
    min,
    optional = false,
    pattern = null,
    ...inputProps
  }: InputProps,
  ref,
) {
  const hasError = getError(api, name);
  const [show, toggle] = useToggle(false);
  const showEyeToggle = !inputProps?.disabled
    ? type === InputTypes.PASSWORD && allowReveal
    : false;
  const watchPassword = showEyeToggle ? api?.watch(name) : '';
  const disableEyeToggle = watchPassword === '';
  const isValidationError =
    Boolean(hasError) || Boolean(inputProps?.validationError);
  const defaultErrorMessage =
    inputProps?.defaultErrorMessage || 'Invalid Value';
  const hasCopy = type === InputTypes.COPY;
  const [inputPattern, setInputPattern] = useState(null);
  useEffectOnce(() => {
    setInputPattern(
      typeof pattern === 'string' ? new RegExp(pattern, 'i') : pattern,
    );
  });

  return (
    <Flex flexDir="column" flexGrow={1}>
      <FormControl
        isInvalid={hasError}
        isRequired={Boolean(inputProps?.required)}
      >
        {!hideLabel && label ? (
          <InputLabel
            htmlFor={inputProps?.['aria-label'] || name}
            label={label}
            tooltip={tooltip}
            required={inputProps?.required}
            optional={optional}
            {...inputProps?.labelStyle}
          />
        ) : null}
        <RenderGuard condition={inputProps?.secondaryLabel}>
          <FormHelperText>{inputProps?.secondaryLabel}</FormHelperText>
        </RenderGuard>
        <InputGroup>
          {icon ? <InputLeftElement children={icon} /> : null}
          <InputRenderer
            type={show ? InputTypes.TEXT : type}
            name={name}
            label={label}
            isError={isValidationError}
            control={api?.control}
            ref={ref}
            size={size}
            paddingRight={(iconRight || hasCopy || showEyeToggle) && '8'}
            pattern={inputPattern}
            defaultErrorMessage={defaultErrorMessage}
            {...inputProps}
          />
          {iconRight ? <InputRightElement children={iconRight} /> : null}
          {showEyeToggle ? (
            <InputRightElement
              boxSize={IconSize[size as any]}
              children={
                <IconButton
                  tabIndex={-1}
                  disabled={disableEyeToggle}
                  size={size}
                  onClick={toggle}
                  aria-label={`toggle ${!hideLabel ? label : ''}`}
                  colorScheme={hasError && 'red'}
                  _hover={{ bgColor: 'transparent' }}
                  variant={hasError ? 'ghost' : 'transparent'}
                  icon={show ? <HiOutlineEye /> : <HiOutlineEyeOff />}
                />
              }
            />
          ) : null}
          {hasCopy ? (
            <InputRightElement
              children={<CopyToClipboard value={inputProps?.value} />}
            />
          ) : null}
        </InputGroup>
        <RenderGuard condition={helpText}>
          <FormHelperText mt={1}>{helpText}</FormHelperText>
        </RenderGuard>
      </FormControl>

      <ControlFeedback api={api} name={name} />
    </Flex>
  );
});
const IconSize = {
  lg: 12,
  sm: 8,
  md: 10,
  xs: 6,
};

export function getValueByType(e: any) {
  return e.currentTarget?.type === InputTypes.NUMBER
    ? e.currentTarget.valueAsNumber
    : e.currentTarget.value;
}

export function InputLabel({
  tooltip = null,
  label,
  htmlFor = '',
  optional = false,
  wrapStyle = null,
  ...formLabelProps
}) {
  return (
    <Flex alignItems="center" {...wrapStyle}>
      <FormLabel
        htmlFor={htmlFor}
        w={!tooltip && 'full'}
        mb={0}
        {...formLabelProps}
      >
        {label}{' '}
        {optional ? (
          <Text className="optional-label" display="inline">
            (optional)
          </Text>
        ) : null}
      </FormLabel>
      {tooltip ? (
        <RiveryInfoTooltip
          color="font-secondary"
          description={tooltip}
          buttonProps={{ height: '0px', minW: 6 }}
        />
      ) : null}
    </Flex>
  );
}

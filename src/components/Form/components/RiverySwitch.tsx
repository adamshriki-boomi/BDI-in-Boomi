import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  Switch,
  SwitchProps,
  Text,
} from '@chakra-ui/react';
import { RenderGuard } from 'components/RenderGuard';
import { ReactNode } from 'react';
import { Controller } from 'react-hook-form';
import { ControlFeedback, InputLabel } from '.';

interface RiverSwitchProps extends SwitchProps {
  label: ReactNode;
  api?: any;
  rules?: any;
  tooltip?: any;
  name?: string;
  ariaLabel?: string;
  leftLabel?: boolean;
  formLabelStyle?: any;
  allowEmptyValue?: boolean;
  formControlStyle?: any;
}

function SwitchComponent({
  api = null,
  label,
  value,
  name,
  switchRef,
  ariaLabel,
  leftLabel,
  formLabelStyle,
  formControlStyle,
  checkIcon = null,
  ...rest
}: RiverSwitchProps & { switchRef?: any; checkIcon?: any }) {
  const control = api?.control;
  const { isChecked } = rest;
  const isLabelString = typeof label == 'string';
  const restAriaLabel = rest['aria-label'];
  return (
    <>
      <FormControl
        as={HStack}
        data-cy={isLabelString ? label : restAriaLabel}
        {...formControlStyle}
      >
        <Switch
          ref={switchRef}
          size="sm"
          id={restAriaLabel}
          order={leftLabel ? 1 : 0}
          mt="2px"
          position="relative"
          {...rest}
        >
          <RenderGuard condition={isChecked}>{checkIcon}</RenderGuard>
        </Switch>
        {isLabelString ? (
          <InputLabel
            fontSize="sm"
            htmlFor={restAriaLabel}
            label={label}
            tooltip={rest?.tooltip}
            {...(leftLabel && {
              wrapStyle: { marginInlineStart: '0px!important' },
            })}
            {...formLabelStyle}
          />
        ) : (
          <FormLabel
            {...(leftLabel && {
              mr: '12px !important',
              marginInlineStart: '0px !important',
            })}
            {...formLabelStyle}
            htmlFor={restAriaLabel}
          >
            {label}
          </FormLabel>
        )}
      </FormControl>
      {control ? <ControlFeedback api={api} name={name} /> : null}
    </>
  );
}

function isSwitchChecked(value, allowEmptyValue) {
  if (allowEmptyValue) {
    if (typeof value == 'string' || value) {
      return true;
    } else {
      return false;
    }
  }
  return value;
}

export function RiverySwitch({
  api,
  name,
  label = '',
  ariaLabel = null,
  rules,
  leftLabel = false,
  formLabelStyle = null,
  allowEmptyValue = false,
  formControlStyle = null,
  checkIcon = null,
  ...rest
}: RiverSwitchProps & { checkIcon?: any }) {
  const switchLabel =
    typeof label == 'string' && !ariaLabel ? label : ariaLabel;
  const control = api?.control;
  return control ? (
    <Controller
      aria-label={switchLabel}
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value, ref } }) => {
        const checked = isSwitchChecked(value, allowEmptyValue);
        return (
          <SwitchComponent
            onChange={onChange}
            switchRef={ref}
            isChecked={checked}
            name={name}
            label={label}
            aria-label={switchLabel}
            leftLabel={leftLabel}
            formLabelStyle={formLabelStyle}
            formControlStyle={formControlStyle}
            checkIcon={checkIcon}
            {...rest}
          />
        );
      }}
    />
  ) : (
    <SwitchComponent
      label={label}
      aria-label={switchLabel}
      leftLabel={leftLabel}
      formLabelStyle={formLabelStyle}
      formControlStyle={formControlStyle}
      checkIcon={checkIcon}
      {...rest}
    />
  );
}

export function SwitchComplexLabel({
  label,
  labelStyle = null,
  description,
  descriptionStyle = null,
}) {
  return (
    <Box marginInlineStart={0}>
      <Text textStyle="R7" {...labelStyle}>
        {label}
      </Text>
      <Box color="font-secondary" textStyle="R8" {...descriptionStyle}>
        {typeof description == 'string' ? (
          <Text>{description}</Text>
        ) : (
          description
        )}
      </Box>
    </Box>
  );
}

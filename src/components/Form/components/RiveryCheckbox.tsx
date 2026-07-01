import { Box, Checkbox, CheckboxProps, Icon, Text } from '@chakra-ui/react';
import { CheckIcon, Minus } from 'components/Icons';
import { ReactNode, useMemo } from 'react';
import { Controller } from 'react-hook-form';

export interface RiverCheckboxProps extends CheckboxProps {
  api?: any;
  rules?: any;
  labelColor?: string;
  ariaLabel?: string;
  name: string;
  label: ReactNode;
}

export function RiveryCheckbox({
  api,
  name,
  label,
  rules,
  ariaLabel = null,
  labelColor = 'font',
  isIndeterminate = false,
  ...rest
}: RiverCheckboxProps) {
  const control = api?.control;
  const checkboxIcon = useMemo(() => {
    return <Icon boxSize={3} as={isIndeterminate ? Minus : CheckIcon} />;
  }, [isIndeterminate]);
  return control ? (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value, ref } }) => {
        return (
          <>
            <Checkbox
              icon={
                Boolean(value) || rest?.defaultChecked ? checkboxIcon : <div />
              }
              aria-label={ariaLabel}
              role="checkbox"
              onChange={onChange}
              ref={ref}
              isChecked={value}
              spacing="0.5rem"
              {...rest}
            >
              <Text
                ml="0px!important"
                fontSize="small"
                color={!Boolean(value) ? 'font-secondary' : labelColor}
                whiteSpace="nowrap"
                //If label is complex, it can not be nested under <p> tag
                {...(typeof label !== 'string' && { as: Box })}
              >
                {label}
              </Text>
            </Checkbox>
            <Text color="red.100" fontSize="xs">
              {api?.formState?.errors?.[name]?.message}
            </Text>
          </>
        );
      }}
    />
  ) : (
    <Checkbox
      icon={checkboxIcon}
      spacing={label ? '0.5rem' : 0}
      isIndeterminate={isIndeterminate}
      {...rest}
    >
      <Text
        whiteSpace="nowrap"
        fontSize="small"
        color={labelColor} //If label is complex, it can not be nested under <p> tag
        {...(typeof label !== 'string' && { as: Box })}
      >
        {label}
      </Text>
    </Checkbox>
  );
}

import { Grid, SystemProps } from '@chakra-ui/react';
import { Box, RenderGuard } from 'components/index';
import React, { ReactNode } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useDeepCompareEffect } from 'react-use';
import { FormControls } from './FormControls';

type renderProps = {
  form: ReactNode;
  useFormApi: Partial<UseFormReturn>;
};
export type FormRendererProps = {
  controls: any[];
  children?: ReactNode;
  render?: (renderProps: renderProps) => JSX.Element;
  onSubmit?: (formData: any) => any;
  formData: { [controlName: string]: any };
  /**
   * (default: false) if true, {form} MUST be rendered by render()
   */
  external?: boolean;
  style?: SystemProps;
  [formProp: string]: any;
};

const emptyArr = [];

export function FormRenderer({
  controls = emptyArr,
  children = null,
  render,
  external = false,
  onSubmit,
  formData,
  style = null,
  gap = 4,
  ...formProps
}: FormRendererProps) {
  const { handleSubmit, ...useFormApi } = useForm<any>({
    defaultValues: formData,
    shouldUnregister: false,
    // these are required for enforcing validation when fields have changed without invoking the form's "onSubmit"
    mode: 'all',
    //all is for using both onChange and onBlur functionality (the trigger will work as accepted )
  });
  // required to prevent unnecessary renders when effect is syncing with formData in useEffect
  const reset = useFormApi.reset;
  // formData might be updated (i.e - in settings, switch to another account)
  useDeepCompareEffect(() => {
    if (formData) {
      reset(formData);
    }
  }, [formData, reset]);
  const formRender = (
    <Grid gap={gap}>
      {controls?.map((control, index) => (
        <RenderGuard
          condition={!control?.is_hidden}
          key={`${index}-${control?.name}`}
        >
          <FormControls
            formMetadata={formProps?.formMetadata}
            controls={control as any}
            api={useFormApi}
          />
        </RenderGuard>
      ))}
      {children}
    </Grid>
  );
  return (
    <Box as="form" {...formProps} onSubmit={handleSubmit(onSubmit)}>
      {render ? (
        <>
          {!external && <Box {...style}>{formRender}</Box>}
          {render({ form: formRender, useFormApi })}
        </>
      ) : (
        formRender
      )}
    </Box>
  );
}

import { Alert, AlertDescription, ChakraProps, Flex } from '@chakra-ui/react';
import React, { Ref } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { checkConditionForm } from 'utils/check.condition';
import { ControlResolver, FormControl, hasControl } from './ControlResolver';

export type FormMetadata = {
  dsId?: string;
  icon?: string;
};
export type FormControlsProps = {
  controls: FormControl | FormControl[];
  isGroup?: boolean;
  api?: Partial<UseFormReturn>;
  formMetadata?: FormMetadata;
};
export function FormControls({
  controls,
  isGroup = true,
  api,
  gap = 1,
  formMetadata = null,
  ...chakraProps
}: FormControlsProps & ChakraProps) {
  const isControls = Array.isArray(controls);
  const help = (controls as FormControl)?.help;
  const hasControlComponent =
    !isControls && hasControl((controls as FormControl)?.type);
  const isConditionValid = checkConditionForm(
    api,
    isControls ? controls[0] : controls,
  );
  const shouldRender = isConditionValid && (isControls || hasControlComponent);
  return shouldRender ? (
    <Flex w="full" gap={gap} alignItems="stretch" flexGrow={1} {...chakraProps}>
      <ControlRenderer
        controls={controls}
        api={api}
        isControls={isControls}
        formMetadata={formMetadata}
      />
      {help ? (
        <Alert status="info" maxWidth="full" paddingX="1">
          <AlertDescription>{help}</AlertDescription>
        </Alert>
      ) : null}
    </Flex>
  ) : null;
}

// HELPERS
type ControlRendererProps = {
  controls: FormControl | FormControl[];
  isControls: boolean;
  api: Partial<UseFormReturn>;
  formMetadata?: FormMetadata;
};
function ControlRenderer({
  isControls,
  controls,
  api,
  formMetadata,
}: ControlRendererProps) {
  return isControls ? (
    <FormControlList
      controls={controls as FormControl[]}
      api={api}
      formMetadata={formMetadata}
    />
  ) : (
    <ControlResolver
      key={(controls as FormControl)?.name}
      control={controls as FormControl}
      api={api}
      formMetadata={formMetadata}
    />
  );
}

type FormControlListProps = {
  register?: Ref<any>;
  controls: FormControl | FormControl[];
  api: Partial<UseFormReturn>;
  formMetadata?: FormMetadata;
};
function FormControlList({
  controls,
  api,
  formMetadata,
}: FormControlListProps) {
  return (
    <>
      {controls?.map((control, index) => (
        <FormControls
          key={`FormControlList-${control.name}-${index}`}
          controls={control}
          api={api}
          isGroup={false}
          gap={null}
          formMetadata={formMetadata}
        />
      ))}
    </>
  );
}

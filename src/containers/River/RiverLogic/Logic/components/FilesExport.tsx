import { ILogicStep } from 'api/types';
import { getError } from 'components/Form';
import { IconFileExport } from 'components/Icons';
import { TargetIcon } from 'containers/River/RiverLogic/Logic/components/TargetLogic';
import {
  ComponentsTypes,
  SelectedTargetResolver,
} from 'containers/River/Targets/SelectedTarget';
import { ConnectionBarInput } from 'modules/ConnectionBar';
import { useGetTargetTypesQuery } from 'modules/Datasources/store/targets.query';
import React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import { useConnectionsByType } from 'store/connectionTypes';
import { getHashKey } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { Collapse, DisplayVariantProps } from './Collapse';
import { useStepContentForm } from './hooks/useStepContentForm';
interface FilesExportProps extends DisplayVariantProps {
  node: ILogicStep;
}
export const useTargetFileZone = (targetType: string) => {
  const { data } = useGetTargetTypesQuery();
  const fz = data?.find(compare('target_type', targetType))?.file_zone_settings
    ?.target_type_id;
  return data?.find(compare('target_type', fz));
};
export const useConnectionsByBlockType = (targetType: string) => {
  const target = useTargetFileZone(targetType);
  const { connections } = useConnectionsByType(target?.connection_type);
  return {
    connectionType: target?.connection_type,
    dataSourceId: target?.datasource_type_id,
    connectionHeader: target?.name,
    connections,
  };
};

export function FilesExport({
  node,
  displayVariant = Collapse.DisplayVariant.DEFAULT,
}: FilesExportProps) {
  const {
    content,
    content: { block_type: blockType, bucket_name },
    step_name,
  } = node;
  const hash = getHashKey(node);
  const { onSubmitHandler, useFormApi } = useStepContentForm(node);

  if (displayVariant === Collapse.DisplayVariant.SUMMARY) {
    return (
      <>
        <TargetIcon icon={IconFileExport} boxSize={5} />
        {bucket_name ? <span>Bucket Name: {bucket_name}</span> : null}
      </>
    );
  }

  return (
    <SelectedTargetResolver
      component={ComponentsTypes.LOGIC_FILE_EXPORT}
      targetType={blockType}
      onSubmitHandler={onSubmitHandler}
      useFormApi={useFormApi}
      content={content}
      hash={hash}
      stepName={step_name}
    />
  );
}

type FzConnectionProps = {
  blockType: string;
  useFormApi: Partial<UseFormReturn>;
};

const CONTROL_NAME = 'content.fzConnection';
const FZC_DEFAULT_VALUE = {};
export function FZConnection({ blockType, useFormApi }: FzConnectionProps) {
  const { connections, connectionType, dataSourceId, ...rest } =
    useConnectionsByBlockType(blockType);
  const errorMessage = getError(useFormApi, CONTROL_NAME);

  return (
    <Controller
      name={CONTROL_NAME}
      control={useFormApi.control}
      defaultValue={FZC_DEFAULT_VALUE}
      render={({ field: { value, onChange } }) => (
        <ConnectionBarInput
          value={value}
          label="FileZone Connection"
          dataSourceId={dataSourceId}
          connectionType={connectionType}
          onChange={({ cross_id }) => onChange(cross_id)}
          validationMessage={errorMessage?.message}
          {...rest}
        />
      )}
    />
  );
}

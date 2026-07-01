import { ILogicStep } from 'api/types';
import { Box, IconFileExport, Text } from 'components';
import { SelectFormGroup } from 'components/Form';
import { isVariableString } from 'containers/River/hooks/useAsyncMetadata';
import {
  Collapse,
  DisplayVariant,
} from 'containers/River/RiverLogic/Logic/components/Collapse';
import { useStepActions } from 'containers/River/RiverLogic/Logic/components/hooks/useStepActions';
import { TargetIcon } from 'containers/River/RiverLogic/Logic/components/TargetLogic';
import { useEnableEdit } from 'hooks/useEnableEdit';
import { useCallback, useMemo, useState } from 'react';
import { getHashKey } from 'utils/api.sanitizer';
import { compare } from 'utils/array.utils';
import { useCreateDataframeMutation, useGetDataframesQuery } from './store';

const CreateLabel = value => {
  return <Text color="primary">+ Create New Dataframe - {value}</Text>;
};

const useDataFrameValues = (content, dataframeKey) => {
  const dataframesResponse = useGetDataframesQuery();
  const data = dataframesResponse?.data;
  const selectedDataFrame = data?.find(
    compare('name', content?.[dataframeKey]),
  );

  const dataframeOptions = useMemo(
    () =>
      (data as any)?.map(({ name }) => ({
        label: name,
        value: name,
      })),
    [data],
  );

  const selectedValue = useMemo(
    () =>
      selectedDataFrame
        ? {
            label: selectedDataFrame?.name,
            value: selectedDataFrame?.name,
          }
        : null,
    [selectedDataFrame],
  );
  return { dataframeOptions, selectedValue };
};

export function DataframeSelector({
  displayVariant,
  content,
  dataframeKey,
  hash,
}) {
  const { dataframeOptions, selectedValue } = useDataFrameValues(
    content,
    dataframeKey,
  );
  const { enableEdit } = useEnableEdit();
  const dataframesResponse = useGetDataframesQuery();
  const [onAdd] = useCreateDataframeMutation();
  const { updateContent } = useStepActions(hash);
  const [error, setError] = useState('');

  const handleSelect = useCallback(
    dataframe => {
      const value = dataframe?.value ? dataframe.value : '';
      updateContent({ [dataframeKey]: value });
    },
    [dataframeKey, updateContent],
  );

  const onAddDataframe = async variable => {
    if (variable) {
      const res: any = await onAdd({ name: variable });
      if (res?.error) {
        setError(res?.error?.data);
        return;
      }
      const newDataframe = { label: variable, value: variable };
      handleSelect(newDataframe);
      return;
    }
  };

  if (displayVariant === Collapse.DisplayVariant.SUMMARY) {
    return (
      <>
        <TargetIcon icon={IconFileExport} boxSize={5} />
        DataFrame: {selectedValue?.label ?? 'none'}
      </>
    );
  }

  return (
    <Box pl={2} py={4}>
      <SelectFormGroup
        label="DataFrame"
        name={`content.${dataframeKey}`}
        options={dataframeOptions}
        isLoading={
          dataframesResponse.isFetching || dataframesResponse.isLoading
        }
        error={dataframesResponse?.error?.['message']}
        isValidNewOption={isVariableString}
        validationMessage={error}
        controlId={dataframeKey}
        value={selectedValue}
        onChange={handleSelect}
        placeholder="Select or type to create a new DataFrame"
        hideErrorTitle
        isClearable
        withCreate={enableEdit}
        createOptionPosition="last"
        formatCreateLabel={CreateLabel}
        onAddOption={onAddDataframe}
        onInputChange={() => setError('')}
      />
    </Box>
  );
}

export enum DataframeKey {
  SOURCE = 'source_dataframe',
  TARGET = 'target_dataframe',
}

type DataframeProps = {
  node: ILogicStep;
  dataframeKey?: DataframeKey;
  displayVariant?: DisplayVariant;
};

export function Dataframe({
  node,
  dataframeKey = DataframeKey.TARGET,
  displayVariant = Collapse.DisplayVariant.DEFAULT,
}: DataframeProps) {
  const { content } = node;
  return (
    <DataframeSelector
      content={content}
      hash={getHashKey(node)}
      dataframeKey={dataframeKey}
      displayVariant={displayVariant}
    />
  );
}

import { Box } from '@chakra-ui/react';
import { SourceType, TargetLoading } from 'api/types';
import { Text } from 'components';
import { FormSelect, Input, RiverySwitch } from 'components/Form/components';
import React from 'react';
import { useEffectOnce } from 'react-use';
const loadingModeOptions = [
  {
    label: 'Append Only',
    value: TargetLoading.APPEND,
  },
  {
    label: 'Upsert - Merge',
    value: TargetLoading.MERGE,
  },
  {
    label: 'Overwrite',
    value: TargetLoading.OVERWRITE,
  },
];

export function LoadingMode({
  formChanges,
  useFormApi,
  logicalKeyRequired = false,
  mergeMethods = undefined,
  loadingModes = loadingModeOptions,
}) {
  const mergeTargetLoading =
    formChanges.content.target_loading === TargetLoading.MERGE;
  const showFilterLogicalKey = Boolean(formChanges.content.is_ordered_merge);
  useEffectOnce(() => {
    if (loadingModes.length === 1) {
      useFormApi.setValue('content.target_loading', loadingModes[0].value, {
        shouldDirty: true,
      });
    }
  });
  const sourceType = formChanges.content.source_type;
  const filteredLoadingModes = loadingModes.filter(({ value }) =>
    sourceType === SourceType.DATAFRAME ? value !== TargetLoading.MERGE : true,
  );
  return (
    <Box py={2}>
      <FormSelect
        label="Loading Mode"
        name="content.target_loading"
        options={filteredLoadingModes}
        controlId="loading mode"
        api={useFormApi}
      />
      <Box pl={5} py={1}>
        {Boolean(mergeMethods) && mergeTargetLoading && (
          <FormSelect
            label="Merge Method"
            name="content.merge_method"
            options={mergeMethods}
            controlId="merge method"
            api={useFormApi}
            defaultValue={mergeMethods[0]}
          />
        )}

        {mergeTargetLoading && (
          <Box fontSize="xs" py={1} pl={10}>
            <RiverySwitch
              name="content.is_ordered_merge"
              label="Filter Logical key duplication between files."
              api={useFormApi}
            />
            <Box py={1} pl={10}>
              <Text>
                Warning! - This option filters out duplications in the current
                source pull.
              </Text>
              <Text>
                Only use it when duplicates are expected in the source, but not
                in the target table.
              </Text>
            </Box>
            {showFilterLogicalKey && (
              <Input
                name="content.order_expression"
                label={`Filter order expression (${
                  logicalKeyRequired ? 'required' : 'optional'
                })`}
                placeholder="The order expression will be random if you leave it empty"
                api={useFormApi}
              />
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

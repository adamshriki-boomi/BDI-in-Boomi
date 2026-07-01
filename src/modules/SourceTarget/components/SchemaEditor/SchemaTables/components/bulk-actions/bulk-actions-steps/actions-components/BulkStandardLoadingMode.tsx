import { Flex } from '@chakra-ui/react';
import { RiveryRadioGroup } from 'components/Form/components/RiveryRadioGroup';
import { useController, useFormContext } from 'react-hook-form';
import * as React from 'react';
import {
  BulkStandardLoadingMergeMethodValues,
  BulkStandardLoadingModeLabels,
  BulkStandardLoadingModeValues,
} from '../../consts';
import { RenderGuard, Text, HStack } from 'components';
import { CustomSelectForm } from 'components/Form';
import {
  MenuList,
  Option,
  SingleValue,
} from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/SelectComponents';
import { RelevantLoadingOptions } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/commonTargetDefinitions';
import { getMergeMethods } from 'modules/SourceTarget/components/SelectDataTarget/DataTargetDefinitions/commonMergeMethod';

export const BulkStandardLoadingMode = () => {
  const formApi = useFormContext();
  const { field: loadingMode } = useController({
    name: 'actions.loadingMode',
    control: formApi.control,
  });

  return (
    <Flex w="450px" position="relative" direction="column" gap={2}>
      <Flex direction="column">
        <Text textStyle="M6" color="primary">
          Loading mode
        </Text>
        <Text textStyle="R7" color="font-secondary">
          Select the way you would like to load the data:
        </Text>
      </Flex>
      <RiveryRadioGroup
        defaultValue={loadingMode.value}
        onChange={option => {
          loadingMode.onChange(option);
        }}
        value={loadingMode.value}
        values={[
          {
            label: BulkStandardLoadingModeLabels.KEEP,
            value: BulkStandardLoadingModeValues.KEEP,
            description:
              'Retain the existing loading mode settings without making any changes.',
          },
          {
            label: BulkStandardLoadingModeLabels.DEFAULT,
            value: BulkStandardLoadingModeValues.DEFAULT,
            description:
              'Select the loading mode to apply on all selected tables.',
            content: <StandardLoadingModeSelection formApi={formApi} />,
          },
        ]}
      />
    </Flex>
  );
};

function StandardLoadingModeSelection({ formApi }) {
  const { field: loadingMethod } = useController({
    name: 'actions.loadingMethod',
    control: formApi.control,
  });
  const { field: loadingMode } = useController({
    name: 'actions.loadingMode',
    control: formApi.control,
  });
  const LoadingOptions = RelevantLoadingOptions();
  const targetName = formApi.watch('targetName');
  const mergeMethods = getMergeMethods(targetName);
  return (
    <Flex flexDir="column" gap={2} w={'full'}>
      <CustomSelectForm
        api={formApi}
        name="actions.loadingMethod"
        chakra
        options={LoadingOptions}
        isDisabled={loadingMode.value === BulkStandardLoadingModeValues.KEEP}
        components={{
          Option: props => <Option {...props} />,
          SingleValue: props => <SingleValue {...props} />,
          MenuList,
        }}
        controlId="loading mode"
        isMulti={false}
      />
      <RenderGuard condition={true}>
        <HStack>
          <RenderGuard
            condition={
              loadingMethod.value === BulkStandardLoadingMergeMethodValues.MERGE
            }
          >
            <Text textStyle="R7" color="font">
              Merge Method
            </Text>
            <CustomSelectForm
              api={formApi}
              isDisabled={
                loadingMode.value === BulkStandardLoadingModeValues.KEEP
              }
              name="actions.mergeMethod"
              chakra
              options={mergeMethods}
              components={{
                Option: props => <Option {...props} />,
                SingleValue: props => <SingleValue {...props} />,
                MenuList,
              }}
              controlId="merge mode"
              isMulti={false}
            />
          </RenderGuard>
        </HStack>
      </RenderGuard>
    </Flex>
  );
}

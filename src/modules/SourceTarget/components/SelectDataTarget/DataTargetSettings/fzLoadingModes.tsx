import { Flex, Text } from 'components';
import { Input, RadioGroup } from 'components/Form';
import S3CustomPathGuide from './S3CustomPathGuide';
import { PartitionedKind } from './commonTargetSettings';
import { useController, useFormContext } from 'react-hook-form';
import { useDataSourcesSections } from '../../../../Datasources';
import { useGetTarget } from '../../../../Datasources/useLogicTargets';

enum FZLoadingModeEnum {
  AUTO = 'auto-period',
  CUSTOM = 'custom',
}
const getDefaultPathValue = (mode: FZLoadingModeEnum) =>
  mode === FZLoadingModeEnum.AUTO
    ? '{river_name}_{river_id}'
    : '{river_name}_{river_id}/{yyyy}-{mm}-{dd}';

const useGetSupportCustomLoadingMode = formApi => {
  const source = formApi?.watch('river.properties.source');
  const target = formApi?.watch('river.properties.target');
  const { selectedDataSource: selectedSource } = useDataSourcesSections(
    'source',
    source?.name,
  );
  const selectedTarget = useGetTarget(target?.name);
  return (
    selectedSource?.feature_flags?.custom_fz_loading_modes &&
    selectedTarget?.target_settings?.custom_fz_loading_modes
  );
};

export const FzLoadingModes = () => {
  const formApi = useFormContext();
  const { field: fzLoadingModeField } = useController({
    name: 'river.properties.target.fz_loading_mode',
    control: formApi.control,
    defaultValue: FZLoadingModeEnum.AUTO,
  });

  const supportCustomLoadingMode = useGetSupportCustomLoadingMode(formApi);
  const pathPlaceholder = getDefaultPathValue(fzLoadingModeField.value);
  const pathDefaultValue = pathPlaceholder;

  const handleModeChange = (newMode: FZLoadingModeEnum) => {
    fzLoadingModeField.onChange(newMode);
    const defaultValue = getDefaultPathValue(newMode);
    formApi.setValue('river.properties.target.path', defaultValue);
  };

  const renderModeContent = () => {
    switch (fzLoadingModeField.value) {
      case FZLoadingModeEnum.CUSTOM:
        return <S3CustomPathGuide />;
      case FZLoadingModeEnum.AUTO:
        return <PartitionedKind formApi={formApi} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Flex flexDir="column" gap="2">
        <Text textStyle="M7" fontWeight="500">
          Partition Granularity Type
        </Text>
        <Text textStyle="M8" color="font-secondary">
          Select and enter all the values for the chosen Target destination.
        </Text>
        <RadioGroup
          name="fz_loading_mode"
          values={[
            { label: 'Auto Period', value: FZLoadingModeEnum.AUTO },
            {
              label: 'Custom',
              value: FZLoadingModeEnum.CUSTOM,
              disabled: !supportCustomLoadingMode,
            },
          ]}
          checked={fzLoadingModeField.value}
          onChange={handleModeChange}
        />
      </Flex>
      <Input
        label="File Zone Path"
        chakra
        api={formApi}
        name="river.properties.target.path"
        placeholder={pathPlaceholder}
        defaultValue={pathDefaultValue}
        required
      />
      {renderModeContent()}
    </>
  );
};

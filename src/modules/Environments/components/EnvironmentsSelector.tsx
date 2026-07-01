import { Grid, Icon } from '@chakra-ui/react';
import { Box, EnvironmentsIcon, HStack, RenderGuard, Text } from 'components';
import { SelectFormGroupProps } from 'components/Form';
import { CustomSelectForm } from 'components/Form/components/SelectFormGroup/CustomSelectForm';
import { useSelectFormStyles } from 'components/Form/components/SelectFormGroup/select.styles';
import { useGetEnvironmentsQuery } from 'modules/Environments/environments.query';
import { getOId } from 'utils/api.sanitizer';

export function CustomOption(props) {
  const all = props.data.label !== 'All Environments';
  return (
    <Grid gridArea="1/1/2/3">
      <HStack {...props}>
        <RenderGuard condition={all}>
          <Icon
            as={EnvironmentsIcon}
            bg={props.data.color}
            boxSize={5}
            p={1}
            color="white!important"
            borderRadius={50}
          />
        </RenderGuard>
        <HStack>
          <Text
            size="small"
            fontWeight={props.isSelected ? 'medium' : 'normal'}
            flexGrow={1}
            display="flex"
          >
            {props.data.label}
          </Text>
          {props.data.is_default ? <Text>(Default)</Text> : null}
        </HStack>
      </HStack>
    </Grid>
  );
}

export const useEnvironmentOptions = (param = '') => {
  const { data: environmentsArray } = useGetEnvironmentsQuery(param);
  return environmentsArray?.map(
    ({ environment_name, color, cross_id, is_default }) => ({
      label: environment_name,
      value: getOId(cross_id),
      color,
      is_default,
    }),
  );
};
const components = {
  SingleValue: CustomOption,
  Option: CustomOption,
};
export function SelectComponent({
  ...props
}: SelectFormGroupProps & {
  api?: any;
  disabled?: boolean;
  required?: boolean;
}) {
  const baseSelectStyle = useSelectFormStyles(true);

  return (
    <Box width={props?.width ?? '230px'}>
      <CustomSelectForm
        chakra
        isMulti={false}
        components={components}
        placeholder="Select an Environment"
        customStyles={{
          control: (styles, props) => {
            const { isDisabled } = props;
            return {
              ...styles,
              ...baseSelectStyle.control(styles, props),
              opacity: isDisabled ? 0.8 : 1,
            };
          },
        }}
        {...props}
      />
    </Box>
  );
}

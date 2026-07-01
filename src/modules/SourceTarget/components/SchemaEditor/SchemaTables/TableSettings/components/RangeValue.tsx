import { ArrowNarrowRight, Grid, Icon } from 'components';
import { Input, RiveryCheckbox } from 'components/Form';
import { useController } from 'react-hook-form';
import { useEffectOnce } from 'react-use';
import { useTableSettingsFormContext } from '../form.hooks';

export function RangeValue({ name, start, end, includeEnd }) {
  const formApi = useTableSettingsFormContext();
  const { field: includeEndField } = useController({
    name: `table.${name}.${includeEnd}` as any,
    control: formApi.control,
  });

  useEffectOnce(() => {
    if ([undefined, null].includes(includeEndField.value)) {
      includeEndField.onChange(false);
    }
  });
  return (
    <Grid
      alignItems="start"
      gridColumn="1/3"
      gridTemplateColumns="140px min-content 140px"
      gap={1}
    >
      <Grid>
        <Input
          type="number"
          label="Start Value"
          placeholder="From Value.."
          name={`table.${name}.${start}`}
          api={formApi}
          chakra
          inputProps={{ min: 1 }}
        />
      </Grid>
      <Icon
        as={ArrowNarrowRight}
        display="flex"
        alignSelf="start"
        color="purple.100"
        boxSize="4"
        mt={7}
      />
      <Grid gap="2">
        <Input
          type="number"
          label="End Value"
          placeholder="Up to Value.."
          name={`table.${name}.${end}`}
          api={formApi}
          chakra
          inputProps={{
            min: formApi?.watch('table.running_number.start_value'),
          }}
        />
        <RiveryCheckbox
          api={formApi}
          name={`table.${name}.${includeEnd}`}
          label="Include End Value"
        />
      </Grid>
    </Grid>
  );
}

import { Box, RenderGuard, Textarea } from 'components';
import { Input, InputLabel } from 'components/Form';
import RiveryAlert from 'components/Alert/Alert';
import { useGetRiverCommonProps } from '../../../../form';

export function FilterExpression({ formApi }) {
  const { isCDC } = useGetRiverCommonProps();
  return (
    <Box w="450px" pt={4}>
      <InputLabel variant="semibold" label="Filters" />
      <RenderGuard condition={isCDC}>
        <Box mb={2}>
          <RiveryAlert
            variant="info"
            description="For CDC, the filter will only be applied during the initial migration step and will be ignored in subsequent executions."
          />
        </Box>
      </RenderGuard>
      <Input
        as={Textarea}
        hideLabel
        placeholder="Enter Filter Expression"
        name="table.additional_source_settings.filter_expression"
        api={formApi}
        chakra
        size="10"
        fontSize="sm"
        optional
      />
    </Box>
  );
}

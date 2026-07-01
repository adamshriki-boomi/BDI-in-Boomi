import { Flex, RenderGuard } from 'components';
import { ExpressionColumnTag } from '../ExpressionColumnTag';

export function ExpressionName({
  row: { original },
  column: {
    getProps: { modifiedColumnsMap },
  },
}) {
  const customValue = modifiedColumnsMap.get(original.name);
  return (
    <Flex justifyContent="flex-end" width="full">
      <RenderGuard condition={Boolean(customValue?.calculated_column_mode)}>
        <ExpressionColumnTag
          label="Calculated"
          type={customValue?.calculated_column_mode}
        />
      </RenderGuard>
    </Flex>
  );
}

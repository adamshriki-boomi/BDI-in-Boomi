import { HStack } from 'components';
import { AddCalculatedColumn } from '../AddCalculatedColumn';
import { useHandleCalculatedExpressions } from 'modules/SourceTarget/components/SchemaEditor/SchemaTables/TableSettings/TableSource/SourceCommonSettings';
import { useMainFormColumnsDefinitions } from 'modules/SourceTarget/components/form';

export function AddCalculated({ isDisabled, api }) {
  const { sourceType, targetType } = useMainFormColumnsDefinitions();
  const { shouldShowCalculatedColumn } = useHandleCalculatedExpressions(
    sourceType,
    targetType,
  );

  if (!shouldShowCalculatedColumn) {
    return null;
  }

  return (
    <HStack justify="space-between" position="absolute" right="0" top="0">
      <AddCalculatedColumn onChange={api.addOne} isDisabled={isDisabled}>
        Add Calculated Column
      </AddCalculatedColumn>
    </HStack>
  );
}

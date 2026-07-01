import { useSttFormContext } from 'modules/SourceTarget';
import { Text } from 'components';

export function SchedulingError() {
  const formApi = useSttFormContext();
  return (
    <Text color="red.100" textStyle="R8">
      {(formApi.formState.errors.river?.properties as any)?.summary?.message}
    </Text>
  );
}

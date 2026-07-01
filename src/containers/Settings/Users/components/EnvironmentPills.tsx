import { Environment } from 'api/types';
import { Text } from 'components';
import { useSelectedEnvironment } from 'store/environments/hooks/useGetEnvironment';

export function EnvironmentPills({ row: { original } }) {
  const { environmentsLength } = useSelectedEnvironment();
  const items = original?.environments
    ? (Object.values(original.environments).filter(
        ({ role }) => role !== 'no_access',
      ) as Environment[])
    : [];
  return (
    <Text>
      {original?.is_all_environment_admin ? environmentsLength : items?.length}
    </Text>
  );
}

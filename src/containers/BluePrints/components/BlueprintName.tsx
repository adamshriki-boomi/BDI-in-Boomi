import { RiveryButton } from 'components';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { upsertSearchParam } from 'utils/searchParams';

export default function BlueprintName({
  value,
  row: {
    original: { cross_id },
  },
}) {
  const { replace } = useHistory();

  const setSelectedBlueprint = useCallback(
    id => replace({ search: upsertSearchParam('blueprint', id) }),
    [replace],
  );
  return (
    <RiveryButton
      pl={1}
      variant="link"
      label={value}
      onClick={() => setSelectedBlueprint(cross_id)}
    />
  );
}

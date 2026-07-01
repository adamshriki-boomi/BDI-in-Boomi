import { RiverListActions } from 'containers/River/components/RiverListAction/RiverListActions';
import React from 'react';
import { getCrossId } from 'utils/api.sanitizer';

const excludedActions = [RiverListActions.ActionList.EDIT_DESCRIPTION];
export function RiverListActionsCell({ row: { original: river } }) {
  return (
    <RiverListActions
      riverName={river?.river_definitions?.river_name}
      crossId={getCrossId(river)}
      isApiV2={Boolean(river?.river_definitions?.is_api_v2)}
      exclude={excludedActions}
    />
  );
}

export function NewRiverListActionsCell({
  row: {
    original: { name, river_cross_id, is_api_v2 },
  },
}) {
  return (
    <RiverListActions
      riverName={name}
      crossId={river_cross_id}
      isApiV2={Boolean(is_api_v2)}
      exclude={excludedActions}
      newTableContext
    />
  );
}

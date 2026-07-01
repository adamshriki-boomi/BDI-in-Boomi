import { RoutesBuilder } from 'app/routes';
import {
  CloseIconSmall,
  ConfirmationModal,
  Icon,
  IconButton,
} from 'components';
import { useState } from 'react';
import { Link, Prompt, useHistory } from 'react-router-dom';
import { useCore } from 'store/core';
import { useRiver } from 'store/river';

export const CloseRiver = () => {
  const { replace } = useHistory();
  const [reRouteLocation, setReRouteLocation] = useState(null);
  const { selectedRiverIsDirty } = useRiver();
  const { envId: env, activeAccountId: account } = useCore();
  return (
    <>
      <Prompt
        when={selectedRiverIsDirty}
        message={(location, action) => {
          if (['PUSH', 'POP'].includes(action)) {
            setReRouteLocation(location);
          }
          if (action === 'REPLACE') {
            return true;
          }
          return reRouteLocation ? true : false;
        }}
      />
      <ConfirmationModal
        show={reRouteLocation}
        title="Leave this data flow?"
        description="Changes you made so far will not be saved"
        onConfirm={() => replace(reRouteLocation?.pathname)}
        onClose={() => setReRouteLocation(null)}
        confirmLabel="Yes, leave data flow"
        cancelLabel="Keep editing"
        variant="error"
      />
      <IconButton
        aria-label="close data flow"
        as={Link}
        to={RoutesBuilder.rivers({ account, env })}
        icon={<Icon as={CloseIconSmall} />}
        backgroundColor="transparent"
        _hover={{ backgroundColor: 'transparent' }}
        _active={{ backgroundColor: 'transparent' }}
      />
    </>
  );
};

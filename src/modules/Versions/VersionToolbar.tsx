import { HStack } from '@chakra-ui/react';
import { ConfirmationModal } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { useRiverId } from 'containers/Activities/helpers';
import { useRiverType } from 'hooks/useRiverType';
import { useDismissDrawer } from 'modules/RiverRightBar';
import {
  IRiverStatus,
  useDisableRiver,
  useGetRiverTrigger,
} from 'modules/SourceTarget';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useAsyncFn, useToggle } from 'react-use';
import { useRiver, useRiverActions } from 'store/river';
import { useVersionController } from './hooks';

export function VersionToolbar() {
  const [showDisaclaimer, toggleDisclaimer] = useToggle(false);
  const isReactRoute = window.location.pathname.includes('rivers');
  const { isLogic } = useRiverType();
  const { isApiV2 } = useRiver();
  const isNewStt = isReactRoute && !isLogic;
  const isV2River = isLogic ? isApiV2 : isReactRoute;
  const { restoreRiver } = useRiverActions();
  const { viewLatest } = useVersionController();
  const river_id = useRiverId();
  const dismissVersionView = useDismissDrawer(true);
  const { getRiver } = useGetRiverTrigger(river_id);
  const { version } = useVersionController();
  const {
    disableRiver: disable,
    running,
    completed: currentVersionDisabled,
  } = useDisableRiver();
  const checkRiverStatus = useCallback(async () => {
    const river = await getRiver();
    return river?.metadata?.river_status === IRiverStatus.ACTIVE;
  }, [getRiver]);

  const [{ loading }, restore] = useAsyncFn(async () => {
    await restoreRiver({ river_id, version_id: version, is_api_v2: isV2River });
    if (isNewStt) {
      await getRiver();
    }
    dismissVersionView();
  });

  const restoreCurrentRiver = useCallback(async () => {
    if (isNewStt) {
      const isRiverActive = await checkRiverStatus();
      if (isRiverActive) {
        toggleDisclaimer(true);
        return;
      }
    }
    restore();
  }, [checkRiverStatus, isNewStt, restore, toggleDisclaimer]);

  useEffect(() => {
    if (currentVersionDisabled) {
      restore();
    }
  }, [currentVersionDisabled, restore]);

  return (
    <HStack gap={2}>
      <RiveryButton
        variant="default"
        label="Back to Current"
        onClick={() => {
          viewLatest();
        }}
        size="small"
      />
      <RiveryButton
        variant="primary"
        label="Restore Version"
        isLoading={loading || running}
        onClick={restoreCurrentRiver}
        size="small"
      />
      <ConfirmationModal
        variant="warning"
        show={showDisaclaimer}
        title="Restore Data Flow Version"
        description="To restore this version, the Data Flow must be disabled."
        onClose={toggleDisclaimer}
        onConfirm={() => disable(river_id)}
        confirmLabel="Disable & Restore"
        confirmColorScheme="primary"
      />
    </HStack>
  );
}

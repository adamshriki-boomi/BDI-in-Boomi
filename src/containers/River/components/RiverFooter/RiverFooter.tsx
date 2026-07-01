import { StatusTypes } from 'api/types';
import { Center, GridBox, useIsNewCheckRunActive } from 'components';
import { IRiverActivityRun } from 'containers/Activities';
import { RiverValidationMessage } from 'modules';
import React, { useMemo } from 'react';
import { useToggle } from 'react-use';
import { useRiver, useRiverRun } from 'store/river';
import { ResultsPanelButton } from './ResultsPanel';
import { RunResult } from './RunResult';
import { RunRiverButton } from './RunRiverButton';
import { SaveRiverButton } from './SaveRiverButton';
import { useRiverDraft } from './useRiverDraft';

function useIsRunDone(details) {
  const isNewCheckRun = useIsNewCheckRunActive();
  return isNewCheckRun
    ? [
        StatusTypes.FAILED,
        StatusTypes.CANCELED,
        StatusTypes.SKIPPED,
        StatusTypes.SUCCEEDED,
      ].includes((details as IRiverActivityRun)?.status)
    : ['D', 'E'].includes(details?.river_run_status);
}

interface RiverFooterProps {
  onView: () => void;
  showPanel: boolean;
}
/**
 * @property childrenOnly {boolean} renders the children jsx without the wrappers
 */
export function RiverFooter({ onView, showPanel }: RiverFooterProps) {
  const {
    save,
    saving,
    run,
    forceSave,
    disabled,
    isErrorDisplayed,
    closeErrorModal,
  } = useRiverDraft();
  const [isDisabled, toggleDisabled] = useToggle(false);

  const { isButtonDisabled, isRunDone } = useIsRiverButtonsDisabled();
  const isSaveButtonDisabled = useMemo(
    () => (isButtonDisabled || isDisabled) && !isRunDone,
    [isButtonDisabled, isDisabled, isRunDone],
  );

  return (
    <GridBox
      bg="background-secondary"
      p={3}
      zIndex={0}
      overflow="hidden"
      gridArea="footer"
      boxShadow="0 0 4px 0 rgba(0,0,0,0.2)"
    >
      <Center>
        <RunRiverButton
          onRun={run}
          disabled={disabled}
          disableSave={toggleDisabled}
        />
        <SaveRiverButton
          onSave={save}
          disabled={disabled || isSaveButtonDisabled}
          loading={saving}
        />
        {!showPanel ? <ResultsPanelButton onClick={onView} /> : null}
        <RiverValidationMessage
          onSave={forceSave}
          show={isErrorDisplayed}
          onClose={closeErrorModal}
          loading={saving}
        />
      </Center>
      <RunResult />
    </GridBox>
  );
}

export function useIsRiverButtonsDisabled() {
  const { details } = useRiverRun();
  const { isPending } = useRiver();
  const isRunDone = useIsRunDone(details);
  const isButtonDisabled = useMemo(() => isPending, [isPending]);
  return { isButtonDisabled, isRunDone };
}

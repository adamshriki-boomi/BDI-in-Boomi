import {
  Box,
  ConfirmationModal,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import RiveryAlert from 'components/Alert/Alert';
import ReActivationModal from 'containers/River/RiverSourceToTarget/components/RiverActivation/ReactivationModal';
import { getQueryParams } from 'hooks/router';
import { useIsneedReactivate, useIsRiverActive } from 'modules/SourceTarget';
import React, { useCallback, useState } from 'react';
import { Prompt, useHistory } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useRiverActions } from 'store/river';
import { useCreateSttFormContext } from '../form.hooks';
import {
  SaveRiverButton,
  useRiverDataBuilder,
  useValidateRiverSaver,
} from './SaveRiverButton';

const emptyFormText = `Exiting at this stage will discard your configuration, requiring you to restart the creation process.`;

const fullFormText = `Quitting the process will result in incomplete Data Flow. You can exit by saving your progress or discard all changes.`;

const blueprintWarningText =
  'Saving without selecting a report will automatically clear all current interface parameter values.';

function blueprintConfirmationMessage(formApi) {
  const river = formApi?.watch('river');
  const showBlueprintWarning =
    !Boolean(Object.values(river?.properties?.schemas)?.length) &&
    Boolean(
      river?.properties?.source?.additional_settings?.interface_parameters,
    );
  return showBlueprintWarning && blueprintWarningText;
}

const isNewLegacyRiverRoute = search => {
  return search.indexOf('selected_river_type') >= 0;
};

export function QuitConfirmationModal({
  currentStep,
  validForSave,
  onStepChange,
}) {
  const [reRouteLocation, setReRouteLocation] = useState(null);
  const { push, location: currLocation } = useHistory();
  const { setVariables } = useRiverActions();
  const formApi = useCreateSttFormContext();
  const confirmReRoute = useCallback(() => {
    push(reRouteLocation?.pathname);
    setReRouteLocation(null);
    setTimeout(() => {
      formApi?.reset();
      onStepChange(0);
      setVariables({});
    }, 500);
  }, [formApi, onStepChange, push, reRouteLocation?.pathname, setVariables]);
  const confirmText = validForSave ? fullFormText : emptyFormText;

  return (
    <>
      <Prompt
        when={formApi?.formState?.isDirty}
        message={(location, action) => {
          //Because it's the same path, the prompt is not automaticaly triggered
          if (
            location.pathname === currLocation.pathname &&
            location?.search.includes('river_drawer') === false &&
            currLocation?.search.includes('river_drawer') === false &&
            location?.search.includes('chat_id') === false
          ) {
            setReRouteLocation({ ...location });
          } else if (
            isNewLegacyRiverRoute(location.search) ||
            action === 'REPLACE'
          ) {
            return true;
          } else if (['PUSH'].includes(action)) {
            setReRouteLocation(location);
          }
          return reRouteLocation ? true : false;
        }}
      />
      <ConfirmationModal
        className={`create-source-to-target-step-${currentStep + 1}`}
        title="Exit Data Flow Creation"
        show={reRouteLocation}
        customConfirm={
          validForSave ? (
            <SaveRiverButton
              label="Save & Exit"
              variant="primary"
              size="base"
              onSuccess={confirmReRoute}
            />
          ) : (
            <RiveryButton
              label="Exit Data Flow Creation"
              variant="primary"
              onClick={confirmReRoute}
            />
          )
        }
        onClose={() => setReRouteLocation(null)}
        {...(validForSave && {
          footerExtraButtons: (
            <RiveryButton
              label="Exit Without Saving"
              colorScheme="danger"
              variant="primary"
              onClick={confirmReRoute}
            />
          ),
        })}
      >
        <Box>
          {confirmText}
          <RenderGuard condition={blueprintConfirmationMessage(formApi)}>
            <br />
            <br />
            <RiveryAlert
              description={blueprintConfirmationMessage(formApi)}
              variant="warning-light"
            />
          </RenderGuard>
          <br /> How would you like to continue?
        </Box>
      </ConfirmationModal>
    </>
  );
}

export function EditModePromptModal() {
  const formApi = useCreateSttFormContext();
  const [location, saveReRouteLocation] = useState(null);
  const [showReactivate, toggleReActivate] = useToggle(false);
  const isRiverActive = useIsRiverActive();
  const shouldReactivate = useIsneedReactivate(formApi);
  const buildRiverData = useRiverDataBuilder();
  const validateRiverStructure = useValidateRiverSaver();
  const [reRouteLocation, setReRouteLocation] = useState(null);
  const {
    replace,
    location: { pathname },
  } = useHistory();

  const confirmReRoute = useCallback(
    (action = 'confirm') => {
      setReRouteLocation(null);
      replace(
        isRiverActive && shouldReactivate && action !== 'discard'
          ? location?.pathname
          : reRouteLocation?.pathname,
      );
    },
    [
      isRiverActive,
      location?.pathname,
      reRouteLocation?.pathname,
      replace,
      shouldReactivate,
    ],
  );

  const { tab } = getQueryParams(['tab']);

  return (
    <>
      <Prompt
        when={Boolean(
          formApi?.formState?.dirtyFields?.river &&
            Object.values(formApi?.formState?.dirtyFields?.river)?.length,
        )}
        message={(location, action) => {
          if (pathname === location.pathname) {
            return true;
          }
          if (isNewLegacyRiverRoute(location.search) || action === 'REPLACE') {
            return true;
          } else if (['PUSH'].includes(action)) {
            setReRouteLocation(location);
          }
          return reRouteLocation ? true : false;
        }}
      />
      <ConfirmationModal
        className={`source-to-target-river-${tab}`}
        variant="warning"
        title="Unsaved Changes"
        show={reRouteLocation}
        dialogWidth="510px"
        customConfirm={
          <SaveRiverButton
            label={
              isRiverActive && shouldReactivate
                ? 'Save & Re-Activate'
                : 'Save Changes'
            }
            variant="primary"
            size="base"
            onSuccess={confirmReRoute}
            onFailure={() => setReRouteLocation(null)}
            {...(isRiverActive &&
              shouldReactivate && {
                onClick: async () => {
                  saveReRouteLocation(reRouteLocation);
                  const river = buildRiverData();
                  const valid = await validateRiverStructure(river, {
                    isActivateButton: true,
                  });
                  setReRouteLocation(null);
                  if (valid) {
                    toggleReActivate(true);
                  }
                },
              })}
          />
        }
        onClose={() => setReRouteLocation(null)}
        footerExtraButtons={
          <RiveryButton
            label="Discard"
            variant="outlined-primary"
            onClick={() => confirmReRoute('discard')}
          />
        }
        {...(!shouldReactivate && {
          description:
            'You have unsaved changes. Do you want to save your changes before exiting the data flow?',
        })}
      >
        <RenderGuard condition={shouldReactivate}>
          <Text>Your Data Flow has unsaved changes.</Text>
          <Text>
            In order to save them, the Data Flow has to be re-activated.
          </Text>
          <Text>
            Discarding the changes will restore the Data Flow to its previous
            state.
          </Text>
          <Text>How would you like to proceed?</Text>
        </RenderGuard>
      </ConfirmationModal>
      <ReActivationModal
        showReactivate={showReactivate}
        toggleReActivate={toggleReActivate}
        dismissReactivation={confirmReRoute}
        closeLabel="Exit Data Flow"
        reRouteTo={location}
      />
    </>
  );
}

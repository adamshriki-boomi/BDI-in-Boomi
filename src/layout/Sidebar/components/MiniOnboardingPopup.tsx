import {
  Fade,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  Portal,
} from '@chakra-ui/react';
import { Storage } from 'api/storage';
import { AppRoutes } from 'app/routes';
import {
  Box,
  Center,
  Popover,
  PopoverContent,
  RiveryButton,
  Text,
} from 'components';
import { RiveryCheckbox } from 'components/Form';
import {
  totalStepsCount,
  useCompletedStepsCount,
  useOnboardingStepsProgress,
} from 'containers/Onboarding/helpers';
import { useGetUserQuery } from 'containers/Settings/Users/usersV1.query';
import { useCallback, useEffect } from 'react';
import { generatePath, Link } from 'react-router-dom';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { getOId } from 'utils/api.sanitizer';

export const useOnboardingPopupCondition = () => {
  const {
    userId,
    activeAccountId: account_id,
    isAdminRole,
    isViewerRole,
  } = useCore();
  const { data: user } = useGetUserQuery({
    user_id: getOId(userId),
    account_id,
  });
  const steps = user?.onboarding && Object.values(user?.onboarding);
  const completedSteps = useCompletedStepsCount(steps);
  const completedMainSteps = useOnboardingStepsProgress(
    user?.onboarding,
  )?.filter(completed => completed)?.length;
  const stepsToShow = isAdminRole ? 6 : 5;
  const stepsCount = isAdminRole ? totalStepsCount() : totalStepsCount() - 1;
  const showPopup =
    !isViewerRole && completedSteps > 1 && completedSteps <= stepsCount - 2;
  return { showPopup, completedMainSteps, stepsToShow };
};

export function PopUp({ trigger, left }) {
  const { envId: env, activeAccountId: account } = useCore();
  const { isAccountInTrial, isViewerRole } = useCore();
  const [show, toggleShow] = useToggle(false);
  const { showPopup, completedMainSteps, stepsToShow } =
    useOnboardingPopupCondition();

  const hidePopup = JSON.parse(
    Storage.getData(Storage.Keys.HIDE_ONBOARDING_KEY),
  );
  useEffect(() => {
    if (!isViewerRole && isAccountInTrial) {
      if (!showPopup) {
        toggleShow(false);
        return;
      }
      if (hidePopup === true) {
        toggleShow(false);
        return;
      }
      if (Boolean(Storage.getData(Storage.Keys.SHOW_ONBOARDING_KEY))) {
        setTimeout(() => toggleShow(true), 60000);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPopup, hidePopup]);

  const removePopup = useCallback(() => {
    Storage.store(Storage.Keys.HIDE_ONBOARDING_KEY, true);
  }, []);

  if (!show) {
    return null;
  }

  return (
    <Popover isOpen={show} placement="bottom">
      {trigger}
      <Portal>
        <Fade in={show}>
          <PopoverContent
            transform="all 3s"
            maxW="215px"
            bg="brand"
            border="1px solid"
            borderColor="purple.50"
            position="absolute"
            top="calc(100vh - 200px)"
            left={left}
            aria-label="onboarding-popup"
            sx={{
              '& .chakra-popover__arrow-positioner': {
                transform: 'rotate(135deg)',
                left: '-6px',
                top: '120px',
                borderBottom: '1px solid',
                borderRight: '1px',
                borderBottomColor: 'purple.50',
                borderRightColor: 'purple.50',
              },
            }}
          >
            <PopoverCloseButton
              onClick={() => toggleShow(false)}
              color="gray.300"
            />
            <PopoverBody>
              <Center p={4} gap={2} flexDir="column">
                <Text textStyle="R7" color="white" textAlign="center">
                  So Close! <br />
                  You have {stepsToShow - completedMainSteps} steps left to
                  finish your onboarding
                </Text>
                <Box>
                  <RiveryButton
                    label="Continue Onboarding"
                    as={Link}
                    to={generatePath(AppRoutes.ONBOARDING, {
                      env,
                      account,
                    })}
                    size="small"
                  />
                </Box>
                <RiveryCheckbox
                  name="hide_onboarding"
                  label="Don't show me again"
                  labelColor="gray.300"
                  onChange={removePopup}
                />
              </Center>
            </PopoverBody>
            <PopoverArrow bg="brand" height="10px" width="10px" />
          </PopoverContent>
        </Fade>
      </Portal>
    </Popover>
  );
}

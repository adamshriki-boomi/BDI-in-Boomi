import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react';
import {
  Box,
  Center,
  Flex,
  Grid,
  HStack,
  Icon,
  Image,
  RiveryButton,
  Text,
} from 'components';
import {
  CloseIconSmall,
  OutlinedSuccess,
  PlusIcon,
} from 'components/Icons/components';
import React, { useCallback, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useEffectOnce, useToggle } from 'react-use';
import { useAccount, useCore } from 'store/core';
import { ONBOARDING_STEPS } from './Steps/StepsStaticContent';
import VideoModal from './VideoModal';

export function Step({ stepIndex, step, onUpdateStep }) {
  const [data, setData] = useState<any>([]);
  const currentStep = ONBOARDING_STEPS[`STEP_${stepIndex}`];
  const substeps = currentStep?.substeps;
  const stepData = Object.values(currentStep?.sections || {});
  const additionalData = currentStep?.additional_section;
  const combinedData = additionalData
    ? stepData.concat(additionalData)
    : stepData;

  useEffectOnce(() => {
    setData(combinedData);
  });

  const completedSubSteps = step && Object.keys(step);
  return (
    <AccordionPanel px={6}>
      <Flex flexDir="column">
        {data?.length > 1 ? (
          <Accordion
            allowToggle
            defaultIndex={[0]}
            sx={{
              '& .chakra-accordion__item:last-child': {
                borderBottomWidth: 0,
              },
            }}
          >
            {data?.map(({ title, text = null, component = null }, idx) => {
              const completedSubStep = completedSubSteps?.includes(
                substeps?.[idx],
              );
              return (
                <AccordionItem
                  key={idx}
                  flexDir="column"
                  borderTop={0}
                  borderBottom="1px solid"
                  borderBottomColor="gray.300"
                  py={2}
                  gap={5}
                >
                  <AccordionButton
                    onClick={() => {
                      if (title === 'Understanding Data Flow Types') {
                        onUpdateStep(
                          currentStep?.id,
                          currentStep?.substeps?.[1],
                        );
                      }
                    }}
                    _hover={{ bg: 'transparent' }}
                    py={2}
                    pl={0.5}
                    pr={1}
                    sx={{
                      '&[aria-expanded="true"]': {
                        '& [aria-label="expand"]': {
                          display: 'none',
                        },
                        fontWeight: 'medium',
                      },
                      '&[aria-expanded="false"]': {
                        '& [aria-label="dismiss"]': {
                          display: 'none',
                        },
                      },
                    }}
                  >
                    <Flex w="full" justify="space-between" alignItems="center">
                      <HStack>
                        {completedSubStep ? (
                          <Icon
                            as={OutlinedSuccess}
                            boxSize={5}
                            color="success"
                          />
                        ) : (
                          <Center
                            fontWeight="medium"
                            fontSize="xs"
                            boxSize={4}
                            border="1px solid"
                            borderColor="font"
                            borderRadius={50}
                            color="font"
                          >
                            {idx + 1}
                          </Center>
                        )}

                        <Text>{title}</Text>
                      </HStack>
                      <Icon
                        boxSize={4}
                        as={PlusIcon}
                        aria-label="expand"
                        color="icon"
                      />
                      <Icon
                        boxSize={4}
                        as={CloseIconSmall}
                        aria-label="dismiss"
                      />
                    </Flex>
                  </AccordionButton>
                  <AccordionPanel>
                    <GenericStepContent
                      text={text}
                      component={component}
                      currentStep={currentStep}
                      idx={idx}
                      onUpdateStep={onUpdateStep}
                    />
                  </AccordionPanel>
                </AccordionItem>
              );
            })}
          </Accordion>
        ) : (
          <Box pt={5} pb={2}>
            <GenericStepContent
              text={data[0]?.text}
              component={data[0]?.component}
              currentStep={currentStep}
              idx={0}
              onUpdateStep={onUpdateStep}
            />
          </Box>
        )}
      </Flex>
    </AccordionPanel>
  );
}

export function GenericStepContent({
  text = '',
  component = null,
  currentStep,
  idx,
  onUpdateStep,
  dismissResourceCenter = null,
}) {
  const renderedInResourceCenter = Boolean(dismissResourceCenter);
  const [watchVideo, setWatchVideo] = useToggle(false);
  const { envId, selectedAccountId: accountId } = useCore();
  const { push } = useHistory();
  const Component = component;
  const button = currentStep?.button?.[idx + 1];
  const isDefaultVariant = button?.label?.includes('Watch');

  const { isSettingOn } = useAccount();
  const onAction = useCallback(() => {
    if (button?.videoImage) {
      onUpdateStep(currentStep?.id, currentStep?.substeps?.[idx]);
      setWatchVideo(true);
    }
    if (button?.url?.pathname) {
      if (button?.label === 'Visit Activities') {
        onUpdateStep(currentStep?.id, currentStep?.substeps?.[idx]);
      }
      const url = button.url;
      const defaultPathname = url.pathname({
        env: envId,
        account: accountId,
        ...url?.additionalParams,
      });
      let pathname = defaultPathname;
      if (url?.type === 'legacy') {
        pathname = url.pathname({ envId, accountId });
      }
      if (
        url?.search === '?create_first_river=true' &&
        isSettingOn('allow_create_new_stt')
      ) {
        pathname = defaultPathname;
      }
      push({
        pathname,
        search: url?.search,
      });
    }
  }, [
    accountId,
    button?.label,
    button?.url,
    button?.videoImage,
    currentStep?.id,
    currentStep?.substeps,
    envId,
    idx,
    isSettingOn,
    onUpdateStep,
    push,
    setWatchVideo,
  ]);

  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';

  return (
    <Flex flexDir="column" px={1} gap={3}>
      {text ? (
        <Grid
          templateColumns={renderedInResourceCenter ? 'unset' : '7fr 5fr'}
          gap={5}
          alignItems="center"
        >
          <Flex gap={3} flexDir="column">
            <Text
              textStyle="R7"
              dangerouslySetInnerHTML={{ __html: text }}
              sx={{
                '& > ul': {
                  paddingLeft: '14px',
                },
              }}
            />
            {renderedInResourceCenter ? (
              isDefaultVariant ? (
                <Text>For more information watch this video: </Text>
              ) : null
            ) : (
              <Box>
                {button?.label ? (
                  <RiveryButton
                    label={button.label}
                    variant={isDefaultVariant ? 'default' : 'primary'}
                    leftIcon={
                      button.icon ? <Icon boxSize={4} as={button.icon} /> : null
                    }
                    onClick={onAction}
                  />
                ) : null}
              </Box>
            )}
          </Flex>
          {button?.videoImage ? (
            <VideoModal
              videoImage={button.videoImage}
              brightcoveVideoId={button?.brightcoveVideoId}
              updateStep={onAction}
              title={currentStep.title}
              setWatchVideo={setWatchVideo}
              activatedFromButton={watchVideo}
              videoBgColor={button?.videoBgColor}
            />
          ) : null}

          {button?.staticImage && !renderedInResourceCenter ? (
            <Image
              src={button.staticImage}
              {...(exoTheme && {
                ml: currentStep?.id === 'data_connections_step' ? '25%' : '50%',
              })}
            />
          ) : null}
        </Grid>
      ) : null}
      {component ? <Component onAction={onAction} /> : null}
    </Flex>
  );
}

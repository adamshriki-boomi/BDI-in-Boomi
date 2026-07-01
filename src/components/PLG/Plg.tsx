import { Grid, Icon, useBoolean } from '@chakra-ui/react';
import { get } from 'api/api.proxy';
import browserCookies from 'browser-cookies';
import {
  Box,
  CloseIconButton,
  Flex,
  InfoIcon,
  RenderGuard,
  RiveryButton,
  Text,
} from 'components';
import { DocPlgBox } from 'components/PLG/DocPlgBox';
import { TalkToExpertPlgBox } from 'components/PLG/TalkToExpertPlgBox';
import { Tagger } from 'components/Tracking/Tagger';
import { Sizes, VideoById } from 'containers/Onboarding/components/VideoModal';
import React, { useEffect, useState } from 'react';

enum PLGTypes {
  'VIDEO' = 'video',
  'DOC' = 'doc',
  'EXPERT' = 'expert',
}
const StepTypeComponent = {
  [PLGTypes.VIDEO]: VideoById,
  [PLGTypes.EXPERT]: TalkToExpertPlgBox,
  [PLGTypes.DOC]: DocPlgBox,
};
export const Plg = ({
  page,
  isIndependentRoute = false,
  style = { right: '10px', top: '10px' },
  defaultHiddenPlg = false,
}) => {
  const smallerWindow = window.parent?.parent?.innerWidth < 1500;
  const cookieName = `plg_${page}_hide`;
  const defaultHideValue =
    !isIndependentRoute &&
    (browserCookies.get(cookieName) === 'true' || defaultHiddenPlg);

  const [show, setShow] = useBoolean(!Boolean(defaultHideValue));
  const [template, setTemplate] = useState(null);
  useEffect(() => {
    get(`../dist/PLG/${page}_plg.json`).then(res => setTemplate(res.data));
  }, [page]);
  return show ? (
    <Tagger tags={['plg_educational', `plg_educational_${page}`]}>
      <Box position="sticky" width="full">
        <RenderGuard condition={!isIndependentRoute}>
          <CloseIconButton
            onClick={() => {
              browserCookies.set(cookieName, 'true');
              setShow.off();
            }}
            position="absolute"
            right="7px"
            top="-7px"
            aria-label="close plg"
          />
        </RenderGuard>
        <Flex
          p={3}
          mr={4}
          pr={isIndependentRoute ? 4 : 8}
          boxShadow="0px 1px 2px 0px rgba(0, 0, 0, 0.15)"
          borderRadius="4px"
          borderStyle="solid"
          borderColor="gray.300"
          borderWidth="1px"
          justifyContent="center"
          alignItems="center"
          gap={2}
          // position="relative"
        >
          <Grid
            w={template?.title_width ?? '34%'}
            gap={smallerWindow ? 0 : 1}
            maxW="380px"
            // position="absolute"
          >
            <Text textStyle={smallerWindow ? 'M6' : 'M5'} color="font">
              {template?.title}
            </Text>
            <Text textStyle={smallerWindow ? 'R8' : 'R7'} color="font">
              {template?.description}
            </Text>
          </Grid>
          {template?.steps?.map((step, idx) => {
            const StepComponent = StepTypeComponent?.[step.type];
            if (step?.resolution) {
              if (window.parent?.parent?.innerWidth < step?.resolution) {
                return null;
              }
            }
            return (
              <RenderGuard
                condition={step.type !== PLGTypes.VIDEO}
                fallback={<VideoById id={step.id} size={Sizes.PLG} />}
              >
                <StepComponent
                  {...step}
                  key={`${step.title}-${idx}`}
                  size={Sizes.PLG}
                  page={page}
                  fontSize={smallerWindow ? 'xs' : null}
                />
              </RenderGuard>
            );
          })}
        </Flex>
      </Box>
    </Tagger>
  ) : (
    <RenderGuard condition={!isIndependentRoute}>
      <Tagger
        tags={[
          'plg_educational_open_button',
          `plg_educational_${page}_open_button`,
        ]}
      >
        <RiveryButton
          label="Not Sure How To Start?"
          leftIcon={<Icon as={InfoIcon} boxSize={4} />}
          variant="link"
          position="absolute"
          right={style.right}
          top={style.top}
          onClick={() => {
            browserCookies.set(cookieName, 'false');
            setShow.on();
          }}
        />
      </Tagger>
    </RenderGuard>
  );
};

export enum StatusTypes {
  VIDEO = 'video',
  DOC = 'doc',
  ACTION = 'action',
}

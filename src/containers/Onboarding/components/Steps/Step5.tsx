import { RoutesBuilder } from 'app/routes';
import { Box, Flex, Grid, Icon, Play, RiveryButton, Text } from 'components';
import {
  ONBOARDING_KITS,
  PRE_BUILT_SOLUTIONS,
} from 'containers/Onboarding/consts';
import { useUpdateUserOnboardingMutation } from 'containers/Settings/Users/usersV1.query';
import { useCallback } from 'react';
import { useToggle } from 'react-use';
import { useCore } from 'store/core';
import { getOId } from 'utils/api.sanitizer';
import VideoModal from '../VideoModal';

export function KitsStep({ resourceCenter = false }) {
  const { activeAccountId: accountId, envId, userId } = useCore();
  const [watchVideo, setWatchVideo] = useToggle(false);
  const [update] = useUpdateUserOnboardingMutation();
  const updateStep = useCallback(
    () =>
      update({
        account_id: accountId,
        user_id: getOId(userId),
        step: { step_key: PRE_BUILT_SOLUTIONS, substep_key: ONBOARDING_KITS },
      }),
    [accountId, update, userId],
  );
  return (
    <Grid
      templateColumns={resourceCenter ? 'unset' : '6fr 5fr'}
      px={1}
      pb={2}
      gap={5}
    >
      <Flex flexDir="column" gap={3} color="font" textStyle="R7">
        <Text>
          Kits provide pre-engineered end-to-end workflow templates with data
          models, pipelines, transformations, table schemas, and orchestration
          logic - that help users with some the most popular use cases.
        </Text>
        <Box>
          Our{' '}
          <RiveryButton
            label="Kit Hub"
            variant="link"
            target="_blank"
            href={RoutesBuilder.kits({ accountId, envId })}
          />{' '}
          is constantly growing and within it you can check out dozens of
          Starter Kits which have been created by our team of data experts.
          Download and Use a Kit of your choice, for example: use the{' '}
          <RiveryButton
            label={`“Slack Alerts”`}
            variant="link"
            target="_blank"
            href={`${RoutesBuilder.kits({
              accountId,
              envId,
            })}/view/6173193119694a4d8b3c2f4d`}
          />{' '}
          to post a message on a given Slack Channel. Or you can check out the{' '}
          <RiveryButton
            label="4 most popular Data Integration Kits to date."
            variant="link"
            target="_blank"
            href="https://rivery.io/blog/top-starter-kits-workflow-templates/"
          />
        </Box>
        <Text textStyle="R8">
          Note: A user must be an Admin to deploy a Kit.
        </Text>
        {resourceCenter ? (
          <Text textStyle="R7">For more information watch this video:</Text>
        ) : (
          <Box>
            <RiveryButton
              label="Watch Video"
              variant="default"
              leftIcon={<Icon boxSize={4} as={Play} />}
              onClick={() => {
                setWatchVideo(true);
                updateStep();
              }}
            />
          </Box>
        )}
      </Flex>
      <VideoModal
        videoImage="KitsVideo"
        brightcoveVideoId="6374535975112"
        title="Kits"
        updateStep={updateStep}
        setWatchVideo={setWatchVideo}
        videoBgColor="red.100"
        activatedFromButton={watchVideo}
      />
    </Grid>
  );
}

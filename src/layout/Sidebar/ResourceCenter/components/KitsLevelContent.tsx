import { Box, Flex, Image, LevelUpKits } from 'components';
import { LevelUpContentHeader } from 'containers/Onboarding/components/LevelBox';
import { KitsStep } from 'containers/Onboarding/components/Steps/Step5';
import { ONBOARDING_STEPS } from 'containers/Onboarding/components/Steps/StepsStaticContent';
import KitsImage from '../Kits.svg';

export function ResourceCenterKitsContent() {
  const title = ONBOARDING_STEPS.STEP_5.title;
  return (
    <Flex gap={4} flexDir="column" h="full">
      <Flex flexDir="column" bg="white" flex={1}>
        <LevelUpContentHeader
          icon={LevelUpKits}
          title={title}
          headerImage={undefined}
          resourceCenterImage={<Image ml="auto" src={KitsImage} />}
          gridProps={{ pt: 6 }}
        />
        <Box bg="white" px={6} pt={4} borderTop="1px" borderTopColor="gray.300">
          <KitsStep resourceCenter />
        </Box>
      </Flex>
    </Flex>
  );
}

import { Box, Flex, Image, LevelUpSql, Text } from 'components';
import { LevelUpContentHeader } from 'containers/Onboarding/components/LevelBox';
import { GenericStepContent } from 'containers/Onboarding/components/Step';
import { ONBOARDING_STEPS } from 'containers/Onboarding/components/Steps/StepsStaticContent';
import { imageSrc } from 'containers/Onboarding/consts';

export function ResourceCenterSqlContent({ dismissDrawer, stepData }) {
  return (
    <Flex gap={4} flexDir="column" h="full">
      <Flex flexDir="column" bg="white" flex={1}>
        <LevelUpContentHeader
          icon={LevelUpSql}
          title={ONBOARDING_STEPS.STEP_4.title}
          headerImage={undefined}
          resourceCenterImage={
            <Image
              position="absolute"
              right={8}
              top={8}
              src={imageSrc('transform_data_using_sql')}
            />
          }
          gridProps={{ pt: 6, templateColumns: '310px 1fr' }}
        />
        <Box
          bg="white"
          px={6}
          pt={4}
          borderTop="1px"
          borderTopColor="gray.300"
          overflow="auto"
          height="calc(100vh - 300px)"
        >
          <Flex gap={8} flexDir="column">
            {stepData?.map(({ title, text }, idx) => (
              <Flex gap={1} flexDir="column" key={title}>
                <Text color="purple.600" textStyle="M6">
                  {title}
                </Text>
                <GenericStepContent
                  text={text}
                  currentStep={ONBOARDING_STEPS.STEP_4}
                  idx={idx}
                  onUpdateStep={console.log}
                  dismissResourceCenter={dismissDrawer}
                />
              </Flex>
            ))}
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}

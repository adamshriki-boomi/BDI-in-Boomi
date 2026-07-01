import { ChevronRight, Flex, HStack, Icon, Text } from 'components';
import { LEVEL_UPS } from 'containers/Onboarding/components/LevelBox';
import { ONBOARDING_STEPS } from 'containers/Onboarding/components/Steps/StepsStaticContent';
import {
  PRE_BUILT_SOLUTIONS,
  TRANSFORM_AND_ORCHESTRATE,
} from 'containers/Onboarding/consts';
import { useCallback } from 'react';
import { compare } from 'utils/array.utils';

const UseRiveryLikeAPro = [
  { title: 'Get a head start with pre-built solutions' },
  { title: 'Transform and orchestrate your data using SQL and Python' },
];

export function LikeAPro({ setLevelContent, setStepContent }) {
  const proItems = Object.values(LEVEL_UPS).map(({ text }) => ({
    title: text,
  }));
  const items = [...UseRiveryLikeAPro, ...proItems];

  const getStepContent = useCallback(() => {
    const stepData = Object.values(ONBOARDING_STEPS.STEP_4.sections);
    setStepContent(stepData, TRANSFORM_AND_ORCHESTRATE);
  }, [setStepContent]);

  const toggleContent = useCallback(
    title => {
      const levelUpContent = Object.values(LEVEL_UPS).find(
        compare('text', title),
      );
      const stepContent = UseRiveryLikeAPro.find(compare('title', title));
      if (levelUpContent) {
        setLevelContent(levelUpContent);
      }
      if (stepContent) {
        const step = Object.values(ONBOARDING_STEPS).find(
          compare('title', title),
        );
        if (step.id === PRE_BUILT_SOLUTIONS) {
          setStepContent(null, PRE_BUILT_SOLUTIONS);
        } else {
          getStepContent();
        }
      }
    },
    [getStepContent, setLevelContent, setStepContent],
  );
  return (
    <Flex
      flexDir="column"
      border="1px solid"
      borderColor="gray.200"
      borderRadius={4}
      shadow="sm"
      p={4}
      gap={2}
    >
      <Text textStyle="M7">Use Boomi Data Integration Like a Pro</Text>
      <Flex flexDir="column" gap={2}>
        {items.map(({ title }) => (
          <HStack
            color="font"
            px={4}
            py={3}
            key={title}
            border="1px"
            borderColor="transparent"
            bg="background-secondary"
            borderRadius={4}
            role="button"
            _hover={{
              borderColor: 'border-action-hover',
              shadow: 'sm',
              '& .chakra-icon': {
                visibility: 'visible',
              },
            }}
            justify="space-between"
            onClick={() => toggleContent(title)}
          >
            <Text>{title}</Text>
            <Icon as={ChevronRight} visibility="hidden" color="icon" />
          </HStack>
        ))}
      </Flex>
    </Flex>
  );
}

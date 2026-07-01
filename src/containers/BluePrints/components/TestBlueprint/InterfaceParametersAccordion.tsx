import { ExLoader, LoaderSize } from '@boomi/exosphere';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react';
import { Flex, RenderGuard, Text } from 'components';
import { useFormContext } from 'react-hook-form';
import InterfaceParametersComponent from '../InterfaceParameters';

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  isLoading: boolean;
  hasData: boolean;
};

export function InterfaceParametersAccordion({
  isOpen,
  onToggle,
  isLoading,
  hasData,
}: Props) {
  const formApi = useFormContext();
  return (
    <Accordion allowMultiple index={isOpen ? [0] : []} flexShrink={0}>
      <RenderGuard
        condition={formApi?.watch(
          'river.properties.source.additional_settings.interface_parameters',
        )}
      >
        <AccordionItem border="none">
          <AccordionButton justifyContent="space-between" onClick={onToggle}>
            <Text textStyle="M6" color="brand">
              Interface Parameters
            </Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel>
            <Flex
              flexDir="column"
              gap={2}
              bg="white"
              p={4}
              border="1px solid"
              borderColor="border"
              borderRadius={4}
            >
              <RenderGuard condition={isLoading}>
                <ExLoader size={LoaderSize.MEDIUM} />
              </RenderGuard>
              <RenderGuard condition={hasData}>
                <Flex flexDir="column" gap={2}>
                  <InterfaceParametersComponent noHeader maxW="350px" />
                </Flex>
              </RenderGuard>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </RenderGuard>
    </Accordion>
  );
}

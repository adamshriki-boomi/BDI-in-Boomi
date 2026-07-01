import { Flex } from '@chakra-ui/react';
import { ExternalLink, Icon, Text } from 'components/index';
import { ImageSize } from 'containers/Onboarding/components/VideoModal';
import { MdOpenInNew } from 'react-icons/md';

export const DocPlgBox = ({ href, title, size, ...rest }) => {
  const smallWindow = window.parent?.parent?.innerWidth < 1500;
  return (
    <Flex
      direction="column"
      justify="space-between"
      border="1px solid"
      borderColor="border-secondary"
      borderRadius={4}
      bg="white"
      padding={3}
      {...ImageSize[size]}
      width={smallWindow ? '180px' : '220px'}
      gap={smallWindow ? 0 : 2}
      {...rest}
    >
      <Text textStyle={smallWindow ? 'R8' : 'R7'}>{title}</Text>
      <ExternalLink
        label="Read Guide"
        url={href}
        size="medium"
        height="26px"
        rightIcon={<Icon as={MdOpenInNew} />}
      />
    </Flex>
  );
};

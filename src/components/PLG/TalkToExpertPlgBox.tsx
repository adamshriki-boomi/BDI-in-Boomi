import { Flex } from '@chakra-ui/react';
import { RiveryButton, Text } from 'components';
import { ImageSize } from 'containers/Onboarding/components/VideoModal';
import { useContactSales } from 'hooks/useContactSales';

export const TalkToExpertPlgBox = ({
  size,
  title,
  page,
  width = '217px',
  ...rest
}) => {
  const scheduleMeeting = useContactSales();
  const smallWindow = window.parent.parent.innerWidth < 1500;
  return (
    <Flex
      direction="column"
      justify="space-between"
      borderRadius={4}
      border="1px solid"
      borderColor="border-secondary"
      bg="background-secondary"
      gap={smallWindow ? 0 : 2}
      padding={3}
      {...ImageSize[size]}
      width={width}
      {...rest}
    >
      <Text textStyle={smallWindow ? 'R8' : 'R7'}>{title}</Text>
      <RiveryButton
        onClick={scheduleMeeting}
        label="Talk with a Data Expert"
        size="small"
      />
    </Flex>
  );
};

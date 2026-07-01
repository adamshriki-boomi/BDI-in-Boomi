import { TagLabel } from '@chakra-ui/react';
import { Center, Icon, RenderGuard, Tag, Text } from 'components';
import { useState } from 'react';

export function SelectionBox({
  icon,
  hoveredIcon = icon,
  title,
  text,
  iconStyle = {},
  titleTextStyle = 'M5',
  descriptionTextStyle = 'R7',
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Center
      position="relative"
      maxW="320px"
      bg="background-secondary"
      borderRadius={4}
      flexDir="column"
      py={6}
      px={6}
      role="button"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      _hover={{
        boxShadow:
          '0px 10px 15px -3px rgba(0, 0, 0, 0.10), 0px 4px 6px 0px rgba(0, 0, 0, 0.05)',
        '&': {
          '[aria-label="title"]': {
            color: 'primary',
          },
          '[aria-label="description"]': {
            color: 'font',
          },
        },
      }}
      {...props}
      {...(props.disabled && {
        pointerEvents: 'none',
        sx: {
          '& > svg, p': { opacity: 0.65 },
        },
      })}
    >
      <Icon
        as={isHovered ? hoveredIcon : icon}
        boxSize="60px"
        mb={3}
        {...iconStyle}
      />
      <Text aria-label="title" textStyle={titleTextStyle} textAlign="center">
        {title}
      </Text>
      <Text
        aria-label="description"
        color="font-secondary"
        textAlign="center"
        textStyle={descriptionTextStyle}
      >
        {text}
      </Text>
      <RenderGuard condition={props.disabled}>
        <Tag position="absolute" top="2" right="2" variant="dark-purple">
          <TagLabel>Coming Soon</TagLabel>
        </Tag>
      </RenderGuard>
    </Center>
  );
}

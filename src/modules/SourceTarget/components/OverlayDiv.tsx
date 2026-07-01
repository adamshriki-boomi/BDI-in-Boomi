import { Box } from 'components';

export function Overlay() {
  return (
    <Box
      position="absolute"
      top="0"
      right="0"
      h="full"
      w="full"
      bg="background-secondary"
      opacity={0.5}
      zIndex={1}
    />
  );
}

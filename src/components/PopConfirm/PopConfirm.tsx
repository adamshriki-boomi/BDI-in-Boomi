import { Box } from 'components';

export default function PopConfirm({
  children,
  mainBoxPosition,
  arrowPosition,
}) {
  return (
    <Box position="fixed" {...mainBoxPosition}>
      <PopConfirmArrow {...arrowPosition} />
      <Box
        w="280px"
        h="110px"
        bg="white!important"
        boxShadow="0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08), 0px 3px 6px -4px rgba(0, 0, 0, 0.12)"
        borderRadius={4}
        p={4}
      >
        {children}
      </Box>
    </Box>
  );
}

function PopConfirmArrow({ ...arrowPosition }) {
  return (
    <Box
      bg="background-secondary"
      w="14px"
      h="14px"
      transform="rotate(45deg)"
      position="absolute"
      borderTop="1px solid"
      borderRight="1px"
      borderTopColor="gray.300"
      borderRightColor="gray.300"
      {...arrowPosition}
    />
  );
}

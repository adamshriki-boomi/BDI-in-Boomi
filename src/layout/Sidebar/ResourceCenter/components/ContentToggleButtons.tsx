import {
  ChevronLeft,
  CloseIconButton,
  HStack,
  Icon,
  RiveryButton,
} from 'components';

export function ContentToggleButtons({ hideContent, dismissDrawer, ...props }) {
  return (
    <HStack
      justify="space-between"
      bg="background-secondary"
      w="full"
      px={4}
      pt={2}
      {...props}
    >
      <RiveryButton
        label="Back"
        variant="text-link"
        color="background-action"
        leftIcon={<Icon as={ChevronLeft} color="background-action" />}
        onClick={hideContent}
        p={0}
      />
      <CloseIconButton
        ml="auto"
        aria-label="close-drawer"
        onClick={() => dismissDrawer(null)}
      />
    </HStack>
  );
}

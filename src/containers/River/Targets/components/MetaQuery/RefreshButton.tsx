import { Icon, RefreshIcon, TransparentIconButton } from 'components';

export function RefreshButton({ load, isDisabled, loading }) {
  return (
    <TransparentIconButton
      minW="4px"
      h="4px"
      mt={9}
      aria-label="refresh-metadata"
      icon={<Icon as={RefreshIcon} color="icon" />}
      onClick={load}
      isDisabled={isDisabled}
      isLoading={loading}
    />
  );
}

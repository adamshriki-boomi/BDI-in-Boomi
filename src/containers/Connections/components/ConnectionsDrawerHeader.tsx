import { Box, RiveryButton } from 'components';

export function DrawerHeader({ type }) {
  return (
    <Box color="font-secondary">
      Select the Data {type} you want to establish a connection with. For help,
      visit our{' '}
      <RiveryButton
        fontSize="sm"
        mx="3px"
        variant="link"
        size="small"
        label="documentation"
        target="_blank"
        href={import.meta.env.VITE_DOCS_LINK}
      />
      .
    </Box>
  );
}

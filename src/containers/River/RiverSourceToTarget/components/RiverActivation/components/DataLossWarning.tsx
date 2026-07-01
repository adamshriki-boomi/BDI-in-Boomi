import { Box, RiveryButton } from 'components';
import RiveryAlert from 'components/Alert/Alert';
import { useSelectedSourceTopology } from '../hooks';

export function DataLossWarning() {
  const { feature_flags } = useSelectedSourceTopology();
  return (
    <RiveryAlert
      mt={2}
      variant="warning-light"
      description={
        <Box fontSize="xs" lineHeight="20px">
          Choosing this option may lead to data loss. <br />
          To learn more, visit our{' '}
          <RiveryButton
            variant="link"
            size="xs"
            label="documentation"
            target="_blank"
            href={feature_flags?.log_doc}
          />
          .
        </Box>
      }
    />
  );
}

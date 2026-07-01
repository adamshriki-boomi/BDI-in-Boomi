import { Box, RiveryButton } from 'components';
import RiveryAlert from 'components/Alert/Alert';

export function SQLAlert({ top = '44px' }) {
  return (
    <RiveryAlert
      height="40px"
      justifyContent="center"
      textAlign="center"
      position="absolute"
      left="0px"
      top={top}
      variant="warning-light"
      description={
        <Box>
          Optimize cost and performance by using partitions and clustering to
          avoid full scans. For more Information
          <RiveryButton
            label="click here"
            variant="link"
            color="primary"
            href="https://help.boomi.com/docs/Atomsphere/Data_Integration/Targets/GoogleBigQuery/partitioning-and-clustering-in-bigquery"
            target="_blank"
            ml={1}
          />
          .
        </Box>
      }
    />
  );
}

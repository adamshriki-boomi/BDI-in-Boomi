import { Box, Text } from 'components';

export default function S3CustomPathGuide() {
  return (
    <Box
      p="4"
      bg="gray.50"
      borderRadius="md"
      border="1px"
      borderColor="gray.200"
      fontSize="sm"
    >
      <Text mb="3" fontWeight="500">
        Use {} in order to define the partitioning format, use only the
        following timestamp parts:
      </Text>

      <Box mb="4">
        <Text color="blue.500" as="span" fontWeight="500">
          yyyy
        </Text>
        <Text as="span"> - Year</Text>
        <br />
        <Text color="blue.500" as="span" fontWeight="500">
          mm
        </Text>
        <Text as="span"> - Month</Text>
        <br />
        <Text color="blue.500" as="span" fontWeight="500">
          dd
        </Text>
        <Text as="span"> - Day</Text>
        <br />
        <Text color="blue.500" as="span" fontWeight="500">
          hh
        </Text>
        <Text as="span"> - Hour</Text>
        <br />
        <Text color="blue.500" as="span" fontWeight="500">
          MM
        </Text>
        <Text as="span"> - Minutes</Text>
        <br />
        <Text color="blue.500" as="span" fontWeight="500">
          SS
        </Text>
        <Text as="span"> - Seconds</Text>
        <br />
        <Text color="blue.500" as="span" fontWeight="500">
          MS
        </Text>
        <Text as="span"> - Milliseconds</Text>
      </Box>

      <Box mb="4">
        <Text>
          <Text color="blue.500" as="span" fontWeight="500">
            {'{entity_source}'}
          </Text>
          <Text as="span">
            {' '}
            - adding the source entity/table name to the path
          </Text>
        </Text>
        <Text>
          <Text color="blue.500" as="span" fontWeight="500">
            {'{entity_target}'}
          </Text>
          <Text as="span">
            {' '}
            - adding the target entity/table name to the path
          </Text>
        </Text>
      </Box>

      <Box mb="4">
        <Text mb="2">
          Add a{' '}
          <Text color="blue.500" as="span" fontWeight="500">
            "river_run_time"
          </Text>{' '}
          prefix before each time component for partitioning by data flow run
          time instead of the loading time per entity.
        </Text>
        <Text>
          For example:{' '}
          <Text color="blue.500" as="span" fontFamily="mono">
            {'{river_run_time::yyyy}/{river_run_time::mm}'}
          </Text>
        </Text>
      </Box>

      <Box>
        <Text fontWeight="500" mb="2">
          Examples of template inputs:
        </Text>
        <Box pl="4">
          <Box mb="3">
            <Text fontWeight="500" display="inline">
              1.{' '}
            </Text>
            <Text color="blue.500" display="inline" fontFamily="mono">
              {'{river_name}_{river_id}/{yyyy}-{mm}-{dd}_{hh}'}
            </Text>
            <Text fontSize="xs" color="gray.600" mt="1" pl="4">
              s3://demo-bucket/mysql_to_S3_63b6a63a109fe0001341708b6/2023-01-05/items/d0e94c9a90d34b669309d36c5b1abc12_mysql_items_7615f00000PfqjiAAD_7525f0000Dfo2C.csv
            </Text>
          </Box>

          <Box mb="3">
            <Text fontWeight="500" display="inline">
              2.{' '}
            </Text>
            <Text color="blue.500" display="inline" fontFamily="mono">
              {
                '{river_name}_{river_id}/{yyyy}-{mm}-{dd}_{hh}:{MM}:{SS}:{MS}/{entity_source}'
              }
            </Text>
            <Text fontSize="xs" color="gray.600" mt="1" pl="4">
              s3://demo-bucket/google_ad_manager_to_S3_63b6a63a109fe000134170886/2023-01-05_20:30:12:13/line_items/c0e94c9a90c34b669309d36c5b1abc12_ad_manager_line_items_7515f00000PfqjiAAD_7525f111110a02C.csv
            </Text>
          </Box>

          <Box>
            <Text fontWeight="500" display="inline">
              3.{' '}
            </Text>
            <Text color="blue.500" display="inline" fontFamily="mono">
              Salesforce/
              {
                '{river_run_time::yyyy}{river_run_time::mm}{river_run_time::dd}_{river_run_time::hh}{river_run_time::MM}{river_run_time::SS}{river_run_time::MS}/{entity_source}'
              }
            </Text>
            <Text fontSize="xs" color="gray.600" mt="1" pl="4">
              s3://demo-bucket/Salesforce/20230105_20301213/leads/d0e94c9a90d34b669309d36c5b1abc12_salesforce_Lead_7615f00000PfqjiAAD_7525f000000Dfo2C.csv
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

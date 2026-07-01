import { Box, Flex, Grid, HStack, RiveryButton, Slide, Text } from 'components';
import VideoModal, { Sizes } from 'containers/Onboarding/components/VideoModal';

export const videos = [
  {
    id: 'Welcome',
    description: 'Get to know Boomi Data Integration',
    brightcoveVideoId: '6374537735112',
  },
  {
    id: 'Connector',
    description: 'Custom Connector',
    brightcoveVideoId: '6374535385112',
  },
  {
    id: 'CDC',
    description: 'CDC DB Replication',
    brightcoveVideoId: '6374537251112',
  },
  {
    id: 'SQL_Transformation',
    description: 'SQL database transformations',
    brightcoveVideoId: '6374535068112',
  },
  {
    id: 'Webinar',
    brightcoveVideoId: '6374537341112',
    description: 'Using Python within Boomi Data Integration',
  },
  {
    id: 'Variables',
    description: 'Using Variables Within Boomi Data Integration',
    brightcoveVideoId: '6374537252112',
  },
  {
    id: 'Logic',
    description: 'Meet our Logic Flow',
    brightcoveVideoId: '6374535085112',
  },
  {
    id: 'Reverse_ETL',
    description: 'Reverse ETL',
    brightcoveVideoId: '6374537444112',
  },
  {
    id: 'Data_Ingestion',
    description: 'Business Application Data Ingestion',
    brightcoveVideoId: '6374536951112',
  },
  {
    id: 'Env_Deployment',
    description: 'Environments and Deployments',
    brightcoveVideoId: '6374537148112',
  },
  {
    id: 'KitsVideo',
    description: 'First look at Boomi Data Integration Kits',
    brightcoveVideoId: '6374535975112',
  },
];

export function DemoVideos() {
  return (
    <Slide in direction="right" style={{ position: 'relative' }}>
      <Flex gap={4} flexDir="column" overflow="hidden" pt={4}>
        <Flex flexDir="column" gap={2} pt={2} px={6}>
          <Text textStyle="M4">Demo Videos</Text>
          <Box textStyle="R7" pr={1}>
            <Text display="inline">
              In these videos, we'll walk you through the key features of Boomi
              Data Integration and demonstrate how they can be used to overcome
              common data integration challenges. For more videos, visit our
            </Text>{' '}
            {/*<RiveryButton*/}
            {/*  label="documentation"*/}
            {/*  variant="link"*/}
            {/*  href="https://docs.rivery.io/docs/demo-videos"*/}
            {/*  target="_blank"*/}
            {/*/>*/}
          </Box>
        </Flex>
        <Flex
          flexDir="column"
          gap={4}
          pl={6}
          pr={4}
          overflowY="auto"
          overflowX="hidden"
          height="calc(100vh - 265px)"
        >
          <Box>
            <VideoModal
              videoImage={videos[0].id}
              brightcoveVideoId={videos[0].brightcoveVideoId}
              title={videos[0].description}
              size={Sizes.LARGE}
            />
          </Box>
          <Box mr="2px">
            <VideoThumbnails thumbnails={videos.slice(1, 10)} />
          </Box>
          {/*<Flex justify="flex-end" mr={2}>*/}
          {/*  <RiveryButton*/}
          {/*    variant="text-link"*/}
          {/*    label="More Videos..."*/}
          {/*    href="https://docs.rivery.io/docs/demo-videos"*/}
          {/*    target="_blank"*/}
          {/*    w="fit-content"*/}
          {/*  />*/}
          {/*</Flex>*/}
        </Flex>
      </Flex>
    </Slide>
  );
}

export function VideoThumbnails({ thumbnails, setVideosContent = null }) {
  const showHeader = thumbnails?.length === 3;
  return (
    <Box>
      {showHeader ? (
        <HStack justify="space-between">
          <Text textStyle="M7">Demo Videos</Text>
          <RiveryButton
            variant="text-link"
            label="Show more..."
            onClick={setVideosContent}
          />
        </HStack>
      ) : null}
      <Grid templateColumns="repeat(3, 1fr)" gap={2} alignItems="baseline">
        {thumbnails.map(({ id, description, brightcoveVideoId }) => (
          <Flex key={description} flexDir="column">
            <VideoModal
              videoImage={id}
              brightcoveVideoId={brightcoveVideoId}
              title={description}
              size={Sizes.SMALL}
            />
            <Text pl={1} fontSize="xs">
              {description}
            </Text>
          </Flex>
        ))}
      </Grid>
    </Box>
  );
}

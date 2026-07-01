import {
  Center,
  Flex,
  Grid,
  Icon,
  NoResultsDefault,
  NoResultsIcon,
  OutlinedClose,
  OutlinedSuccess,
  RenderGuard,
  StatusIsRunning,
  Text,
} from 'components';
import { RiveryButton } from 'components/Buttons';
import { HiOutlineDotsCircleHorizontal } from 'react-icons/hi';

export function NoResults({
  text = 'Try redefining your search or use different keywords.',
}) {
  const exoTheme = import.meta.env.VITE_EXO_THEME === 'true';
  return (
    <Center flexDirection="column" h="full" pt={12}>
      <RenderGuard
        condition={exoTheme}
        fallback={<Icon as={NoResultsIcon} boxSize="135px" />}
      >
        <Icon as={NoResultsDefault} boxSize="135px" />
      </RenderGuard>
      <Text textStyle="M4" pt={4}>
        We searched everywhere but found nothing.
      </Text>
      <Text textAlign="center" color="font-secondary" textStyle="R6">
        {text}
      </Text>
    </Center>
  );
}

export function NoEntities({
  entity = 'object',
  text = null,
  my = '2%',
  icon = NoResultsDefault,
  doc_link = null,
}: {
  entity?: any;
  doc_link?: string;
  text?: any;
  my?: string | number;
  icon?: any;
}) {
  return (
    <Center flexDirection="column" my={my}>
      <Icon h="110px" w="110px" as={icon} />
      <Text fontWeight="bold" fontSize="lg" pt={4}>
        Not even a single {entity} to show
      </Text>
      {text ? (
        <Center>{text}</Center>
      ) : (
        <Flex alignItems="center">
          View our
          <RiveryButton
            fontSize="sm"
            mx={1}
            variant="link"
            size="small"
            label="documentation"
            target="_blank"
            href={doc_link || import.meta.env.VITE_DOCS_LINK}
          />
          for help.
        </Flex>
      )}
    </Center>
  );
}

const statusIcons = [
  StatusIsRunning,
  OutlinedSuccess,
  OutlinedClose,
  HiOutlineDotsCircleHorizontal,
];
export function ActivitiesNoSearchResults() {
  return (
    <Center
      h="full"
      flexDir="column"
      color="font-secondary"
      fontSize="md"
      gap={2}
      minH="400px"
    >
      <Grid templateColumns="repeat(4, 1fr)" gap={3} px={4}>
        {statusIcons.map((icon, idx) => (
          <Icon key={idx} as={icon} boxSize={6} />
        ))}
      </Grid>
      <Center flexDir="column">
        <Text>No Results were Found.</Text>
        <Text>Please try a different search.</Text>
      </Center>
    </Center>
  );
}

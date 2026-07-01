import { Center, Icon, Image, RdsTools, Text } from 'components';
import SchemasLoaderGif from 'components/Icons/icons/schemaLoader.gif';

export function LoadingSchemas({ entity = 'Schemas & Tables' }) {
  return (
    <Center flexDir="column">
      <Image boxSize="55px" src={SchemasLoaderGif} alt="streaming" />
      <Text textStyle="R5" color="purple.200">
        Loading {entity}
      </Text>
    </Center>
  );
}

export function ErrorSchemas({ entity = 'schemas' }) {
  return (
    <Center flexDir="column" gap={2}>
      <Icon boxSize="55px" as={RdsTools} color="purple.200" />
      <Text textAlign="center" textStyle="R5" color="purple.200">
        Unable to load {entity}. <br />
        Please check your Connection settings.
      </Text>
    </Center>
  );
}

import { Center, Icon, Text } from 'components';

export default function EmptyEntitiesState({ entity, icon }) {
  return (
    <Center flexDir="column" mb={8}>
      <Icon as={icon} color="font-secondary" boxSize="135px" />
      <Text color="font" textStyle="M4" mt={4} fontSize="lg">
        Not even a single {entity} to show
      </Text>
    </Center>
  );
}

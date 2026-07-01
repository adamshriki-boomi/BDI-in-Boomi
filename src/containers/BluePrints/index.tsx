import { Breadcrumbs, Flex, View } from 'components';
import { useDocumentTitle } from 'hooks/useDocumentTitle';
import BlueprintsGrid from './components/BlueprintsGrid';

export default function Blueprints() {
  useDocumentTitle('Blueprints');

  return (
    <View p={4} pt={3} h="100%">
      <Flex flexDir="column" bg="white" overflow="hidden" h="100%">
        <Breadcrumbs links={[{ label: 'Blueprints' }]} />
        <BlueprintsGrid />
      </Flex>
    </View>
  );
}

import {
  Box,
  Flex,
  Icon,
  ListItem,
  RdsValidate,
  RenderGuard,
  RiveryButton,
  Text,
  UnorderedList,
} from 'components';
import { BlueprintsTags } from 'utils/tracking.tags';
import { useBlueprintValidation } from '../helpers';

export default function ValidateYaml({ field, ...props }) {
  const { testBlueprintFile, isLoading } = useBlueprintValidation();
  return (
    <RiveryButton
      label="Validate"
      variant="default"
      isLoading={isLoading}
      onClick={() => testBlueprintFile(field)}
      leftIcon={<Icon as={RdsValidate} boxSize={4} />}
      data-pendo-id={BlueprintsTags.VALIDATE_BUTTON}
      {...props}
    />
  );
}

enum MessageType {
  ERRORS = 'errors',
  WARNINGS = 'warnings',
}

export function YamlValidations({ data }) {
  const hasErrorsOrWarnings =
    data?.errors?.length > 0 || data?.warnings?.length > 0;
  return (
    <Flex flexDir="column" gap={2}>
      <RenderGuard condition={hasErrorsOrWarnings}>
        <Text>Validation completed with the following results:</Text>
        <MessagesBlock data={data?.errors} type={MessageType.ERRORS} />
        <MessagesBlock data={data?.warnings} type={MessageType.WARNINGS} />
      </RenderGuard>
    </Flex>
  );
}

function MessagesBlock({ data, type }) {
  return (
    <RenderGuard condition={data?.length > 0}>
      <Text lineHeight="1.1" fontWeight="medium" textTransform="capitalize">
        {type}:
      </Text>
      <Box borderRadius={4} border="1px" bg="background" py={2} px={4}>
        <UnorderedList spacing={3} color="font">
          {data.map(({ name, location, message }) => (
            <ListItem>
              <Flex flexDir="column">
                <Text fontWeight="bold">{name}:</Text>
                <Text lineHeight="1.1">{message}</Text>
                <Text>{location}</Text>
              </Flex>
            </ListItem>
          ))}
        </UnorderedList>
      </Box>
    </RenderGuard>
  );
}

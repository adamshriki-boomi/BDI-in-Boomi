import {
  Divider,
  Flex,
  Grid,
  HStack,
  Icon,
  RenderGuard,
  Text,
} from 'components';
import * as React from 'react';
import { components as RSComponents } from 'react-select';

export function DefaultRenderGuard({
  isTableView,
  isDefault,
  isSelected = false,
}) {
  return (
    <RenderGuard condition={isTableView && isDefault}>
      <Text
        marginInlineStart="2px!important"
        display="inline-block"
        color="font-secondary"
      >
        (Default)
      </Text>
    </RenderGuard>
  );
}

export function SingleValue({
  children,
  data,
  isTableView = false,
  defaultSetting = undefined,
}) {
  return (
    <Grid w="full" gap="2" alignItems="center" gridArea="1/1/2/3">
      <HStack>
        <RenderGuard condition={Boolean(data.icon)}>
          <Icon boxSize="18px" as={data.icon} />
        </RenderGuard>
        <Text>{children}</Text>
        <DefaultRenderGuard
          isTableView={isTableView}
          isDefault={children === defaultSetting?.label}
        />
      </HStack>
    </Grid>
  );
}

export function Option({
  label,
  data,
  isSelected,
  isTableView = false,
  defaultSetting = undefined,
}) {
  return (
    <Flex flexDir="column" gap={2}>
      <HStack>
        <RenderGuard condition={Boolean(data.icon)}>
          <Icon as={data.icon} boxSize="18px" />
        </RenderGuard>
        <Text textStyle="M7">{label}</Text>
        <DefaultRenderGuard
          isTableView={isTableView}
          isDefault={label === defaultSetting?.label}
          isSelected={isSelected}
        />
      </HStack>
      <Text textStyle="R8" color="font">
        {data.description}
      </Text>
    </Flex>
  );
}

export function MenuList(props) {
  return (
    <RSComponents.MenuList {...props}>
      <Flex flexDir="column">
        {props.children.map((option, idx) => (
          <Flex key={idx} flexDir="column">
            {option}
            <Divider mt={1} borderColor="gray.300" />
          </Flex>
        ))}
      </Flex>
    </RSComponents.MenuList>
  );
}

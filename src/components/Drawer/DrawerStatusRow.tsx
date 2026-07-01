import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  FlexProps,
  Grid,
  HStack,
} from '@chakra-ui/react';
import { Text } from 'components';
import { ReactNode } from 'react';
import { useToggle } from 'react-use';

export function NarrowRow({
  name,
  value,
  ...rest
}: FlexProps & { name: ReactNode; value: ReactNode }) {
  return <Row name={name} value={value} border={false} my={0.5} {...rest} />;
}

export function WideRow({
  name,
  value,
  breakLine = false,
  ...rest
}: FlexProps & { name: ReactNode; value: ReactNode; breakLine?: boolean }) {
  return (
    <Row
      name={name}
      value={value}
      breakLine={breakLine}
      border={true}
      py={2}
      {...rest}
    />
  );
}

function Row({ name, value, breakLine = false, border, ...rest }) {
  const error = name === 'Error Description';
  return (
    <Grid
      aria-label={name}
      // justify="space-between"
      templateColumns="2fr 3fr"
      borderBottom={border ? '1px solid' : 'unset'}
      borderBottomColor="border"
      {...rest}
    >
      <Text>{name}</Text>
      {typeof value == 'string' ? (
        <AccordionRowWrap breakLine={breakLine} accordion={error}>
          {value}
        </AccordionRowWrap>
      ) : (
        <Box>{value}</Box>
      )}
    </Grid>
  );
}

function AccordionRowWrap({ accordion, breakLine, children }) {
  const [expanded, toggleExpanded] = useToggle(false);
  return accordion ? (
    <Accordion allowToggle onChange={toggleExpanded}>
      <AccordionItem border="none">
        <HStack>
          {!expanded ? (
            <Text
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
              width="200px"
              color="red.100"
              fontSize="xs"
            >
              {children}
            </Text>
          ) : null}
          <AccordionButton
            justifyContent="end"
            w={expanded ? '100%' : 'fit-content'}
            p="0px !important"
            _focus={{ boxShadow: 'none' }}
            _hover={{ bg: 'transparent' }}
          >
            <Text fontSize="xs" color="primary">
              {expanded ? 'Show Less' : 'Show more'}
            </Text>
          </AccordionButton>
        </HStack>
        <AccordionPanel maxW="300px" pb={4} pr={0} color="red.100">
          {children}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  ) : (
    <Text
      color="font-secondary"
      {...(breakLine ? { width: '220px', overflowWrap: 'break-word' } : null)}
    >
      {children}
    </Text>
  );
}

import { Heading, Text } from '@chakra-ui/react';
import { RiveryButton } from 'components/Buttons';
import * as React from 'react';

export function Title({ display_name, ...rest }) {
  return (
    <Heading mb={1} fontSize="md" fontWeight="medium" color="primary" {...rest}>
      {display_name}
    </Heading>
  );
}

export function SmallTitle({ display_name, ...rest }) {
  return (
    <Text
      mb={1}
      fontSize="sm"
      fontWeight="normal"
      color="primary"
      dangerouslySetInnerHTML={{ __html: display_name }}
      {...rest}
    />
  );
}

export function RegularText({ display_name, ...rest }) {
  return (
    <Text
      fontSize="sm"
      fontWeight="normal"
      dangerouslySetInnerHTML={{ __html: display_name }}
      {...rest}
    />
  );
}

export function GenericLink({ display_name, link, ...rest }) {
  return (
    <RiveryButton
      label={display_name}
      href={link}
      target="_blank"
      variant="link"
      {...rest}
    />
  );
}

import { chakra, DrawerCloseButton } from '@chakra-ui/react';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { removeParams } from 'utils/searchParams';
import { DRAWER_PARAM_NAME } from './config';

export function DrawerClose({ children }) {
  return (
    <chakra.a
      as={Link}
      to={{ search: removeParams(window.location.search, [DRAWER_PARAM_NAME]) }}
      replace
    >
      {children}
    </chakra.a>
  );
}

export function DrawerCloseLink() {
  return (
    <DrawerCloseButton
      _active={{ boxShadow: 'none' }}
      _focus={{ boxShadow: 'none' }}
      _hover={{ bg: 'transparent' }}
      as={Link}
      replace
      to={{ search: removeParams(window.location.search, [DRAWER_PARAM_NAME]) }}
    />
  );
}

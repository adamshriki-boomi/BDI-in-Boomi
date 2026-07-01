import { HStack } from '@chakra-ui/react';
import React from 'react';

export function FooterGroups({ groups }) {
  return groups.map(group =>
    group.headers.map(header => (
      <GroupFooter key={`footer-${header.id}`} {...header} />
    )),
  );
}

function GroupFooter({ footerProps, styleProps, render, getFooterProps }) {
  return (
    <HStack
      p={2}
      bg="background-secondary"
      position="sticky"
      bottom={0}
      {...styleProps}
      {...footerProps}
      {...getFooterProps()}
    >
      {render('Footer')}
    </HStack>
  );
}

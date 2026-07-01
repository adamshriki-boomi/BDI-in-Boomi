import { ChakraProvider, Grid, Heading, Icon, Input } from '@chakra-ui/react';
import * as auditIcons from 'audit';
import * as billingIcons from 'billing';
import * as allIcons from 'icons';
import React, { useState } from 'react';
import * as sidebarIcons from 'sidebar';
import * as stepIcons from 'step';
import { ComponentsPackage } from './ComponentsPackage';

const RiveryIcon = allIcons.RTextLogo;

const icons = [
  ['src/components/Icons', allIcons],
  ['src/layout/Sidebar/components/icons', sidebarIcons],
  ['src/modules/Billing/icons', billingIcons],
  ['src/containers/AuditLog/icons', auditIcons],
  ['src/components/Icons/step', stepIcons.StepIcons],
];
function App() {
  const [filter, setFilter] = useState('');
  return (
    <ChakraProvider>
      <Grid
        h="100vh"
        overflow="hidden"
        gridTemplateRows="auto auto 1fr"
        gap="4"
      >
        <Heading
          color="white"
          bgColor="purple.900"
          alignItems="center"
          display="flex"
          gap="3"
          p="4"
        >
          <Icon as={RiveryIcon} width="32" h="full" mt="1.5" /> Icons
          <Input
            value={filter}
            color="white"
            onChange={ev => setFilter(ev.target.value)}
            placeholder="find icons..."
          />
        </Heading>
        <Grid height="full" overflow="auto" px="4" gridGap="2">
          {icons.map(([path, items]) => (
            <ComponentsPackage
              key={path}
              filter={filter}
              icons={items}
              path={path}
            />
          ))}
        </Grid>
      </Grid>
    </ChakraProvider>
  );
}

export default App;

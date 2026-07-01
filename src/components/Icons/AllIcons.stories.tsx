import { Box, Flex, Heading, Icon } from '@chakra-ui/react';
import { Input } from 'components/Form';
import React, { useState } from 'react';
import * as allIcons from './';

const icons = Object.entries(allIcons).filter(
  ([, component]) => typeof component === 'function',
);
export default {
  title: 'Components/Icons/All',
  component: Icon,
} as any;

const Template = props => {
  const [filter, setFilter] = useState('');
  return (
    <>
      <Input
        value={filter}
        onChange={ev => setFilter(ev.target.value)}
        chakra
      />
      <Flex gap="6" flexWrap="wrap" my="4">
        {icons
          .filter(([iconName]) => iconName.toLocaleLowerCase().includes(filter))
          .map(([iconName, IconComponent]: any) => (
            <Box key={iconName}>
              <Icon as={IconComponent} href="" boxSize="20" {...props} />
              <Heading fontSize="sm" textAlign="center">
                {iconName}
              </Heading>
            </Box>
          ))}
      </Flex>
    </>
  );
};
export const All = Template.bind({});
All.args = {
  // icon: 'action',
  boxSize: 20,
  color: '',
};

export const Disabled = Template.bind({});
Disabled.args = {
  // icon: 'action',
  disabled: true,
};

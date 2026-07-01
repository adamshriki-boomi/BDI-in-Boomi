import { Box, Flex, Heading } from '@chakra-ui/react';
import React from 'react';
import { StepIcon, StepIcons } from './step';

export default {
  title: 'Components/Icons/StepIcon',
  component: StepIcon,
} as any;

const Template = props => <StepIcon {...props} />;
export const Default = Template.bind({});
Default.args = {
  icon: 'action',
  boxSize: 28,
  selected: false,
};

const AllTemplate = props => (
  <>
    <Flex gap="6" flexWrap="wrap">
      {Object.keys(StepIcons).map(iconName => (
        <Box>
          <StepIcon key={iconName} {...props} icon={iconName} />
          <Heading fontSize="sm" textAlign="center">
            {iconName}
          </Heading>
        </Box>
      ))}
    </Flex>
  </>
);
export const All = AllTemplate.bind({});
All.args = {
  icon: 'action',
  boxSize: 28,
};

export const Disabled = AllTemplate.bind({});
Disabled.args = {
  icon: 'action',
  disabled: true,
};

export const Selected = AllTemplate.bind({});
Selected.args = {
  icon: 'action',
  selected: true,
};

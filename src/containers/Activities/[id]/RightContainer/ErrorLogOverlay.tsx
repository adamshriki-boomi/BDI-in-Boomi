import { Box, Flex, Grid, RiveryInfoTooltip, Text } from 'components';
import { ButtonCopy } from 'components/VariableList/ButtonCopy';
import * as React from 'react';

export function ErrorLogOverlay({ value }) {
  const doneWithWarnng = value?.includes('Done With Warning');
  return (
    <RiveryInfoTooltip
      color="font"
      buttonProps={{ h: 0 }}
      extraProps={{
        placement: 'bottom',
        contentProps: {
          position: 'absolute',
          right: '50px',
          top: '10px',
          w: '300px',
        },
      }}
      icon={
        <Text
          fontSize="sm"
          fontWeight="normal"
          color={doneWithWarnng ? 'font' : 'red.200'}
          overflow="hidden"
          whiteSpace="nowrap"
          textOverflow="ellipsis"
        >
          {doneWithWarnng
            ? value.replace('Done With Warning', 'Done with warning')
            : value}
        </Text>
      }
      description={
        <Grid maxH="150px" py={2} templateRows="1fr 28px">
          <Box overflowY="auto">{value}</Box>
          <Flex justify="end" pt={2}>
            <ButtonCopy size="small" value={value} buttontype="text" />
          </Flex>
        </Grid>
      }
    />
  );
}

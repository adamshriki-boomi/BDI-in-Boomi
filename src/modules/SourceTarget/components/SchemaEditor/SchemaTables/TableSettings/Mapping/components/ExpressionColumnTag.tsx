import { Tag } from '@chakra-ui/react';
import { useOpacityCalculate } from 'modules/Environments/helpers';
import { CalculatedColumnMode } from 'modules/SourceTarget/store';
import * as React from 'react';

interface ExpressionColumnTagProps {
  label?: string;
  type?: CalculatedColumnMode;
}

export function ExpressionColumnTag({
  type = 'target',
  label = 'Expression',
}: ExpressionColumnTagProps) {
  const targetBgColor = useOpacityCalculate('tagGeekBlue', 0.1);
  const sourceBgColor = useOpacityCalculate('tagOrange', 0.1);
  return (
    <Tag
      bg={type === 'target' ? targetBgColor : sourceBgColor}
      variant="outline"
      size="sm"
      textTransform="capitalize"
      color={type === 'target' ? 'tagGeekBlue' : 'tagOrange'}
      p="1px 8px"
      borderRadius={2}
      fontSize="12px"
      mt="2px!important"
      sx={{
        '&': {
          badgeColor: 'transparent',
          boxShadow: 'none',
        },
      }}
    >
      {label}
    </Tag>
  );
}

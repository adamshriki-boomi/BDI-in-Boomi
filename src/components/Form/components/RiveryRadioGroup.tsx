import { Box, Flex, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';
import { RenderGuard } from 'components/RenderGuard';

interface RadioGroupProps {
  direction?: 'column' | 'row';
  defaultValue: string;
  onChange: (value: string) => any;
  values: any[];
  value?: string;
  stackGap?: number;
}

export function RiveryRadioGroup({
  stackGap = 0,
  direction = 'column',
  defaultValue,
  onChange,
  values,
  value: selectedValue,
}: RadioGroupProps) {
  return (
    <RadioGroup
      value={selectedValue}
      defaultValue={defaultValue}
      onChange={onChange}
    >
      <Stack
        direction={direction as any}
        gap={stackGap}
        sx={{
          '& > label': {
            alignItems: 'flex-start',
            '& > .chakra-radio__control': { mt: 0.5 },
          },
        }}
      >
        {values.map(
          (
            {
              value,
              label,
              description = null,
              isDisabled = false,
              content = null,
            },
            idx,
          ) => (
            <>
              <Radio key={idx} value={value} isDisabled={isDisabled}>
                <>
                  <Text
                    fontSize="sm"
                    fontStyle={description ? 'M7' : 'R7'}
                    whiteSpace="pre"
                  >
                    {label}
                  </Text>
                  <Box textStyle="R8">
                    <RenderGuard
                      condition={typeof description == 'string'}
                      fallback={description}
                    >
                      <Text className="radio-description">{description}</Text>
                    </RenderGuard>
                  </Box>
                </>
              </Radio>
              <RenderGuard condition={content && value === selectedValue}>
                <Flex justifyContent="start" pl={6} pt={2}>
                  {content}
                </Flex>
              </RenderGuard>
            </>
          ),
        )}
      </Stack>
    </RadioGroup>
  );
}

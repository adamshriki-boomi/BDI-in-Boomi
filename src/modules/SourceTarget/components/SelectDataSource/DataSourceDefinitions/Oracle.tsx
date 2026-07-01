import { Flex, RenderGuard } from 'components';
import { useGetRiverCommonProps } from 'modules/SourceTarget/components/form';
import { ReplaceNewlineCharacters } from './ReplaceNewlineCharacters';
import * as React from 'react';
import { StreamConfigurations } from './LogPosition';
import { useFormContext } from 'react-hook-form';

export default function OracleSource() {
  const formApi = useFormContext();
  const { isCDC } = useGetRiverCommonProps();
  return (
    <Flex flexDir="column" gap={2}>
      <RenderGuard
        condition={isCDC}
        fallback={<ReplaceNewlineCharacters formApi={formApi} />}
      >
        <StreamConfigurations />
      </RenderGuard>
    </Flex>
  );
}

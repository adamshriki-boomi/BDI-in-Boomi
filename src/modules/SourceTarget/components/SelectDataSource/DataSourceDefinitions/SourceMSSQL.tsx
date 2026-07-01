import { TargetTypesV1 } from 'api/types';
import { Flex, RenderGuard } from 'components';
import { RiverySwitch } from 'components/Form';
import { useGetRiverCommonProps } from 'modules/SourceTarget/components/form';
import { useFormContext } from 'react-hook-form';
import { IncludeDeletedRows } from './IncludeDeletedRows';
import { StreamConfigurations } from './LogPosition';
import { ReplaceInvalidCharsSwitch } from './ReplaceInvalidCharsSwitch';
import { ReplaceNewlineCharacters } from './ReplaceNewlineCharacters';

export default function MSSQLSource() {
  const formApi = useFormContext();
  const { isCDC, isByVersionExtractMethodSelected } = useGetRiverCommonProps();

  const target = formApi.watch('river.properties.target.name');
  const deletedRowsSupportedTargets = [
    TargetTypesV1.SNOWFLAKE,
    TargetTypesV1.DATABRICKS,
  ];
  const shouldShowDeletedRows =
    isByVersionExtractMethodSelected &&
    deletedRowsSupportedTargets.includes(target);

  return (
    <Flex flexDir="column" gap={4}>
      <RenderGuard
        condition={isCDC}
        fallback={
          <>
            {' '}
            <ReplaceInvalidCharsSwitch api={formApi} />
            <RiverySwitch
              label="Ignore Hidden Columns"
              leftLabel
              ml="auto"
              api={formApi}
              name="river.properties.source.additional_settings.ignore_hidden_columns"
            />
            <RiverySwitch
              label="Hexadecimal string representation for VARBINARY values"
              leftLabel
              ml="auto"
              api={formApi}
              name="river.properties.source.additional_settings.hex_str_rep_for_varbinary"
            />
            <ReplaceNewlineCharacters formApi={formApi} />
            <RenderGuard condition={shouldShowDeletedRows}>
              <IncludeDeletedRows formApi={formApi} />
            </RenderGuard>
          </>
        }
      >
        <StreamConfigurations />
      </RenderGuard>
    </Flex>
  );
}

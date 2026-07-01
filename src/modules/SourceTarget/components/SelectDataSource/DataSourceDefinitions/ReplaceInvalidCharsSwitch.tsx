import { RenderGuard } from 'components';
import { RiverySwitch } from 'components/Form/components/RiverySwitch';
import { useGetRiverCommonProps } from 'modules/SourceTarget';

export function ReplaceInvalidCharsSwitch({ api, ...rest }) {
  const { isCDC } = useGetRiverCommonProps();
  return (
    <RenderGuard condition={!isCDC}>
      <RiverySwitch
        label="Replace Invalid Characters for Target Tables / Columns Names"
        leftLabel
        ml="auto"
        api={api}
        name="river.properties.source.additional_settings.fix_invalid_characters"
        marginInlineEnd={0}
        {...rest}
      />
    </RenderGuard>
  );
}

import { RoutesBuilder } from 'app/routes';
import { RenderGuard, RiveryInfoTooltip, Text } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { getScheduleText } from 'containers/River/Settings/components/ScheduleEditor';
import { IRiverStatus } from 'modules/SourceTarget';
import React from 'react';
import { Link } from 'react-router-dom';
import { useAccount, useCore } from 'store/core';
import { RiverTypes } from 'api/types';

export const ScheduleIndicator = ({
  value: scheduled,
  row: {
    original: { river_cross_id, river_type, river_status, is_api_v2 },
  },
}) => {
  const { activeAccountId: account, envId: env } = useCore();
  const { isSettingOn } = useAccount();
  const is_scheduled = Boolean(scheduled?.length);
  const expression = scheduled?.[0];
  const v2RiverPath = RoutesBuilder.river({
    account,
    env,
    river: river_cross_id,
  });
  const schedulerDrawerPath = `${v2RiverPath}?river_drawer=scheduler`;

  const schedulePath =
    isSettingOn('allow_create_new_stt') &&
    is_api_v2 &&
    river_type !== RiverTypes.LOGIC
      ? schedulerDrawerPath
      : river_type === RiverTypes.LOGIC
      ? RoutesBuilder.riverSettings({ account, env, river: river_cross_id })
      : RoutesBuilder.legacyRiverSettings({
          accountId: account,
          envId: env,
          river: river_cross_id,
        });
  const value = (truncate = true) =>
    is_scheduled ? (
      <Text
        fontWeight="normal"
        overflow={truncate ? 'hidden' : 'none'}
        whiteSpace={truncate ? 'nowrap' : 'normal'}
        textOverflow={truncate ? 'ellipsis' : 'none'}
        color={
          truncate
            ? river_status === IRiverStatus.ACTIVE
              ? 'font-link'
              : 'font-disabled'
            : 'font-inverse'
        }
      >
        {getScheduleText(expression, undefined, true)}
      </Text>
    ) : truncate ? (
      <Text color="font-secondary" />
    ) : null;

  return (
    <RenderGuard condition={is_scheduled}>
      <RiveryInfoTooltip
        extraProps={{ placement: 'top' }}
        icon={
          <RiveryButton
            paddingInlineStart="0px !important"
            justifyContent="start"
            as={Link}
            w="full"
            variant="text-link"
            to={schedulePath}
            title={getScheduleText(expression, null, true)}
            label={value()}
          />
        }
        description={value(false)}
      />
    </RenderGuard>
  );
};

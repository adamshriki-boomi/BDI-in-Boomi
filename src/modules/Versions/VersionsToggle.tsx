import { RiveryDate } from 'api/types';
import { Link, Text } from 'components';
import { useSetDrawer } from 'modules/RiverRightBar';
import { DrawerType } from 'modules/RiverRightBar/Actions';
import * as React from 'react';
import { getDate } from 'utils/api.sanitizer';

export function VersionsToggle({
  children,
  disabled = false,
  ariaLabel,
  ...style
}) {
  const setDrawer = useSetDrawer();
  return (
    <Link
      onClick={() => setDrawer(DrawerType.VERSIONS)}
      fontSize="xs"
      aria-label={ariaLabel}
      color={disabled ? 'font-disabled' : 'font'}
      display="flex"
      gap="1"
      pointerEvents={disabled ? 'none' : 'unset'}
      {...style}
    >
      {children}
    </Link>
  );
}

VersionsToggle.DateToggle = DateToggle;

const isDateValid = date => Boolean(getDate(date));

export function DateToggle({ date }) {
  const isValid = isDateValid(date);
  return (
    <VersionsToggle ariaLabel="River Modified" disabled={!isValid}>
      <DateTime date={date} />
    </VersionsToggle>
  );
}

function DateTime({ date }: { date: RiveryDate }) {
  const isDateValid = Boolean(date?.$date);
  const dateObj = isDateValid ? new Date(date?.$date) : new Date();
  return (
    <>
      <Text>{isDateValid ? 'Modified' : 'Drafted'}:</Text>
      <Text>{dateObj?.toLocaleDateString()}</Text>
      <Text>{dateObj?.toLocaleTimeString()}</Text>
    </>
  );
}

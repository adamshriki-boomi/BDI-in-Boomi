import { OpenSupport } from 'modules/ModalForm/OpenSupport';
import * as React from 'react';

export function GetInTouchWithSupport() {
  return (
    <>
      If you need immediate help, please get in touch with our
      <OpenSupport
        label="Support Team"
        aria-label="support team"
        variant="link"
        display="inline-flex"
        p={0}
        m={0}
        ml={1}
        verticalAlign="baseline"
      />
      .
    </>
  );
}

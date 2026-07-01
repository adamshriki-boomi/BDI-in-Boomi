import { CopyIcon, IconButton, RiveryOverlay } from 'components';
import { useCopyToClipboardWithToast } from 'hooks/useCopyToClipboard';
import * as React from 'react';

export function CopyToClipboard({ value }) {
  const { copyToClipboard } = useCopyToClipboardWithToast();
  return (
    <RiveryOverlay description="copy link">
      <IconButton
        aria-label="copy link"
        tabIndex={-1}
        size="sm"
        onClick={() => copyToClipboard(value)}
        variant="transparent"
        icon={<CopyIcon />}
      />
    </RiveryOverlay>
  );
}

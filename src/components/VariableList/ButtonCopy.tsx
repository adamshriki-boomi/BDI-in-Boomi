import { IconButton, IconButtonProps } from '@chakra-ui/react';
import { RiveryButton, RiveryButtonProps } from 'components/Buttons';
import { CopyIcon } from 'components/Icons';
import { useCopyToClipboardWithToast } from 'hooks/useCopyToClipboard';
import * as React from 'react';

interface ButtonCopyProps
  extends Omit<IconButtonProps, 'aria-label' | 'onClick'>,
    Omit<RiveryButtonProps, 'label'> {
  value: string;
  buttontype?: 'text' | 'icon';
}

export function ButtonCopy({
  value,
  buttontype = 'icon',
  ...props
}: ButtonCopyProps) {
  const { copyToClipboard } = useCopyToClipboardWithToast();

  return buttontype === 'text' ? (
    <RiveryButton
      label="Copy"
      {...props}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        copyToClipboard(value);
      }}
    />
  ) : (
    <IconButton
      icon={<CopyIcon />}
      variant="primary"
      aria-label="copy"
      {...props}
      onClick={() => copyToClipboard(value)}
    />
  );
}

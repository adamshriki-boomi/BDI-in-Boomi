import { useToastComponent } from 'hooks/useToast';
import { useEffect } from 'react';
import { useCopyToClipboard } from 'react-use';

export const useCopyToClipboardWithToast = () => {
  const { success } = useToastComponent();
  const [{ value: valueCopied }, copyToClipboard] = useCopyToClipboard();

  useEffect(() => {
    if (valueCopied) {
      success({ description: 'Value was copied to clipboard' });
    }
  }, [success, valueCopied]);
  return { copyToClipboard };
};

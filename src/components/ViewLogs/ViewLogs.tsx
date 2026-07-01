import { HStack, useToast } from '@chakra-ui/react';
import 'components/ExternalLink';
import { DownloadIcon } from 'components/Icons';
import { useCopyToClipboardWithToast } from 'hooks/useCopyToClipboard';
import { CreateLoadingToast } from 'hooks/useToast';
import { SuperAdminEnabler } from 'modules/FeatureEnabler/SuperAdminEnabler';
import * as React from 'react';
import { useCallback, useRef } from 'react';
import { downloadPullRequestLogs } from './viewLogs.api';
import { RiveryButton } from 'components';

export const ViewLogs = ({ pullRequestId = null, message = null }) => {
  const { copyToClipboard } = useCopyToClipboardWithToast();
  const toast = useToast();
  const toastIdRef = useRef<any>(null);

  const handleDownload = useCallback(async () => {
    if (!pullRequestId) return;
    if (!toast.isActive(pullRequestId)) {
      toastIdRef.current = CreateLoadingToast(
        toast,
        'Download in progress',
        pullRequestId,
      );
    }
    const updateToast = (status, description) =>
      toast.update(toastIdRef.current, {
        duration: 3000,
        isClosable: true,
        title: null,
        status,
        description,
      });

    try {
      const result = await downloadPullRequestLogs(pullRequestId);
      if (result === 'empty') {
        updateToast('error', 'No logs found');
        return;
      }
      updateToast('success', 'Download completed!');
    } catch (e: any) {
      updateToast('error', e?.detail ?? 'Failed to download logs');
    }
  }, [pullRequestId, toast]);

  return (
    <HStack justify="space-between">
      {Boolean(message) ? (
        <RiveryButton
          label="Copy Error"
          variant="link"
          size="small"
          onClick={e => {
            e.preventDefault();
            copyToClipboard(message);
          }}
        />
      ) : null}
      <SuperAdminEnabler>
        {pullRequestId ? (
          <RiveryButton
            label="View logs"
            variant="primary"
            size="small"
            rightIcon={<DownloadIcon />}
            onClick={e => {
              e.preventDefault();
              handleDownload();
            }}
          />
        ) : null}
      </SuperAdminEnabler>
    </HStack>
  );
};

import { Icon } from '@chakra-ui/react';
import { getDataV1 } from 'api/api.proxy';
import { Sparkles } from 'components';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'store/core';
import { isFailureStatus } from 'utils/status.utils';
import { TroubleshootTags } from 'utils/tracking.tags';
import { RiveryButton } from './Buttons';
import { RenderGuard } from './RenderGuard';
import { Tagger } from './Tracking/Tagger';

export default function HelpMeFixIt({
  errorMessage,
  status,
  onAiClick,
}: {
  errorMessage?: string | null;
  status?: string | null;
  onAiClick?: (docsUrl?: string | null) => void;
}) {
  const { accountSettings } = useAccount();
  const [errorCodeUrl, setErrorCodeUrl] = useState(null);
  const matches = errorMessage?.match(/RVR-[A-Z]+-(?:[A-Z]+-)*\d+/g);
  const code = matches?.[matches?.length - 1];
  const allowAi = Boolean(accountSettings?.allow_ai_based_processing);
  const isFailed = isFailureStatus(status);

  const checkPageContent = useCallback(
    async errorCode => {
      if (!code) {
        setErrorCodeUrl(false);
      } else {
        try {
          const res = await getDataV1(
            false,
            `/verify_boomi_docs_url?url_suffix=${errorCode}`,
          );
          setErrorCodeUrl(res.exists ? res.url : null);
        } catch {
          setErrorCodeUrl(null);
        }
      }
    },
    [code],
  );

  useEffect(() => {
    if (code) {
      checkPageContent(code?.toLowerCase());
    } else {
      setErrorCodeUrl(false);
    }
  }, [checkPageContent, code]);

  const show = allowAi ? isFailed : Boolean(errorCodeUrl);

  return (
    <RenderGuard condition={show}>
      <Tagger tags={TroubleshootTags.HELP_ME_FIX_IT_BUTTON}>
        <RiveryButton
          size="small"
          leftIcon={<Icon as={Sparkles} />}
          label="Help Me Fix It"
          variant="outlined-primary"
          onClick={e => {
            e.stopPropagation();

            if (allowAi) {
              onAiClick?.(errorCodeUrl ?? null);
              return;
            }

            if (errorCodeUrl) {
              window.open(errorCodeUrl.toLowerCase());
            }
          }}
        />
      </Tagger>
    </RenderGuard>
  );
}

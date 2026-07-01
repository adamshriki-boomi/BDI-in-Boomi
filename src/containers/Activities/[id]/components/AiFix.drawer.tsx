import { ExLoader, LoaderVariant } from '@boomi/exosphere/dist/react/loader';
import {
  ExIconButton,
  IconButtonFlavor,
  IconButtonSize,
  IconButtonType,
} from '@boomi/exosphere/dist/react/icon-button';
import {
  Center,
  Box,
  DrawerBody,
  DrawerCloseLink,
  DrawerHeader,
  Flex,
  Icon,
  NotificationsEmpty,
  RenderGuard,
  RiveryButton,
  SlideFade,
  Sparkles,
  Text,
} from 'components';
import { Tagger } from 'components/Tracking/Tagger';
import { ResultsPanelInnerSpinner } from 'components/Loaders/Loader';
import RiveryAlert from 'components/Alert/Alert';
import { ExoText } from 'components/Exosphere/ExoText';
import { useToastComponent } from 'hooks/useToast';
import Markdown from 'markdown-to-jsx';
import React, { useCallback, useEffect, useState } from 'react';
import { generatePath, useHistory } from 'react-router-dom';
import { useCore } from 'store/core';
import { TroubleshootTags } from 'utils/tracking.tags';
import { AppRoutes } from '../../../../app/routes';
import { OpenSupport } from '../../../../modules/ModalForm/OpenSupport';

const DEFAULT_DOCS_URL = 'https://docs.rivery.io/';

function extractIssueSummary(markdown: string | null): string {
  if (!markdown) return '';
  const match = markdown.match(/##\s+Issue Summary\s*\n([\s\S]*?)(?=\n##\s|$)/);
  return match?.[1]?.trim() ?? '';
}

export type AiFixDrawerProps = {
  onBack: () => void;
  aiFixTitle: string;
  showSpinner?: boolean;
  errorDescription?: string;
  isTroubleshootLoading: boolean;
  troubleshootData: { formatted_report?: string | null };
  documentationUrl?: string | null;
  hideBackButton?: boolean;
  diagnoseError?: string | null;
};

function TroubleshootFailedError({ message }: { message: string }) {
  return (
    <Center flex={1} minH={0} py={10}>
      <Flex
        flexDir="column"
        alignItems="center"
        textAlign="center"
        maxW="520px"
        gap={3}
      >
        <Icon as={NotificationsEmpty} boxSize="90px" />
        <ExoText styleName="Subhead 1 Bold">
          Could not get agent response
        </ExoText>
        <ExoText
          styleName="Body Small 1"
          color="var(--exo-color-font-secondary)"
        >
          {message}
        </ExoText>
      </Flex>
    </Center>
  );
}

function ExternalLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

const NoIcon = () => null;

const markdownContentSx = {
  wordBreak: 'break-word' as const,
  '& a': {
    color: 'var(--exo-palette-periwinkle-50)',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  '& h1': { fontSize: '1.5em', fontWeight: 600, mt: 2, mb: 1 },
  '& h2': { fontSize: '1.25em', fontWeight: 600, mt: 2, mb: 1 },
  '& h3': { fontSize: '1.1em', fontWeight: 600, mt: 2, mb: 1 },
  '& h4, & h5, & h6': { fontSize: '1em', fontWeight: 600, mt: 2, mb: 1 },
  '& p': { my: 2 },
  '& ul, & ol': { pl: 6, my: 2 },
  '& li': { my: 0.5 },
  '& blockquote': {
    borderLeft: '4px solid',
    borderColor: 'gray.300',
    pl: 3,
    my: 2,
    color: 'gray.600',
  },
  '& pre, & pre code, & code': {
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
  },
  '& pre': {
    bg: 'gray.200',
    p: 3,
    borderRadius: 'md',
    overflow: 'auto',
    my: 2,
  },
  '& code': { fontSize: '0.9em', bg: 'gray.200', px: 1, borderRadius: 'sm' },
  '& pre code': { bg: 'transparent', p: 0 },
  '& table': { width: '100%', borderCollapse: 'collapse', my: 2 },
  '& th, & td': {
    border: '1px solid',
    borderColor: 'gray.200',
    px: 2,
    py: 1,
    textAlign: 'left',
  },
  '& th': { fontWeight: 600, bg: 'gray.50' },
  '& strong': { fontWeight: 600 },
  '& em': { fontStyle: 'italic' },
};

function TroubleshootLoader() {
  return (
    <Flex
      flex={1}
      alignItems="center"
      justifyContent="center"
      flexDir="column"
      py={10}
      gap={2}
    >
      <Box
        w="28px"
        h="28px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <ExLoader variant={LoaderVariant.INLINE_DOTS} inline />
      </Box>
      <ExoText styleName="Body">AI gathering solutions...</ExoText>
      <ExoText styleName="Body Small 1" color="var(--exo-color-font-secondary)">
        (it may take up to 30 seconds)
      </ExoText>
    </Flex>
  );
}

function FormattedReport({
  content,
  ...rest
}: {
  content: string | null;
  'data-pendo-id'?: string;
}) {
  if (!content) return null;
  return (
    <Box
      fontSize="sm"
      maxW="100%"
      minW={0}
      overflowX="hidden"
      sx={markdownContentSx}
      {...rest}
    >
      <Markdown options={{ overrides: { a: ExternalLink } }}>
        {content}
      </Markdown>
    </Box>
  );
}

function TroubleshootGivenError({
  errorDescription,
}: {
  errorDescription: string | undefined;
}) {
  if (!errorDescription) return null;
  return (
    <RiveryAlert
      variant="error-light"
      icon={NoIcon}
      description={
        <Box
          maxH="250px"
          overflowY="auto"
          overflowX="hidden"
          pr={2}
          sx={{ wordBreak: 'break-word' }}
        >
          {errorDescription}
        </Box>
      }
    />
  );
}

function TroubleshootFooterDisclaimer({
  documentationUrl,
}: {
  documentationUrl: string;
}) {
  return (
    <RiveryAlert
      variant="info"
      description={
        <>
          Boomi Data Integration&apos;s AI-powered troubleshooting tool searches
          through our Documentation and provides summaries. As a result,
          it&apos;s important to verify its accuracy.
          <br />
          Still need help? Visit our{' '}
          <RiveryButton
            label="Documentation"
            variant="link"
            href={documentationUrl}
            target="_blank"
          />{' '}
          or{' '}
          <OpenSupport variant="link" size="medium" label="Contact Support" />
        </>
      }
    />
  );
}

function TroubleshootHeader({
  onBack,
  aiFixTitle,
  hideBackButton,
}: {
  onBack: () => void;
  aiFixTitle: string;
  hideBackButton?: boolean;
}) {
  return (
    <>
      <Flex alignItems="center" gap={2} minH={7}>
        {!hideBackButton && (
          <Box onClick={onBack} cursor="pointer">
            <ExIconButton
              icon="Left caret"
              size={IconButtonSize.SMALL}
              type={IconButtonType.SECONDARY}
              flavor={IconButtonFlavor.BRANDED}
              label="Back"
            />
          </Box>
        )}
        <Text
          width="90%"
          minH={7}
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
        >
          {aiFixTitle}
        </Text>
      </Flex>
      <Flex alignItems="center" gap={2} mt={1}>
        <Icon as={Sparkles} color="var(--exo-palette-gray-20)" />
        <ExoText
          styleName="Body Small 1"
          color="var(--exo-color-font-secondary)"
        >
          AI-Powered Assistant Solution
        </ExoText>
      </Flex>
    </>
  );
}

export function AiFixDrawer(props: AiFixDrawerProps) {
  const {
    onBack,
    aiFixTitle,
    showSpinner = false,
    errorDescription,
    isTroubleshootLoading,
    troubleshootData,
    documentationUrl,
    hideBackButton = false,
    diagnoseError = null,
  } = props;

  const effectiveDocsUrl = documentationUrl ?? DEFAULT_DOCS_URL;
  const [revealed, setRevealed] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const { success } = useToastComponent();

  useEffect(() => {
    setRevealed(false);
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const formattedReport = troubleshootData?.formatted_report ?? null;

  const handleFeedback = useCallback(
    (rating: 'up' | 'down') => {
      setFeedbackGiven(true);
      const pendoApi = window['pendo'];
      if (pendoApi?.track) {
        pendoApi.track('troubleshoot_feedback', {
          rating,
          response: extractIssueSummary(formattedReport),
        });
      }
      success({ description: 'Thank you for your feedback' });
    },
    [success, formattedReport],
  );

  return (
    <>
      <DrawerHeader
        fontSize="lg"
        py={3}
        mx={6}
        px={0}
        borderBottom="1px solid"
        borderBottomColor="border"
      >
        <TroubleshootHeader
          onBack={onBack}
          aiFixTitle={aiFixTitle}
          hideBackButton={hideBackButton}
        />
      </DrawerHeader>
      <DrawerCloseLink />
      {showSpinner ? (
        <ResultsPanelInnerSpinner />
      ) : (
        <SlideFade
          in={revealed}
          offsetX={24}
          offsetY={0}
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
          transition={{ enter: { duration: 0.25 } }}
        >
          <DrawerBody
            gap="4"
            pt={2}
            pb={6}
            display="flex"
            flexDir="column"
            flex={1}
            minW={0}
            maxW="100%"
          >
            <RenderGuard condition={Boolean(errorDescription)}>
              <TroubleshootGivenError errorDescription={errorDescription} />
            </RenderGuard>

            <Flex
              flex={1}
              minH={0}
              minW={0}
              maxW="100%"
              w="full"
              overflowY="auto"
              overflowX="hidden"
            >
              <RenderGuard condition={Boolean(diagnoseError)}>
                <TroubleshootFailedError message={diagnoseError} />
              </RenderGuard>
              <RenderGuard condition={!diagnoseError && isTroubleshootLoading}>
                <TroubleshootLoader />
              </RenderGuard>
              <RenderGuard
                condition={
                  !diagnoseError &&
                  !isTroubleshootLoading &&
                  Boolean(formattedReport)
                }
              >
                <Tagger tags={TroubleshootTags.DIAGNOSE_RESPONSE}>
                  <FormattedReport content={formattedReport} />
                </Tagger>
              </RenderGuard>
            </Flex>

            <RenderGuard
              condition={
                !diagnoseError &&
                !isTroubleshootLoading &&
                Boolean(formattedReport)
              }
            >
              <Flex alignItems="center" gap={2}>
                <ExoText styleName="Body Small 1">Was this helpful?</ExoText>
                <Tagger tags={TroubleshootTags.FEEDBACK_THUMBS_UP_BUTTON}>
                  <ExIconButton
                    icon="ThumbsUp"
                    size={IconButtonSize.DEFAULT}
                    type={IconButtonType.SECONDARY}
                    flavor={IconButtonFlavor.BRANDED}
                    disabled={feedbackGiven}
                    onClick={() => handleFeedback('up')}
                  />
                </Tagger>
                <Tagger tags={TroubleshootTags.FEEDBACK_THUMBS_DOWN_BUTTON}>
                  <ExIconButton
                    icon="ThumbsDown"
                    size={IconButtonSize.DEFAULT}
                    type={IconButtonType.SECONDARY}
                    flavor={IconButtonFlavor.BRANDED}
                    disabled={feedbackGiven}
                    onClick={() => handleFeedback('down')}
                  />
                </Tagger>
              </Flex>
            </RenderGuard>

            <TroubleshootFooterDisclaimer documentationUrl={effectiveDocsUrl} />
          </DrawerBody>
        </SlideFade>
      )}
    </>
  );
}

const SETTINGS_ACCOUNT_SECTION = 'account';

export function EnableAiPrompt() {
  const history = useHistory();
  const { activeAccountId, envId, accountSettings, isAdminRole } = useCore();
  const showAiPrompt = !accountSettings?.allow_ai_based_processing;

  const goToAccountSettings = useCallback(() => {
    const path = generatePath(AppRoutes.SETTINGS_SECTION, {
      account: activeAccountId,
      env: envId,
      section: SETTINGS_ACCOUNT_SECTION,
    });
    history.push(path);
  }, [history, activeAccountId, envId]);

  if (!showAiPrompt) {
    return;
  }

  const description = isAdminRole
    ? 'Enable AI features to receive faster, step-by-step troubleshooting.'
    : 'Ask an account admin to enable AI features for faster, step-by-step troubleshooting.';

  return (
    <Box
      w="100%"
      mb={2}
      py={2}
      px={4}
      border="1px solid"
      borderRadius="4px"
      bgColor="exo-color-background-selected-weak"
      borderColor="exo-color-background-selected"
      flexDir="column"
      display="flex"
      gap={1}
    >
      <ExoText styleName="Body Large 1 Bold">
        Smarter Troubleshooting with AI
      </ExoText>
      <ExoText styleName="Body Small 1 UI">{description}</ExoText>
      <Flex justify="flex-end" mt={2} w="100%">
        <Tagger tags={TroubleshootTags.ENABLE_AGENT_BANNER_BUTTON}>
          <RiveryButton
            variant="primary"
            size="small"
            label="Enable AI"
            onClick={goToAccountSettings}
            disabled={!isAdminRole}
          />
        </Tagger>
      </Flex>
    </Box>
  );
}

import {
  Box,
  CopyIcon,
  Flex,
  Icon,
  RenderGuard,
  RiveryButton,
  RiveryModal,
  Text,
} from 'components';
import { ComplexInputField } from 'components/Form';
import { useRiverId } from 'containers/Activities/helpers';
import { useSelectedSourceTopology } from 'containers/River/RiverSourceToTarget/components/RiverActivation/hooks';
import { useCopyToClipboardWithToast } from 'hooks/useCopyToClipboard';
import { useGetConfigData } from 'modules/SourceTarget/store';
import { useEffect } from 'react';
import { useToggle } from 'react-use';
import { useGetRiverCommonProps, useIsRiverActive } from '../../form';

export function LogPositionModal() {
  const isActive = useIsRiverActive();
  const riverId = useRiverId();
  const [show, toggle] = useToggle(false);
  const { getConfig, isFetching, data, error } = useGetConfigData(riverId);
  const { feature_flags } = useSelectedSourceTopology();

  useEffect(() => {
    if (error || data) {
      toggle(true);
    }
  }, [error, data, toggle]);
  return (
    <>
      <RiveryButton
        w="fit-content"
        mt={2}
        label="Check Log Position"
        isDisabled={!isActive}
        variant="outlined-primary"
        onClick={getConfig}
        isLoading={isFetching}
        {...(isActive && { href: '#' })}
      />
      <RiveryModal
        title="Log Position"
        toggle={toggle}
        show={show}
        footer={{ cancelLabel: 'Close', saveLabel: null }}
      >
        <RenderGuard
          condition={Boolean(data)}
          fallback={
            <Box p={6} pr={3}>
              {(error as any)?.data?.detail}
            </Box>
          }
        >
          <Flex gap={2} p={6} flexDir="column">
            {feature_flags?.topology_fields?.map((field, idx) => (
              <RenderGuard condition={data?.config?.[field?.id]}>
                <CopyPositionField
                  key={idx}
                  label={field?.label}
                  value={data?.config?.[field?.id] ?? ''}
                />
              </RenderGuard>
            ))}
          </Flex>
        </RenderGuard>
      </RiveryModal>
    </>
  );
}

function CopyPositionField({ label, value }) {
  const { copyToClipboard } = useCopyToClipboardWithToast();

  return (
    <Flex direction="column">
      <Text>{label}</Text>
      <ComplexInputField
        inputProps={{
          value,
        }}
        buttonProps={{
          variant: 'default',
          rightIcon: <Icon boxSize={4} as={CopyIcon} />,
          paddingInlineStart: '2px',
          paddingInlineEnd: 2,
          onClick: () => copyToClipboard(value),
        }}
      />
    </Flex>
  );
}

export function StreamConfigurations() {
  const { isCDC } = useGetRiverCommonProps();

  return (
    <RenderGuard condition={isCDC}>
      <Flex flexDir="column">
        <Text>Stream Configurations</Text>
        <Text color="font-secondary">
          Each successful run will hold a specific log position, which
          represents the latest position on the Boomi Data Integration connector
          side. The position constantly updates based on your database changes.
        </Text>
        <LogPositionModal />
      </Flex>
    </RenderGuard>
  );
}

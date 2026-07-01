import { Collapse } from '@chakra-ui/react';
import { Box, Flex, RenderGuard, RiveryButton } from 'components';
import { Input, RadioGroup } from 'components/Form';
import { useEffect, useState } from 'react';
import { compare } from 'utils/array.utils';
import { useSelectedSourceTopology, useSelectedValueToggle } from '../hooks';
import { DataLossWarning } from './DataLossWarning';
import { IDataSourceV1 } from 'api/types';

export function AutoSyncDescription() {
  const { log_doc } = useSelectedSourceTopology();
  return (
    <Box>
      Stream data from the latest run. This option will handle the streaming
      process automatically. Recommended on the first run and generally for
      low-touch stream management. For more information, visit our{' '}
      <RiveryButton
        variant="link"
        size="xs"
        label="documentation"
        target="_blank"
        href={log_doc}
      />
      .
    </Box>
  );
}

export function ReinitializeSyncDescription({ value }) {
  const { topology } = useSelectedSourceTopology();
  const { isOpen } = useSelectedValueToggle(value, 'reinitialize');

  return (
    <Flex flexDir="column">
      <Box>
        The most recent available {topology} position. This option will
        re-initialize the streaming process by pointing the Data Flow’s{' '}
        {topology}
        position to the latest position that exists in your Source database.
      </Box>
      <Collapse in={isOpen}>
        <DataLossWarning />
      </Collapse>
    </Flex>
  );
}

export function ManualSyncDescription({ value, config, setConfig }) {
  const { topology: sourceTopology, feature_flags } =
    useSelectedSourceTopology();
  const { isOpen } = useSelectedValueToggle(value, 'manual');
  const options = sourceTopology?.split('/');
  const [topology, onSelectTopology] = useState('');
  useEffect(() => {
    //initialize the topology to the first option
    if (!topology && options && options.length > 0) {
      onSelectTopology(options[0]);
    }
  }, [options, topology]);

  return (
    <Flex flexDir="column">
      <Box>
        Set position manually. This option provides complete control over the
        streaming process by allowing to set the Data Flow’s {sourceTopology}{' '}
        position.
      </Box>
      <Collapse in={isOpen}>
        <Flex flexDir="column" pt={2} gap={2}>
          <RenderGuard condition={options?.length > 1 && topology}>
            <RadioGroup
              label=""
              name="topology"
              values={options?.map(opt => ({
                label: opt,
                value: opt,
                ariaLabel: `${opt}-button`,
              }))}
              checked={topology}
              onChange={onSelectTopology}
            />
          </RenderGuard>
          {feature_flags?.topology_fields
            ?.filter(compare('topology', topology.toLowerCase()))
            .map((field, idx) => (
              <Input
                key={idx}
                label={field?.label}
                name={field?.id}
                placeholder={`example: ${field?.placeholder}`}
                value={config?.[field?.id] ?? ''}
                onClick={e => e.currentTarget.focus()}
                onChange={e =>
                  setConfig({ ...config, [field?.id]: e.target.value })
                }
                chakra
              />
            ))}
          <DataLossWarning />
        </Flex>
      </Collapse>
    </Flex>
  );
}

export const AdditionalOptionsValues = (
  value,
  config,
  setConfig,
  source: IDataSourceV1,
) =>
  [
    {
      label: 'Automated Sync (Default)',
      value: 'auto',
      description: <AutoSyncDescription />,
    },
    {
      label: 'Reinitialize Sync',
      value: 'reinitialize',
      description: <ReinitializeSyncDescription value={value} />,
    },
    !source?.feature_flags?.hide_manual_sync && {
      label: 'Manual Sync',
      value: 'manual',
      description: (
        <ManualSyncDescription
          value={value}
          config={config}
          setConfig={setConfig}
        />
      ),
    },
  ].filter(Boolean);

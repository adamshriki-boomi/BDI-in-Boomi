import { ExSegmentedControl } from '@boomi/exosphere/dist/react/segmentedcontrol';
import { ExSegmentedControls } from '@boomi/exosphere/dist/react/segmentedcontrols';
import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import { isBdiPrototypeEnv } from './config';
import { useBdiConfig } from './BdiPrototypeContext';

/**
 * Dev-only floating switcher to flip the prototype's two version flags live.
 * Lets the designer compare Original / Leftnav / Masthead / Both in one running
 * instance. Hidden outside the prototype env. Styled with Exosphere tokens.
 */
export function BdiPrototypeSwitcher() {
  const { leftnav, masthead, setLeftnav, setMasthead } = useBdiConfig();

  if (!isBdiPrototypeEnv()) return null;

  const indexOf = (e: any): number =>
    e?.detail?.index ?? e?.detail?.selectedIndex ?? e?.detail?.selected ?? 0;

  return (
    <Box
      position="fixed"
      bottom="16px"
      right="16px"
      zIndex={2147483000}
      minW="248px"
      p="var(--exo-spacing-standard, 16px)"
      bg="var(--exo-color-background, #ffffff)"
      color="var(--exo-color-font, #1f1f1f)"
      border="1px solid var(--exo-color-border, #cccccc)"
      borderRadius="var(--exo-border-radius-medium, 8px)"
      boxShadow="0 4px 16px rgba(0,0,0,0.18)"
      fontFamily="var(--exo-font-family, inherit)"
    >
      <Text
        fontSize="11px"
        fontWeight={700}
        letterSpacing="0.06em"
        textTransform="uppercase"
        mb="10px"
        color="var(--exo-color-font-weak, #707070)"
      >
        BDI Prototype
      </Text>

      <Text fontSize="12px" mb="4px" fontWeight={600}>
        Left navigation
      </Text>
      <ExSegmentedControls
        onSelectionChange={(e: any) =>
          setLeftnav(indexOf(e) === 1 ? 'exo' : 'rivery')
        }
      >
        <ExSegmentedControl
          aria-label="bdi-leftnav-rivery"
          label="Rivery"
          selected={leftnav === 'rivery'}
        />
        <ExSegmentedControl
          aria-label="bdi-leftnav-exosphere"
          label="Exosphere"
          selected={leftnav === 'exo'}
        />
      </ExSegmentedControls>

      <Box h="12px" />

      <Text fontSize="12px" mb="4px" fontWeight={600}>
        Masthead
      </Text>
      <ExSegmentedControls
        onSelectionChange={(e: any) =>
          setMasthead(indexOf(e) === 1 ? 'exo' : 'off')
        }
      >
        <ExSegmentedControl
          aria-label="bdi-masthead-off"
          label="Off"
          selected={masthead === 'off'}
        />
        <ExSegmentedControl
          aria-label="bdi-masthead-exosphere"
          label="Exosphere"
          selected={masthead === 'exo'}
        />
      </ExSegmentedControls>
    </Box>
  );
}

import { Center, Grid } from '@chakra-ui/react';
import { DataQualityTestMeta } from 'api/types';
import { RiveryModal } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { RiverySwitch } from 'components/Form/components';
import { useCallback } from 'react';
import { useToggle } from 'react-use';
import { useRiverActions } from 'store/river';
import { compare, merge } from 'utils/array.utils';
import { DataQualityFeatureFlag } from '../DataQualityFeatureFlag';
import { QualityTestsGrid } from '../QualityTestsGrid/QualityTestsGrid';
import { TestTableType } from '../QualityTestsGrid/TestsGrid';

interface QualityTestsButtonProps {
  /**
   * Step hash or River Id
   */
  id: string;
  // generated on the server
  stepId: string;
  type?: TestTableType;
  ariaLabel?: string;
  value: DataQualityTestMeta[];
}

QualityTestsButton.Type = TestTableType;
export function QualityTestsButton({
  /** id will be used to fetch tests */
  id,
  stepId,
  type = TestTableType.STEP,
  ariaLabel,
  value: testsMeta,
}: QualityTestsButtonProps) {
  const [show, toggle] = useToggle(false);
  const onDone = () => {
    toggle(false);
  };

  const checked = testsMeta?.some(compare('is_active', true));

  return (
    <DataQualityFeatureFlag>
      <Grid gridTemplateColumns="1fr min-content">
        <RiveryButton
          label="Quality Tests"
          aria-label={`Quality Tests ${ariaLabel}`}
          variant="default"
          size="small"
          onClick={() => toggle()}
          borderEndRadius="0"
        />
        <Center
          border="1px"
          borderLeft="0"
          borderColor="gray.400"
          borderRightRadius="4"
          pl="1"
        >
          <TestsSwitch
            id={id}
            testsMeta={testsMeta}
            checked={checked}
            label={ariaLabel}
          />
        </Center>
      </Grid>
      <RiveryModal
        show={show}
        onClose={toggle}
        title="Quality Tests"
        centered
        ariaLabel="quality tests modal"
        variant="medium"
      >
        <QualityTestsGrid
          id={id}
          stepId={stepId}
          type={type}
          onDone={onDone}
          skip={!show}
          ariaLabel={ariaLabel}
        />
      </RiveryModal>
    </DataQualityFeatureFlag>
  );
}

type TestsSwitchProps = {
  id: string;
  testsMeta: DataQualityTestMeta[];
  checked: boolean;
  label: string;
};
const TestsSwitch = ({ id, testsMeta, checked, label }: TestsSwitchProps) => {
  const { updateStep, updateRiverTaskConfig } = useRiverActions();
  const toggleTests = useCallback(
    (is_active: boolean) => {
      updateStep({
        hash: id,
        data_quality_tests_ids: testsMeta?.map(merge({ is_active })),
      });
      updateRiverTaskConfig({ should_run_data_quality_tests: is_active });
    },
    [id, testsMeta, updateRiverTaskConfig, updateStep],
  );
  return (
    <RiverySwitch
      display="block"
      ariaLabel={`toggle quality tests ${label}`}
      isChecked={Boolean(checked)}
      onChange={() => toggleTests(!checked)}
      label=""
    />
  );
};

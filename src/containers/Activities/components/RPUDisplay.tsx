import { RiveryOverlay, Text } from 'components';

const isZero = (units: number) => units === 0 && '0';
const isM = (units: number) =>
  units > 1000000 && parseFloat((units / 1000000).toFixed(1)) + 'M';
const isK = (units: number) =>
  units > 1000 && parseFloat((units / 1000).toFixed(1)) + 'K';
const isZeroish = (units: number) => units < 0.01 && '<0.01';
const isInteger = (units: number) => units % 1 === 0 && units;
const formatWithTwoDigits = (units: number) => parseFloat(units?.toFixed(2));

export function RPUDisplay({ value }) {
  const BDU = String(formatRpu(value));
  return (
    <RiveryOverlay portal placement="auto" description={value}>
      <Text cursor="default">{BDU}</Text>
    </RiveryOverlay>
  );
}

const numberUnitTests = [
  isZero,
  isM,
  isK,
  isZeroish,
  isInteger,
  formatWithTwoDigits,
];
export const formatRpu = units => {
  return numberUnitTests.reduce(
    (acc, unitTest) => {
      const testResult = unitTest(acc.value);
      return testResult ? { ...acc.value, result: testResult } : acc;
    },
    { value: units, result: units },
  )?.result;
};

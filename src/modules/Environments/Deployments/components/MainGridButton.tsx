import { RadioGroup } from 'components/Form';
import { ViewTypes } from '../packages.query';

export function PackagesActivitiesRadio({ selected, onSelectView }) {
  const options = [
    {
      label: ViewTypes.PACKAGES,
      value: ViewTypes.PACKAGES,
      ariaLabel: `${ViewTypes.PACKAGES}-button`,
    },
    {
      label: ViewTypes.ACTIVITY,
      value: ViewTypes.ACTIVITY,
      ariaLabel: `${ViewTypes.ACTIVITY}-button`,
    },
  ];

  return (
    <RadioGroup
      name="package-selector"
      values={options}
      checked={selected}
      onChange={onSelectView}
    />
  );
}

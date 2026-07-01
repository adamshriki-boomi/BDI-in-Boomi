import { HStack, Icon, SortDownZa, SortUpAz, useRadioGroup } from 'components';
import { InnerButtonGroup } from 'components/Buttons/ButtonGroup';
import { useCallback } from 'react';
import { DisplayOrder } from './helpers';

const ButtonIcons = {
  [DisplayOrder.ASC]: SortUpAz,
  [DisplayOrder.DESC]: SortDownZa,
};

export function SortButtonGroup({ onSelectView }) {
  const options = Object.values(DisplayOrder);
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: 'viewType',
    defaultValue: DisplayOrder.ASC,
    onChange: onSelectView,
  });

  const group = getRootProps();
  const radioButtonValue = useCallback(
    value =>
      Boolean(ButtonIcons[value]) ? (
        <Icon as={ButtonIcons[value]} boxSize="18px" />
      ) : (
        value
      ),
    [],
  );

  return (
    <HStack {...group}>
      {options.map((value, idx) => {
        const radio = getRadioProps({ value });
        return (
          <InnerButtonGroup key={value} idx={idx} {...radio}>
            {radioButtonValue(value)}
          </InnerButtonGroup>
        );
      })}
    </HStack>
  );
}

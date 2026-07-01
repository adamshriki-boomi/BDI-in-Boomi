import { chakra } from '@chakra-ui/react';
import './ScheduleEditor.scss';

export function MultiSelect({ options, selection, onChange }) {
  const isOptionChecked = ({ value, label }) =>
    selection?.includes(value) || selection?.includes(label);
  return options?.map(({ value, label, displayLabel = label }) => (
    <Option
      key={value}
      label={displayLabel}
      value={value}
      checked={isOptionChecked({ value, label })}
      onChange={onChange}
    />
  ));
}

function Option({ label, value, checked, onChange }) {
  return (
    <chakra.label
      display="flex"
      justifyContent="center"
      alignItems="center"
      userSelect="none"
      cursor="pointer"
      bgColor={checked ? 'background-selected' : null}
      borderRadius="4px"
      color={checked ? 'white' : 'font'}
      w="30px"
      h="30px"
      _hover={{
        bgColor: 'background-selected-weak',
        color: 'font',
      }}
      aria-label={label}
    >
      {label}
      <chakra.input
        appearance="none"
        type="checkbox"
        checked={checked ?? false}
        onChange={({ target: { checked } }) =>
          onChange({ value, label, checked })
        }
      />
    </chakra.label>
  );
}

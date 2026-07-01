import { useCallback, useState } from 'react';
import { emailValidation } from 'utils/validations';
import { CustomSelectForm } from './SelectFormGroup';
import { useMultiLinerSelectStyles } from './SelectFormGroup/select.styles';
import { RiveryOverlay } from 'components/RiveryOverlay/RiveryOverlay';

const validVariabERegex = new RegExp('^{.*}$', 'i');
const invalidMessage = 'Please enter a valid email address or a variable name';

const isValidValue = value =>
  emailValidation.test(value) || validVariabERegex.test(value);

export const useOnValueChange = (
  currentValue,
  onChange,
  onSetInputValue,
  onSetValidationMessage,
) => {
  return useCallback(
    (email: any) => {
      if (Array.isArray(email)) {
        onChange(email.map(e => e.value).join(','));
        return;
      }
      const value = email?.value;
      if (!isValidValue(value)) {
        onSetValidationMessage(invalidMessage);
        return;
      }
      onSetInputValue('');
      const emails = Boolean(currentValue)
        ? currentValue.concat(',' + value)
        : value;
      onChange(emails);
    },
    [currentValue, onChange, onSetInputValue, onSetValidationMessage],
  );
};

export const useOnKeyDown = (
  onValueChange,
  onSetValidationMessage,
  inputValue,
) => {
  return useCallback(
    e => {
      onSetValidationMessage('');
      if (e.key === 'Enter') {
        e.preventDefault();
        onValueChange({ value: inputValue });
        return;
      }
      if (e.key === ',') {
        e.preventDefault();
        const value = inputValue.trim();
        if (value) {
          onValueChange({ value });
          return;
        }
        return;
      }
    },
    [inputValue, onSetValidationMessage, onValueChange],
  );
};

MultiEmailsCreatableSelect.isValidValue = isValidValue;
MultiEmailsCreatableSelect.invalidMessage = invalidMessage;
export default function MultiEmailsCreatableSelect({
  emailsField = null,
  options = [],
  custom = false,
  ...rest
}) {
  const style = useMultiLinerSelectStyles();
  const [inputValue, setInputValue] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const onValueChange = useOnValueChange(
    emailsField?.value,
    emailsField?.onChange,
    setInputValue,
    setValidationMessage,
  );
  const value = Boolean(emailsField?.value)
    ? emailsField?.value
        .split(',')
        .map(email => ({ value: email, label: email }))
    : null;

  const onKeyDown = useOnKeyDown(
    onValueChange,
    setValidationMessage,
    inputValue,
  );

  return (
    <CustomSelectForm
      validationMessage={validationMessage}
      controlId="multi emails select"
      withCreate
      options={options}
      customStyles={{
        ...style,
        menu: currentStyle => ({ ...currentStyle, visibility: 'hidden' }),
        multiValue: styles => ({
          ...style.multiValue(styles),
          maxWidth: '270px',
        }),
        multiValueLabel: (styles, props) => ({
          ...style.multiValueLabel(styles, props),
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '240px',
        }),
      }}
      components={{
        DropdownIndicator: () => null,
        MultiValueLabel: props => (
          <RiveryOverlay description={props.data.label} portal>
            <div {...props.innerProps}> {props.children} </div>
          </RiveryOverlay>
        ),
      }}
      onBlur={() => {
        setInputValue('');
        setValidationMessage('');
      }}
      {...(!custom && {
        onKeyDown,
        value,
        inputValue,
        onInputChange: setInputValue,
        onChange: onValueChange,
      })}
      {...rest}
    />
  );
}

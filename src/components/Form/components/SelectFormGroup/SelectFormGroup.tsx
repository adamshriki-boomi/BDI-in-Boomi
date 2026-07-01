import {
  Button,
  FormControl,
  HStack,
  IconButton,
  StyleProps,
} from '@chakra-ui/react';
import { Box, FormLabel, Icon, RenderGuard, Text } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { HelpText } from 'components/Form/components/ControlFeedback';
import {
  ChevronDown,
  ChevronUp,
  CloseIcon,
  InfoTooltip,
} from 'components/Icons';
import { ViewLogs } from 'components/ViewLogs/ViewLogs';
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import Select, {
  components as RSComponents,
  MenuPlacement,
  MenuPosition,
} from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { CreatableAdditionalProps } from 'react-select/dist/declarations/src/useCreatable';
import { StateManagerProps } from 'react-select/dist/declarations/src/useStateManager';
import { useAsyncFn } from 'react-use';
import { useSelectFormStyles } from './select.styles';
import { ValidationError } from './ValidationError';

export type SelectOptionType = { label: string; value: string };

export const DropdownIndicatorContainer = ({ icon, ...props }: any) => {
  return (
    <RSComponents.DropdownIndicator {...props}>
      <IconButton
        bg="inherit"
        _hover={{ bg: 'transparent' }}
        _active={{ bg: 'transparent' }}
        h="0.1px!important"
        minW="24px!important"
        aria-label={`dropdown-indicator-${props.selectProps.ariaLabel}`}
        icon={<Icon as={icon} boxSize={4} color="font" />}
      />
    </RSComponents.DropdownIndicator>
  );
};

export const DropdownIndicator = props => {
  const ArrowComponent = props.selectProps.menuIsOpen ? ChevronUp : ChevronDown;
  return <DropdownIndicatorContainer {...props} icon={ArrowComponent} />;
};

export const ClearIndicator = props => {
  const {
    selectProps: { menuIsOpen },
  } = props;
  return (
    <RenderGuard condition={!menuIsOpen}>
      <RSComponents.ClearIndicator {...props}>
        <IconButton
          minW={1}
          bg="inherit"
          _hover={{ bg: 'inherit' }}
          icon={<Icon as={CloseIcon} />}
          boxSize={4}
          aria-label={`${props.selectProps.ariaLabel}-clear-indicator`}
          p={0}
        />
      </RSComponents.ClearIndicator>
    </RenderGuard>
  );
};

function IndicatorsContainer(props) {
  return (
    <RSComponents.IndicatorsContainer {...props}>
      <HStack
        h="inherit"
        p={0}
        opacity={1}
        bg="inherit"
        _hover={{ bg: 'inherit!important' }}
        onClick={e => e.stopPropagation()}
        as={Button}
      >
        {props.children}
      </HStack>
    </RSComponents.IndicatorsContainer>
  );
}

const customComponents = {
  DropdownIndicator,
  ClearIndicator,
  IndicatorSeparator: () => null,
  IndicatorsContainer,
};

export interface SelectFormGroupProps<T = unknown>
  extends Omit<StateManagerProps, 'options'>,
    Partial<CreatableAdditionalProps<any, any>> {
  label?: string;
  options: (() => Promise<T[]>) | (() => T[]) | T[];
  onChange?: (item: T) => any;
  onRefresh?: () => any;
  onAddOption?: (item: any) => any;
  controlId: string;
  customStyles?: any;
  labelStyle?: StyleProps;
  selectProps?: Omit<StateManagerProps, 'options'>;
  ariaLabel?: string;
  withCreate?: boolean;
  editableCreate?: boolean;
  defaultCreateValue?: any;
  defaultCreateLabel?: string;
  createOption?: () => Record<string, any>;
  isValidNewOption?: (option: any) => boolean;
  formatCreateLabel?: (value: any) => any;
  noOptionsLabel?: any;
  filterOption?: (candidate: any, input: string) => boolean;
  validationMessage?: string;
  hideErrorTitle?: boolean;
  error?: string;
  pullRequestId?: string;
  inputId?: string;
  footer?: React.ReactNode;
  /**
   * (false) when true, will use chakra components wrappers to perpare new instances for migration
   */
  chakra?: boolean;
  /**
   * TEMPORARY - passing a custom style to control overrides the custom rivery theme
   * this config is intended to be used in `useSelectFormStyles()`
   */
  styleConfig?: { autoHeightControl?: boolean };
  size?: 'md' | 'sm' | 'lg' | string;
  displayError?: string;
  helpText?: string;
  maxMenuHeight?: number;
  // TODO - check if in use
  metadataResponse?: any;
  innerProps?: any;
  header?: any;
  showLabel?: boolean;
  handleInputChange?: any;
  [key: string]: any;
}

export const regexSpecialCharacters = /[-[/\]{}()*+?.,\\^$|#\s]/g;

const Menu = props => {
  const {
    isLoading,
    selectProps: { onRefresh, error, footer },
  } = props;
  const ariaLabel = props.selectProps.ariaLabel ?? props.selectProps.label;

  return (
    <RSComponents.Menu
      {...props}
      isLoading={false}
      innerProps={{
        'aria-label': `${ariaLabel ?? ''} options list`,
        ...props.innerProps,
        ...props?.selectProps?.innerProps,
      }}
    >
      {onRefresh ? (
        <RiveryButton
          label="Refresh"
          variant="text-link"
          w="full"
          py={2}
          onClick={onRefresh}
          disabled={isLoading}
          isLoading={isLoading}
        />
      ) : null}
      {error ? (
        <Text w="full" color="red.200" p={4}>
          error: {error}
        </Text>
      ) : null}
      {props.children}
      {footer}
    </RSComponents.Menu>
  );
};

function EditableInput(props) {
  const {
    selectProps: { value, getOptionLabel },
  } = props;
  const label = props.value || (value ? getOptionLabel(value) : '');
  return <RSComponents.Input {...props} isHidden={false} value={label} />;
}

const EmptySingleValue = () => null;

export function SelectFormGroup<T = any>({
  label,
  options: getOptions,
  onChange,
  onRefresh,
  onBlur,
  onAddOption,
  controlId,
  selectProps = emptyObj,
  components,
  ariaLabel,
  editableCreate,
  withCreate = editableCreate,
  defaultCreateValue,
  defaultCreateLabel = 'Create',
  createOption,
  isValidNewOption,
  formatCreateLabel,
  noOptionsLabel,
  filterOption,
  validationMessage = undefined,
  hideErrorTitle = false,
  error: initError = undefined,
  footer = undefined,
  pullRequestId = undefined,
  customStyles = null,
  labelStyle = null,
  chakra = false,
  styleConfig,
  size,
  handleInputChange = null,
  inputId = null,
  showLabel = true,
  optional = false,
  defaultValueProp,
  allowSelectAll = false,
  'data-pendo-id': pendoId,
  ...restSelectProps
}: SelectFormGroupProps<T>) {
  //Allow access the create prop within the components, I set it inside the styles
  const withCreateOptionsStyles = {
    ...customStyles,
    menuList: styles => {
      return {
        ...styles,
        withCreate,
        allowSelectAll,
      };
    },
  };

  const selectStyles = useSelectFormStyles(chakra);
  const [error, setError] = useState<string | ReactNode | undefined>('');
  useEffect(() => {
    setError(
      pullRequestId ? (
        <>
          {initError}
          <ViewLogs pullRequestId={pullRequestId} />
        </>
      ) : (
        initError
      ),
    );
  }, [initError, pullRequestId]);
  const [displayError, setDisplayError] = useState();
  const { value, isRequired } = restSelectProps;
  const { isLoading, loadOptions, options, displayOptions } =
    useOptionsResolver(getOptions, value, setError, setDisplayError);
  const loadingIndicatorCfg =
    onRefresh || typeof getOptions === 'function'
      ? { LoadingIndicator: null }
      : {};
  let displayProps: any = {
    // ...ariaProps,
    size,
    error,
    footer,
    filterOption,
    options:
      typeof getOptions === 'function'
        ? displayOptions
        : restSelectProps?.isLoading || error
        ? emptyArr
        : getOptions,
    isLoading,
    //Do we want this option???
    // closeMenuOnScroll: e => {
    //   return !e?.target?.className?.includes('select-form-group__menu-list');
    // },
    ariaLabel,
    inputId,
    label: label || controlId,
    selected: 'Any',
    classNamePrefix: 'select-form-group',
    ...selectProps,
    allowCreateWhileLoading: withCreate,
    onRefresh:
      onRefresh || typeof getOptions === 'function'
        ? () => {
            setError(undefined);
            setDisplayError(undefined);
            (onRefresh && onRefresh()) || loadOptions();
          }
        : null,
    maxMenuHeight: restSelectProps?.maxMenuHeight ?? 400,
    components: {
      ...loadingIndicatorCfg,
      ...customComponents,
      ...components,
      Option,
      CustomOption: components?.Option,
      Menu,
      NoOptionsMessage: error ? () => null : toNoOptionsMessage(noOptionsLabel),
    },
    onChange: option => {
      if (option?.isFixed) {
        const getOptionValue = selectProps?.getOptionValue;
        onAddOption(getOptionValue ? getOptionValue(option) : option.value);
      } else {
        onChange && onChange(option);
      }
    },
    menuPortalTarget: document.body,
    menuPlacement: 'auto' as MenuPlacement,
    menuPosition: 'fixed' as MenuPosition,
    ...restSelectProps,
    styles: {
      ...selectStyles,
      ...withCreateOptionsStyles,
      menu: styles => ({
        ...styles,
        marginTop: '4px!important',
      }),
    },
    onMenuOpen:
      restSelectProps?.onMenuOpen ??
      (typeof getOptions !== 'function' || options || isLoading
        ? null
        : loadOptions),
  };

  if (withCreate) {
    displayProps = withCreateProperties(displayProps, {
      defaultCreateLabel,
      defaultCreateValue,
      onAddOption,
      createOption,
      selectProps,
      options,
      isValidNewOption,
      formatCreateLabel,
      filterOption,
      editable: editableCreate,
    });
  }
  const errorMessage =
    restSelectProps?.displayError ||
    validationMessage ||
    (!displayProps?.value && displayError);

  const ariaLabelDisplay = ariaLabel || label || controlId;
  return (
    <Box
      flexGrow={1}
      my={!chakra ? 3 : 'initial'}
      role="listbox"
      aria-label={ariaLabelDisplay}
      m={chakra ? 0 : 'unset'}
      data-pendo-id={pendoId}
    >
      <FormControl isRequired={isRequired} onBlur={onBlur}>
        {label && showLabel ? (
          <FormLabel
            aria-required={isRequired}
            fontSize="xs"
            {...labelStyle}
            fontWeight="normal"
            mb="0"
            aria-labelledby={ariaLabelDisplay}
          >
            {label} {optional ? <Text display="inline">(optional)</Text> : null}
          </FormLabel>
        ) : null}
        {restSelectProps?.secondaryLabel ? (
          <Text color="font-secondary" fontSize="sm" w="90%">
            {restSelectProps?.secondaryLabel}
          </Text>
        ) : null}
        {withCreate ? (
          <CreatableSelect {...displayProps} errorMessage={errorMessage} />
        ) : (
          <Select
            {...displayProps}
            errorMessage={errorMessage}
            onInputChange={handleInputChange}
          />
        )}
        <ValidationError message={errorMessage} />
        <RenderGuard condition={restSelectProps?.helpText}>
          <HStack>
            <Icon
              color="exo-color-background-info-strong"
              as={InfoTooltip}
              boxSize={4}
            />
            <HelpText
              message={restSelectProps?.helpText}
              marginInlineStart="2px!important"
            />
          </HStack>
        </RenderGuard>
      </FormControl>
    </Box>
  );
}
/**
 * adds a "role" to the default option rendered by any SelectFormGroup
 * renders any custom option that is passed to the "components" of react-select as "Option"
 */
function Option(props) {
  const CustomOption = props?.selectProps?.components?.CustomOption ?? null;
  const children = CustomOption ? <CustomOption {...props} /> : props.children;
  return (
    <RSComponents.Option
      {...props}
      children={children}
      innerProps={{
        role: 'option',
        ...props.innerProps,
      }}
    />
  );
}

function withCreateProperties(
  props,
  {
    defaultCreateLabel,
    defaultCreateValue,
    onAddOption,
    selectProps,
    options,
    createOption,
    isValidNewOption,
    formatCreateLabel,
    filterOption,
    editable,
  },
) {
  const result = {
    ...props,
    getOptionLabel: option =>
      selectProps?.getOptionLabel?.(option) ?? option?.label,
    getOptionValue: option =>
      selectProps?.getOptionValue?.(option) ?? option?.value,
    filterOption: (candidate, input) => {
      return (
        candidate.data.isFixed ||
        candidate.data.__isNew__ ||
        result
          ?.getOptionLabel(candidate)
          ?.toLowerCase()
          ?.includes(input.toLowerCase()) ||
        (filterOption && filterOption(candidate, input))
      );
    },
    createOptionPosition: props.createOptionPosition || 'first',
    onCreateOption: onAddOption,
    formatCreateLabel:
      formatCreateLabel ??
      (label =>
        `${
          createOption
            ? result.getOptionLabel(createOption())
            : defaultCreateLabel
        } "${label}"`),
    isValidNewOption: (inputValue, selectValue, selectOptions) => {
      return (
        inputValue &&
        !selectOptions?.find(option => {
          const value = result.getOptionValue(option);
          if (value?.match) {
            try {
              return isOptionMatch(value, inputValue);
            } catch (e) {}
          }
          return false;
        }) &&
        (!isValidNewOption || isValidNewOption(inputValue))
      );
    },
  };
  const isOptionMatch = (value, inputValue) => {
    const normalizedRe = inputValue.replace(regexSpecialCharacters, '$&');
    return value.match(new RegExp(`^${normalizedRe}$`, 'i'));
  };

  if (props.onChange) {
    result.onBlur = e => {
      const value = e?.target?.value;
      if (result.isValidNewOption(value)) {
        props.onChange({ value, label: value });
      }
    };
  }

  const defaultSearchValue =
    (createOption && result.getOptionValue(createOption())) ||
    defaultCreateValue;
  if (
    (createOption || (defaultCreateLabel && defaultCreateValue)) &&
    !options?.find(
      option => result.getOptionValue(option) === defaultSearchValue,
    )
  ) {
    const newOption = createOption
      ? createOption()
      : {
          label: `${defaultCreateLabel} "${defaultCreateValue}"`,
          value: defaultCreateValue,
        };
    result.options = [{ isFixed: true, ...newOption }].concat(result.options);
  }

  if (editable) {
    result.components.Input = EditableInput;
    result.components.SingleValue = EmptySingleValue;
  }
  return result;
}

function useOptionsResolver(getOptions, value, onError, setDisplayError) {
  const [{ loading: isLoading, value: options }, loadOptions] =
    useAsyncFn(async () => {
      if (typeof getOptions === 'function') {
        try {
          setDisplayError(undefined);
          return await getOptions();
        } catch (e) {
          onError(e?.message ?? e.toString());
          if (!(e instanceof SyntaxError)) {
            setDisplayError(e.toString());
            return emptyArr; // we dont want to send the call again by default so we returns emptyArr
          }
        }
      } else {
        return getOptions;
      }
    }, [getOptions]);

  const displayOptions = useMemo(() => {
    if (!options && value && typeof getOptions === 'function') {
      return [value];
    }
    return options ?? emptyArr;
  }, [value, options, getOptions]);

  return { isLoading, loadOptions, options, displayOptions };
}

const toNoOptionsMessage = label =>
  label
    ? props => <RSComponents.NoOptionsMessage {...props} children={label} />
    : RSComponents.NoOptionsMessage;

const emptyObj = {};
const emptyArr = [];

export const createOption = name => ({ value: name, label: name });

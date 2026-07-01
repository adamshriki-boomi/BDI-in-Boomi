import { SystemStyleObject } from '@chakra-ui/react';

export type exoReactSelectThemeConfig = {
  baseStyle: {
    container: SystemStyleObject;
    menu: SystemStyleObject;
    menuPortal: SystemStyleObject;
    option: (
      isSelected: boolean,
      label: string,
      data: any,
      isMulti: boolean,
    ) => SystemStyleObject;
    dropdownIndicator: SystemStyleObject;
    valueContainer: SystemStyleObject;
    clearIndicator: SystemStyleObject;
    menuList: SystemStyleObject;
    multiValue: SystemStyleObject;
    multiValueRemove: (isDisabled: boolean) => SystemStyleObject;
    multiValueLabel: (isDisabled: boolean) => SystemStyleObject;
    control: (props: any) => SystemStyleObject;
    placeholder: SystemStyleObject;
    groupHeading: SystemStyleObject;
  };
  sizes: {
    sm: string;
    md: string;
    lg: string;
    auto: string;
  };
  variants: Record<string, any>;
  defaultProps: {
    size: 'sm' | 'md' | 'lg' | 'auto';
    variant: string;
  };
};

const sizes = {
  sm: 'var(--chakra-sizes-8)',
  md: 'var(--chakra-sizes-9)',
  lg: 'var(--chakra-sizes-10)',
  auto: 'auto',
};

// React Select theme definition
const exoReactSelect: exoReactSelectThemeConfig = {
  baseStyle: {
    container: {},
    menu: {
      borderRadius: '4px !important',
      minWidth: '200px',
    },
    menuPortal: {
      zIndex: 5000,
    },
    option: (isSelected, label, data, isMulti) => {
      const customOption = label === 'Custom';
      const newConnectionOption = data?.label === 'new';

      return {
        backgroundColor: isSelected
          ? 'var(--chakra-colors-purple-100)'
          : 'transparent',
        color: isSelected ? 'white' : 'inherit',
        fontWeight: isSelected ? '500' : 'inherit',
        borderBottom:
          newConnectionOption && '1px solid var(--chakra-colors-gray-300)',
        borderTop:
          (customOption || data?.__isNew__) &&
          '1px solid var(--chakra-colors-gray-300)',
        '&:hover': {
          color: 'inherit',
          backgroundColor: 'var(--chakra-colors-gray-300)',
        },
        ...(isMulti && { padding: '0px', margin: '2px 0px', height: '30px' }),
      };
    },
    dropdownIndicator: {
      paddingLeft: '0px',
      marginInlineStart: '0px!important',
    },
    valueContainer: {
      padding: '0px 0px 0px 8px',
      flexWrap: 'nowrap',
    },
    clearIndicator: {
      padding: '6px 0px',
    },
    menuList: {
      padding: '0px',
      borderRadius: 4,
    },
    multiValue: {
      paddingRight: '0',
      paddingLeft: '0',
    },
    multiValueRemove: isDisabled => ({
      padding: '2px 2px',
      color: isDisabled
        ? 'var(--chakra-colors-gray-500)'
        : 'var(--chakra-colors-gray-800)',
      '&:hover': {
        cursor: 'pointer',
        color: 'var(--chakra-colors-gray-800)',
        backgroundColor: 'var(--chakra-colors-purple-50)',
      },
    }),
    multiValueLabel: isDisabled => ({
      height: '22px',
      alignContent: 'center',
      borderRadius: '4px',
      cursor: 'pointer',
      color: isDisabled
        ? 'var(--chakra-colors-gray-500)'
        : 'var(--chakra-colors-gray-800)',
      backgroundColor: 'var(--chakra-colors-gray-200)',
      paddingLeft: '8px',
    }),
    control: props => {
      const sizeProp = props.selectProps?.size;
      const size = sizeProp ? sizes?.[sizeProp] : sizes.md;

      return {
        cursor: 'text',
        borderRadius: '4px',
        padding: '0px',
        backgroundColor: Boolean(props.selectProps.errorMessage)
          ? 'var(--chakra-colors-red-50)'
          : props.isDisabled
          ? 'var(--chakra-colors-gray-150)'
          : 'var(--chakra-colors-gray-100)',
        borderWidth: '1px',
        borderColor:
          props.menuIsOpen || props.isFocused
            ? 'var(--chakra-colors-purple-400)'
            : Boolean(props.selectProps.errorMessage)
            ? 'var(--chakra-colors-red-200)'
            : props.isDisabled
            ? 'var(--chakra-colors-gray-300)'
            : 'var(--chakra-colors-gray-200)',
        boxShadow:
          props.menuIsOpen || props.isFocused
            ? '0px 0px 4px 0px var(--chakra-colors-purple-50)'
            : 'none',
        minHeight: size,
        height: 'auto',
        width: '100%',
        '&:hover': {
          borderColor: 'var(--chakra-colors-gray-700)',
        },
        '& > .select-form-group__indicators > button': {
          minWidth: '24px!important',
        },
      };
    },
    placeholder: {
      color: 'var(--chakra-colors-gray-600)',
      position: 'absolute',
    },
    groupHeading: {
      color: 'var(--chakra-colors-purple-300)',
      textTransform: 'capitalize',
      fontWeight: '400',
    },
  },
  sizes,
  variants: {
    multiLine: {
      container: {
        maxWidth: 'fit-content',
      },
      multiValue: {
        minWidth: 'undefined',
        width: 'fit-content',
      },
      valueContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        padding: '4px',
      },
      indicatorsContainer: {
        alignItems: 'flex-start',
        '& > button': {
          marginLeft: 'auto',
          paddingTop: '10px',
        },
      },
      clearIndicator: {
        padding: '0px',
      },
      option: {
        borderTop: 'none',
      },
      control: {
        display: 'grid',
        gridTemplateColumns: '1fr 50px',
        alignItems: 'start',
      },
    },
    unstyled: {
      control: {
        borderRadius: '0px',
        backgroundColor: 'transparent',
        borderWidth: '0 0 1px 0',
      },
    },
  },
  defaultProps: {
    size: 'md',
    variant: 'default',
  },
};

export default exoReactSelect;

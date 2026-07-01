import { SystemStyleObject } from '@chakra-ui/react';
import theme from '@boomi/exosphere/dist/css-theme-variables.json';
const variables = theme['lightTheme'];

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
    indicatorsContainer?: SystemStyleObject;
    indicators?: SystemStyleObject;
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

const backgroundSelectedBlue = variables['--exo-color-background-selected'];
const backgroundLightSelectedBlue =
  variables['--exo-color-background-selected-weak'];
const dangerStrong = variables['--exo-color-background-danger-strong'];
const dangerWeak = variables['--exo-color-background-danger-weak'];
const border = variables['--exo-color-border'];
const borderSecondary = variables['--exo-color-border-secondary'];
const hoverWeak = variables['--exo-color-background-action-hover-weak'];
const hoverStrong = variables['--exo-color-background-action-hover'];
const fontColor = variables['--exo-color-font'];
const fontColorSecondary = variables['--exo-color-font-secondary'];
const iconColor = variables['--exo-color-icon'];

// React Select theme definition
const exoReactSelect: exoReactSelectThemeConfig = {
  baseStyle: {
    control: props => {
      const sizeProp = props.selectProps?.size;
      const size = sizeProp ? sizes?.[sizeProp] : sizes.md;

      return {
        cursor: 'text',
        padding: '0px',
        backgroundColor: Boolean(props.selectProps.errorMessage)
          ? dangerWeak
          : 'white',
        borderWidth: '1px',
        borderColor: props.menuIsOpen
          ? backgroundSelectedBlue
          : borderSecondary,
        boxShadow: 'none',
        minHeight: size,
        height: 'auto',
        width: '100%',
        '&:focus': {
          borderColor: Boolean(props.selectProps.errorMessage)
            ? dangerStrong
            : backgroundSelectedBlue,
        },
        '&:hover': {
          borderColor: props.menuIsOpen ? backgroundSelectedBlue : hoverStrong,
          '&:focus': {
            borderColor: Boolean(props.selectProps.errorMessage)
              ? dangerStrong
              : backgroundSelectedBlue,
          },
        },
        '& > .select-form-group__indicators > button': {
          minWidth: '24px!important',
        },
        '& .select-form-group__single-value': {
          color: fontColor,
        },
      };
    },

    container: {},
    menu: {
      borderRadius: '4px !important',
      minWidth: '200px',
      bg: 'white',
    },
    menuPortal: {
      zIndex: 5000,
      bg: 'white',
    },
    option: (isSelected, label, data, isMulti) => {
      const customOption = label === 'Custom';
      const newConnectionOption = data?.label === 'new';
      return {
        backgroundColor: 'white',
        '& .chakra-icon': {
          color: iconColor,
        },
        ...(isSelected && {
          backgroundColor: backgroundLightSelectedBlue,
          '& .chakra-icon': {
            color: backgroundSelectedBlue,
          },
        }),
        color: fontColor,
        borderBottom: newConnectionOption && '1px solid',
        borderBottomColor: hoverWeak,
        borderTop: (customOption || data?.__isNew__) && '1px solid ',
        borderTopColor: hoverWeak,
        '&:hover': {
          backgroundColor: hoverWeak,
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
      padding: '0px',
      marginInlineStart: '0px',
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
      backgroundColor: 'white',
      padding: '2px 2px',
      color: isDisabled ? fontColorSecondary : hoverStrong,
      borderRadius: '0px 4px 4px 0px',
      borderRight: '1px solid',
      borderTop: '1px solid',
      borderBottom: '1px solid',
      borderColor: border,
      '&:hover': {
        cursor: 'pointer',
        color: hoverStrong,
        backgroundColor: 'white',
      },
    }),
    multiValueLabel: isDisabled => ({
      height: '22px',
      alignContent: 'center',
      borderRadius: '4px 0px 0px 4px',
      borderLeft: '1px solid',
      borderTop: '1px solid',
      borderBottom: '1px solid',
      borderColor: border,
      cursor: 'pointer',
      color: isDisabled ? fontColorSecondary : fontColor,
      backgroundColor: 'white',
      paddingLeft: '8px',
    }),

    placeholder: {
      color: fontColorSecondary,
      position: 'absolute',
    },
    groupHeading: {
      color: hoverStrong,
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
          minWidth: '24px!important',
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
        backgroundColor: 'white',
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

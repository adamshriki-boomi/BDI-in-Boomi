import { useTheme } from '@chakra-ui/react';

export const useSelectFormStyles = chakra => {
  const theme = useTheme();
  const reactSelectTheme: Record<any, any> = theme.components.ReactSelect;
  return {
    container: styles => {
      return {
        ...styles,
        ...reactSelectTheme?.baseStyle.container,
      };
    },
    menu: styles => {
      return {
        ...styles,
        ...reactSelectTheme?.baseStyle.menu,
      };
    },
    menuPortal: (provider, _) => {
      return {
        ...provider,
        ...reactSelectTheme?.baseStyle.menuPortal,
      };
    },
    option: (styles, { isSelected, label, data, isMulti }) => {
      return {
        ...styles,
        ...reactSelectTheme?.baseStyle.option(isSelected, label, data, isMulti),
      };
    },
    dropdownIndicator: styles => {
      return {
        ...styles,
        ...reactSelectTheme?.baseStyle.dropdownIndicator,
      };
    },
    valueContainer: providedStyles => {
      return {
        ...providedStyles,
        ...reactSelectTheme?.baseStyle.valueContainer,
        padding: chakra ? '0px 0px 0px 8px!important' : '0px!important',
      };
    },
    clearIndicator: styles => {
      return {
        ...styles,
        ...reactSelectTheme?.baseStyle.clearIndicator,
      };
    },
    menuList: providedStyles => {
      return {
        ...providedStyles,
        ...reactSelectTheme?.baseStyle.menuList,
      };
    },
    multiValue: styles => {
      return {
        ...styles,
        ...reactSelectTheme?.baseStyle.multiValue,
      };
    },
    multiValueRemove: (styles, { isDisabled }) => {
      return {
        ...styles,
        ...reactSelectTheme?.baseStyle.multiValueRemove(isDisabled),
      };
    },
    multiValueLabel: (styles, { isDisabled }) => {
      return {
        ...styles,
        ...reactSelectTheme?.baseStyle.multiValueLabel(isDisabled),
      };
    },
    control: (providedStyles, props) => {
      return {
        ...providedStyles,
        ...reactSelectTheme?.baseStyle.control(props),
        borderRadius: !chakra ? '0px' : '4px',
        borderWidth: !chakra ? '0 0 1px 0 !important' : '1px',
        ...(!chakra && { backgroundColor: 'white', boxShadow: 'none' }),
      };
    },
    placeholder: providedStyles => {
      return {
        ...providedStyles,
        ...reactSelectTheme?.baseStyle.placeholder,
      };
    },
    groupHeading: providedStyles => {
      return {
        ...providedStyles,
        ...reactSelectTheme?.baseStyle.groupHeading,
      };
    },
  };
};

export const useMultiLinerSelectStyles = () => {
  const baseSelectStyle = useSelectFormStyles(true);

  const style = {
    ...baseSelectStyle,
    multiValue: styles => ({
      ...baseSelectStyle.multiValue(styles),
      minWidth: undefined,
      width: 'fit-content',
    }),
    valueContainer: styles => ({
      ...baseSelectStyle.valueContainer(styles),
      display: 'flex',
      flexWrap: 'wrap',
      padding: '4px',
    }),
    indicatorsContainer: styles => ({
      ...styles,
      alignItems: 'flex-start',
      '& > button': {
        marginLeft: 'auto',
        paddingTop: '10px',
      },
    }),
    clearIndicator: styles => ({
      ...baseSelectStyle.clearIndicator(styles),
      padding: '0px!important',
    }),
    option: (styles, props) => ({
      ...baseSelectStyle.option(styles, props),
      borderTop: 'none',
    }),
    container: styles => ({
      ...baseSelectStyle.container(styles),
      maxLWidth: 'fit-content',
    }),
    control: (styles, props) => ({
      ...baseSelectStyle.control(styles, props),
      display: 'grid',
      gridTemplateColumns: '1fr 50px',
      alignItems: 'start',
    }),
  };
  return style;
};

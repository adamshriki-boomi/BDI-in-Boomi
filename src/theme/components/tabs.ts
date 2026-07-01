import { ComponentStyleConfig } from '@chakra-ui/theme';

const Tabs: ComponentStyleConfig = {
  baseStyle: {},
  defaultProps: {
    colorScheme: 'purple',
    size: 'sm',
    variant: 'line',
  },
  variants: {
    line: {
      tab: {
        h: '48px',
        borderRadius: '4px 4px 0px 0px',

        //I removed it because it was causing a jump when focused. Can't find a reason for it to be here.
        // pb: '8px',
        _focus: {
          boxShadow: 'none',
          //Same
          // mb: 0,
        },
        _selected: {
          bg: 'var(--Opacity-Puprle-050-OP25, #EFEDF7)',
          fontWeight: 'medium',
        },
        _hover: {
          bg: 'background-secondary',
          color: 'gray.700',
          // fontWeight: 'medium',
          borderBottom: '2px solid',
          borderBottomColor: 'gray.200',
        },
      },
      tabpanel: {
        pt: '12px!important',
        p: 0,
      },
      tabpanels: {
        p: 0,
      },
    },
    wizard: {
      root: {
        display: 'grid',
        alignItems: 'center',
        overflow: 'hidden',
        gridTemplateRows: 'auto 1fr',
        gridGap: '4',
      },
      tablist: {
        borderBottom: 0,
        justifyContent: 'center',
        '& .tab-line': {
          opacity: 0.5,
          borderColor: 'gray.600',
        },
        '& .tab-line-selected': {
          opacity: 1,
          borderColor: 'primary!important',
        },
      },
      tab: {
        '& .tab-index': {
          borderColor: 'gray.600',
        },
        _selected: {
          color: 'primary',
          fontWeight: '400!important',
          '& .tab-index': {
            borderColor: 'gray.500',
          },
        },
        _disabled: {
          color: 'gray.600',
          opacity: 1,
        },
        borderBottom: 0,
        py: 3,
      },
      tabpanels: {
        height: 'full',
        overflow: 'hidden',
      },
      tabpanel: {
        height: 'full',
        pt: 0,
      },
    },
  },
};

export default Tabs;

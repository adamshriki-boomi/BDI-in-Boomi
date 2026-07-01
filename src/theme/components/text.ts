import { ComponentStyleConfig } from '@chakra-ui/theme';

const Text: ComponentStyleConfig = {
  baseStyle: {},
  defaultProps: {},
  variants: {
    textEllipsis: {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
  },
};

export default Text;

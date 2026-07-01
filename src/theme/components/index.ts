import Alert from './alert';
import Button from './button';
import Checkbox from './checkbox';
import Drawer from './drawer';
import exoTag from './exoTag';
import FormError from './FormError';
import FormLabel from './FormLabel';
import Input from './input';
import Link from './link';
import Modal from './modal';
import NumberInput from './NumberInput';
import Popover from './popover';
import Radio from './radio';
import reactSelect from './reactSelect';
import Switch from './switch';
import Tabs from './tabs';
import Text from './text';

// When adding new components, component variations, sizes, colors and other theme foundations
// https://chakra-ui.com/docs/styled-system/theming/advanced#theme-typings
// Run ==> npm run gen:theme-typings

const components = {
  Button,
  Checkbox,
  Switch,
  Tabs,
  Popover,
  Modal,
  Input,
  Text,
  FormLabel,
  FormError,
  NumberInput,
  Alert,
  Link,
  Radio,
  Drawer,
  Tag: exoTag,
  ReactSelect: reactSelect,
};

export default components;

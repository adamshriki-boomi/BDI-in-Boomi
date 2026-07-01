import Drawer from './drawer';
import exoAlert from './exoAlert';
import exoButton from './exoButton';
import exoCheckbox from './exoCheckbox';
// import exoFormControl from './exoFormHelperText';
import exoFormLabel from './exoFormLabel';
import exoInput from './exoInput';
import exoRadio from './exoRadio';
import exoReactSelect from './exoReactSelect';
import exoSwitch from './exoSwitch';
import exoTabs from './exoTabs';
import exoTag from './exoTag';
import FormError from './FormError';
import Link from './link';
import Modal from './modal';
import NumberInput from './NumberInput';
import Popover from './popover';
import Text from './text';

const exoComponents = {
  Button: exoButton,
  Checkbox: exoCheckbox,
  Switch: exoSwitch,
  Tabs: exoTabs,
  Popover,
  Modal,
  Input: exoInput,
  Text,
  FormLabel: exoFormLabel,
  // FormControl: exoFormControl,
  FormError,
  NumberInput,
  Alert: exoAlert,
  Link,
  Radio: exoRadio,
  Drawer,
  Tag: exoTag,
  ReactSelect: exoReactSelect,
  // FormControl: exoFormControl,
};

export default exoComponents;

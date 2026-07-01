import { ControlList, InputControl } from 'api/types';
import { Flex } from 'components';
import { KeyVal } from 'components/Form/components/KeyVal';
import { Provider } from 'components/Form/components/Providers';
import {
  GenericLink,
  RegularText,
  SmallTitle,
  Title,
} from 'components/Form/components/Title';
import { FormMetadata } from 'components/Form/FormControls';
import { AWSConnection } from 'containers/Connections/components/ConnectionComponents/AWS';
import { GCloudConnection } from 'containers/Connections/components/ConnectionComponents/GCloud';
import React from 'react';
import { GenericComplexField } from './components';
import { CollapseForm } from './components/CollapseForm';
import { Content } from './components/Content';
import { Definition } from './components/Definition';
import { GenericSsh } from './components/GenericSsh';
import { Input } from './components/Input';
import { KeyFilePathComponent } from './components/KeyFilePath';
import { KeyValueList } from './components/KeyValueList';
import { Radio } from './components/Radio';
import { RiveryCheckbox } from './components/RiveryCheckbox';
import { RiverySwitch } from './components/RiverySwitch';
import { Secret } from './components/Secret';
import { SelectSingle } from './components/SelectSingle';
import { TagInput } from './components/TagInput';
import { UploadFile } from './components/UploadFile';
import { DateRangeSelect, SplitIntervals } from './genericS2T/DateRange';
import {
  ExtractMethodSelect,
  IncrementalFieldSelect,
  IncrementalTypeInput,
} from './genericS2T/ExtactMethod';

export interface FormControl extends InputControl {
  api?: any;
}

export type ControlResolverProps = {
  control: FormControl;
  api: any;
  formMetadata?: FormMetadata;
};
export function ControlResolver({
  control,
  api,
  formMetadata,
}: ControlResolverProps) {
  const { label, ...rest } = control;
  const required =
    rest?.required === true ? 'This field is required' : rest?.required;
  const ControlComponent = controlsMap[control.type];
  // a control may include  a controls[] - in this case the api prop is required
  // to be passed down as the api prop rather than spread it into the control
  // const apiMethods = Array.isArray(control?.controls) ? { api } : api;

  return ControlComponent ? (
    <Flex flexDir="column" flexGrow={1}>
      <ControlComponent
        label={control.display_name}
        api={api}
        {...rest}
        required={required}
        formMetadata={formMetadata}
      />
      <Definition>{label}</Definition>
    </Flex>
  ) : null;
}

const controlsMap = {
  [ControlList.TITLE]: Title,
  [ControlList.SMALL_TITLE]: SmallTitle,
  [ControlList.PLAIN_TEXT]: RegularText,
  [ControlList.KEY_VAL]: KeyVal,
  [ControlList.INPUT_TEXT]: Input,
  [ControlList.INPUT_EMAIL]: Input,
  [ControlList.INPUT_NUMBER]: Input,
  [ControlList.INPUT_PASSWORD]: Input,
  [ControlList.INPUT_COMPLEXED]: GenericComplexField,
  [ControlList.SELECT_SINGLE]: SelectSingle,
  [ControlList.UPLOAD_FILE]: UploadFile,
  [ControlList.PROVIDER]: Provider,
  [ControlList.COLLAPSE]: CollapseForm,
  [ControlList.PASSWORD]: Secret,
  [ControlList.KEYVALUE]: KeyValueList,
  [ControlList.RADIO]: Radio,
  [ControlList.CONTENT]: Content,
  [ControlList.TAGINPUT]: TagInput,
  [ControlList.GENERIC_SSH]: GenericSsh,
  [ControlList.AWS]: AWSConnection,
  [ControlList.GCLOUD]: GCloudConnection,
  [ControlList.BQ_SRC]: GCloudConnection,
  [ControlList.SWITCH]: RiverySwitch,
  [ControlList.CHECKBOX]: RiveryCheckbox,
  [ControlList.LINK]: GenericLink,
  [ControlList.KEY_FILE_PATH]: KeyFilePathComponent,
  [ControlList.EXTRACT_METHOD]: ExtractMethodSelect,
  [ControlList.INCREMENTAL_FIELD]: IncrementalFieldSelect,
  [ControlList.INCREMENTAL_TYPE]: IncrementalTypeInput,
  [ControlList.DATE_RANGE]: DateRangeSelect,
  [ControlList.SPLIT_INTERVALS]: SplitIntervals,
};

export const hasControl = (type: ControlList | string) => !!controlsMap[type];

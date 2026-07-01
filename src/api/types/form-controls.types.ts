export enum ControlList {
  TITLE = 'title',
  SMALL_TITLE = 'small_title',
  PLAIN_TEXT = 'plain_text',
  KEY_VAL = 'key_val',
  INPUT_TEXT = 'text',
  INPUT_EMAIL = 'email',
  INPUT_NUMBER = 'number',
  INPUT_PASSWORD = 'input_password',
  INPUT_COMPLEXED = 'complex_input',
  PASSWORD = 'password',
  CHECKBOX = 'checkbox',
  SWITCH = 'switch',
  UPLOAD_FILE = 'file',
  PROVIDER = 'connect_with',
  COLLAPSE = 'collapse',
  KEYVALUE = 'key-value',
  RADIO = 'radio',
  SELECT_SINGLE = 'list_single_options',
  CONTENT = 'content',
  TAGINPUT = 'tag-input',
  GENERIC_SSH = 'generic_ssh',
  AWS = 'aws_component',
  GCLOUD = 'gcloud_component',
  BQ_SRC = 'bq_src_component',
  LINK = 'link',
  KEY_FILE_PATH = 'key_file_path',
  EXTRACT_METHOD = 'extract_method',
  INCREMENTAL_FIELD = 'incremental_field',
  INCREMENTAL_TYPE = 'incremental_type',
  DATE_RANGE = 'date_range',
  SPLIT_INTERVALS = 'split_time_intervals',
}

export interface InputControl {
  type: ControlList | string;
  name?: string; // control name
  display_name?: string;
  label?: string;
  placeholder?: string;
  required?: boolean | string;
  width?: number;
  help?: string;
  [key: string]: any;
}

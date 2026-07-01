import { action } from '@storybook/addon-actions';
import { Button } from 'components';
import React from 'react';
import { useForm } from 'react-hook-form';
import { UploadFile, UploadLocalFile } from './UploadFile';

export default {
  title: 'FormRenderer/UploadFile',
  component: UploadFile,
} as any;

const Template = ({ filePath = undefined, ...props }) => {
  const { handleSubmit, ...useFormApi } = useForm({
    defaultValues: {
      [props.name]: filePath,
    },
  });

  const onSubmit = formData => {
    action('formData')(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <UploadFile {...(props as any)} api={useFormApi as any} />
      <Button type="submit" variant="solid" colorScheme="teal" mt="4">
        submit
      </Button>
    </form>
  );
};

export const Default = Template.bind({});
Default.args = {
  name: 'python_file',
  label: 'python file',
  file_type: 'py',
};

export const WithFile = Template.bind({});
WithFile.args = {
  name: 'python_file',
  label: 'python file',
  filePath: 'demo_file.py',
};

const TemplateLocal = props => {
  return <UploadLocalFile {...props} />;
};

export const DefaultTemplateLocal = TemplateLocal.bind({});
DefaultTemplateLocal.args = {
  onChange: action('templateLocal'),
  fileType: 'png',
};

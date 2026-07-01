import { action } from '@storybook/addon-actions';
import React, { useState } from 'react';
import { EditableText as EditableTextComponent } from './EditableText';

export default {
  title: 'containers/RiverBox',
  component: EditableTextComponent,
} as any;

const Wrapper = ({ children }) => {
  return <div>{children}</div>;
};

const Template = args => {
  const [text, setText] = useState(args.text);
  const onChange = (text: string) => {
    action('Text Changed')(text);
    setText(text);
  };
  return (
    <Wrapper>
      <EditableTextComponent text={text} onChange={onChange} />
    </Wrapper>
  );
};

export const EditableText = Template.bind({});
EditableText.args = {
  text: 'Rivers Group',
};

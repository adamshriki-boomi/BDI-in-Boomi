import { InputGroup, InputRightElement } from '@chakra-ui/react';
import { Flex, Icon, IconButton, RenderGuard } from 'components';
import { useState } from 'react';
import { MdClear } from 'react-icons/md';
import { Input, InputProps } from './Input';

export function InputSearch({ onSearch, ...props }: Partial<InputProps>) {
  const [value, setValue] = useState(props?.value || '');
  const handleOnChange = searchValue => {
    setValue(searchValue);
    onSearch(searchValue);
  };

  return (
    <Flex alignItems="center" position="relative" w="100%">
      <InputGroup>
        <Input
          name="search"
          hideLabel={true}
          placeholder="Search..."
          onChange={ev => handleOnChange(ev.currentTarget.value)}
          onKeyDown={(ev: KeyboardEvent) => {
            isEsc(ev) && handleOnChange('');
          }}
          value={value}
          pl="3"
          pr="8"
          flexGrow="1"
          {...props}
        />
        <RenderGuard condition={value || props?.value}>
          <InputRightElement>
            <IconButton
              aria-label={value ? 'clear filter' : ''}
              position="absolute"
              right={0}
              variant="transparent"
              onClick={() =>
                value
                  ? handleOnChange('')
                  : props.onChange({ target: { value: '' } })
              }
              icon={<Icon as={MdClear} boxSize={4} />}
            />
          </InputRightElement>
        </RenderGuard>
      </InputGroup>
    </Flex>
  );
}

const isEsc = (ev: KeyboardEvent) => ev.key === 'Escape';

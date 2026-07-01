import { Flex, RenderGuard } from 'components';
import { CustomSelectForm, InputLabel } from 'components/Form';
import { InputNumber } from 'components/Form/components/Input/InputNumber';
import { useEffectOnce } from 'react-use';
import { compare } from 'utils/array.utils';
import { useTableSettings } from '../form.hooks';
import { DefaultSettings } from './DefaultSourceSettings';

export function PostgresSettings({ sourceDefinition }) {
  return (
    <DefaultSettings
      sourceDefinition={sourceDefinition}
      additionalSourceSettingsTop={<TimeStamp />}
    />
  );
}

const timestampOptions = [
  { label: 'With Timezone', value: true },
  { label: 'Without Timezone', value: false },
];

function TimeStamp() {
  const { value: includeTimezone, update } = useTableSettings(
    'additional_source_settings.include_timezone',
  );

  const { value: timeZoneOffset, update: updateOffset } = useTableSettings(
    'additional_source_settings.timezone_offset',
  );

  useEffectOnce(() => {
    if (includeTimezone === null) {
      update(false);
    }
  });
  const value = timestampOptions.find(compare('value', includeTimezone));
  return (
    <Flex flexDir="column" w="450px" gap={2}>
      <InputLabel variant="semibold" label="Timestamp Format" />
      <CustomSelectForm
        options={timestampOptions}
        controlId="timestamp"
        chakra
        isMulti={false}
        label="The SQL standard allows you to choose between timestamps with or without a time zone. Adjust the Time Zone Offset UTC field to specify the offset (in hours) from UTC."
        onChange={({ value }) => update(value)}
        value={value}
      />
      <RenderGuard
        condition={Boolean(includeTimezone)} // display offset only if timezone (boolean) is selected
      >
        <Flex color="font-secondary" alignItems="center" gap={2}>
          Time zone offset UTC
          <InputNumber
            name="additional_source_settings.timezone_offset"
            inputProps={{ min: -12, max: 12 }}
            fieldHeight="30px"
            w="60px"
            value={timeZoneOffset as number}
            onChange={updateOffset}
          />
        </Flex>
      </RenderGuard>
    </Flex>
  );
}

import { ExInput } from '@boomi/exosphere/dist/react/input';
import { ExMenuItem } from '@boomi/exosphere/dist/react/menu-item';
import { ExSelect } from '@boomi/exosphere/dist/react/select';
import MultiEmailsCreatableSelect from 'components/Form/components/MultiEmailsComponent';
import { useGetUsersQuery } from 'containers/Settings/Users/users.query';
import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import '../index.scss';

export interface NotificationFormData {
  timeframe: string;
  thresholdType: string;
  thresholdValue: number;
  recipients: string[];
}

interface NotificationFormProps {
  isPreset: boolean;
  isPayg: boolean;
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export function NotificationForm({ isPreset, isPayg }: NotificationFormProps) {
  const { control, watch, trigger, setValue } =
    useFormContext<NotificationFormData>();
  const thresholdType = watch('thresholdType');
  const timeframe = watch('timeframe');

  // Fetch users for recipients dropdown
  const { data: users = [] } = useGetUsersQuery(null);

  // Transform users to combobox options
  const userOptions = useMemo(() => {
    return users
      .filter(user => user.user_email)
      .map(user => ({
        value: user.user_email,
        label: user.user_email,
      }));
  }, [users]);

  const timeframeOptions = useMemo<SelectOption[]>(() => {
    const options: SelectOption[] = [
      {
        label: 'Daily',
        value: 'Daily',
        disabled: thresholdType !== 'Absolute',
      },
      {
        label: 'Monthly',
        value: 'Monthly',
        disabled: thresholdType !== 'Absolute',
      },
      { label: 'Total', value: 'Total', disabled: isPayg },
    ];

    return options;
  }, [isPayg, thresholdType]);

  const thresholdTypeOptions = useMemo<SelectOption[]>(
    () => [
      { label: 'Absolute', value: 'Absolute' },
      {
        label: 'Percentage',
        value: 'Percentage',
        disabled: isPayg || timeframe !== 'Total',
      },
    ],
    [timeframe, isPayg],
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
      }}
    >
      <Controller
        name="timeframe"
        control={control}
        rules={{ required: 'Timeframe is required' }}
        render={({ field, fieldState }) => (
          <ExSelect
            label="Timeframe"
            selected={field.value}
            onChange={(e: CustomEvent) => {
              const newValue = e.detail?.value;
              if (newValue !== undefined && newValue !== null) {
                setValue('timeframe', newValue, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
                field.onChange(newValue);
              }
            }}
            disabled={isPreset}
            invalid={!!fieldState.error}
            errorMsg={fieldState.error?.message}
            hideClearIcon
          >
            {timeframeOptions.map(option => (
              <ExMenuItem
                key={option.value}
                value={option.value}
                className={option.disabled ? 'disabled-menu-item' : ''}
                {...(option.disabled !== undefined && {
                  disabled: option.disabled,
                })}
              >
                {option.label}
              </ExMenuItem>
            ))}
          </ExSelect>
        )}
      />

      <Controller
        name="thresholdType"
        control={control}
        rules={{ required: 'Threshold type is required' }}
        render={({ field, fieldState }) => (
          <ExSelect
            label="Threshold Type"
            selected={field.value}
            onChange={(e: CustomEvent) => {
              const newValue = e.detail?.value;
              if (newValue !== undefined && newValue !== null) {
                setValue('thresholdType', newValue, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
                field.onChange(newValue);
              }
            }}
            disabled={isPreset}
            invalid={!!fieldState.error}
            hideClearIcon
          >
            {thresholdTypeOptions.map(option => (
              <ExMenuItem
                key={option.value}
                value={option.value}
                className={option.disabled ? 'disabled-menu-item' : ''}
                {...(option.disabled !== undefined && {
                  disabled: option.disabled,
                })}
              >
                {option.label}
              </ExMenuItem>
            ))}
          </ExSelect>
        )}
      />

      <Controller
        name="thresholdValue"
        control={control}
        rules={{
          required: 'Threshold value is required',
          min: { value: 1, message: 'Enter a value above 1' },
          max:
            thresholdType === 'Percentage'
              ? { value: 100, message: 'Percentage cannot exceed 100' }
              : undefined,
        }}
        render={({ field, fieldState }) => {
          return (
            <ExInput
              type="number"
              step="any"
              label="Threshold value"
              value={String(field.value)}
              onInput={(e: CustomEvent) => {
                const target = e.target as HTMLInputElement;
                const numValue = Number(target.value);
                field.onChange(isNaN(numValue) ? 0 : numValue);
              }}
              disabled={isPreset}
              invalid={!!fieldState.error}
              errorMsg={fieldState.error?.message}
            />
          );
        }}
      />

      {/* Recipients - MultiEmailsCreatableSelect */}
      <Controller
        name="recipients"
        control={control}
        rules={{
          validate: (value: string[] | string) => {
            // Convert string to array for validation if needed
            const recipientsArray = Array.isArray(value)
              ? value
              : value
              ? (value as string).split(',').filter(Boolean)
              : [];
            // Only show "required" validation error if there are no recipients at all
            if (recipientsArray.length === 0) {
              return 'Enter at least 1 recipient';
            }
            // Validate email format only if there are recipients
            const invalidEmails = recipientsArray.filter(
              email => !isValidEmail(email.trim()),
            );
            if (invalidEmails.length > 0) {
              return 'All recipients must be valid email addresses';
            }
            return true;
          },
        }}
        render={({ field, fieldState }) => {
          // Convert array to comma-separated string for MultiEmailsCreatableSelect
          const stringValue = Array.isArray(field.value)
            ? field.value.join(',')
            : (field.value as string) || '';

          // Create a field object that works with MultiEmailsCreatableSelect
          const emailsField = {
            value: stringValue,
            onChange: (newValue: string) => {
              // Convert comma-separated string back to array
              const arrayValue = newValue
                ? newValue
                    .split(',')
                    .map(e => e.trim())
                    .filter(Boolean)
                : [];
              field.onChange(arrayValue);
              // Trigger validation to clear error when recipients are added
              trigger('recipients');
            },
          };

          // Use the component's internal state management (without custom mode)
          // Override the menu visibility to show the dropdown with options
          return (
            <MultiEmailsCreatableSelect
              label="Recipients"
              emailsField={emailsField}
              options={userOptions}
              validationMessage={fieldState.error?.message}
              disabled={isPreset}
              helpText="Add existing email or type a new email address."
              customStyles={{
                menu: (currentStyle: any) => ({
                  ...currentStyle,
                  visibility: 'visible',
                }),
                control: (currentStyle: any) => ({
                  ...currentStyle,
                  minHeight: 'auto',
                  height: 'auto',
                }),
                valueContainer: (currentStyle: any) => ({
                  ...currentStyle,
                  padding: '4px 8px',
                }),
              }}
            />
          );
        }}
      />
    </div>
  );
}

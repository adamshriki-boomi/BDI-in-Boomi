import { Box, Center, HStack, RenderGuard, Text } from 'components';
import RiveryButton from 'components/Buttons/RiveryButton';
import { RiveryDatePicker } from 'components/Form/components/RiveryDatePicker';
import { CustomSelectForm } from 'components/Form/components/SelectFormGroup/CustomSelectForm';
import { TableFilter } from 'components/RiveryTable/TableFilter';
import { useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { calculateTime } from 'utils/date.utils';
import { DEFAULT_TIME_RANGE } from './ActivitiesGrid';
import { commonSelectStyle } from './components/helpers';
import './Deployments.scss';
import { ViewTypes } from './packages.query';

const packageStatusOptions = [
  {
    label: 'Deployed',
    value: { deployment_status: 'succeeded' },
  },
  {
    label: 'Failed to deploy',
    value: { deployment_status: 'failed' },
  },
  {
    label: 'Reverted',
    value: { revert_status: 'succeeded' },
  },
  {
    label: 'Failed to revert',
    value: { revert_status: 'failed' },
  },
];

function returnUndefinedForEmpty(value) {
  return value.length === 0 ? undefined : value;
}

export function SearchComponent({
  type,
  minW,
  inlineView = false,
  allDisabled = false,
}) {
  const datePickerRef = useRef<any>(null);
  const isPackagesView = type === ViewTypes.PACKAGES;
  const formApi = useFormContext();
  const { reset, setValue } = formApi;
  const activity = formApi.watch('activity');

  const filterPackageStatus = useCallback(
    value => {
      if (!Array.isArray(value)) {
        const newValue = activity.package_status?.filter(
          ({ value: status }) =>
            JSON.stringify(status) !== JSON.stringify(value),
        );
        return setValue('activity', {
          ...activity,
          package_status: returnUndefinedForEmpty(newValue),
        });
      }
      return setValue('activity', {
        ...activity,
        package_status: returnUndefinedForEmpty(value),
      });
    },
    [activity, setValue],
  );

  return (
    <HStack alignItems="end" minWidth={minW}>
      {!inlineView ? (
        <Box flex={1}>
          <RenderGuard condition={!isPackagesView}>
            <Text fontSize="xs" color="purple.400">
              Package Name
            </Text>
          </RenderGuard>
          <TableFilter
            api={formApi}
            name={`${type}.package_name`}
            isDisabled={allDisabled}
            chakra
          />
        </Box>
      ) : null}
      {!isPackagesView && (
        <>
          <Box flex={1} pr={0.25} maxW={inlineView && 250}>
            <CustomSelectForm
              customStyles={commonSelectStyle}
              label="Package Status"
              controlId="package_status"
              options={packageStatusOptions}
              name="package_status"
              updateFilter={filterPackageStatus}
              filtersOn={activity?.package_status?.length > 0}
              isDisabled={allDisabled}
            />
          </Box>
          <Box w={inlineView ? 250 : 310}>
            <RiveryDatePicker
              ref={datePickerRef}
              label="Last Modified"
              defaultValue={{
                label: DEFAULT_TIME_RANGE,
                value: calculateTime('D', 7),
              }}
              setPickerValue={value =>
                setValue('activity', {
                  ...activity,
                  date_range: { time: value.value, label: value.label },
                })
              }
            />
          </Box>
        </>
      )}

      <Center>
        <RiveryButton
          ml={0.5}
          label="Clear"
          variant="text"
          onClick={() => {
            datePickerRef?.current?.setDefault();
            reset();
          }}
          disabled={allDisabled}
        />
      </Center>
    </HStack>
  );
}

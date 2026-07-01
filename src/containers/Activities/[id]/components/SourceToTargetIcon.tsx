import { RiverTypes } from 'api/types';
import { ArrowNarrowRight, Center, FlexProps, Icon } from 'components';
import { DataSourceIcon } from 'containers/Activities/components/ActivitiesColumns';

interface SourceToTargetIconProps {
  riverType: RiverTypes | any;
  sourceIcon: string;
  targetIcon: string;
  allowedTypes?: any[];
}
export const SourceToTargetIcon = ({
  riverType,
  sourceIcon,
  targetIcon,
  allowedTypes = [],
}: SourceToTargetIconProps) => {
  return (
    <>
      <DSIconWrap>
        <DataSourceIcon type={sourceIcon} boxWidth={14} />
      </DSIconWrap>
      {[...allowedIcons, ...allowedTypes].includes(riverType) ? (
        <>
          <Icon as={ArrowNarrowRight} color="brand" boxSize="4" mx={2} />
          <DSIconWrap>
            <DataSourceIcon type={targetIcon} boxWidth={14} />
          </DSIconWrap>
        </>
      ) : null}
    </>
  );
};
const allowedIcons = [RiverTypes.SOURCE_TO_TARGET];

function DSIconWrap({ ...props }: FlexProps) {
  return (
    <Center
      boxSize="70px"
      py={1}
      px={2}
      borderRadius={7}
      bg="white"
      shadow="0px 3.891px 5.837px -0.973px rgba(0, 0, 0, 0.10), 0px 1.946px 3.891px -1.946px rgba(0, 0, 0, 0.05)"
      {...props}
    />
  );
}

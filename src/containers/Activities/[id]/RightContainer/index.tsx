import { RiverTypes } from 'api/types';
import { ActivityPageTypes, useActivityPageType } from '../../store';
import { ActionRiverActivity } from './Action';
import { ActivityForLogic } from './ActivityForLogic';
import SourceToTarget from './SourceToTarget';
import { SourceToTargetSubRivers } from './SourceToTargetSubRivers';

const ActivityRenderer = {
  [ActivityPageTypes.SUB_RIVERS]: SourceToTargetSubRivers,
  [ActivityPageTypes.MULTI]: SourceToTarget,
  [ActivityPageTypes.SOURCE_TO_TARGET]: SourceToTarget,
  [RiverTypes.LOGIC]: ActivityForLogic,
  [RiverTypes.ACTION]: ActionRiverActivity,
};
export function RightContainer() {
  const { activityPageType } = useActivityPageType();
  const Component = ActivityRenderer?.[activityPageType];
  // <div /> - the conditional splitter cannot work with null render
  return Component ? <Component /> : <div />;
}

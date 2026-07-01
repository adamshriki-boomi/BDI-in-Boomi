import { RiverDefinitions, RiverTypes } from 'api/types';
import { IRiverTypes } from 'modules/SourceTarget/store';

export type SourcesDefinition = {
  source: string;
  target: string;
};
const sttTypes = [
  RiverTypes.SOURCE_TO_FZ,
  RiverTypes.SOURCE_TO_TARGET,
  IRiverTypes.SOURCE_TO_TARGET,
];

export const shouldAllowNewStt = (
  riverType: RiverTypes,
  definitions: RiverDefinitions,
  // sources: SourcesDefinition,
) => {
  return sttTypes.includes(riverType) && Boolean(definitions?.is_api_v2);
  // ? isAllowedSource(sources.source) && isAllowedTarget(sources.target)
  // : false;
};

// HELPERS
/**
 * set sources and targets to allow displaying the new UI for STT
 */
// const allowedSources = ['MySQL'];
// const allowedTargets = ['Snowflake'];
// const createFilter = (allowed: string[]) => (source: string) =>
// allowed.includes(source);
// const isAllowedSource = createFilter(allowedSources);
// const isAllowedTarget = createFilter(allowedTargets);

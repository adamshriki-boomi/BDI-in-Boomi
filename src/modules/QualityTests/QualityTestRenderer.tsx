import { BlockTypes } from 'api/types';

type QualityTestRendererProps = {
  blockType: BlockTypes;
  children: JSX.Element;
};

const supportedSteps = [BlockTypes.SQL];
export function QualityTestRenderer({
  blockType,
  children,
}: QualityTestRendererProps) {
  return supportedSteps.includes(blockType) ? children : null;
}

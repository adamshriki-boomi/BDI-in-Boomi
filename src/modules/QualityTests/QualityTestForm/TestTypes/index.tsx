import { UseFormReturn } from 'react-hook-form';
import { TestTypeId } from '../../store';
import { NotNullTest } from './NotNullTest';
import { UniqueValuesTest } from './UniqueValuesTest';

const TestTypeRenderers = {
  [TestTypeId.NOT_NULL]: NotNullTest,
  [TestTypeId.UNIQUE]: UniqueValuesTest,
};

interface TestTypeRendererProps extends Record<string, any> {
  type: TestTypeId | string;
  api: Partial<UseFormReturn<any>>;
  options: any[];
}
export const TestTypeRenderer = ({ type, ...props }: TestTypeRendererProps) => {
  const Component = TestTypeRenderers?.[type];
  return Component ? <Component {...props} /> : null;
};

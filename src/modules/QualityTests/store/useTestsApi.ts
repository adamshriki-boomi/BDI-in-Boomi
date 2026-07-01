import { DataQualityTestMeta, ILogicStep } from 'api/types';
import { IQualityTestCreatePayload } from 'modules';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRiver, useRiverActions } from 'store/river';
import { getOId, getRefId } from 'utils/api.sanitizer';
import { compare, merge, pluck } from 'utils/array.utils';
import { TestTableType } from '../QualityTestsGrid/TestsGrid';
import {
  convertOIDarrToString,
  useCreateQualityTestMutation,
  useGetTestsQuery,
} from './qualityTests.query';
import { IQualityTest } from './qualityTests.types';
import { useGetTestTypesQuery } from './qualityTestTypes.query';
import { IQualityTestType } from './qualityTestTypes.types';

export interface TestsApiHandlers {
  addOne: (id: string) => void;
  removeOne: (id: string) => void;
  toggleOne: (id: string, is_active: boolean) => void;
  toggleAll: (is_active: boolean) => void;
}
// when mode is river, we need all test id's
type useTestsApiConfig = {
  /**
   * step hash id
   */
  id: string;
  type: TestTableType;
  options?: {
    skip?: boolean;
  };
};
export const useTestsApi = ({
  id,
  type,
  options: { skip } = {},
}: useTestsApiConfig) => {
  const stepTestsMeta = useStepTests(id);
  const [testsMeta, setTestIds] =
    useState<DataQualityTestMeta[]>(stepTestsMeta);
  const handlers: TestsApiHandlers = useMemo(
    () => ({
      addOne: (id: string) =>
        setTestIds(tests => [...tests, { id, is_active: true }]),
      removeOne: (id: string) =>
        setTestIds(tests => tests.filter(item => item.id !== id)),
      toggleOne: (id: string, is_active: boolean) => {
        setTestIds(tests => {
          return tests.map(merge({ is_active }, compare('id', id)));
        });
      },
      toggleAll: (is_active: boolean) =>
        setTestIds(tests => tests.map(merge({ is_active }))),
    }),
    [],
  );

  useStepTestsUpdater(id, stepTestsMeta, testsMeta);

  const { data, isLoading } = useGetTestsQuery(
    convertOIDarrToString(testsMeta),
    {
      skip,
    },
  );
  const tests = useTestMetadataEnhancer(data, testsMeta);
  const hasTests = tests?.length > 0;
  return {
    tests: testsMeta?.length === 0 ? [] : tests,
    hasTests,
    handlers,
    isLoading,
  };
};

export const useGetTestOne = (testId: string) => {
  const { data } = useGetTestsQuery(testId);
  const tests = useTestMetadataEnhancer(data, []);
  return tests?.[0];
};
/**
 * triggers onChange when a test is added or has been removed from draft of tests
 */
const useStepTestsUpdater = (
  hash: string,
  stepTestIds: DataQualityTestMeta[],
  draftTestIds: DataQualityTestMeta[],
) => {
  const { updateStep, updateRiverTaskConfig } = useRiverActions();
  const hasTestIdsChanged = compareArrays(stepTestIds, draftTestIds);
  const hasActiveQualityTest = draftTestIds?.some(pluck('is_active'));

  useEffect(() => {
    if (hasTestIdsChanged && Boolean(hash) && draftTestIds) {
      updateStep({ hash, data_quality_tests_ids: draftTestIds });
    }
  }, [draftTestIds, hasTestIdsChanged, hash, updateStep]);

  // activate the should_run_data_quality_tests so server will run tests
  useEffect(() => {
    if (hasActiveQualityTest) {
      updateRiverTaskConfig({
        should_run_data_quality_tests: true,
      });
    }
  }, [hasActiveQualityTest, updateRiverTaskConfig]);
};

const compareArrays = (
  source: DataQualityTestMeta[],
  copy: DataQualityTestMeta[],
) => {
  return source.every((item, index) => getOId(item) === getOId(copy[index]));
};
const findTestIds = (step: ILogicStep) => {
  return step?.data_quality_tests_ids || [];
};
const useStepTests = (id: string) => {
  const { findStep } = useRiver();
  return findTestIds(findStep(id));
};

export const useTestTypes = () => {
  const { data: types } = useGetTestTypesQuery();
  const findTest = (id: string) => {
    return types?.find(compare('_id', id));
  };
  return { types, findTest };
};

export type QualityTestWithTypeMetadata = IQualityTest &
  Pick<IQualityTestType, 'description' | 'test_type_name'>;
/**
 * enhance tests with data test type metadata
 */
const useTestMetadataEnhancer = (
  tests: IQualityTest[],
  testsMeta: DataQualityTestMeta[],
): QualityTestWithTypeMetadata[] => {
  const { types } = useTestTypes();
  const testsWithTypesData = addMetadata(tests || [], types);
  return addIsActive(testsWithTypesData, testsMeta);
};

const addIsActive = (
  tests: QualityTestWithTypeMetadata[],
  testsMeta: DataQualityTestMeta[],
): QualityTestWithTypeMetadata[] => {
  return tests?.map(test => {
    const testMeta = testsMeta?.find(compare('id', test._id));
    return {
      ...test,
      is_active: testMeta?.is_active,
    };
  });
};
const addMetadata = (
  tests: IQualityTest[],
  testTypes: IQualityTestType[],
): QualityTestWithTypeMetadata[] => {
  return tests?.map(test => {
    const testType = testTypes?.find(
      compare('_id', test.data_quality_test_type_id),
    );
    return {
      ...test,
      test_type_name: testType?.test_type_name,
      description: compileTemplate(
        testType?.description,
        test?.test_schema?.join(','),
        'column_name',
      ),
    };
  });
};

const compileTemplate = (template: string, value: string, variable: string) =>
  template?.replace(`{${variable}}`, value);

export const useCreateTest = () => {
  const [createTest, result] = useCreateQualityTestMutation();

  const addTest = useCallback(
    async (test: IQualityTestCreatePayload) => {
      const response: any = await createTest(test);
      const newTestId = getRefId(response?.data?.[0]);
      return newTestId;
    },
    [createTest],
  );

  return { addTest, result };
};

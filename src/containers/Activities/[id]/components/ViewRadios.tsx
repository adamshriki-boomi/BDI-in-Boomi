import { RiverTypes } from 'api/types';
import { RadioGroup } from 'components/Form';
import {
  ActivityPageTypes,
  useActivityPageType,
} from 'containers/Activities/store';
import { useHistory } from 'react-router-dom';
import { useSearchParam } from 'react-use';
import { removeParams, upsertSearchParam } from 'utils/searchParams';
import { VIEW_PARAM } from '../params';
import { useMemo } from 'react';

export const ViewOptions = {
  Runs: 'schedulers',
  Tables: 'targets',
  'Sub-Data Flows': 'subrivers',
};

export const ParamName = {
  Runs: 'run_group_id',
  Tables: 'target_name',
};

export const ParamByView = {
  schedulers: ParamName.Runs,
  targets: ParamName.Tables,
  subrivers: ParamName.Runs,
};

const options = Object.entries(ViewOptions).map(([label, value]) => ({
  label,
  value,
  ariaLabel: `${label}-button`,
}));
const isSingleViewMode = (riverType: string) =>
  [
    RiverTypes.LOGIC,
    ActivityPageTypes.SOURCE_TO_TARGET,
    RiverTypes.ACTION,
  ].some(optionalType => optionalType === riverType);

export function ViewRadios() {
  const viewParam = useSearchParam(VIEW_PARAM);
  const viewParamValue = viewParam || ViewOptions.Runs;
  const { activityPageType } = useActivityPageType();
  const { replace } = useHistory();

  const radioOptions = useMemo(() => {
    if (activityPageType === ActivityPageTypes.SUB_RIVERS) {
      return options;
    } else {
      return options.filter(option => {
        if (option.value === 'subrivers') {
          return null;
        }
        return option;
      });
    }
  }, [activityPageType]);

  if (!activityPageType || isSingleViewMode(activityPageType)) {
    return null;
  }

  return (
    <RadioGroup
      label=""
      name="plan"
      values={radioOptions}
      checked={viewParamValue}
      onChange={v => {
        replace({
          pathname: window.location.pathname,
          search: removeParams(upsertSearchParam(VIEW_PARAM, v), [
            'run',
            'pageIndex',
            'page',
            'pageSize',
          ]),
        });
      }}
    />
  );
}

const isViewParamSet = (viewParam, paramName) => {
  if (!paramName) {
    return true;
  }
  return viewParam ? ParamByView[viewParam] !== paramName : false;
};

export const useIsViewLoading = param => {
  const viewParam = useViewParam();
  return isViewParamSet(viewParam, param);
};

export const useViewParam = () => {
  return useSearchParam(VIEW_PARAM);
};

export const useViewParamResolver = () => {
  const viewParam = useViewParam();
  return {
    viewParam,
    isRunsView: !viewParam || viewParam === ViewOptions.Runs,
    isSubRivers: viewParam === ViewOptions['Sub-Data Flows'],
    isTablesView: viewParam === ViewOptions.Tables,
  };
};

/**
 * name of prop to set for "run" search param
 */
export const useRunParamPropName = () => {
  const { isRunsView, isSubRivers } = useViewParamResolver();
  return isRunsView || isSubRivers ? ParamName.Runs : ParamName.Tables;
};

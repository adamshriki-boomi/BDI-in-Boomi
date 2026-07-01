export enum Operators {
  EQUALS = 'equals',
  DIFF = 'different',
  EXISTS = 'exists',
}
const checkConditionRecursive = (condition, control, api) => {
  if (condition.and) {
    return condition.and
      .map(cond => checkConditionRecursive(cond, control, api))
      .every(Boolean);
  } else if (condition.or) {
    return condition.or
      .map(cond => checkConditionRecursive(cond, control, api))
      .sum(Boolean);
  } else if (condition.not) {
    return !checkConditionRecursive(condition, control, api);
  } else {
    const field = api.watch(condition.field_name);
    if (condition[Operators.DIFF]) {
      return field !== condition[Operators.DIFF];
    } else if (condition[Operators.EQUALS]) {
      return field === condition[Operators.EQUALS];
    } else if (condition[Operators.EXISTS]) {
      return typeof field !== 'undefined';
    }
  }
  return false;
};
export const checkConditionForm = (api, control) => {
  if (control?.condition && api) {
    return checkConditionRecursive(control.condition, control, api);
  }
  return true;
};

import { shallowEqual, useSelector } from 'react-redux';
import * as selectors from '../__templateName__.selectors';

export function use__templateNameToPascalCase__() {
  const state = {
    __templateName__Entities: useSelector(
      selectors.select__templateNameToPascalCase__Entities,
      shallowEqual,
    ),
    __templateName__Array: useSelector(
      selectors.select__templateNameToPascalCase__Array,
      shallowEqual,
    ),
    total: useSelector(selectors.selectTotal__templateNameToPascalCase__),
    selectedId: useSelector(
      selectors.selectSelected__templateNameToPascalCase__,
    ),
  };

  return state;
}

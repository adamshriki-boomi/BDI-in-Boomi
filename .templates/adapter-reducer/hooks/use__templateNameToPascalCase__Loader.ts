import { useEffect } from 'react';
import { use__templateNameToPascalCase__ } from './use__templateNameToPascalCase__';
import { use__templateNameToPascalCase__Actions } from './use__templateNameToPascalCase__Actions';

export function use__templateNameToPascalCase__Loader() {
  const { total } = use__templateNameToPascalCase__();
  const {
    fetch__templateNameToPascalCase__,
  } = use__templateNameToPascalCase__Actions();

  useEffect(() => {
    if (total === 0) fetch__templateNameToPascalCase__();
  }, [fetch__templateNameToPascalCase__, total]);
}

import { ExtractMethod } from 'api/types';
import { emailValidation } from 'utils/validations';
import { boolean, lazy, mixed, object, string } from 'yup';

const schemaValidation = lazy(schemas => {
  if (typeof schemas === 'object') {
    const hasSelectedTables = Object.values(schemas).filter(tables => {
      return Object.values(tables).some(table => table.is_selected);
    });
    if (Object.keys(schemas)?.length === 0 || hasSelectedTables.length === 0) {
      // If not tables selected, and the action is activation - return error
      return object().test('schema-and-table-required', function () {
        if (this.options.context.isActivateButton) {
          return this.createError({
            message:
              'Please select at least one table to run/activate the Data Flow',
          });
        }
        return true;
      });
    }
    return object().shape(
      Object.keys(schemas).reduce((acc, schema) => {
        acc[schema] = tablesValidation;
        return acc;
      }, {}),
    );
  }
  return mixed(); // Fallback schema for non-objects schemas
});

const tablesValidation = lazy(tables => {
  if (typeof tables === 'object' && tables !== null) {
    return object().shape(
      Object.keys(tables).reduce((acc, table) => {
        if (typeof tables[table] === 'object') {
          acc[table] = singleTableJSON;
        } else {
          acc[table] = boolean(); // Fallback schema for non-objects table
        }
        return acc;
      }, {}),
    );
  }
  return mixed(); // Fallback schema for non-objects tables
});

const singleTableJSON = object({
  is_selected: boolean(),
  name: string().when('is_selected', {
    is: true,
    then: schema => schema.required('Table name is required'),
  }),
  extract_method: string().nullable(),
  incremental_field: string()
    .nullable()
    .test('incremental-field-required', function (value) {
      const { is_selected, extract_method, name } = this.parent;
      if (is_selected && extract_method === ExtractMethod.INCREMENTAL) {
        if (!value) {
          return this.createError({
            message: `The extract method of table "${name}" ${
              this.parent?.schemaName
                ? 'in "' + this.parent.schemaName + '" schema'
                : ''
            } 
            is incremental and requires a selection of an incremental field and value`,
          });
        } else if (
          is_selected &&
          ((this.parent.epoch && this.parent.epoch?.start_value == null) ||
            (this.parent.running_number &&
              this.parent.running_number?.start_value == null) ||
            (this.parent.date_range && !this.parent.date_range?.start_date))
        ) {
          return this.createError({
            message: `Incremental field of table "${name}" requires a start value`,
          });
        }
      }
      return true; // Pass the validation
    }),
});

const riveValidationSchema = object({
  activation: boolean(),
  properties: object({
    source: object({
      name: string().required('Source name is required'), //example for easy required validation
      run_type: string().nullable(),
      additional_settings: object({}), // example for type validation -> will fail if the field type is not object
    }),
    target: object({
      name: string().required('Target name is required'),
    }),
    // Skip schema validation for custom_query run_type
    schemas: mixed().when('source.run_type', {
      is: 'custom_query',
      then: () => mixed(), // No validation needed for custom query
      otherwise: () => schemaValidation,
    }),
  }),
});

export const validateRiver = async (data, context = null) => {
  try {
    await riveValidationSchema.validate(data, {
      context,
      abortEarly: false,
    });
  } catch (err) {
    return err.errors;
  }
};

export const validateNotificationsAndSettings = async data => {
  try {
    await notificationsAndSettingsSchema.validate(data, {
      abortEarly: false,
    });
  } catch (err) {
    const paths = err.inner.map(e => e.path);
    return { errors: err.errors, paths };
  }
};

export const validateRiverTables = async (
  existingSchemas,
  currSchema,
  tableNames,
) => {
  try {
    const schema = cachedTableDuplicationValidation(
      existingSchemas,
      currSchema,
      tableNames,
    );
    await schema.validate({}, { abortEarly: false });
  } catch (err) {
    return err.errors;
  }
};

const validateEmails = value => {
  // Split the string by commas
  const emails = value.split(',').map(email => email.trim());
  // Create a yup schema for a single email
  const emailSchema = string()
    .test(
      'matches email or variable',
      'The value must be a valid email or a variable name',
      value => {
        const variableRegex = /^{.*}$/;
        return variableRegex.test(value) || emailValidation.test(value);
      },
    )
    .required('Email is required');
  // Validate each email
  for (const email of emails) {
    try {
      emailSchema.validateSync(email, { abortEarly: false });
    } catch (err) {
      return `Invalid email: ${email}`;
    }
  }
};

export const notificationsAndSettingsSchema = object({
  settings: object({
    notification: object({
      failure: object({
        is_enabled: boolean(),
        email: string().test('invalid-or-missing-email', function (value) {
          const { is_enabled } = this.parent;
          if (is_enabled) {
            if (!value) {
              return this.createError({
                message: 'Email address for notification is required',
              });
            } else {
              const response = validateEmails(value);
              if (response) {
                return this.createError({
                  message: response as any,
                });
              }
            }
          }
          return true; // Pass the validation
        }),
      }),
      run_threshold: object({
        is_enabled: boolean(),
        email: string().test('invalid-or-missing-email', function (value) {
          const { is_enabled } = this.parent;
          if (is_enabled) {
            if (!value) {
              return this.createError({
                message: 'Email address for notification is required',
              });
            } else {
              const response = validateEmails(value);
              if (response) {
                return this.createError({
                  message: response as any,
                });
              }
            }
          }
          return true; // Pass the validation
        }),
      }),
      warning: object({
        is_enabled: boolean(),
        email: string().test('invalid-or-missing-email', function (value) {
          const { is_enabled } = this.parent;
          if (is_enabled) {
            if (!value) {
              return this.createError({
                message: 'Email address for notification is required',
              });
            } else {
              const response = validateEmails(value);
              if (response) {
                return this.createError({
                  message: response as any,
                });
              }
            }
          }
          return true;
        }),
      }),
    }),
  }),
});

/**
 * Creates a Yup validation that checks for duplicate table names
 * @param {Object} existingSchemas - Object of existing schemas and their tables
 * @param {string} newSchemaName - Name of the new schema being added
 * @param {string[]} newTables - Array of table names in the new schema
 * @returns {Object} Yup validation schema
 */
const tableDuplicationValidation = (
  existingSchemas,
  newSchemaName,
  newTables,
) => {
  return mixed().test('no-duplicate-tables', function (value) {
    // Skip validation if any parameter is invalid
    if (
      !existingSchemas ||
      typeof existingSchemas !== 'object' ||
      !newSchemaName ||
      !Array.isArray(newTables)
    ) {
      return true;
    }

    // Instead of checking every table against every other table every time
    const selectedTablesMap = new Map(); // target table name -> { schemaName, tableData }

    for (const [schemaName, tables] of Object.entries(existingSchemas)) {
      // Skip the current schema we're adding to
      if (schemaName === newSchemaName) continue;

      // Skip if tables is empty or not an object
      if (!tables || typeof tables !== 'object') continue;

      // Add all selected tables to our lookup map (key = target table name, not source-only name)
      for (const [existingTableKey, tableData] of Object.entries(tables)) {
        if (tableData?.is_selected) {
          const targetTableName =
            tableData.target_table ?? tableData.name ?? existingTableKey;
          if (targetTableName) {
            selectedTablesMap.set(targetTableName, {
              schemaName,
              tableData,
            });
          }
        }
      }
    }

    const newSchemaTables = existingSchemas[newSchemaName];
    for (const tableKey of newTables) {
      if (!tableKey) continue;

      const row =
        newSchemaTables && typeof newSchemaTables === 'object'
          ? newSchemaTables[tableKey]
          : undefined;
      const targetTableName = row?.target_table ?? row?.name ?? tableKey;

      const existingTable = selectedTablesMap.get(targetTableName);
      if (existingTable) {
        return this.createError({
          message: `We have recognized a duplication in the target table name "${targetTableName}" for the tables: "${existingTable.schemaName}"->"${targetTableName}" and "${newSchemaName}"->"${targetTableName}". Please rename one of the tables in order to proceed.`,
        });
      }
    }

    return true;
  });
};

const validationCache = new Map();

/**
 *  Cached version of tableDuplicationValidation to avoid rebuilding HashMap on repeated calls
 */
export const cachedTableDuplicationValidation = (
  existingSchemas,
  newSchemaName,
  newTables,
) => {
  // Include full schemas so cache invalidates when target_table / selection changes (validator closes over existingSchemas)
  const cacheKey = JSON.stringify({
    schemas: existingSchemas,
    newSchema: newSchemaName,
    tables: newTables?.slice().sort(),
  });

  if (validationCache.has(cacheKey)) {
    return validationCache.get(cacheKey);
  }

  const result = tableDuplicationValidation(
    existingSchemas,
    newSchemaName,
    newTables,
  );
  validationCache.set(cacheKey, result);

  // Clear cache after 5 seconds to prevent memory leaks
  setTimeout(() => validationCache.delete(cacheKey), 5000);

  return result;
};

export default tableDuplicationValidation;

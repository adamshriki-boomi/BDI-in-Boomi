import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import stepSchema from './schemas/step.schema.json';
import stepV2Schema from './schemas/stepv2.schema.json';

// currently, it works with "require()" only and not import
// const stepSchema = require('./schemas/step.schema.json');
const ajv = new Ajv({ allErrors: true, useDefaults: true });
ajvErrors(ajv, { singleError: true, keepErrors: false });
ajv.addSchema(stepSchema);
export const validateRiverContent = ajv.compile(stepSchema);
export const validateRiverV2Content = ajv.compile(stepV2Schema);

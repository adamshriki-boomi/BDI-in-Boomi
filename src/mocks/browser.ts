import { setupWorker } from 'msw';
import { handlers } from './handlers';

// Browser-side MSW worker for the BDI prototype mock backend.
export const worker = setupWorker(...handlers);

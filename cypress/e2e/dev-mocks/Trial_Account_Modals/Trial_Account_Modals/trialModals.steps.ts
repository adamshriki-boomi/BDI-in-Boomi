import { Given } from '@badeball/cypress-cucumber-preprocessor';
import { signInWithSimpleRiver } from '../../common/utils/login';

Given('I am a trial mode user with expired trial', () => {
  signInWithSimpleRiver({ token: 'token/token.success.api.VIEWER.json' });
});

Given('I am a trial mode user with extended trial', () => {
  signInWithSimpleRiver({ token: 'token/token.success.api.SHOW-WELCOME.json' });
});

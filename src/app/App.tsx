import '@boomi/exosphere/dist/styles.css';
import { ChakraProvider } from '@chakra-ui/react';
import { ConnectionGlobal } from 'containers/Connections';
import { LoginGuard } from 'containers/Login/Login';
import { ErrorBoundaryRivers } from 'modules';
import { loadExternalScripts } from 'modules/LoadExternals/LoadExternals';
import {
  BdiPrototypeProvider,
  BdiPrototypeSwitcher,
} from 'modules/BdiPrototype';
import { BrowserRouter } from 'react-router-dom';
import { theme } from '../theme';
import './App.scss';
import { AuthenticatedApp } from './AuthenticatedApp';
import { GlobalModals } from './GlobalModals';

// Base path (trailing slash stripped) so routing works under a GitHub Pages
// sub-path; empty string locally where BASE_URL is '/'.
const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '');

function App() {
  loadExternalScripts();
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <ChakraProvider theme={theme(import.meta.env.VITE_EXO_THEME === 'true')}>
        <BdiPrototypeProvider>
          <ErrorBoundaryRivers>
            <LoginGuard>
              <AuthenticatedApp />
              <GlobalModals />
              <ConnectionGlobal />
            </LoginGuard>
          </ErrorBoundaryRivers>
          <BdiPrototypeSwitcher />
        </BdiPrototypeProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
}

export default App;

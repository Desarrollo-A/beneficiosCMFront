/* eslint-disable perfectionist/sort-imports */
import 'src/global.css';

// i18n
import 'src/locales/i18n';

// ----------------------------------------------------------------------

import { GoogleOAuthProvider } from '@react-oauth/google';

import Router from 'src/routes/sections';

import ThemeProvider from 'src/theme';

import { LocalizationProvider } from 'src/locales';

import { useScrollToTop } from 'src/hooks/use-scroll-to-top';

import ProgressBar from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';
import { SettingsDrawer, SettingsProvider } from 'src/components/settings';

import { CheckoutProvider } from 'src/sections/checkout/context';

import { AuthProvider } from 'src/auth/context/jwt';
import ContextGeneralProvider from './utils/contextGeneralProvider';
// import { AuthProvider } from 'src/auth/context/auth0';
// import { AuthProvider } from 'src/auth/context/amplify';
// import { AuthProvider } from 'src/auth/context/firebase';

// Este es un nuevo comentario

// ----------------------------------------------------------------------

export default function App() {
  const charAt = `
  ██████╗ ███████╗███╗   ██╗███████╗███████╗██╗ ██████╗██╗ ██████╗ ███████╗     ██████╗███╗   ███╗
  ██╔══██╗██╔════╝████╗  ██║██╔════╝██╔════╝██║██╔════╝██║██╔═══██╗██╔════╝    ██╔════╝████╗ ████║
  ██████╔╝█████╗  ██╔██╗ ██║█████╗  █████╗  ██║██║     ██║██║   ██║███████╗    ██║     ██╔████╔██║
  ██╔══██╗██╔══╝  ██║╚██╗██║██╔══╝  ██╔══╝  ██║██║     ██║██║   ██║╚════██║    ██║     ██║╚██╔╝██║
  ██████╔╝███████╗██║ ╚████║███████╗██║     ██║╚██████╗██║╚██████╔╝███████║    ╚██████╗██║ ╚═╝ ██║
  ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚══════╝╚═╝     ╚═╝ ╚═════╝╚═╝ ╚═════╝ ╚══════╝     ╚═════╝╚═╝     ╚═╝
                                                                                                                                                                                                 
  `;

  console.info(`%c${charAt}`, 'color: #B4A46C');

  useScrollToTop();

  return (
    <GoogleOAuthProvider clientId="calendario-recepci-n-cm-local@snappy-tine-360922.iam.gserviceaccount.com">
      <AuthProvider>
        <LocalizationProvider>
          <SettingsProvider
            defaultSettings={{
              themeMode: 'light', // 'light' | 'dark'
              themeDirection: 'ltr', //  'rtl' | 'ltr'
              themeContrast: 'default', // 'default' | 'bold'
              themeLayout: 'vertical', // 'vertical' | 'horizontal' | 'mini'
              themeColorPresets: 'blue', // 'default' | 'cyan' | 'purple' | 'blue' | 'orange' | 'red'
              themeStretch: false,
            }}
          >
            <ThemeProvider>
              <MotionLazy>
                <SnackbarProvider>
                  <CheckoutProvider>
                    <SettingsDrawer />
                    <ProgressBar />
                    <ContextGeneralProvider>
                      <GoogleOAuthProvider clientId="161969316544-ou10ee3mktbmp2og21po8rj2eke8ej9t.apps.googleusercontent.com">
                        <Router />
                      </GoogleOAuthProvider>
                    </ContextGeneralProvider>
                  </CheckoutProvider>
                </SnackbarProvider>
              </MotionLazy>
            </ThemeProvider>
          </SettingsProvider>
        </LocalizationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { GuestGuard } from 'src/auth/guard';
import CompactLayout from 'src/layouts/compact';
import AuthClassicLayout from 'src/layouts/auth/classic';

import { SplashScreen } from 'src/components/loading-screen';
// ----------------------------------------------------------------------

// AMPLIFY
const AmplifyLoginPage = lazy(() => import('src/pages/auth/amplify/login'));
const AmplifyRegisterPage = lazy(() => import('src/pages/auth/amplify/register'));
const AmplifyVerifyPage = lazy(() => import('src/pages/auth/amplify/verify'));
const AmplifyNewPasswordPage = lazy(() => import('src/pages/auth/amplify/new-password'));
const AmplifyForgotPasswordPage = lazy(() => import('src/pages/auth/amplify/forgot-password'));

// JWT
const JwtLoginPage = lazy(() => import('src/pages/auth/jwt/login'));
const JwtRegisterPage = lazy(() => import('src/pages/auth/jwt/register'));
const JwtpreRegisterPage = lazy(() => import('src/pages/auth/jwt/preRegister'));
const JwtVerificacionPage = lazy(() => import('src/pages/auth/jwt/verificacion'));
const JwtNewPasswordPage = lazy(() => import('src/pages/auth/jwt/new-password'));
const JwtForgotPasswordPage = lazy(() => import('src/pages/auth/jwt/forgot-password'));

// FIREBASE
const FirebaseLoginPage = lazy(() => import('src/pages/auth/firebase/login'));
const FirebaseRegisterPage = lazy(() => import('src/pages/auth/firebase/register'));
const FirebaseVerifyPage = lazy(() => import('src/pages/auth/firebase/verify'));
const FirebaseForgotPasswordPage = lazy(() => import('src/pages/auth/firebase/forgot-password'));

// AUTH0
const Auth0LoginPage = lazy(() => import('src/pages/auth/auth0/login'));
const Auth0Callback = lazy(() => import('src/pages/auth/auth0/callback'));


// ----------------------------------------------------------------------

const authAmplify = {
  path: 'amplify',
  element: (
    <GuestGuard>
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    </GuestGuard>
  ),
  children: [
    {
      path: 'login',
      element: (
        <AuthClassicLayout>
          <AmplifyLoginPage />
        </AuthClassicLayout>
      ),
    },
    {
      path: 'register',
      element: (
        <AuthClassicLayout title="Manage the job more effectively with Minimal">
          <AmplifyRegisterPage />
        </AuthClassicLayout>
      ),
    },
    {
      element: (
        <CompactLayout>
          <Outlet />
        </CompactLayout>
      ),
      children: [
        { path: 'verify', element: <AmplifyVerifyPage /> },
        { path: 'new-password', element: <AmplifyNewPasswordPage /> },
        { path: 'forgot-password', element: <AmplifyForgotPasswordPage /> },
      ],
    },
  ],
};

const authJwt = {
  path: 'jwt',
  element: (
    <GuestGuard>
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    </GuestGuard>
  ),
  children: [
    {
      path: 'login',
      element: (
        <AuthClassicLayout>
          <JwtLoginPage />
        </AuthClassicLayout>
      ),
    },
    {
      path: 'forgot-password',
      element: (
        <AuthClassicLayout>
          <JwtForgotPasswordPage />
        </AuthClassicLayout>
      ),
    },
    {
      path: 'new-password',
      element: (
        <AuthClassicLayout>
          <JwtNewPasswordPage />
        </AuthClassicLayout>
      ),
    },
    {
      path: 'register',
      element: (
        <AuthClassicLayout title="Manage the job more effectively with Minimal">
          <JwtRegisterPage />
        </AuthClassicLayout>
      ),
    },
    {
      path: 'preRegister',
      element: (
          <JwtpreRegisterPage />
       
      ),
    },
    {
      path: 'verificacion',
      element: (
          <JwtVerificacionPage />
       
      ),
    },
  ],
};

const authFirebase = {
  path: 'firebase',
  element: (
    <GuestGuard>
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    </GuestGuard>
  ),
  children: [
    {
      path: 'login',
      element: (
        <AuthClassicLayout>
          <FirebaseLoginPage />
        </AuthClassicLayout>
      ),
    },
    {
      path: 'register',
      element: (
        <AuthClassicLayout title="Manage the job more effectively with Minimal">
          <FirebaseRegisterPage />
        </AuthClassicLayout>
      ),
    },
    {
      element: (
        <CompactLayout>
          <Outlet />
        </CompactLayout>
      ),
      children: [
        { path: 'verify', element: <FirebaseVerifyPage /> },
        { path: 'forgot-password', element: <FirebaseForgotPasswordPage /> },
      ],
    },
  ],
};

const authAuth0 = {
  path: 'auth0',
  element: (
    <GuestGuard>
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    </GuestGuard>
  ),
  children: [
    {
      path: 'login',
      element: (
        <AuthClassicLayout>
          <Auth0LoginPage />
        </AuthClassicLayout>
      ),
    },
    {
      path: 'callback',
      element: <Auth0Callback />,
    },
  ],
};

export const authRoutes = [
  {
    path: `${import.meta.env.BASE_URL}auth`,
    children: [authAmplify, authJwt, authFirebase, authAuth0],
  },
];

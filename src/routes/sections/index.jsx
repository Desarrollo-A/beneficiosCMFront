// import { lazy } from 'react';
import { Navigate, useRoutes } from 'react-router-dom';

// import AuthClassicLayout from 'src/layouts/auth/classic';
/* import MainLayout from 'src/layouts/main'; */

import { useSession } from 'src/hooks/use-session';

import { PATH_AFTER_LOGIN } from 'src/config-global';

import { authRoutes } from './auth';
import { mainRoutes } from './main';
// import { authDemoRoutes } from './auth-demo';
import { dashboardRoutes } from './dashboard';
import { beneficiosRoutes } from './beneficios';
import { fondoAhorroRoutes } from './fondoAhorro';

// const JwtLoginPage = lazy(() => import('src/pages/auth/jwt/login'));

// ----------------------------------------------------------------------

export default function Router() {
  useSession();

  return useRoutes([
    // SET INDEX PAGE WITH SKIP HOME PAGE
    {
      path: '/',
      element: <Navigate to={PATH_AFTER_LOGIN} replace />,
    },

    // ----------------------------------------------------------------------

    // SET INDEX PAGE WITH HOME PAGE
    // {
    //   path: import.meta.env.BASE_URL,
    //   element: (
    //     <AuthClassicLayout>
    //       <JwtLoginPage />
    //     </AuthClassicLayout>
    //   ),
    // },

    // Auth routes
    ...authRoutes,
    // ...authDemoRoutes,

    // Dashboard routes
    ...dashboardRoutes,

    // Beneficios routes
    ...beneficiosRoutes,

    // Main routes
    ...mainRoutes,

    // Components routes
    ...fondoAhorroRoutes,

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}

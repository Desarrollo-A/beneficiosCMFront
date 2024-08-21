import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

// AYUDA
const FondoAhorroPage = lazy(() => import('src/pages/raiz/fondo-ahorro-view'));

// ----------------------------------------------------------------------

export const raizRoutes = [
  {
    path: `${import.meta.env.BASE_URL}`,
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { path: 'fondoAhorro', element: <FondoAhorroPage /> },
    ],
  },
];

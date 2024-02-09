import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------
// CITAS
const HistorialReportesPage = lazy(() => import('src/pages/dashboard/reportes/historial-reportes'));
const ReportePacientesPage = lazy(() => import('src/pages/dashboard/reportes/reporte-pacientes'));
const EvaluacionCitasPage = lazy(() => import ('src/pages/dashboard/evaluacion-citas-view'));
// OVERVIEW
const IndexPage = lazy(() => import('src/pages/dashboard/app'));
const DashPage = lazy(() => import('src/pages/dashboard/dash'));
// ENCUESTAS
const EncuestasPage = lazy(() => import('src/pages/dashboard/encuestas/encuestas-view'));
const CrearEncuestaPage = lazy(() => import('src/pages/dashboard/encuestas/crear-view'));
const VerEncuestasPage = lazy(() => import('src/pages/dashboard/encuestas/ver-view'));
const VerEncuestaDetallePage = lazy(() => import('src/pages/dashboard/encuestas/ver-detalle-view'));
// GESTOR
const AtencionXsedePage = lazy(() => import('src/pages/dashboard/gestor/atencionXsede-view'));
const OficinasPage = lazy(() => import('src/pages/dashboard/gestor/oficinas-view'));
const SedesPage = lazy(() => import('src/pages/dashboard/gestor/sedes-view'));
// ----------------------------------------------------------------------

// AVISOS DE PRIVACIDAD
const AvisosDePrivacidad = lazy(() => import('src/pages/dashboard/privacidad/aviso-privacidad'));
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const OverviewBankingPage = lazy(() => import('src/pages/dashboard/banking'));
const OverviewBookingPage = lazy(() => import('src/pages/dashboard/booking'));
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'));
const CalendarioPage = lazy(() => import('src/pages/dashboard/calendario'));
// PRODUCT
const ProductDetailsPage = lazy(() => import('src/pages/dashboard/product/details'));
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit'));
// ORDER
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));
// INVOICE
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details'));
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'));
// USER
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));

const PerfilPage = lazy(() => import('src/pages/dashboard/usuarios/perfil'));

// BLOG
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'));
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'));
// JOB
const JobDetailsPage = lazy(() => import('src/pages/dashboard/job/details'));
const JobListPage = lazy(() => import('src/pages/dashboard/job/list'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/job/new'));
const JobEditPage = lazy(() => import('src/pages/dashboard/job/edit'));
// TOUR
const TourDetailsPage = lazy(() => import('src/pages/dashboard/tour/details'));
const TourListPage = lazy(() => import('src/pages/dashboard/tour/list'));
const TourCreatePage = lazy(() => import('src/pages/dashboard/tour/new'));
const TourEditPage = lazy(() => import('src/pages/dashboard/tour/edit'));
// Test
const TestInsertBatch = lazy(() => import('src/pages/dashboard/usuarios/new'));
// FILE MANAGER
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
// APP
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const MailPage = lazy(() => import('src/pages/dashboard/mail'));
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
// TEST RENDER PAGE BY ROLE
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// BLANK PAGE
// const BlankPage = lazy(() => import('src/pages/dashboard/blank'));
const BlankPage = lazy(() => import('src/sections/_examples/extra/upload-view'));

// ----------------------------------------------------------------------

export const dashboardRoutes = [
  {
    path: `${import.meta.env.BASE_URL}dashboard`,
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
      { element: <IndexPage />, index: true },
      {
        path: 'reportes',
        children: [
          { path: 'historial', element: <HistorialReportesPage /> },
          { path: 'pacientes', element: <ReportePacientesPage /> },
        ],
      },
      {
        path: 'encuestas',
        children: [
          { path: 'contestar', element: <EncuestasPage /> },
          { path: 'crear', element: <CrearEncuestaPage /> },
          { path: 'ver', element: <VerEncuestasPage /> },
          { path: 'detalle', element: <VerEncuestaDetallePage /> },
        ],
      },
      {
        path: 'gestor',
        children: [
          { path: 'atencionxsede', element: <AtencionXsedePage /> },
          { path: 'oficinas', element: <OficinasPage /> },
          { path: 'sedes', element: <SedesPage /> },
        ],
      },
      {
        path: 'privacidad',
        children: [
          { path: 'administrar', element: <AvisosDePrivacidad /> },
          { path: 'ver', element: <AvisosDePrivacidad /> }
        ],
      },
      { path: 'dash', element: <DashPage /> },
      /*       { path: 'encuestas', element: <EncuestasPage /> }, */
      { path: 'ecommerce', element: <OverviewEcommercePage /> },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      { path: 'banking', element: <OverviewBankingPage /> },
      { path: 'booking', element: <OverviewBookingPage /> },
      { path: 'file', element: <OverviewFilePage /> },
      { path: 'calendarioespecialista', element: <CalendarioPage /> },
      {
        path: 'user',
        children: [
          { path: 'cards', element: <UserCardsPage /> },
          { path: 'list', element: <UserListPage /> },
          { path: 'new', element: <UserCreatePage /> },
          { path: ':id/edit', element: <UserEditPage /> },
          { path: 'account', element: <UserAccountPage /> },
        ],
      },
      {
        path: 'product',
        children: [
          { element: <ProductListPage />, index: true },
          { path: 'list', element: <ProductListPage /> },
          { path: ':id', element: <ProductDetailsPage /> },
          { path: 'new', element: <ProductCreatePage /> },
          { path: ':id/edit', element: <ProductEditPage /> },
        ],
      },
      {
        path: 'order',
        children: [
          { element: <OrderListPage />, index: true },
          { path: 'list', element: <OrderListPage /> },
          { path: ':id', element: <OrderDetailsPage /> },
        ],
      },
      {
        path: 'invoice',
        children: [
          { element: <InvoiceListPage />, index: true },
          { path: 'list', element: <InvoiceListPage /> },
          { path: ':id', element: <InvoiceDetailsPage /> },
          { path: ':id/edit', element: <InvoiceEditPage /> },
          { path: 'new', element: <InvoiceCreatePage /> },
        ],
      },
      {
        path: 'post',
        children: [
          { element: <BlogPostsPage />, index: true },
          { path: 'list', element: <BlogPostsPage /> },
          { path: ':title', element: <BlogPostPage /> },
          { path: ':title/edit', element: <BlogEditPostPage /> },
          { path: 'new', element: <BlogNewPostPage /> },
        ],
      },
      {
        path: 'job',
        children: [
          { element: <JobListPage />, index: true },
          { path: 'list', element: <JobListPage /> },
          { path: ':id', element: <JobDetailsPage /> },
          { path: 'new', element: <JobCreatePage /> },
          { path: ':id/edit', element: <JobEditPage /> },
        ],
      },
      {
        path: 'tour',
        children: [
          { element: <TourListPage />, index: true },
          { path: 'list', element: <TourListPage /> },
          { path: ':id', element: <TourDetailsPage /> },
          { path: 'new', element: <TourCreatePage /> },
          { path: ':id/edit', element: <TourEditPage /> },
        ],
      },
      {
        path: 'usuarios',
        children: [
          { element: <TestInsertBatch />, index: true },
          { path: 'new', element: <TestInsertBatch /> },
          { path: 'perfil', element: <PerfilPage /> },
        ],
      },
      { path: 'file-manager', element: <FileManagerPage /> },
      { path: 'mail', element: <MailPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'calendariobeneficiario', element: <CalendarPage /> },
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { path: 'blank', element: <BlankPage /> },
      { path: 'evaluacioncitas', element: <EvaluacionCitasPage /> }
    ],
  },
];

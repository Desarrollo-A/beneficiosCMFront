import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthGuard } from 'src/auth/guard';
import DashboardLayout from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------
// CITAS
const CitasPage = lazy(() => import('src/pages/beneficios/citas'));
// REPORTES
const HistorialReportesPage = lazy(
  () => import('src/pages/beneficios/reportes/historial-reportes')
);
const ReportePacientesPage = lazy(() => import('src/pages/beneficios/reportes/reporte-pacientes'));
const DemandaBeneficiosPage = lazy(
  () => import('src/pages/beneficios/reportes/demanda-beneficios')
);
const ReporteEncuestasPage = lazy(() => import('src/pages/beneficios/reportes/reporte-encuestas'));
// OVERVIEW
const DashPage = lazy(() => import('src/pages/beneficios/dash'));
// ENCUESTAS
const EncuestasPage = lazy(() => import('src/pages/beneficios/encuestas/encuestas-view'));
const CrearEncuestaPage = lazy(() => import('src/pages/beneficios/encuestas/crear-view'));
const VerEncuestasPage = lazy(() => import('src/pages/beneficios/encuestas/ver-view'));
const VerEncuestaDetallePage = lazy(
  () => import('src/pages/beneficios/encuestas/ver-detalle-view')
);
// GESTOR
const AtencionXsedePage = lazy(() => import('src/pages/beneficios/gestor/atencionXsede-view'));
/* const AtencionPorSedePage = lazy(() => import('src/pages/beneficios/gestor/atencion-por-sede')); */
const HorariosEspePage = lazy(() => import('src/pages/beneficios/gestor/horariosEspe-view'));
const EstatusPuestosPage = lazy(() => import('src/pages/beneficios/gestor/estausPuestos-view'));
const SedesPage = lazy(() => import('src/pages/beneficios/gestor/sedes-view'));
const UsuariosPage = lazy(() => import('src/pages/beneficios/gestor/usuarios-view'));
// ----------------------------------------------------------------------
// AYUDA
const AyudaPage = lazy(() => import('src/pages/beneficios/ayuda/ayuda-view'));
const GestorAyudaPage = lazy(() => import('src/pages/beneficios/ayuda/gestorAyuda-view'));
// AVISOS DE PRIVACIDAD
const AvisosDePrivacidad = lazy(() => import('src/pages/beneficios/privacidad/aviso-privacidad'));
const OverviewEcommercePage = lazy(() => import('src/pages/beneficios/ecommerce'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/beneficios/analytics'));
const OverviewBankingPage = lazy(() => import('src/pages/beneficios/banking'));
const OverviewBookingPage = lazy(() => import('src/pages/beneficios/booking'));
const OverviewFilePage = lazy(() => import('src/pages/beneficios/file'));
const CalendarioPage = lazy(() => import('src/pages/beneficios/calendario'));
// PRODUCT
const ProductDetailsPage = lazy(() => import('src/pages/beneficios/product/details'));
const ProductListPage = lazy(() => import('src/pages/beneficios/product/list'));
const ProductCreatePage = lazy(() => import('src/pages/beneficios/product/new'));
const ProductEditPage = lazy(() => import('src/pages/beneficios/product/edit'));
// ORDER
const OrderListPage = lazy(() => import('src/pages/beneficios/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/beneficios/order/details'));
// INVOICE
const InvoiceListPage = lazy(() => import('src/pages/beneficios/invoice/list'));
const InvoiceDetailsPage = lazy(() => import('src/pages/beneficios/invoice/details'));
const InvoiceCreatePage = lazy(() => import('src/pages/beneficios/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/beneficios/invoice/edit'));
// USER
const UserCardsPage = lazy(() => import('src/pages/beneficios/user/cards'));
const UserListPage = lazy(() => import('src/pages/beneficios/user/list'));
const UserAccountPage = lazy(() => import('src/pages/beneficios/user/account'));
const UserCreatePage = lazy(() => import('src/pages/beneficios/user/new'));
const UserEditPage = lazy(() => import('src/pages/beneficios/user/edit'));
const PerfilPage = lazy(() => import('src/pages/beneficios/usuarios/perfil'));
// BOLETOS
const BoletosPage = lazy(() => import('src/pages/beneficios/boletos/boletos-view'));

// BLOG
const BlogPostsPage = lazy(() => import('src/pages/beneficios/post/list'));
const BlogPostPage = lazy(() => import('src/pages/beneficios/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/beneficios/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/beneficios/post/edit'));
// JOB
const JobDetailsPage = lazy(() => import('src/pages/beneficios/job/details'));
const JobListPage = lazy(() => import('src/pages/beneficios/job/list'));
const JobCreatePage = lazy(() => import('src/pages/beneficios/job/new'));
const JobEditPage = lazy(() => import('src/pages/beneficios/job/edit'));
// TOUR
const TourDetailsPage = lazy(() => import('src/pages/beneficios/tour/details'));
const TourListPage = lazy(() => import('src/pages/beneficios/tour/list'));
const TourCreatePage = lazy(() => import('src/pages/beneficios/tour/new'));
const TourEditPage = lazy(() => import('src/pages/beneficios/tour/edit'));
// Test
const TestInsertBatch = lazy(() => import('src/pages/beneficios/usuarios/new'));
// FILE MANAGER
const FileManagerPage = lazy(() => import('src/pages/beneficios/file-manager'));
// APP
const ChatPage = lazy(() => import('src/pages/beneficios/chat'));
const MailPage = lazy(() => import('src/pages/beneficios/mail'));
const CalendarPage = lazy(() => import('src/pages/beneficios/calendar'));
const KanbanPage = lazy(() => import('src/pages/beneficios/kanban'));
// TEST RENDER PAGE BY ROLE
const PermissionDeniedPage = lazy(() => import('src/pages/beneficios/permission'));
// BLANK PAGE
// const BlankPage = lazy(() => import('src/pages/beneficios/blank'));
const BlankPage = lazy(() => import('src/sections/_examples/extra/upload-view'));

// const AgendaPage = lazy(() => import('src/pages/beneficios/agenda'))


// ----------------------------------------------------------------------

export const beneficiosRoutes = [
  {
    path: `${import.meta.env.BASE_URL}beneficios`,
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
      { element: <DashPage />, index: true },
      {
        path: 'reportes',
        children: [
          { path: 'historial', element: <HistorialReportesPage /> },
          { path: 'pacientes', element: <ReportePacientesPage /> },
          { path: 'demandaBeneficios', element: <DemandaBeneficiosPage /> },
          { path: 'reporteEncuestas', element: <ReporteEncuestasPage /> },
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
          /* { path: 'atencionporsede', element: <AtencionPorSedePage /> }, */
          { path: 'horariosEspecificos', element: <HorariosEspePage /> },
          { path: 'estatusPuestos', element: <EstatusPuestosPage /> },
          { path: 'sedes', element: <SedesPage /> },
          { path: 'usuarios', element: <UsuariosPage /> },
        ],
      },
      {
        path: 'privacidad',
        children: [
          { path: 'administrar', element: <AvisosDePrivacidad /> },
          { path: 'ver', element: <AvisosDePrivacidad /> },
        ],
      },
      {
        path: 'ayuda',
        children: [
          { path: 'ayuda', element: <AyudaPage /> },
          { path: 'gestor', element: <GestorAyudaPage /> },
        ],
      },
      {
        path: 'boletos', element: <BoletosPage />,
        children: [
          /* { path: 'boletos', element: <BoletosPage /> }, */
        ],
      },
      { path: 'dash', element: <DashPage /> },
      /*       { path: 'encuestas', element: <EncuestasPage /> }, */
      { path: 'ecommerce', element: <OverviewEcommercePage /> },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      { path: 'banking', element: <OverviewBankingPage /> },
      { path: 'booking', element: <OverviewBookingPage /> },
      { path: 'file', element: <OverviewFilePage /> },
      { path: 'calendario', element: <CalendarioPage /> },
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
        path: 'usuariosexternos',
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
      { path: 'citas', element: <CitasPage /> }
    ],
  },
];

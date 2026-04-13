import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import ProtectedRoute, { RequireAuth } from './components/layout/ProtectedRoute.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import VerifySimulation from './pages/VerifySimulation.jsx'
import AdminHome from './pages/admin/AdminHome.jsx'
import ChargesAdmin from './pages/admin/ChargesAdmin.jsx'
import CreditProductsAdmin from './pages/admin/CreditProductsAdmin.jsx'
import InstitutionalConfig from './pages/admin/InstitutionalConfig.jsx'
import InvestmentProductsAdmin from './pages/admin/InvestmentProductsAdmin.jsx'
import ClientHome from './pages/client/ClientHome.jsx'
import ClientRequests from './pages/client/ClientRequests.jsx'
import CreditSimulation from './pages/client/CreditSimulation.jsx'
import History from './pages/client/History.jsx'
import InvestmentSimulation from './pages/client/InvestmentSimulation.jsx'
import RequestFlow from './pages/client/RequestFlow.jsx'
import RequestDetail from './pages/admin/RequestDetail.jsx'
import RequestsAdmin from './pages/admin/RequestsAdmin.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/* Admin — fully protected */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AppShell mode="admin" />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="config" element={<InstitutionalConfig />} />
        <Route path="creditos" element={<CreditProductsAdmin />} />
        <Route path="cobros" element={<ChargesAdmin />} />
        <Route path="inversiones" element={<InvestmentProductsAdmin />} />
        <Route path="solicitudes" element={<RequestsAdmin />} />
        <Route path="solicitudes/:id" element={<RequestDetail />} />
      </Route>

      {/* Client — public for simulations, auth required for personal data */}
      <Route path="/cliente" element={<AppShell mode="client" />}>
        <Route index element={<ClientHome />} />
        <Route path="simulacion" element={<CreditSimulation />} />
        <Route path="inversion" element={<InvestmentSimulation />} />
        <Route path="historial" element={<RequireAuth role="client"><History /></RequireAuth>} />
        {/* These require login — they handle personal client data */}
        <Route path="solicitud" element={<RequireAuth role="client"><RequestFlow /></RequireAuth>} />
        <Route path="solicitudes" element={<RequireAuth role="client"><ClientRequests /></RequireAuth>} />
      </Route>

      {/* QR verification */}
      <Route path="/verificar/:id" element={<AppShell mode="client" />}>
        <Route index element={<VerifySimulation />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

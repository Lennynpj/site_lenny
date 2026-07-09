import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import MuscuLayout from './apps/muscu/MuscuLayout'
import TodayPage from './apps/muscu/TodayPage'
import ProgramPage from './apps/muscu/ProgramPage'
import HistoryPage from './apps/muscu/HistoryPage'
import ProgressPage from './apps/muscu/ProgressPage'
import ComptesLayout from './apps/comptes/ComptesLayout'
import DashboardPage from './apps/comptes/DashboardPage'
import SubscriptionsPage from './apps/comptes/SubscriptionsPage'
import IncomesPage from './apps/comptes/IncomesPage'
import AssetsPage from './apps/comptes/AssetsPage'
import ProjectionPage from './apps/comptes/ProjectionPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/muscu" element={<MuscuLayout />}>
        <Route index element={<TodayPage />} />
        <Route path="programme" element={<ProgramPage />} />
        <Route path="historique" element={<HistoryPage />} />
        <Route path="progression" element={<ProgressPage />} />
      </Route>
      <Route path="/comptes" element={<ComptesLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="abonnements" element={<SubscriptionsPage />} />
        <Route path="revenus" element={<IncomesPage />} />
        <Route path="patrimoine" element={<AssetsPage />} />
        <Route path="projection" element={<ProjectionPage />} />
      </Route>
    </Routes>
  )
}

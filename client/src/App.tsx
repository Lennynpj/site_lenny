import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import MuscuLayout from './apps/muscu/MuscuLayout'
import TodayPage from './apps/muscu/TodayPage'
import ProgramPage from './apps/muscu/ProgramPage'
import HistoryPage from './apps/muscu/HistoryPage'
import ProgressPage from './apps/muscu/ProgressPage'
import LysaLayout from './apps/lysa/LysaLayout'
import SeancePage from './apps/lysa/SeancePage'
import LysaProgrammePage from './apps/lysa/ProgrammePage'
import ProgresPage from './apps/lysa/ProgresPage'
import ComptesLayout from './apps/comptes/ComptesLayout'
import AccueilPage from './apps/comptes/AccueilPage'
import MonMoisPage from './apps/comptes/MonMoisPage'
import MesDepensesPage from './apps/comptes/MesDepensesPage'
import EpargnePage from './apps/comptes/EpargnePage'
import ReglagesPage from './apps/comptes/ReglagesPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/muscu" element={<MuscuLayout />}>
        <Route index element={<TodayPage />} />
        <Route path="programme" element={<ProgramPage />} />
        <Route path="historique" element={<HistoryPage />} />
        <Route path="progression" element={<ProgressPage />} />
      </Route>
      <Route path="/lysa" element={<LysaLayout />}>
        <Route index element={<SeancePage />} />
        <Route path="programme" element={<LysaProgrammePage />} />
        <Route path="progres" element={<ProgresPage />} />
      </Route>
      <Route path="/comptes" element={<ComptesLayout />}>
        <Route index element={<AccueilPage />} />
        <Route path="mois" element={<MonMoisPage />} />
        <Route path="depenses" element={<MesDepensesPage />} />
        <Route path="epargne" element={<EpargnePage />} />
        <Route path="reglages" element={<ReglagesPage />} />
      </Route>
    </Routes>
  )
}

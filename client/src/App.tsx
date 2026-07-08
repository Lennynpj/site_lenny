import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import MuscuLayout from './apps/muscu/MuscuLayout'
import TodayPage from './apps/muscu/TodayPage'
import ProgramPage from './apps/muscu/ProgramPage'
import HistoryPage from './apps/muscu/HistoryPage'
import ProgressPage from './apps/muscu/ProgressPage'

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
    </Routes>
  )
}

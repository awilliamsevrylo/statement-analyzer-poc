// src/App.tsx
import { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Workbench from './pages/Workbench';
import Processing from './pages/Processing';
import ReportViewer from './pages/ReportViewer';
import Mobile from './pages/Mobile';
import NewAnalysisModal from './components/modals/NewAnalysisModal';

function AppLayout() {
  const [showNewAnalysis, setShowNewAnalysis] = useState(false);
  const location = useLocation();
  const isMobileRoute = location.pathname === '/mobile';

  return (
    <div className="min-h-[100dvh] bg-slate-50">
      {!isMobileRoute && <Navbar onNewAnalysis={() => setShowNewAnalysis(true)} />}
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              onNewAnalysis={() => setShowNewAnalysis(true)}
              onRetryAnalysis={() => setShowNewAnalysis(true)}
            />
          }
        />
        <Route path="/jobs/:jobId/*" element={<Workbench />} />
        <Route path="/processing/:jobId" element={<Processing />} />
        <Route path="/report/:jobId" element={<ReportViewer />} />
        <Route path="/mobile" element={<Mobile />} />
      </Routes>
      {showNewAnalysis && (
        <NewAnalysisModal onClose={() => setShowNewAnalysis(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppLayout />
    </HashRouter>
  );
}

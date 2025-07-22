import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RobotProvider } from '@/context/RobotContext';
import MainLayout from '@/components/layout/MainLayout';
import DashboardPage from '@/pages/DashboardPage';
import ControlsPage from '@/pages/ControlsPage';
import AutomationPage from '@/pages/AutomationPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SettingsPage from '@/pages/SettingsPage';
import HardwarePage from '@/pages/HardwarePage';
import MissionsPage from '@/pages/MissionsPage';
import MonitoringPage from '@/pages/MonitoringPage';
import MediaPage from '@/pages/MediaPage';
import FleetPage from '@/pages/FleetPage';
import ReportsPage from '@/pages/ReportsPage';
import NetworkPage from '@/pages/NetworkPage';
import LogsPage from '@/pages/LogsPage';
import HelpPage from '@/pages/HelpPage';
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="emu-robot-ui-theme">
      <RobotProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/controls" element={<ControlsPage />} />
              <Route path="/missions" element={<MissionsPage />} />
              <Route path="/automation" element={<AutomationPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/media" element={<MediaPage />} />
              <Route path="/fleet" element={<FleetPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/network" element={<NetworkPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/hardware" element={<HardwarePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/help" element={<HelpPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster richColors theme="dark" />
      </RobotProvider>
    </ThemeProvider>
  );
}

export default App;

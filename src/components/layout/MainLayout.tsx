import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import { useRobot } from '@/context/RobotContext';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = () => {
  const { wsError, voice } = useRobot();

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Navigation */}
      <MobileNav />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden md:block flex-shrink-0">
          <Header />
        </div>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 min-h-0 scroll-container scroll-independent scroll-boundary">
          <div className="h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <AnimatePresence>
          {(wsError || voice.error) && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-20 md:bottom-4 right-4 bg-red-500/90 text-white p-4 rounded-lg shadow-lg max-w-sm z-50"
            >
              <h4 className="font-bold mb-1">System Alert</h4>
              <p className="text-sm">{wsError || voice.error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MainLayout;

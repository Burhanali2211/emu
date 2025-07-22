import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Gamepad2, 
  Navigation,
  Bot,
  Activity,
  BarChart2,
  Camera,
  FileText,
  Users,
  Wifi,
  Database,
  Cpu,
  Settings,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RobotFace } from '@/components/RobotFace';
import { useRobot } from '@/context/RobotContext';

const quickNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/controls', icon: Gamepad2, label: 'Controls' },
  { to: '/missions', icon: Navigation, label: 'Missions' },
  { to: '/monitoring', icon: Activity, label: 'Monitor' },
];

const allNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', category: 'main' },
  { to: '/controls', icon: Gamepad2, label: 'Controls', category: 'main' },
  { to: '/missions', icon: Navigation, label: 'Missions', category: 'operations' },
  { to: '/automation', icon: Bot, label: 'Automation', category: 'operations' },
  { to: '/monitoring', icon: Activity, label: 'Monitoring', category: 'operations' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics', category: 'data' },
  { to: '/media', icon: Camera, label: 'Media', category: 'data' },
  { to: '/reports', icon: FileText, label: 'Reports', category: 'data' },
  { to: '/fleet', icon: Users, label: 'Fleet', category: 'management' },
  { to: '/network', icon: Wifi, label: 'Network', category: 'management' },
  { to: '/logs', icon: Database, label: 'Logs', category: 'management' },
  { to: '/hardware', icon: Cpu, label: 'Hardware', category: 'system' },
  { to: '/settings', icon: Settings, label: 'Settings', category: 'system' },
  { to: '/help', icon: HelpCircle, label: 'Help', category: 'system' },
];

const MobileNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { robotExpression, isConnected } = useRobot();

  const toggleMenu = () => setIsOpen(!isOpen);

  const groupedItems = allNavItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof allNavItems>);

  const categoryTitles = {
    main: 'Main',
    operations: 'Operations',
    data: 'Data & Media',
    management: 'Management',
    system: 'System',
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-950/50 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <RobotFace expression={robotExpression} isActive={isConnected} />
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            EMU ROBOT
          </h1>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMenu}
          className="text-slate-300 hover:text-white"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-sm border-t border-slate-800 z-40">
        <div className="flex items-center justify-around py-2">
          {quickNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-blue-400' 
                    : 'text-slate-400 hover:text-white'
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50"
            onClick={toggleMenu}
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-80 h-full bg-slate-950 border-r border-slate-800 overflow-y-auto overflow-x-hidden flex flex-col scroll-container scroll-independent scroll-boundary"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <RobotFace expression={robotExpression} isActive={isConnected} />
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        EMU ROBOT
                      </h1>
                      <p className="text-sm text-slate-400">
                        {isConnected ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMenu}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-4 space-y-6">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                      {categoryTitles[category as keyof typeof categoryTitles]}
                    </h3>
                    <div className="space-y-1">
                      {items.map((item, index) => (
                        <motion.div
                          key={item.to}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                                isActive 
                                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                              }`
                            }
                            onClick={toggleMenu}
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                          </NavLink>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-800 mt-auto">
                <div className="text-center text-xs text-slate-500">
                  <p>EMU Dashboard v5.0</p>
                  <p className="mt-1">© 2024 Robot Control Systems</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNav;

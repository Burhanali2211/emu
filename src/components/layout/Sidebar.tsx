import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Gamepad2,
  Bot,
  BarChart2,
  Settings,
  Github,
  Cpu,
  Navigation,
  Activity,
  Camera,
  Users,
  FileText,
  Wifi,
  Database,
  HelpCircle
} from 'lucide-react';
import { RobotFace } from '@/components/RobotFace';
import { useRobot } from '@/context/RobotContext';
import { motion } from 'framer-motion';

const navSections = [
  {
    title: 'Main',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/controls', icon: Gamepad2, label: 'Controls' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { to: '/missions', icon: Navigation, label: 'Missions' },
      { to: '/automation', icon: Bot, label: 'Automation' },
      { to: '/monitoring', icon: Activity, label: 'Monitoring' },
    ]
  },
  {
    title: 'Data & Media',
    items: [
      { to: '/analytics', icon: BarChart2, label: 'Analytics' },
      { to: '/media', icon: Camera, label: 'Media' },
      { to: '/reports', icon: FileText, label: 'Reports' },
    ]
  },
  {
    title: 'Management',
    items: [
      { to: '/fleet', icon: Users, label: 'Fleet' },
      { to: '/network', icon: Wifi, label: 'Network' },
      { to: '/logs', icon: Database, label: 'Logs' },
    ]
  },
  {
    title: 'System',
    items: [
      { to: '/hardware', icon: Cpu, label: 'Hardware' },
      { to: '/settings', icon: Settings, label: 'Settings' },
      { to: '/help', icon: HelpCircle, label: 'Help' },
    ]
  }
];

const Sidebar = () => {
  const { robotExpression, isConnected } = useRobot();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-950/50 border-r border-slate-800 h-screen overflow-hidden">
      {/* Header Section - Fixed */}
      <div className="flex-shrink-0 p-4">
        <div className="flex flex-col items-center mb-8">
          <RobotFace expression={robotExpression} isActive={isConnected} />
          <h1 className="text-xl font-bold mt-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">EMU ROBOT</h1>
        </div>
      </div>

      {/* Navigation Section - Scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 scroll-container scroll-independent scroll-boundary">
        <nav className="space-y-6">
          {navSections.map((section, sectionIndex) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-4">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item, index) => (
                  <motion.li
                    key={item.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * (sectionIndex * 3 + index) }}
                  >
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all text-slate-300 hover:bg-slate-800 hover:text-white ${
                          isActive ? 'bg-blue-600/20 text-white neon-border shadow-lg' : ''
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </NavLink>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Section - Fixed */}
      <div className="flex-shrink-0 p-4 text-center text-xs text-slate-500 border-t border-slate-800">
        <a href="https://github.com/your-repo" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 hover:text-slate-300 transition-colors">
            <Github size={14} /> View on GitHub
        </a>
        <p className="mt-2">EMU Dashboard v5.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;

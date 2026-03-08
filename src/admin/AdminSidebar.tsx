import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Images, 
  MessageSquareQuote, 
  Mail, 
  LogOut,
  Settings,
  Info
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { supabase } from '@/lib/supabase';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

interface AdminSidebarProps {
  onClose?: () => void;
}

const menuItems = [
  { id: 'dashboard', path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { id: 'categories', path: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { id: 'gallery', path: '/admin/gallery', label: 'Gallery', icon: Images },
  { id: 'testimonials', path: '/admin/testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'about', path: '/admin/about', label: 'About Us', icon: Info },
  { id: 'inbox', path: '/admin/inbox', label: 'Inbox', icon: Mail },
  { id: 'settings', path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ onClose }: AdminSidebarProps) {
  const { messages } = useData();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = messages.filter(m => !m.isRead).length;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <aside className="w-72 h-screen bg-neutral-950 border-r border-neutral-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-800">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <img 
            src="/logo-white.png" 
            alt="Ravindu Egodawatte Photography" 
            className="h-10 w-auto"
          />
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);

            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <NavLink
                  to={item.path}
                  onClick={onClose}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                      : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.id === 'inbox' && unreadCount > 0 && (
                    <span className="ml-auto w-5 h-5 bg-amber-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-800">
        <div className="flex items-center gap-3 px-4 py-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center">
            <span className="text-white font-medium">A</span>
          </div>
          <div>
            <span className="text-white text-sm font-medium">Admin User</span>
            <span className="text-neutral-500 text-xs block">admin@example.com</span>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-900 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  CheckSquare, 
  KeyRound, 
  LogOut, 
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { 
    path: '/dashboard/money', 
    label: 'Money', 
    icon: Wallet,
    colorClass: 'text-money',
    bgClass: 'bg-money/10',
    hoverClass: 'hover:bg-money/20',
  },
  { 
    path: '/dashboard/tasks', 
    label: 'Tasks', 
    icon: CheckSquare,
    colorClass: 'text-tasks',
    bgClass: 'bg-tasks/10',
    hoverClass: 'hover:bg-tasks/20',
  },
  { 
    path: '/dashboard/vault', 
    label: 'Password Vault', 
    icon: KeyRound,
    colorClass: 'text-vault',
    bgClass: 'bg-vault/10',
    hoverClass: 'hover:bg-vault/20',
  },
];

export function DashboardSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border lg:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        className={cn(
          "fixed left-0 top-0 h-full w-[280px] bg-sidebar border-r border-sidebar-border z-50",
          "lg:translate-x-0 lg:static lg:z-auto"
        )}
        style={{ x: undefined }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-money flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">SecureHub</h1>
                <p className="text-xs text-muted-foreground">Productivity Suite</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    item.hoverClass,
                    isActive ? `${item.bgClass} ${item.colorClass}` : "text-muted-foreground"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && item.colorClass)} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className={cn("ml-auto w-1.5 h-1.5 rounded-full", `bg-${item.colorClass.replace('text-', '')}`)}
                      style={{ backgroundColor: isActive ? 'currentColor' : undefined }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent/50">
              <div className="w-9 h-9 rounded-full bg-gradient-money flex items-center justify-center text-sm font-bold text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 mt-2 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

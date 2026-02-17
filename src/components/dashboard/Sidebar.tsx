import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { 
  FileText, 
  Plus, 
  Star, 
  User, 
  LogOut,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProfile } from '@/hooks/useProfile';
import { useState, useEffect } from 'react';

const navItems = [
  { icon: FileText, label: 'All Notes', path: '/dashboard', primary: true },
  { icon: Plus, label: 'New Note', path: '/dashboard/new', primary: true },
  { icon: Star, label: 'Favorites', path: '/dashboard/favorites', primary: false },
  { icon: User, label: 'Profile', path: '/dashboard/profile', primary: false },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { profile } = useProfile();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-sidebar border-r border-sidebar-border flex flex-col overflow-y-auto",
          "lg:translate-x-0 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <img src="/logo.png" alt="Scriblet" className="w-7 h-7 rounded-lg" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground tracking-tight">Scriblet</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-sidebar-accent"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-6 flex-1">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all duration-200 relative group",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/70"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      isActive ? "scale-110" : "group-hover:scale-105"
                    )} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Theme toggle */}
          <div className="mt-8 pt-6 border-t border-sidebar-border">
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium w-full text-sidebar-foreground hover:bg-sidebar-accent/70 transition-all duration-200"
            >
              {darkMode ? (
                <>
                  <Sun className="w-5 h-5" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>
          </div>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border mt-auto">
          <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-sidebar-accent/50 group hover:bg-sidebar-accent transition-colors">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0">
              <img 
                src={profile?.avatar_url || '/profile.png'} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <User className="w-5 h-5 text-primary/60 hidden" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate text-sidebar-foreground">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-destructive/10 hover:text-destructive shrink-0"
              onClick={handleSignOut}
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}

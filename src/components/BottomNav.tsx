import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Heart, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Heart, label: 'Favorites', path: '/dashboard/favorites' },
    { icon: Plus, label: 'New', path: '/dashboard/new' },
    { icon: User, label: 'Profile', path: '/dashboard/profile' },
  ];

  // Only show on protected routes
  if (!location.pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-6 w-6', item.label === 'New' && 'h-7 w-7')} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

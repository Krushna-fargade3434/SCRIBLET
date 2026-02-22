import { LayoutGrid, List } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list';

interface ViewModeSelectorProps {
  mode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeSelector({ mode, onModeChange }: ViewModeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange('grid')}
        className={cn(
          'h-8 w-8 p-0',
          mode === 'grid' && 'bg-background shadow-sm'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange('list')}
        className={cn(
          'h-8 w-8 p-0',
          mode === 'list' && 'bg-background shadow-sm'
        )}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}

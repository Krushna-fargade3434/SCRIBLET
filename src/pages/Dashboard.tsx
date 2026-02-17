import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, FileText, Loader2, SlidersHorizontal, Grid3x3, List } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { NoteCard } from '@/components/dashboard/NoteCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNotes } from '@/hooks/useNotes';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type FilterType = 'all' | 'quick' | 'favorites';
type SortType = 'created' | 'edited' | 'title';

export default function Dashboard() {
  const { notes, isLoading, deleteNote, toggleFavorite } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('edited');
  const navigate = useNavigate();

  const filters = [
    { id: 'all' as FilterType, label: 'All notes', count: notes.length },
    { id: 'quick' as FilterType, label: 'Quick notes', count: notes.filter(n => n.tags?.includes('quick') || !n.content || n.content.length < 100).length },
    { id: 'favorites' as FilterType, label: 'Favorites', count: notes.filter(n => n.is_favorite).length },
  ];

  const filteredNotes = useMemo(() => {
    let result = notes;

    // Apply filter
    if (activeFilter === 'favorites') {
      result = result.filter((note) => note.is_favorite);
    } else if (activeFilter === 'quick') {
      result = result.filter((note) => 
        note.tags?.includes('quick') || 
        !note.content || note.content.length < 100
      );
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content?.toLowerCase().includes(query) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'created') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === 'edited') {
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

    return result;
  }, [notes, searchQuery, activeFilter, sortBy]);

  const handleDeleteNote = async (id: string) => {
    await deleteNote.mutateAsync(id);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <motion.div
          className="sticky top-0 z-20 backdrop-blur-lg bg-background/80 border-b border-border"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-2xl relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search notes by title, content, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-muted/50 border-border focus-visible:ring-primary"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0 h-11 w-11">
                    <SlidersHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setSortBy('edited')}
                    className={cn(sortBy === 'edited' && 'bg-accent text-accent-foreground')}
                  >
                    Recently edited {sortBy === 'edited' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortBy('created')}
                    className={cn(sortBy === 'created' && 'bg-accent text-accent-foreground')}
                  >
                    Recently created {sortBy === 'created' && '✓'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setSortBy('title')}
                    className={cn(sortBy === 'title' && 'bg-accent text-accent-foreground')}
                  >
                    Title (A-Z) {sortBy === 'title' && '✓'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.div>

        {/* Filter Chips */}
        <motion.div
          className="px-4 sm:px-6 lg:px-8 py-4 flex gap-2 overflow-x-auto scrollbar-hide bg-background"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                'px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap flex items-center gap-2',
                activeFilter === filter.id 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              )}
            >
              {filter.label}
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-semibold",
                activeFilter === filter.id 
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                {filter.count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Notes grid */}
        <div className="px-4 sm:px-6 lg:px-8 pb-24 pt-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Loading your notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-3">
                {searchQuery ? 'No notes found' : activeFilter === 'favorites' ? 'No favorites yet' : 'No notes yet'}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {searchQuery
                  ? 'Try adjusting your search terms or filters'
                  : activeFilter === 'favorites'
                  ? 'Star your important notes to see them here'
                  : 'Create your first note to get started on your journey'}
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => navigate('/dashboard/new')}
                  size="lg"
                  className="shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Note
                </Button>
              )}
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AnimatePresence mode="popLayout">
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={(n) => navigate(`/dashboard/note/${n.id}`)}
                    onDelete={handleDeleteNote}
                    onToggleFavorite={(id, isFavorite) =>
                      toggleFavorite.mutate({ id, is_favorite: isFavorite })
                    }
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Floating Action Button */}
        <motion.button
          className="fab"
          onClick={() => navigate('/dashboard/new')}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </div>
    </DashboardLayout>
  );
}

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Star, Pin, Trash2, Calendar } from 'lucide-react';
import { Note } from '@/hooks/useNotes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cleanNoteContent, cleanNoteTitle, cleanTags } from '@/lib/cleanNoteContent';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
}

const colorMap: Record<string, string> = {
  '#ffffff': 'bg-card',
  '#F8F9FA': 'bg-card',
  '#1a1a1a': 'bg-card',
  '#faf5f0': 'bg-note-cream',
  '#e8f0e8': 'bg-note-sage',
  '#f0e8f5': 'bg-note-lavender',
  '#fae8e0': 'bg-note-peach',
  '#e0f0fa': 'bg-note-sky',
  '#e0faf0': 'bg-note-mint',
};

export function NoteCard({ 
  note, 
  onEdit, 
  onDelete, 
  onToggleFavorite,
}: NoteCardProps) {
  const bgClass = colorMap[note.bg_color] || 'bg-card';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => onEdit(note)}
      className={cn(
        "group relative p-6 rounded-xl border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer min-h-[220px] flex flex-col",
        !note.bg_image_url && bgClass
      )}
      style={note.bg_image_url ? { backgroundColor: note.bg_color || '#ffffff' } : undefined}
    >
      {/* Background image layer */}
      {note.bg_image_url && (
        <>
          <div
            className="absolute inset-0 z-0 rounded-xl"
            style={{
              backgroundImage: `url(${note.bg_image_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          {/* Overlay for text readability - stronger gradient */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-white/70 via-white/80 to-white/90 dark:from-black/60 dark:via-black/70 dark:to-black/80" />
        </>
      )}

      {/* Status indicators */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {note.is_pinned && (
          <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20">
            <Pin className="w-3.5 h-3.5 text-primary" />
          </div>
        )}
        {note.is_favorite && (
          <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm border border-primary/20">
            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 mb-3 text-lg leading-tight pr-16">
          {cleanNoteTitle(note.title)}
        </h3>

        {/* Content preview */}
        {note.content && (
          <div 
            className="text-[15px] leading-relaxed text-muted-foreground line-clamp-4 mb-4 flex-1 
            [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-foreground
            [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-foreground
            [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground
            [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2
            [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:my-2
            [&_li]:my-1
            [&_b]:font-semibold [&_b]:text-foreground
            [&_strong]:font-semibold [&_strong]:text-foreground
            [&_i]:italic [&_em]:italic
            [&_u]:underline
            [&_p]:my-1"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cleanTags(note.tags).slice(0, 3).map((tag, idx) => (
              <span 
                key={idx}
                className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-md border border-primary/20"
              >
                {tag}
              </span>
            ))}
            {cleanTags(note.tags).length > 3 && (
              <span className="px-2 py-1 text-xs font-medium text-muted-foreground">
                +{cleanTags(note.tags).length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50 mt-auto">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{format(new Date(note.updated_at), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute bottom-4 right-4 z-20 flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100 items-center gap-1.5 transition-all duration-200">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg bg-background/95 backdrop-blur-sm hover:bg-background border border-border shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(note.id, note.is_favorite);
          }}
        >
          <Star
            className={cn(
              "w-4 h-4 transition-colors",
              note.is_favorite ? "fill-primary text-primary" : "text-muted-foreground"
            )}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg bg-background/95 backdrop-blur-sm hover:bg-background hover:text-destructive border border-border shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

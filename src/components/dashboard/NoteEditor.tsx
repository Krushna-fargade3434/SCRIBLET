import { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2, Bold, Italic, List, ListOrdered, Heading1, Heading2, Code, Link, Check, FileEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Note, CreateNoteInput } from '@/hooks/useNotes';
import { cleanNoteContent, cleanNoteTitle, cleanTags } from '@/lib/cleanNoteContent';

interface NoteEditorProps {
  note?: Note | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateNoteInput) => Promise<void>;
}

const colorOptions = [
  { value: '#ffffff', label: 'White', class: 'bg-white' },
  { value: '#ddd4c7', label: 'Cream', class: 'bg-note-cream' },
  { value: '#c8dcd2', label: 'Sage', class: 'bg-note-sage' },
  { value: '#dcd4e3', label: 'Lavender', class: 'bg-note-lavender' },
  { value: '#ddc8ba', label: 'Peach', class: 'bg-note-peach' },
  { value: '#c4dde8', label: 'Sky', class: 'bg-note-sky' },
  { value: '#c9e0d5', label: 'Mint', class: 'bg-note-mint' },
];

export function NoteEditor({ note, open, onClose, onSave }: NoteEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'draft' | 'saving' | 'saved'>('draft');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate word and character count
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  useEffect(() => {
    if (note) {
      setTitle(cleanNoteTitle(note.title));
      setContent(cleanNoteContent(note.content || ''));
      setBgColor(note.bg_color);
      setTags(cleanTags(note.tags).join(', '));
      setSaveStatus('saved');
    } else {
      setTitle('');
      setContent('');
      setBgColor('#ffffff');
      setTags('');
      setSaveStatus('draft');
    }
  }, [note, open]);

  // Mark as draft when content changes
  useEffect(() => {
    if (title || content) {
      setSaveStatus('draft');
    }
  }, [title, content, bgColor, tags]);

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newContent = 
      content.substring(0, start) + 
      before + 
      selectedText + 
      after + 
      content.substring(end);
    
    setContent(newContent);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      await onSave({
        title: title.trim(),
        content: content.trim() || undefined,
        bg_color: bgColor,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });

      setSaveStatus('saved');
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
      setSaveStatus('draft');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={cn(
        "overflow-y-auto transition-all",
        isFullscreen 
          ? "max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] rounded-none" 
          : "sm:max-w-[700px] max-h-[90vh]"
      )}>
        <DialogHeader className="pr-10 sm:pr-12">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-3 flex-1">
              <DialogTitle className="text-base sm:text-lg md:text-xl pr-1">{note ? 'Edit Note' : 'Create Note'}</DialogTitle>
              {/* Save Status Indicator */}
              <div className={cn(
                "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full transition-colors",
                saveStatus === 'saved' && "bg-green-500/10 text-green-700 dark:text-green-400",
                saveStatus === 'saving' && "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
                saveStatus === 'draft' && "bg-muted text-muted-foreground"
              )}>
                {saveStatus === 'saved' && <Check className="w-3 h-3" />}
                {saveStatus === 'saving' && <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
                {saveStatus === 'draft' && <FileEdit className="w-3 h-3" />}
                <span className="font-medium">
                  {saveStatus === 'saved' && 'Saved'}
                  {saveStatus === 'saving' && 'Saving...'}
                  {saveStatus === 'draft' && 'Draft'}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-9 w-9 sm:h-8 sm:w-8 shrink-0 -mr-1 sm:-mr-2 touch-manipulation"
              type="button"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-5 w-5 sm:h-4 sm:w-4" />
              ) : (
                <Maximize2 className="h-5 w-5 sm:h-4 sm:w-4" />
              )}
            </Button>
          </div>
          <DialogDescription className="sr-only">
            {note ? 'Edit your note details below' : 'Create a new note by filling out the form below'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 sm:space-y-4 py-3 sm:py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              {/* Word and Character Count */}
              <div className="text-xs text-muted-foreground flex items-center gap-3">
                <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
                <span className="text-border">•</span>
                <span>{charCount} {charCount === 1 ? 'character' : 'characters'}</span>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-muted/50 rounded-lg border border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('**', '**')}
                className="h-8 px-2.5"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('*', '*')}
                className="h-8 px-2.5"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <div className="w-px h-8 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('# ', '')}
                className="h-8 px-2.5"
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('## ', '')}
                className="h-8 px-2.5"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </Button>
              <div className="w-px h-8 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('- ', '')}
                className="h-8 px-2.5"
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('1. ', '')}
                className="h-8 px-2.5"
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
              <div className="w-px h-8 bg-border mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('`', '`')}
                className="h-8 px-2.5"
                title="Code"
              >
                <Code className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown('[', '](url)')}
                className="h-8 px-2.5"
                title="Link"
              >
                <Link className="w-4 h-4" />
              </Button>
            </div>

            <Textarea
              ref={textareaRef}
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note... (Markdown supported)"
              className="min-h-[40dvh] text-sm sm:text-base resize-none font-mono whitespace-pre-wrap"
              style={{ whiteSpace: 'pre-wrap' }}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium">
              Tags (comma separated)
            </label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="work, personal, ideas..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Background Color</label>
            <div className="grid grid-cols-7 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setBgColor(color.value)}
                  className={cn(
                    "aspect-square rounded-lg border-2 transition-all hover:scale-110",
                    color.class,
                    bgColor === color.value
                      ? "border-primary ring-2 ring-primary/20 scale-110"
                      : "border-border"
                  )}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()} className="w-full sm:w-auto">
            {isSaving ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

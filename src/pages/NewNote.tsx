import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Palette, Image as ImageIcon, X, Type, Bold, Italic, Underline, List, Download, FileText } from 'lucide-react';
import { useNotes, CreateNoteInput, Note } from '@/hooks/useNotes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cleanNoteContent, cleanNoteTitle, cleanTags } from '@/lib/cleanNoteContent';
import { exportAsMarkdown, exportAsHTML, exportAsText, exportAsPDF } from '@/lib/exportUtils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/RichTextEditor';

const colorOptions = [
  { value: '#F8F9FA', label: 'Default', bg: 'bg-[#F8F9FA]' },
  { value: '#faf5f0', label: 'Cream', bg: 'bg-[#faf5f0]' },
  { value: '#e8f0e8', label: 'Sage', bg: 'bg-[#e8f0e8]' },
  { value: '#f0e8f5', label: 'Lavender', bg: 'bg-[#f0e8f5]' },
  { value: '#fae8e0', label: 'Peach', bg: 'bg-[#fae8e0]' },
  { value: '#e0f0fa', label: 'Sky', bg: 'bg-[#e0f0fa]' },
  { value: '#e0faf0', label: 'Mint', bg: 'bg-[#e0faf0]' },
  { value: '#ffe4e8', label: 'Rose', bg: 'bg-[#ffe4e8]' },
  { value: '#fff4e0', label: 'Amber', bg: 'bg-[#fff4e0]' },
  { value: '#e8e0f5', label: 'Lilac', bg: 'bg-[#e8e0f5]' },
  { value: '#ffe8f0', label: 'Pink', bg: 'bg-[#ffe8f0]' },
  { value: '#f0fae8', label: 'Lime', bg: 'bg-[#f0fae8]' },
  { value: '#e0e8f0', label: 'Slate', bg: 'bg-[#e0e8f0]' },
  { value: '#ffeee0', label: 'Coral', bg: 'bg-[#ffeee0]' },
  { value: '#e8faf5', label: 'Teal', bg: 'bg-[#e8faf5]' },
  { value: '#f5e8fa', label: 'Mauve', bg: 'bg-[#f5e8fa]' },
  { value: '#f5f0e8', label: 'Sand', bg: 'bg-[#f5f0e8]' },
  { value: '#e8f5fa', label: 'Aqua', bg: 'bg-[#e8f5fa]' },
];

const bgImages = [
  '/avatars/photo1.png',
  '/avatars/photo2.png',
  '/avatars/photo3.png',
  '/avatars/photo4.png',
  '/avatars/photo5.jpg',
  '/avatars/photo6.webp',
  '/avatars/photo7.jpeg',
  '/avatars/photo8.jpg',
  '/avatars/photo9.jpeg',
  '/avatars/photo10.jpeg',
  '/avatars/photo11.jpg',
  '/avatars/photo12.jpg',
  '/avatars/photo13.jpg',
  '/avatars/photo14.jpg',
  '/avatars/photo15.jpeg',
  '/avatars/photo16.jpg',
  '/avatars/photo17.jpg',
  '/avatars/photo18.jpg',
  '/avatars/photo19.jpg',
  '/avatars/photo20.jpeg',
  '/avatars/photo21.jpg',
  '/avatars/photo22.jpg',
];

export default function NewNote() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { createNote, updateNote, notes } = useNotes();
  const existingNote = isEdit ? notes.find((n) => n.id === id) : undefined;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bgColor, setBgColor] = useState('#F8F9FA');
  const [bgImageUrl, setBgImageUrl] = useState<string | undefined>(undefined);
  const [tags, setTags] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showFormatPicker, setShowFormatPicker] = useState(false);
  const [useRichEditor, setUseRichEditor] = useState(false);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Export handler
  const handleExport = async (format: 'markdown' | 'html' | 'text' | 'pdf') => {
    if (!title.trim()) {
      toast.error('Please add a title before exporting');
      return;
    }

    // Get current content HTML from editor
    const currentContent = useRichEditor ? content : (contentRef.current?.innerHTML || '');

    const noteData: Note = {
      id: id || '',
      title,
      content: currentContent,
      bg_color: bgColor,
      bg_image_url: bgImageUrl,
      is_favorite: existingNote?.is_favorite || false,
      is_pinned: existingNote?.is_pinned || false,
      note_date: existingNote?.note_date,
      user_id: existingNote?.user_id || '',
      created_at: existingNote?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    try {
      switch (format) {
        case 'markdown':
          exportAsMarkdown(noteData);
          toast.success('Exported as Markdown');
          break;
        case 'html':
          exportAsHTML(noteData);
          toast.success('Exported as HTML');
          break;
        case 'text':
          exportAsText(noteData);
          toast.success('Exported as Text');
          break;
        case 'pdf':
          await exportAsPDF(noteData);
          toast.success('Exported as PDF');
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    }
  };

  // Auto-resize textarea function
  const autoResize = (element: HTMLTextAreaElement | null) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = element.scrollHeight + 'px';
    }
  };

  // Formatting functions
  const applyFormat = (format: 'bold' | 'italic' | 'underline' | 'bullet' | 'number' | 'heading1' | 'heading2' | 'heading3') => {
    const textarea = contentRef.current;
    if (!textarea) return;

    textarea.focus();

    switch (format) {
      case 'bold':
        document.execCommand('bold', false);
        break;

      case 'italic':
        document.execCommand('italic', false);
        break;

      case 'underline':
        document.execCommand('underline', false);
        break;

      case 'bullet':
        document.execCommand('insertUnorderedList', false);
        break;

      case 'number':
        document.execCommand('insertOrderedList', false);
        break;

      case 'heading1':
        document.execCommand('formatBlock', false, '<h1>');
        break;

      case 'heading2':
        document.execCommand('formatBlock', false, '<h2>');
        break;

      case 'heading3':
        document.execCommand('formatBlock', false, '<h3>');
        break;
    }
  };

  const increaseFontSize = () => {
    if (contentRef.current) {
      const currentSize = parseInt(window.getComputedStyle(contentRef.current).fontSize);
      contentRef.current.style.fontSize = (currentSize + 2) + 'px';
    }
  };

  const decreaseFontSize = () => {
    if (contentRef.current) {
      const currentSize = parseInt(window.getComputedStyle(contentRef.current).fontSize);
      if (currentSize > 12) {
        contentRef.current.style.fontSize = (currentSize - 2) + 'px';
      }
    }
  };

  useEffect(() => {
    autoResize(titleRef.current);
  }, [title]);

  useEffect(() => {
    if (existingNote && contentRef.current) {
      setTitle(cleanNoteTitle(existingNote.title || ''));
      const cleanedContent = cleanNoteContent(existingNote.content || '');
      setContent(cleanedContent);
      contentRef.current.innerHTML = cleanedContent;
      setBgColor(existingNote.bg_color || '#F8F9FA');
      setBgImageUrl(existingNote.bg_image_url || undefined);
      setTags(cleanTags(existingNote.tags).join(', '));
    }
  }, [existingNote]);

  const handleSave = async () => {
    if (!title.trim()) return;

    // Get current content HTML from editor
    const contentHTML = useRichEditor ? content : (contentRef.current?.innerHTML || '');
    
    const data: CreateNoteInput = {
      title: title.trim(),
      content: contentHTML,
      bg_color: bgColor,
      bg_image_url: bgImageUrl,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    if (isEdit && existingNote) {
      await updateNote.mutateAsync({ id: existingNote.id, ...data });
    } else {
      await createNote.mutateAsync(data);
    }
    navigate('/dashboard');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (title.trim()) {
          handleSave();
        }
      }
      // Ctrl/Cmd + B for bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        applyFormat('bold');
      }
      // Ctrl/Cmd + I for italic
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        applyFormat('italic');
      }
      // Ctrl/Cmd + U for underline
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        applyFormat('underline');
      }
      // Escape to go back
      if (e.key === 'Escape') {
        navigate('/dashboard');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, bgColor, bgImageUrl, tags, isEdit, existingNote]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <motion.header
        className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card/50 backdrop-blur-sm z-20"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard')}
          className="h-10 w-10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-semibold text-base">{isEdit ? 'Edit Note' : 'Create Note'}</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Download className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('markdown')}>
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('html')}>
                Export as HTML
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('text')}>
                Export as Text
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            disabled={!title.trim()}
            className="h-10 w-10 text-primary"
          >
            <Check className="w-5 h-5" />
          </Button>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        className="flex-1 overflow-y-auto pb-48 md:pb-28"
        style={{
          backgroundColor: bgImageUrl ? '#FFFFFF' : bgColor,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Background Image Layer */}
        {bgImageUrl && (
          <>
            <div
              className="fixed inset-0 z-0"
              style={{
                backgroundImage: `url(${bgImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
            {/* Light overlay for text readability */}
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-white/40 via-white/45 to-white/55" />
          </>
        )}

        {/* Content */}
        <div className="relative z-10 px-5 py-6">
          {/* Title Input */}
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="w-full bg-transparent border-none outline-none resize-none text-3xl font-bold text-foreground placeholder:text-muted-foreground/40 mb-4 overflow-hidden"
            rows={1}
            style={{
              minHeight: '44px',
              lineHeight: '1.3',
            }}
            autoFocus
          />

          {/* Content Input */}
          {useRichEditor ? (
            <div className="bg-white/80 rounded-lg overflow-hidden">
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="Write your note here..."
              />
            </div>
          ) : (
            <div
              ref={contentRef}
              contentEditable
              onInput={(e) => setContent(e.currentTarget.innerHTML || '')}
              data-placeholder="Write your note here..."
              className="w-full bg-transparent border-none outline-none text-base text-foreground/90 leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40 [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:my-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-2 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:my-2 [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:my-1 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic [&_u]:underline"
              style={{
                minHeight: 'calc(100vh - 400px)',
              }}
            />
          )}
        </div>
      </motion.div>

      {/* Bottom Action Sheet */}
      <motion.div
        className="fixed bottom-16 left-0 right-0 md:bottom-0 z-50 pb-2"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="px-4 py-4 flex items-center justify-center gap-6">
          <motion.button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowImagePicker(false);
              setShowFormatPicker(false);
            }}
            className={cn(
              "relative w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg",
              showColorPicker 
                ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-pink-500/50" 
                : "bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-pink-400/30 hover:shadow-pink-500/50"
            )}
            whileTap={{ scale: 0.85, rotate: -10 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            title="Background color"
          >
            <Palette className="w-6 h-6" />
          </motion.button>
          
          <motion.button
            type="button"
            onClick={() => {
              setShowImagePicker(!showImagePicker);
              setShowColorPicker(false);
              setShowFormatPicker(false);
            }}
            className={cn(
              "relative w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg",
              showImagePicker 
                ? "bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-blue-500/50" 
                : "bg-gradient-to-br from-blue-400 to-cyan-500 text-white shadow-blue-400/30 hover:shadow-blue-500/50"
            )}
            whileTap={{ scale: 0.85, rotate: 10 }}
            whileHover={{ scale: 1.1, rotate: -5 }}
            title="Background image"
          >
            <ImageIcon className="w-6 h-6" />
          </motion.button>
          
          <motion.button
            type="button"
            onClick={() => {
              setShowFormatPicker(!showFormatPicker);
              setShowColorPicker(false);
              setShowImagePicker(false);
            }}
            className={cn(
              "relative w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg",
              showFormatPicker 
                ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/50" 
                : "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-400/30 hover:shadow-amber-500/50"
            )}
            whileTap={{ scale: 0.85, rotate: -10 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            title="Format"
          >
            <Type className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Color Picker Panel */}
        <AnimatePresence>
          {showColorPicker && (
            <motion.div
              className="px-4 pb-4 pt-2 bg-background/50 backdrop-blur-sm"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex gap-3 overflow-x-auto pb-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      setBgColor(color.value);
                      setBgImageUrl(undefined);
                    }}
                    className={cn(
                      'relative shrink-0 w-12 h-12 rounded-full border-2 transition-all',
                      color.bg,
                      bgColor === color.value && !bgImageUrl
                        ? 'border-primary ring-2 ring-primary/30 scale-110'
                        : 'border-border/50'
                    )}
                    title={color.label}
                  >
                    {bgColor === color.value && !bgImageUrl && (
                      <Check className="absolute inset-0 m-auto w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Picker Panel */}
        <AnimatePresence>
          {showImagePicker && (
            <motion.div
              className="px-4 pb-4 pt-2 bg-background/50 backdrop-blur-sm"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex gap-3 overflow-x-auto pb-2">
                {bgImages.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => {
                      setBgImageUrl(src);
                      setBgColor('#FFFFFF');
                    }}
                    className={cn(
                      'relative shrink-0 w-20 h-20 rounded-xl border-2 overflow-hidden transition-all',
                      bgImageUrl === src
                        ? 'border-primary ring-2 ring-primary/30 scale-105'
                        : 'border-border/50'
                    )}
                  >
                    <img src={src} alt="Background" className="w-full h-full object-cover" />
                    {bgImageUrl === src && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </button>
                ))}
                {bgImageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setBgImageUrl(undefined);
                      setBgColor('#F8F9FA');
                    }}
                    className="shrink-0 w-20 h-20 rounded-xl border-2 border-border/50 flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive transition-all"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Format Picker Panel */}
        <AnimatePresence>
          {showFormatPicker && (
            <motion.div
              className="px-4 pb-4 pt-2 bg-background/50 backdrop-blur-sm"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Editor Mode Toggle */}
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Editor Mode:</span>
                <button
                  type="button"
                  onClick={() => setUseRichEditor(!useRichEditor)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                    useRichEditor
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {useRichEditor ? '✨ Rich Editor' : 'Simple Editor'}
                </button>
              </div>

              {!useRichEditor && (
                <>
                  {/* Formatting Tools - Only show in simple mode */}
                  <div className="flex gap-2 flex-wrap items-center">
                    {/* Text Styling */}
                    <button
                      type="button"
                      onClick={() => applyFormat('bold')}
                      className="p-2 rounded bg-background hover:bg-muted transition-colors active:scale-95"
                      title="Bold (Ctrl+B) - **text**"
                    >
                      <Bold className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('italic')}
                      className="p-2 rounded bg-background hover:bg-muted transition-colors active:scale-95"
                      title="Italic (Ctrl+I) - *text*"
                    >
                      <Italic className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('underline')}
                      className="p-2 rounded bg-background hover:bg-muted transition-colors active:scale-95"
                      title="Underline - __text__"
                    >
                      <Underline className="w-5 h-5" />
                    </button>

                    <div className="w-px h-6 bg-border mx-1" />

                    {/* Headings */}
                    <button
                      type="button"
                      onClick={() => applyFormat('heading1')}
                      className="px-2 py-1 rounded bg-background hover:bg-muted transition-colors active:scale-95 text-sm font-bold"
                      title="Heading 1 - # text"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('heading2')}
                      className="px-2 py-1 rounded bg-background hover:bg-muted transition-colors active:scale-95 text-sm font-bold"
                      title="Heading 2 - ## text"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('heading3')}
                      className="px-2 py-1 rounded bg-background hover:bg-muted transition-colors active:scale-95 text-sm font-bold"
                      title="Heading 3 - ### text"
                    >
                      H3
                    </button>

                    <div className="w-px h-6 bg-border mx-1" />

                    {/* Lists */}
                    <button
                      type="button"
                      onClick={() => applyFormat('bullet')}
                      className="p-2 rounded bg-background hover:bg-muted transition-colors active:scale-95"
                      title="Bullet list - • text"
                    >
                      <List className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('number')}
                      className="p-2 rounded bg-background hover:bg-muted transition-colors active:scale-95"
                      title="Numbered list - 1. text"
                    >
                      <span className="text-sm font-medium">1.</span>
                    </button>

                    <div className="w-px h-6 bg-border mx-1" />

                    {/* Font Size */}
                    <button
                      type="button"
                      onClick={decreaseFontSize}
                      className="px-2 py-1 rounded bg-background hover:bg-muted transition-colors active:scale-95 text-sm font-bold"
                      title="Decrease font size"
                    >
                      A-
                    </button>
                    <button
                      type="button"
                      onClick={increaseFontSize}
                      className="px-2 py-1 rounded bg-background hover:bg-muted transition-colors active:scale-95 text-sm font-bold"
                      title="Increase font size"
                    >
                      A+
                    </button>
                  </div>
                </>
              )}

              {useRichEditor && (
                <div className="text-sm text-muted-foreground">
                  Rich editor enabled with advanced formatting, tables, images, and more.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

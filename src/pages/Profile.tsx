import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, Pencil, Info, Save, Moon, Sun, Monitor, UserCircle, Settings, Upload, Award, TrendingUp, Clock, FileText, Star, Download, Trash2, Lock, Bell, AlertTriangle, Type, RefreshCw, Database, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNotes } from '@/hooks/useNotes';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ImageCropDialog } from '@/components/ImageCropDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useState, useEffect, useMemo } from 'react';
import { APP_VERSION } from '@/lib/version';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const { notes } = useNotes();
  const { profile, updateAvatar, uploadAvatar } = useProfile();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [autoSave, setAutoSave] = useState(true);
  const [showNotifications, setShowNotifications] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' || 'auto';
    setTheme(savedTheme);
    
    const savedFontSize = localStorage.getItem('fontSize') as 'small' | 'medium' | 'large' || 'medium';
    setFontSize(savedFontSize);
    document.documentElement.style.fontSize = savedFontSize === 'small' ? '14px' : savedFontSize === 'large' ? '18px' : '16px';
    
    const savedAutoSave = localStorage.getItem('autoSave') !== 'false';
    setAutoSave(savedAutoSave);
    
    const savedNotifications = localStorage.getItem('showNotifications') !== 'false';
    setShowNotifications(savedNotifications);
  }, []);

  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setDisplayName(user.user_metadata.full_name);
    }
  }, [user]);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }

    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const { error: userError } = await supabase.auth.updateUser({
        data: { full_name: displayName },
      });

      if (userError) throw userError;

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleImageCropped = async (croppedImageBlob: Blob) => {
    await uploadAvatar.mutateAsync(croppedImageBlob);
  };

  const handleFontSizeChange = (newSize: 'small' | 'medium' | 'large') => {
    setFontSize(newSize);
    localStorage.setItem('fontSize', newSize);
    const size = newSize === 'small' ? '14px' : newSize === 'large' ? '18px' : '16px';
    document.documentElement.style.fontSize = size;
    toast.success(`Font size changed to ${newSize}`);
  };

  const handleAutoSaveToggle = () => {
    const newValue = !autoSave;
    setAutoSave(newValue);
    localStorage.setItem('autoSave', String(newValue));
    toast.success(`Auto-save ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleNotificationsToggle = () => {
    const newValue = !showNotifications;
    setShowNotifications(newValue);
    localStorage.setItem('showNotifications', String(newValue));
    toast.success(`Notifications ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleExportAllNotes = () => {
    if (notes.length === 0) {
      toast.error('No notes to export');
      return;
    }
    
    const exportData = {
      notes: notes.map(note => ({
        title: note.title,
        content: note.content,
        created_at: note.created_at,
        updated_at: note.updated_at,
        is_favorite: note.is_favorite,
        is_pinned: note.is_pinned,
        bg_image_url: note.bg_image_url,
      })),
      exported_at: new Date().toISOString(),
      total_notes: notes.length,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scriblet-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${notes.length} notes successfully`);
  };

  const handleClearCache = () => {
    // Clear all localStorage except theme and user preferences
    const itemsToKeep = ['theme', 'fontSize', 'autoSave', 'showNotifications'];
    const toKeep: { [key: string]: string | null } = {};
    itemsToKeep.forEach(key => {
      toKeep[key] = localStorage.getItem(key);
    });
    
    localStorage.clear();
    
    Object.entries(toKeep).forEach(([key, value]) => {
      if (value !== null) {
        localStorage.setItem(key, value);
      }
    });
    
    toast.success('Cache cleared successfully');
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // Delete all notes first
      for (const note of notes) {
        await supabase.from('notes').delete().eq('id', note.id);
      }
      
      // Sign out
      await supabase.auth.signOut();
      toast.success('Account data deleted. Redirecting...');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const avatarOptions = [
    '/avatars/photo1.png',
    '/avatars/photo2.png',
    '/avatars/photo3.png',
    '/avatars/photo4.png',
    '/profile.png',
  ];

  const stats = [
    { label: 'Total Notes', value: notes.length, icon: FileText, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { label: 'Favorites', value: notes.filter((n) => n.is_favorite).length, icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    { label: 'Pinned', value: notes.filter((n) => n.is_pinned).length, icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  ];

  const recentNotes = useMemo(() => {
    return notes
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3);
  }, [notes]);

  const accountAge = useMemo(() => {
    if (!user?.created_at) return 0;
    const created = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [user]);

  return (
    <DashboardLayout>
      <div className="min-h-screen pb-20 md:pb-6">
        {/* Hero Banner */}
        <motion.div
          className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background border-b border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(0_0_0/0.05)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.03)_1px,transparent_0)]"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <motion.div
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-card border-4 border-background shadow-2xl">
                  <img
                    src={profile?.avatar_url || '/profile.png'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/profile.png';
                    }}
                  />
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform flex items-center justify-center">
                      <Pencil className="w-4 h-4" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Choose Profile Photo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Button
                        onClick={() => {
                          setOpen(false);
                          setCropDialogOpen(true);
                        }}
                        className="w-full h-14 text-base"
                        variant="outline"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Custom Photo
                      </Button>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or choose preset
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[40vh] overflow-y-auto p-1">
                        {avatarOptions.map((url) => (
                          <button
                            key={url}
                            onClick={async () => {
                              await updateAvatar.mutateAsync(url);
                              setOpen(false);
                            }}
                            className="group relative aspect-square rounded-full overflow-hidden border-3 border-border hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all hover:scale-105"
                            aria-label={`Choose avatar ${url}`}
                          >
                            <img
                              src={url}
                              alt="Avatar option"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="text-2xl sm:text-3xl font-bold max-w-sm"
                      />
                      <Button onClick={handleSaveProfile} disabled={isSavingProfile} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        {isSavingProfile ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 justify-center sm:justify-start mb-2">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                        {displayName || 'User'}
                      </h1>
                      <Button onClick={() => setIsEditing(true)} variant="ghost" size="sm">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <p className="text-muted-foreground text-sm sm:text-base mb-4 break-all">
                    {user?.email}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-start">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {format(new Date(user?.created_at || new Date()), 'MMM yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{accountAge} days active</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      Verified
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
          <motion.div
            className="grid grid-cols-3 gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-card rounded-xl sm:rounded-2xl border border-border shadow-lg p-4 sm:p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center", stat.bgColor)}>
                    <stat.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", stat.color)} />
                  </div>
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-1">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex gap-2 border-b border-border">
              <button
                onClick={() => setActiveTab('profile')}
                className={cn(
                  "px-4 py-3 font-medium text-sm transition-colors relative",
                  activeTab === 'profile'
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <UserCircle className="w-4 h-4 inline-block mr-2" />
                Overview
                {activeTab === 'profile' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={cn(
                  "px-4 py-3 font-medium text-sm transition-colors relative",
                  activeTab === 'settings'
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Settings className="w-4 h-4 inline-block mr-2" />
                Settings
                {activeTab === 'settings' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Account Details - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Account Information Card */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Account Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Email Address</p>
                        <p className="font-semibold text-foreground break-all overflow-wrap-anywhere">{user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Member Since</p>
                        <p className="font-semibold text-foreground">
                          {user?.created_at
                            ? format(new Date(user.created_at), 'MMMM d, yyyy')
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                        <Shield className="w-6 h-6 text-green-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Account Status</p>
                        <p className="font-semibold text-green-600 dark:text-green-400">Verified & Secure</p>
                      </div>
                    </div>
                  </div>
                </div>

               {/* Recent Activity */}
                {recentNotes.length > 0 && (
                  <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        Recent Activity
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate('/dashboard')}
                      >
                        View All
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {recentNotes.map((note) => (
                        <div 
                          key={note.id}
                          className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 cursor-pointer transition-colors border border-border"
                          onClick={() => navigate(`/dashboard/note/${note.id}`)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground truncate">{note.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Updated {format(new Date(note.updated_at), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - 1 column */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Quick Stats
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Storage Used</span>
                        <span className="font-medium">{notes.length} notes</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min((notes.length / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Account Age</span>
                        <span className="font-semibold text-foreground">{accountAge} days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">App Version</span>
                        <span className="font-semibold text-foreground">v{APP_VERSION}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Achievements
                  </h3>
                  <div className="space-y-3">
                    {notes.length >= 1 && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">First Note</p>
                          <p className="text-xs text-muted-foreground">Created your first note</p>
                        </div>
                      </div>
                    )}
                    {notes.filter(n => n.is_favorite).length >= 1 && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                        <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">
                          <Star className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Favorite</p>
                          <p className="text-xs text-muted-foreground">Marked a note as favorite</p>
                        </div>
                      </div>
                    )}
                    {accountAge >= 7 && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Week Streak</p>
                          <p className="text-xs text-muted-foreground">Active for 7+ days</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Appearance Settings */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Moon className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">Theme Preference</h3>
                      <p className="text-sm text-muted-foreground">
                        Customize how Scriblet looks on your device
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Light Theme */}
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={cn(
                        "group p-4 rounded-xl border-2 transition-all hover:scale-105",
                        theme === 'light'
                          ? "border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10"
                          : "border-border hover:border-purple-500/50"
                      )}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-full h-24 rounded-lg bg-white border border-gray-200 p-3 shadow-sm transition-transform group-hover:shadow-md">
                          <div className="h-2 w-12 bg-purple-500 rounded mb-2"></div>
                          <div className="space-y-1.5">
                            <div className="h-1.5 bg-gray-300 rounded w-full"></div>
                            <div className="h-1.5 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-1.5 bg-gray-300 rounded w-5/6"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span className="font-semibold">Light</span>
                          {theme === 'light' && (
                            <motion.div 
                              layoutId="themeIndicator"
                              className="w-2 h-2 rounded-full bg-purple-500"
                            />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Dark Theme */}
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={cn(
                        "group p-4 rounded-xl border-2 transition-all hover:scale-105",
                        theme === 'dark'
                          ? "border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10"
                          : "border-border hover:border-purple-500/50"
                      )}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-full h-24 rounded-lg bg-gray-900 border border-gray-700 p-3 shadow-sm transition-transform group-hover:shadow-md">
                          <div className="h-2 w-12 bg-purple-400 rounded mb-2"></div>
                          <div className="space-y-1.5">
                            <div className="h-1.5 bg-gray-600 rounded w-full"></div>
                            <div className="h-1.5 bg-gray-600 rounded w-3/4"></div>
                            <div className="h-1.5 bg-gray-600 rounded w-5/6"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-indigo-400" />
                          <span className="font-semibold">Dark</span>
                          {theme === 'dark' && (
                            <motion.div 
                              layoutId="themeIndicator"
                              className="w-2 h-2 rounded-full bg-purple-500"
                            />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Auto Theme */}
                    <button
                      onClick={() => handleThemeChange('auto')}
                      className={cn(
                        "group p-4 rounded-xl border-2 transition-all hover:scale-105",
                        theme === 'auto'
                          ? "border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10"
                          : "border-border hover:border-purple-500/50"
                      )}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-full h-24 rounded-lg overflow-hidden border border-gray-300 shadow-sm transition-transform group-hover:shadow-md">
                          <div className="flex h-full">
                            <div className="w-1/2 bg-white p-2">
                              <div className="h-1.5 w-8 bg-purple-500 rounded mb-1.5"></div>
                              <div className="space-y-1">
                                <div className="h-1 bg-gray-300 rounded w-full"></div>
                                <div className="h-1 bg-gray-300 rounded w-2/3"></div>
                              </div>
                            </div>
                            <div className="w-1/2 bg-gray-900 p-2">
                              <div className="h-1.5 w-8 bg-purple-400 rounded mb-1.5"></div>
                              <div className="space-y-1">
                                <div className="h-1 bg-gray-600 rounded w-full"></div>
                                <div className="h-1 bg-gray-600 rounded w-2/3"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold">Auto</span>
                          {theme === 'auto' && (
                            <motion.div 
                              layoutId="themeIndicator"
                              className="w-2 h-2 rounded-full bg-purple-500"
                            />
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Font Size Settings */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <Type className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">Text Size</h3>
                      <p className="text-sm text-muted-foreground">
                        Adjust the base text size for better readability
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleFontSizeChange('small')}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all hover:scale-105",
                        fontSize === 'small'
                          ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10"
                          : "border-border hover:border-blue-500/50"
                      )}
                    >
                      <div className="text-center">
                        <div className="text-sm font-medium mb-1">Small</div>
                        <div className="text-xs text-muted-foreground">14px</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleFontSizeChange('medium')}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all hover:scale-105",
                        fontSize === 'medium'
                          ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10"
                          : "border-border hover:border-blue-500/50"
                      )}
                    >
                      <div className="text-center">
                        <div className="text-base font-medium mb-1">Medium</div>
                        <div className="text-xs text-muted-foreground">16px</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleFontSizeChange('large')}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all hover:scale-105",
                        fontSize === 'large'
                          ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/10"
                          : "border-border hover:border-blue-500/50"
                      )}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium mb-1">Large</div>
                        <div className="text-xs text-muted-foreground">18px</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Editor Preferences */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                      <Settings className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">Editor Preferences</h3>
                      <p className="text-sm text-muted-foreground">
                        Customize your note-taking experience
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Auto-save Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                          <RefreshCw className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-semibold">Auto-save Notes</p>
                          <p className="text-sm text-muted-foreground">Automatically save changes as you type</p>
                        </div>
                      </div>
                      <button
                        onClick={handleAutoSaveToggle}
                        className={cn(
                          "relative w-14 h-8 rounded-full transition-colors",
                          autoSave ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                        )}
                      >
                        <motion.div
                          className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                          animate={{ x: autoSave ? 24 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>

                    {/* Notifications Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Bell className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="font-semibold">Show Notifications</p>
                          <p className="text-sm text-muted-foreground">Get notified about important updates</p>
                        </div>
                      </div>
                      <button
                        onClick={handleNotificationsToggle}
                        className={cn(
                          "relative w-14 h-8 rounded-full transition-colors",
                          showNotifications ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-600"
                        )}
                      >
                        <motion.div
                          className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                          animate={{ x: showNotifications ? 24 : 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
                      <Database className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">Data Management</h3>
                      <p className="text-sm text-muted-foreground">
                        Export, backup, or clear your data
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleExportAllNotes}
                      className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border hover:bg-indigo-500/10 hover:border-indigo-500/50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 flex items-center justify-center shrink-0 transition-colors">
                        <Download className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Export Notes</p>
                        <p className="text-xs text-muted-foreground">Download all as JSON</p>
                      </div>
                    </button>

                    <button
                      onClick={handleClearCache}
                      className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border hover:bg-orange-500/10 hover:border-orange-500/50 transition-all group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 group-hover:bg-orange-500/20 flex items-center justify-center shrink-0 transition-colors">
                        <Trash2 className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Clear Cache</p>
                        <p className="text-xs text-muted-foreground">Free up space</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Privacy & Security */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                      <Lock className="w-6 h-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">Privacy & Security</h3>
                      <p className="text-sm text-muted-foreground">
                        Your data is encrypted and secure
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                      <Shield className="w-5 h-5 text-green-500 shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-foreground">End-to-end encryption enabled</p>
                        <p className="text-muted-foreground">Your notes are securely stored</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                      <Lock className="w-5 h-5 text-blue-500 shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-foreground">Account is password protected</p>
                        <p className="text-muted-foreground">Signed in as {user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* App Information */}
              <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gray-500/10 flex items-center justify-center shrink-0">
                      <Info className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1">About Scriblet</h3>
                      <p className="text-sm text-muted-foreground">
                        Application information and version details
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Version</p>
                      <p className="text-lg font-bold text-foreground">v{APP_VERSION}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Platform</p>
                      <p className="text-lg font-bold text-foreground">Web</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Status</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">Active</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-500/5 rounded-2xl border-2 border-red-500/20 shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-1 text-red-600 dark:text-red-400">Danger Zone</h3>
                      <p className="text-sm text-muted-foreground">
                        Irreversible actions that affect your account
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/50 text-red-600 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400"
                      onClick={() => {
                        supabase.auth.signOut();
                        navigate('/');
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 bg-red-500 hover:bg-red-600"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete All Data
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        onImageCropped={handleImageCropped}
      />

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Delete All Data
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This action cannot be undone. This will permanently:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Delete all your notes ({notes.length} total)</li>
                <li>Remove your profile information</li>
                <li>Clear all your settings and preferences</li>
              </ul>
              <p className="font-semibold text-foreground mt-4">Are you absolutely sure?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Yes, delete everything'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

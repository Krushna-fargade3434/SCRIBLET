import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, Pencil, Info, Save, Moon, Sun, Monitor, UserCircle, Settings, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useNotes } from '@/hooks/useNotes';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageCropDialog } from '@/components/ImageCropDialog';
import { useState, useEffect } from 'react';
import { APP_VERSION } from '@/lib/version';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Profile() {
  const { user } = useAuth();
  const { notes } = useNotes();
  const { profile, updateAvatar, uploadAvatar } = useProfile();
  const [open, setOpen] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('auto');

  useEffect(() => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'auto' || 'auto';
    setTheme(savedTheme);
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
      // Update user metadata
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

  const avatarOptions = [
    '/avatars/photo1.png',
    '/avatars/photo2.png',
    '/avatars/photo3.png',
    '/avatars/photo4.png',
    '/profile.png',
  ];

  const stats = [
    { label: 'Total Notes', value: notes.length },
    { label: 'Favorites', value: notes.filter((n) => n.is_favorite).length },
    { label: 'Pinned', value: notes.filter((n) => n.is_pinned).length },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 pb-20 md:pb-6">
        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">
            Account
          </h1>
          <p className="text-muted-foreground">
            Manage your profile and preferences
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                "px-4 py-2.5 font-medium text-sm transition-colors relative",
                activeTab === 'profile'
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserCircle className="w-4 h-4 inline-block mr-2" />
              Profile
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
                "px-4 py-2.5 font-medium text-sm transition-colors relative",
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

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Profile card */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden mb-6">
              {/* Header section */}
              <div className="p-5 sm:p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-b border-border">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-card border-4 border-primary/20 shadow-lg">
                    <img 
                      src={profile?.avatar_url || '/profile.png'} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/profile.png';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                        className="text-xl font-semibold mb-2"
                      />
                    ) : (
                      <h2 className="text-2xl font-semibold text-foreground mb-1">
                        {displayName || 'User'}
                      </h2>
                    )}
                    <p className="text-muted-foreground break-words text-sm">
                      {user?.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Pencil className="w-4 h-4 mr-2" />
                          Photo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Choose Profile Photo</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Upload custom photo button */}
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
                          
                          {/* Divider */}
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

                          {/* Preset avatars */}
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
                    {isEditing ? (
                      <Button onClick={handleSaveProfile} disabled={isSavingProfile} size="sm">
                        <Save className="w-4 h-4 mr-2" />
                        {isSavingProfile ? 'Saving...' : 'Save'}
                      </Button>
                    ) : (
                      <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 border-b border-border divide-x divide-border bg-muted/30">
                {stats.map((stat) => (
                  <div key={stat.label} className="p-4 sm:p-6 text-center">
                    <p className="text-3xl font-bold text-foreground mb-1">
                      {stat.value}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Email</p>
                    <p className="font-medium text-foreground break-words">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Member since</p>
                    <p className="font-medium text-foreground">
                      {user?.created_at
                        ? format(new Date(user.created_at), 'MMMM d, yyyy')
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">Account Status</p>
                    <p className="font-semibold text-primary">Verified & Secure</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Theme Selector */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Moon className="w-5 h-5" />
                    Appearance
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose how Scriblet looks to you
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Light Theme */}
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all hover:border-primary/50",
                        theme === 'light'
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-full h-24 rounded-lg bg-white border border-gray-200 p-3 shadow-sm">
                          <div className="h-2 w-12 bg-purple-500 rounded mb-2"></div>
                          <div className="space-y-1.5">
                            <div className="h-1.5 bg-gray-300 rounded w-full"></div>
                            <div className="h-1.5 bg-gray-300 rounded w-3/4"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          <span className="font-medium">Light</span>
                        </div>
                      </div>
                    </button>

                    {/* Dark Theme */}
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all hover:border-primary/50",
                        theme === 'dark'
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-full h-24 rounded-lg bg-gray-900 border border-gray-700 p-3 shadow-sm">
                          <div className="h-2 w-12 bg-purple-400 rounded mb-2"></div>
                          <div className="space-y-1.5">
                            <div className="h-1.5 bg-gray-600 rounded w-full"></div>
                            <div className="h-1.5 bg-gray-600 rounded w-3/4"></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          <span className="font-medium">Dark</span>
                        </div>
                      </div>
                    </button>

                    {/* Auto Theme */}
                    <button
                      onClick={() => handleThemeChange('auto')}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all hover:border-primary/50",
                        theme === 'auto'
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-full h-24 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                          <div className="flex h-full">
                            <div className="w-1/2 bg-white p-2">
                              <div className="h-1.5 w-8 bg-purple-500 rounded mb-1.5"></div>
                              <div className="h-1 bg-gray-300 rounded w-full mb-1"></div>
                              <div className="h-1 bg-gray-300 rounded w-2/3"></div>
                            </div>
                            <div className="w-1/2 bg-gray-900 p-2">
                              <div className="h-1.5 w-8 bg-purple-400 rounded mb-1.5"></div>
                              <div className="h-1 bg-gray-600 rounded w-full mb-1"></div>
                              <div className="h-1 bg-gray-600 rounded w-2/3"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          <span className="font-medium">Auto</span>
                        </div>
                      </div>
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {theme === 'auto' && 'Theme will match your system preferences'}
                    {theme === 'light' && 'Always use light theme'}
                    {theme === 'dark' && 'Always use dark theme'}
                  </p>
                </div>

                {/* App Info */}
                <div className="pt-6 border-t border-border">
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Info className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-medium">App Version</p>
                      <p className="font-medium text-foreground">
                        v{APP_VERSION}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        onImageCropped={handleImageCropped}
      />
    </DashboardLayout>
  );
}

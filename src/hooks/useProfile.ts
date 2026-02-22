import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ProfileRow {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as ProfileRow | null;
    },
    enabled: !!user,
  });

  const updateAvatar = useMutation({
    mutationFn: async (avatar_url: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data: existing, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (fetchError) throw fetchError;

      if (existing) {
        const { data, error } = await supabase
          .from('profiles')
          .update({ avatar_url })
          .eq('user_id', user.id)
          .select()
          .single();
        if (error) throw error;
        return data as ProfileRow;
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert({ user_id: user.id, avatar_url })
        .select()
        .single();
      if (error) throw error;
      return data as ProfileRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile photo updated');
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (imageBlob: Blob) => {
      if (!user) throw new Error('Not authenticated');

      try {
        // Generate a unique filename
        const fileExt = 'jpg';
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = fileName; // Just the filename, bucket already has path

        // Try to upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, imageBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.warn('Supabase storage upload failed, using data URL fallback:', uploadError);
          // Fallback: Convert blob to data URL
          const dataUrl = await blobToDataURL(imageBlob);
          
          // Update profile with data URL
          const { data: existing, error: fetchError } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();
          if (fetchError) throw fetchError;

          if (existing) {
            const { data, error } = await supabase
              .from('profiles')
              .update({ avatar_url: dataUrl })
              .eq('user_id', user.id)
              .select()
              .single();
            if (error) throw error;
            return data as ProfileRow;
          }

          const { data, error } = await supabase
            .from('profiles')
            .insert({ user_id: user.id, avatar_url: dataUrl })
            .select()
            .single();
          if (error) throw error;
          return data as ProfileRow;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        // Update profile with new avatar URL
        const { data: existing, error: fetchError } = await supabase
          .from('profiles')
          .select('id, avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();
        if (fetchError) throw fetchError;

        // Delete old avatar from storage if it exists and is from our storage
        if (existing?.avatar_url && existing.avatar_url.includes('supabase') && existing.avatar_url.includes('avatars')) {
          try {
            const urlParts = existing.avatar_url.split('/');
            const oldFileName = urlParts[urlParts.length - 1];
            if (oldFileName && oldFileName !== fileName) {
              await supabase.storage.from('avatars').remove([oldFileName]);
            }
          } catch (err) {
            console.warn('Failed to delete old avatar:', err);
          }
        }

        if (existing) {
          const { data, error } = await supabase
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('user_id', user.id)
            .select()
            .single();
          if (error) throw error;
          return data as ProfileRow;
        }

        const { data, error } = await supabase
          .from('profiles')
          .insert({ user_id: user.id, avatar_url: publicUrl })
          .select()
          .single();
        if (error) throw error;
        return data as ProfileRow;
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile photo uploaded successfully');
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo: ' + error.message);
    },
  });

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    updateAvatar,
    uploadAvatar,
  };
}

// Helper function to convert blob to data URL
function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
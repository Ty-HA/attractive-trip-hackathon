import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDisplayName(user?: { id?: string; user_metadata?: { display_name?: string } }) {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !user.id) {
      setDisplayName(null);
      return;
    }
    // Priorité au display_name du user_metadata
    if (user.user_metadata && user.user_metadata.display_name) {
      setDisplayName(user.user_metadata.display_name);
      return;
    }
    let isMounted = true;
    supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (isMounted) {
          setDisplayName(data?.display_name || null);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [user]);

  return displayName;
}

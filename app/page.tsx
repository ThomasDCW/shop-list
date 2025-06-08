'use client';

import type { User } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { AiOutlineLogout } from 'react-icons/ai';
import Auth from './components/Auth';
import { createClient } from './utils/supabase/client';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (isLoading) {
    return (
      <main className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="space-y-8">
        <Auth onAuthSuccess={() => {}} />
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="text-center">
        <h1 className="mb-4 text-xl font-bold text-gray-900">
          Bienvenue sur shoplist 🛒
        </h1>
        <p className="text-lg text-gray-600">
          Salut {user.email} ! Organisez vos courses facilement
        </p>
        <button
          onClick={handleSignOut}
          className="fixed top-4 right-6 flex items-center gap-2 text-sm text-[#ff761e] hover:text-[#ff9500]"
        >
          <span className="text-xs">Déconnexion</span>
          <AiOutlineLogout size={20} />
        </button>
      </div>
    </main>
  );
}

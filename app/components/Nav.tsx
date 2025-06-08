'use client';

import { createClient } from '@/app/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaListCheck } from 'react-icons/fa6';
import { IoMdHome } from 'react-icons/io';

export default function Nav() {
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

  // Ne pas afficher la navigation si l'utilisateur n'est pas connecté
  if (isLoading || !user) {
    return null;
  }

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="mx-auto max-w-screen-xl px-4 py-3">
        <div className="flex items-center justify-around">
          <Link
            href="/"
            className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            tabIndex={0}
            aria-label="Accueil"
          >
            <IoMdHome size={24} />
          </Link>
          <Link
            href="/lists"
            className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            tabIndex={0}
            aria-label="Ma liste"
          >
            <FaListCheck size={24} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

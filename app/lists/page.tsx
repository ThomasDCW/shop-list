'use client';

import ListForm from '@/app/components/ListForm';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { createClient } from '../utils/supabase/client';

interface List {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export default function Lists() {
  const [lists, setLists] = useState<List[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    let channel: any = null;
    let authSubscription: any = null;

    const checkUserAndFetchLists = async () => {
      try {
        // Vérifier l'authentification d'abord
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/');
          return;
        }

        if (!mounted) return;

        setUser(user);

        // Ensuite charger les listes
        const { data } = await supabase
          .from('lists')
          .select('*')
          .order('created_at', { ascending: false });

        if (mounted && data) {
          setLists(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des listes:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkUserAndFetchLists();

    // Surveiller les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        if (mounted) {
          router.push('/');
        }
      } else if (session?.user && mounted) {
        setUser(session.user);

        // Configuration Realtime pour synchronisation temps réel des propres listes
        if (!channel) {
          try {
            channel = supabase
              .channel(`user_lists_${session.user.id}`)
              .on(
                'postgres_changes',
                {
                  event: '*',
                  schema: 'public',
                  table: 'lists',
                  filter: `user_id=eq.${session.user.id}`,
                },
                (payload) => {
                  if (!mounted) return;

                  console.log('Synchronisation liste:', payload);

                  if (payload.eventType === 'INSERT') {
                    setLists((currentLists) => {
                      // Vérifier si la liste existe déjà pour éviter les doublons
                      const exists = currentLists.some(
                        (list) => list.id === payload.new.id
                      );
                      if (!exists) {
                        return [payload.new as List, ...currentLists];
                      }
                      return currentLists;
                    });
                  }

                  if (payload.eventType === 'UPDATE') {
                    setLists((currentLists) =>
                      currentLists.map((list) =>
                        list.id === payload.new.id
                          ? (payload.new as List)
                          : list
                      )
                    );
                  }

                  if (payload.eventType === 'DELETE') {
                    setLists((currentLists) =>
                      currentLists.filter((list) => list.id !== payload.old.id)
                    );
                  }
                }
              )
              .subscribe();
          } catch (error) {
            console.log('Info: Realtime non disponible:', error);
          }
        }
      }
    });

    authSubscription = subscription;

    // Nettoyage des subscriptions
    return () => {
      mounted = false;
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [supabase, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ListForm placeholder="Ajouter une liste" />
      {lists?.map((list) => (
        <Link
          href={`/lists/${list.id}`}
          key={list.id}
          className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm transition-colors duration-200 hover:bg-gray-50"
        >
          <span className="text-lg font-medium text-gray-700">{list.name}</span>
          <FaArrowRight
            className="rounded-full bg-gradient-to-r from-[#ff761e] to-[#ff9500] p-2 text-white"
            size={28}
          />
        </Link>
      ))}
      {lists?.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p>Aucune liste pour le moment.</p>
          <p className="text-sm">Créez votre première liste ci-dessus !</p>
        </div>
      )}
    </div>
  );
}

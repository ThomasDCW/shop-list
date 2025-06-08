'use client';

import ListForm from '@/app/components/ListForm';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    listId: string;
    listName: string;
  }>({
    isOpen: false,
    listId: '',
    listName: '',
  });
  const supabase = createClient();
  const router = useRouter();

  const handleToggleMenu = (listId: string) => {
    setOpenMenuId(openMenuId === listId ? null : listId);
  };

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  // Fermer la modal avec Échap
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && deleteConfirm.isOpen) {
        handleDeleteCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleteConfirm.isOpen]);

  const handleDeleteConfirm = (listId: string, listName: string) => {
    setDeleteConfirm({
      isOpen: true,
      listId,
      listName,
    });
    setOpenMenuId(null); // Fermer le menu
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({
      isOpen: false,
      listId: '',
      listName: '',
    });
  };

  const handleDeleteList = async () => {
    try {
      const { error } = await supabase
        .from('lists')
        .delete()
        .eq('id', deleteConfirm.listId);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
      }

      handleDeleteCancel(); // Fermer la modal
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  useEffect(() => {
    let mounted = true;
    let channel: any = null;
    let authSubscription: any = null;

    const checkUserAndFetchLists = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/');
          return;
        }

        if (!mounted) return;

        setUser(user);

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        if (mounted) {
          router.push('/');
        }
      } else if (session?.user && mounted) {
        setUser(session.user);

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
        <div key={list.id} className="relative">
          <Link
            href={`/lists/${list.id}`}
            key={list.id}
            className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm transition-colors duration-200 hover:bg-gray-50"
          >
            <span className="text-lg font-medium text-gray-700">
              {list.name}
            </span>

            <BsThreeDotsVertical
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleMenu(list.id);
              }}
              className="cursor-pointer text-gray-500 hover:text-gray-700"
            />
          </Link>
          {openMenuId === list.id && (
            <div className="absolute top-12 right-0 z-50 rounded-lg bg-white shadow-lg">
              <button
                onClick={() => handleDeleteConfirm(list.id, list.name)}
                className="rounded-lg p-4 text-left font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-800"
              >
                <MdDelete />
              </button>
            </div>
          )}
        </div>
      ))}
      {lists?.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <p>Aucune liste pour le moment.</p>
          <p className="text-sm">Créez votre première liste ci-dessus !</p>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="animate-in zoom-in-95 w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <MdDelete />
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Êtes-vous sûr de vouloir supprimer la liste{' '}
                <span className="font-medium text-gray-900">
                  "{deleteConfirm.listName}"
                </span>{' '}
                ? Cette action est irréversible.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:outline-none"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteList}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

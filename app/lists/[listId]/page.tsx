'use client';

import Input from '@/app/components/Input';
import { createClient } from '@/app/utils/supabase/client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

interface Item {
  id: string;
  list_id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  is_checked?: boolean;
}

interface List {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export default function List({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const resolvedParams = React.use(params);
  const [items, setItems] = useState<Item[]>([]);
  const [list, setList] = useState<List | null>(null);
  console.log(items);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    let listChannel: any = null;
    let itemsChannel: any = null;
    let authSubscription: any = null;

    const fetchListAndItems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          window.location.href = '/';
          return;
        }

        if (!mounted) return;

        const { data: listData, error: listError } = await supabase
          .from('lists')
          .select('*')
          .eq('id', resolvedParams.listId)
          .single();

        if (listError) {
          throw new Error(
            `Erreur lors du chargement de la liste: ${listError.message}`
          );
        }

        if (!listData) {
          throw new Error('Liste non trouvée');
        }

        if (mounted) {
          setList(listData);
        }

        const { data: itemsData, error: itemsError } = await supabase
          .from('items')
          .select('*')
          .eq('list_id', resolvedParams.listId)
          .order('created_at', { ascending: false });

        if (itemsError) {
          throw new Error(
            `Erreur lors du chargement des items: ${itemsError.message}`
          );
        }

        if (mounted) {
          setItems(itemsData || []);
        }
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Une erreur inconnue est survenue'
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchListAndItems();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        if (mounted) {
          window.location.href = '/';
        }
      } else if (session?.user && mounted) {
        if (!listChannel) {
          try {
            listChannel = supabase
              .channel(`list_detail_${resolvedParams.listId}`)
              .on(
                'postgres_changes',
                {
                  event: '*',
                  schema: 'public',
                  table: 'lists',
                  filter: `id=eq.${resolvedParams.listId}`,
                },
                (payload) => {
                  if (!mounted) return;

                  console.log('Synchronisation liste:', payload);

                  if (payload.eventType === 'UPDATE') {
                    setList(payload.new as List);
                  }

                  if (payload.eventType === 'DELETE') {
                    window.location.href = '/lists';
                  }
                }
              )
              .subscribe();
          } catch (error) {
            console.log('Info: Realtime liste non disponible:', error);
          }
        }

        if (!itemsChannel) {
          try {
            itemsChannel = supabase
              .channel(`items_detail_${resolvedParams.listId}`)
              .on(
                'postgres_changes',
                {
                  event: '*',
                  schema: 'public',
                  table: 'items',
                  filter: `list_id=eq.${resolvedParams.listId}`,
                },
                (payload) => {
                  if (!mounted) return;

                  console.log('Synchronisation items:', payload);

                  if (payload.eventType === 'INSERT') {
                    setItems((currentItems) => {
                      const exists = currentItems.some(
                        (item) => item.id === payload.new.id
                      );
                      if (!exists) {
                        return [payload.new as Item, ...currentItems];
                      }
                      return currentItems;
                    });
                  }

                  if (payload.eventType === 'UPDATE') {
                    setItems((currentItems) =>
                      currentItems.map((item) =>
                        item.id === payload.new.id
                          ? (payload.new as Item)
                          : item
                      )
                    );
                  }

                  if (payload.eventType === 'DELETE') {
                    setItems((currentItems) =>
                      currentItems.filter((item) => item.id !== payload.old.id)
                    );
                  }
                }
              )
              .subscribe();
          } catch (error) {
            console.log('Info: Realtime items non disponible:', error);
          }
        }
      }
    });

    authSubscription = subscription;

    return () => {
      mounted = false;
      if (listChannel) {
        supabase.removeChannel(listChannel).catch(() => {});
      }
      if (itemsChannel) {
        supabase.removeChannel(itemsChannel).catch(() => {});
      }
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [resolvedParams.listId, supabase]);

  const handleAddItem = async (itemName: string) => {
    try {
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const { data, error } = await supabase
        .from('items')
        .insert({
          list_id: resolvedParams.listId,
          name: itemName.trim(),
          user_id: user.id,
        })
        .select();

      if (error) {
        throw new Error(`Erreur lors de l'ajout de l'item: ${error.message}`);
      }

      console.log('Nouvel item créé:', data);
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'item:", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'ajout de l'item"
      );
    }
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Trouver l'item actuel
      const currentItem = items.find((item) => item.id === itemId);
      if (!currentItem) {
        throw new Error('Item non trouvé');
      }

      // Mettre à jour l'état local immédiatement pour une meilleure UX
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId ? { ...item, is_checked: !item.is_checked } : item
        )
      );

      // Mettre à jour Supabase
      const { error } = await supabase
        .from('items')
        .update({ is_checked: !currentItem.is_checked })
        .eq('id', itemId);

      if (error) {
        // En cas d'erreur, revenir à l'état précédent
        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === itemId
              ? { ...item, is_checked: currentItem.is_checked }
              : item
          )
        );
        throw new Error(
          `Erreur lors de la mise à jour de l'item: ${error.message}`
        );
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'item:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la mise à jour de l'item"
      );
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      const { error } = await supabase.from('items').delete().eq('id', itemId);

      if (error) {
        throw new Error(
          `Erreur lors de la suppression de l'item: ${error.message}`
        );
      }

      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== itemId)
      );
    } catch (err) {
      console.error("Erreur lors de la suppression de l'item:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression de l'item"
      );
    }
  };

  if (isLoading) {
    return (
      <main className="space-y-6">
        <Link
          href="/lists"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <FaArrowLeft size={18} />
          Listes / Chargement...
        </Link>
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-6">
        <Link
          href="/lists"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <FaArrowLeft size={18} />
          Listes / Erreur
        </Link>
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          <p className="font-semibold">Erreur</p>
          <p className="text-sm">{error}</p>
        </div>
      </main>
    );
  }

  if (!list) {
    return (
      <main className="space-y-6">
        <Link
          href="/lists"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <FaArrowLeft size={18} />
          Listes / Non trouvée
        </Link>
        <div className="rounded-lg bg-yellow-50 p-4 text-yellow-700">
          <p className="font-semibold">Liste non trouvée</p>
          <p className="text-sm">
            Cette liste n'existe pas ou a été supprimée.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-4/5 space-y-6 overflow-y-scroll">
      <Link
        href="/lists"
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
      >
        <FaArrowLeft size={18} />
        Listes / {list.name}
      </Link>

      <Input onAddItemAction={handleAddItem} placeholder="Ajouter un produit" />

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-red-700">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between rounded-lg bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
            role="listitem"
            aria-label={`Item: ${item.name}`}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-gray-300 transition-all duration-200 checked:border-[#ff761e] checked:bg-[#ff761e] hover:border-[#ff761e] focus:ring-2 focus:ring-[#ff761e] focus:ring-offset-2 focus:outline-none"
                  checked={item.is_checked}
                  onChange={() => handleToggleItem(item.id)}
                  aria-label={`Marquer ${item.name} comme ${item.is_checked ? 'non complété' : 'complété'}`}
                />
                <svg
                  className="pointer-events-none absolute h-4 w-4 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p
                className={`text-sm transition-all duration-200 ${
                  item.is_checked
                    ? 'text-gray-400 line-through'
                    : 'text-gray-700'
                }`}
              >
                {item.name}
              </p>
            </div>
            <button
              onClick={() => handleDeleteItem(item.id)}
              className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus:opacity-100"
              aria-label={`Supprimer ${item.name}`}
            >
              <svg
                className="h-6 w-6 text-gray-400 transition-colors duration-200 hover:text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {items.length === 0 && !isLoading && (
        <div className="py-8 text-center text-gray-500">
          <p>Aucun produit dans cette liste.</p>
          <p className="text-sm">Ajoutez votre premier produit ci-dessus !</p>
        </div>
      )}
    </main>
  );
}

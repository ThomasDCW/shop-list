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

        // Récupérer les informations de la liste
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

        // Récupérer les items de la liste
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

    // Surveiller les changements d'authentification et configurer Realtime
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        if (mounted) {
          window.location.href = '/';
        }
      } else if (session?.user && mounted) {
        // Configuration Realtime pour la liste
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
                    // Rediriger si la liste est supprimée
                    window.location.href = '/lists';
                  }
                }
              )
              .subscribe();
          } catch (error) {
            console.log('Info: Realtime liste non disponible:', error);
          }
        }

        // Configuration Realtime pour les items
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
                      // Vérifier si l'item existe déjà pour éviter les doublons
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

    // Nettoyage des subscriptions
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

      // Récupérer l'utilisateur connecté
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
    <main className="space-y-6">
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

      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg bg-white p-2 shadow-sm"
          >
            {item.name}
          </li>
        ))}
      </ul>

      {items.length === 0 && !isLoading && (
        <div className="py-8 text-center text-gray-500">
          <p>Aucun produit dans cette liste.</p>
          <p className="text-sm">Ajoutez votre premier produit ci-dessus !</p>
        </div>
      )}
    </main>
  );
}

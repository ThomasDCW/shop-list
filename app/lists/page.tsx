'use client';

import ListForm from '@/app/components/ListForm';
import Link from 'next/link';
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
  const supabase = createClient();

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const { data } = await supabase
          .from('lists')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) {
          setLists(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des listes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLists();

    const channel = supabase
      .channel('lists_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lists',
        },
        (payload) => {
          console.log('Changement détecté:', payload);

          if (payload.eventType === 'INSERT') {
            setLists((currentLists) => [payload.new as List, ...currentLists]);
          }

          if (payload.eventType === 'UPDATE') {
            setLists((currentLists) =>
              currentLists.map((list) =>
                list.id === payload.new.id ? (payload.new as List) : list
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

    // Nettoyage de la subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ListForm placeholder="Ajouter une liste" />
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
        </div>
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

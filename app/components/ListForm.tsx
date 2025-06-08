'use client';

import { useState } from 'react';
import { createClient } from '../utils/supabase/client';

interface ListFormProps {
  placeholder: string;
  onListCreated?: () => void;
}

export default function ListForm({
  placeholder,
  onListCreated,
}: ListFormProps) {
  const [value, setValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error('Utilisateur non connecté');
        return;
      }

      const { data, error } = await supabase
        .from('lists')
        .insert({
          name: value.trim(),
          user_id: user.id,
        })
        .select();

      if (error) {
        console.error('Erreur lors de la création de la liste:', error);
      } else {
        console.log('Nouvelle liste créée:', data);
        setValue('');

        // Callback pour rafraîchir la liste
        if (onListCreated) {
          onListCreated();
        }
        // Note: La liste apparaîtra automatiquement grâce au rechargement de données
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="">
      <div className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-md border-none px-3 py-3 text-base focus:ring-2 focus:ring-[#ff761e] focus:outline-none sm:px-4 sm:py-3 sm:text-lg"
          aria-label="Ajouter une liste"
        />
        <button
          type="submit"
          className="h-10 w-10 rounded-full bg-gradient-to-r from-[#ff761e] to-[#ff9500] text-xl font-bold text-white transition-colors duration-200 hover:bg-orange-700 focus:ring-2 focus:ring-[#ff761e] focus:ring-offset-1 focus:outline-none"
          aria-label="Ajouter la liste"
        >
          +
        </button>
      </div>
    </form>
  );
}

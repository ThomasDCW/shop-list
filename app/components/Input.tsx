'use client';

import { useState } from 'react';

interface InputProps {
  onAddItemAction?: (item: string) => void;
  placeholder: string;
}

export default function Input({ onAddItemAction, placeholder }: InputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onAddItemAction?.(value.trim());
      setValue('');
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
          aria-label="Ajouter un produit à la liste"
        />
        <button
          type="submit"
          className="h-10 w-10 cursor-pointer rounded-full bg-gradient-to-r from-[#ff761e] to-[#ff9500] text-xl font-bold text-white transition-colors duration-200 hover:bg-orange-700 focus:ring-2 focus:ring-[#ff761e] focus:ring-offset-1 focus:outline-none"
          aria-label="Ajouter le produit à la liste"
        >
          +
        </button>
      </div>
    </form>
  );
}

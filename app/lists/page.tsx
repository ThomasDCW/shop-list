'use client';

import Input from '@/app/components/Input';
import Link from 'next/link';
import { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';

export default function Lists() {
  const mockLists = [
    { id: 1, name: 'Liste 1' },
    { id: 2, name: 'Liste 2' },
    { id: 3, name: 'Liste 3' },
  ];
  const [lists, setLists] = useState<{ id: number; name: string }[]>(mockLists);

  const handleAddList = (name: string) => {
    setLists([...lists, { id: lists.length + 1, name }]);
  };

  return (
    <div className="space-y-6">
      <Input onAddItemAction={handleAddList} placeholder="Ajouter une liste" />
      {lists.map((list) => (
        <Link
          href={`/lists/${list.id}`}
          key={list.id}
          className="flex items-center justify-between rounded-lg bg-white p-4 shadow-sm hover:bg-gray-50"
        >
          <span className="text-lg font-medium text-gray-700">{list.name}</span>
          <FaArrowRight
            className="rounded-full bg-gradient-to-r from-[#ff761e] to-[#ff9500] p-2 text-white"
            size={28}
          />
        </Link>
      ))}
    </div>
  );
}

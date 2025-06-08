'use client';

import Input from '@/app/components/Input';
import Link from 'next/link';
import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

export default function List({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const resolvedParams = React.use(params);
  const [items, setItems] = useState<string[]>([]);

  const handleAddItem = (item: string) => {
    setItems([...items, item]);
  };

  return (
    <main className="space-y-6">
      <Link
        href="/lists"
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
      >
        <FaArrowLeft size={18} />
        Listes / {resolvedParams.listId}
      </Link>

      <Input onAddItemAction={handleAddItem} placeholder="Ajouter un produit" />

      <ul className="mt-4 space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-center justify-between rounded-lg bg-white p-2 shadow-sm"
          >
            {item}
          </li>
        ))}
      </ul>
    </main>
  );
}

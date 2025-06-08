'use client';

import Input from '@/app/components/Input';
import { useState } from 'react';

export default function List() {
  const [items, setItems] = useState<string[]>([]);

  const handleAddItem = (item: string) => {
    setItems([...items, item]);
  };

  return (
    <main className="mx-auto h-screen max-w-xl px-4 py-4 sm:px-6 lg:px-8">
      <Input onAddItemAction={handleAddItem} />
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

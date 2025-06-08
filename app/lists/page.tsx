'use client';

import Link from 'next/link';
import { useState } from 'react';

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
    <div className="flex flex-col gap-2">
      {lists.map((list) => (
        <Link
          href={`/lists/${list.id}`}
          key={list.id}
          className="flex items-center justify-between rounded-lg bg-white p-2 shadow-sm"
        >
          {list.name}
        </Link>
      ))}
    </div>
  );
}

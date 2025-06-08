'use client';

import { createClient } from '@/app/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaListCheck } from 'react-icons/fa6';
import { IoMdHome } from 'react-icons/io';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ href, icon, label, isActive }: NavItemProps) => {
  return (
    <Link
      href={href}
      className={`relative flex flex-col items-center justify-center rounded-lg px-4 py-2 transition-all duration-500 ${
        isActive
          ? 'bg-gray-50 text-[#ff761e] transition-all duration-500'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
      }`}
      tabIndex={0}
      aria-label={label}
    >
      {isActive && (
        <div className="absolute -top-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[#ff761e] transition-all duration-700 ease-in-out" />
      )}

      {/* Icône */}
      <div className="mb-1">{icon}</div>

      {/* Label */}
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
};

export default function Nav() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  if (isLoading || !user) {
    return null;
  }

  const navItems = [
    {
      href: '/',
      icon: <IoMdHome size={22} />,
      label: 'Accueil',
      isActive: pathname === '/',
    },
    {
      href: '/lists',
      icon: <FaListCheck size={20} />,
      label: 'Mes listes',
      isActive: pathname === '/lists' || pathname.startsWith('/lists/'),
    },
  ];

  return (
    <nav
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white/80 shadow-lg backdrop-blur-md"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="mx-auto max-w-screen-xl px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={item.isActive}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}

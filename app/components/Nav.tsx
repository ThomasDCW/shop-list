import Link from 'next/link';
import { FaListCheck } from 'react-icons/fa6';
import { IoMdHome } from 'react-icons/io';

export default function Nav() {
  return (
    <nav
      className="fixed right-0 bottom-0 left-0 border-t border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900"
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="mx-auto max-w-screen-xl px-4 py-3">
        <div className="flex items-center justify-around">
          <Link
            href="/"
            className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            tabIndex={0}
            aria-label="Accueil"
          >
            <IoMdHome size={24} />
          </Link>
          <Link
            href="/list"
            className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            tabIndex={0}
            aria-label="Ma liste"
          >
            <FaListCheck size={24} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

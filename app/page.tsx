import icon from '@/app/assets/pwa-icon.png';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="mx-auto max-w-xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Image className="w-[32px]" src={icon} alt="Shop List" priority />
          <h1 className="font-bold tracking-tight">
            <span className="bg-gradient-to-r from-[#ff761e] to-[#ff9500] bg-clip-text text-transparent">
              Shop List
            </span>
          </h1>
        </div>
      </main>
    </div>
  );
}

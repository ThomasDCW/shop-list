import icon from '@/app/assets/pwa-icon.png';
import Image from 'next/image';
import Link from 'next/link';

export default function Icon() {
  return (
    <Link href="/" className="flex items-center gap-1 pb-4">
      <Image
        className="w-[40px] transition-transform duration-300 group-hover:scale-110"
        src={icon}
        alt="Shop List Logo"
        priority
      />
      <h1 className="text-xl font-bold tracking-tight">
        <span className="bg-gradient-to-r from-[#ff761e] to-[#ff9500] bg-clip-text font-sans text-transparent transition-all duration-300 hover:from-[#ff9500] hover:to-[#ff761e]">
          shoplist
        </span>
      </h1>
    </Link>
  );
}

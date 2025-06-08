import icon from '@/app/assets/pwa-icon.png';
import Image from 'next/image';

export default function Icon() {
  return (
    <div className="flex flex-col items-center space-y-2 text-center">
      <div className="group flex items-center gap-2">
        <Image
          className="w-[40px] transition-transform duration-300 group-hover:scale-110"
          src={icon}
          alt="Shop List Logo"
          priority
        />
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-[#ff761e] to-[#ff9500] bg-clip-text text-transparent transition-all duration-300 hover:from-[#ff9500] hover:to-[#ff761e]">
            Shop List
          </span>
        </h1>
      </div>
    </div>
  );
}

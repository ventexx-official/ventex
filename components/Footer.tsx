import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#222222] text-white py-12 border-t border-[#333333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 md:gap-0 mb-10">
          <div className="flex flex-col items-start">
            <Link href="/" className="font-black italic uppercase text-xl tracking-wider text-white hover:opacity-80 transition-opacity">
              Ventex
            </Link>
            <span className="text-[#888888] text-sm mt-1">Where startups pitch, fund and sell.</span>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-x-8 gap-y-3 text-sm">
            <Link href="/discover" className="text-[#888888] hover:text-white transition-colors">Discover</Link>
            <Link href="/marketplace" className="text-[#888888] hover:text-white transition-colors">Marketplace</Link>
            <Link href="/login" className="text-[#888888] hover:text-white transition-colors">Login</Link>
            <Link href="/signup" className="text-[#888888] hover:text-white transition-colors">Sign up</Link>
            <Link href="/terms" className="text-[#888888] hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="text-[#888888] hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>
        <div className="border-t border-[#333333] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[#888888] text-sm">&copy; 2025 Ventex. All rights reserved.</span>
          <span className="text-[#555555] text-xs">Built for founders, investors & builders.</span>
        </div>
      </div>
    </footer>
  );
}

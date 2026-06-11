"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import RevealBoot from './RevealBoot';
import FloatingStatusRail from './FloatingStatusRail';
import StratosphereBackground from './StratosphereBackground';

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // List of routes that should not display the Navbar and Footer
  const noNavRoutes = ['/onboarding', '/login', '/signup', '/forgot-password', '/auth/callback'];
  const hideNav = noNavRoutes.some(route => pathname.startsWith(route));

  return (
    <div className="flex flex-col min-h-screen">
      <StratosphereBackground />
      <RevealBoot />
      {!hideNav && <Navbar />}
      <main className="flex-grow z-10 relative">
        {children}
      </main>
      {!hideNav && <Footer />}
      {pathname === '/' && <FloatingStatusRail />}
    </div>
  );
}

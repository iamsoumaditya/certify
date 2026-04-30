"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar({ userId }: { userId: string | null }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-serif font-bold text-[22px] text-gold">Certify</Link>
        
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="https://github.com/iamsoumaditya/certify" target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 text-gray-500 hover:text-navy transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.18-.34 6.52-1.6 6.52-7.09a5.5 5.5 0 0 0-1.53-3.9 5.5 5.5 0 0 0-.15-3.8s-1.3-.41-4.2 1.55a14.8 14.8 0 0 0-8 0c-2.9-1.96-4.2-1.55-4.2-1.55a5.5 5.5 0 0 0-.15 3.8 5.5 5.5 0 0 0-1.53 3.9c0 5.49 3.34 6.75 6.52 7.09a4.8 4.8 0 0 0-1 3.03V22"></path><path d="M9 20c-5 1.5-5-2.5-7-3"></path></svg>
            <span className="hidden sm:inline font-semibold">Star Us</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-2">
            {!userId ? (
              <>
                <Link href="/sign-in" className="text-navy hover:text-navy/70 transition-colors border border-transparent px-4 py-2 hover:bg-gray-50 rounded-md">Sign In</Link>
                <Link href="/sign-up" className="bg-navy text-white hover:bg-navy/90 transition-colors px-4 py-2 rounded-md">Sign Up</Link>
              </>
            ) : (
              <>
                <Link href="/certificates" className="text-navy hover:text-navy/70 transition-colors mr-2">
                  My Certificates
                </Link>
                <Link href="/dashboard" className="text-navy hover:text-navy/70 transition-colors mr-2">
                  Dashboard
                </Link>
                <UserButton />
              </>
            )}
          </div>

          {/* Mobile Toggle & User Button */}
          <div className="md:hidden flex items-center gap-4">
            {userId && <UserButton />}
            <button onClick={() => setIsOpen(!isOpen)} className="text-navy p-1">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 p-4 flex flex-col gap-4 shadow-lg md:hidden">
          <Link onClick={() => setIsOpen(false)} href="https://github.com/iamsoumaditya/certify" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-500 hover:text-navy transition-colors px-4 py-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.03c3.18-.34 6.52-1.6 6.52-7.09a5.5 5.5 0 0 0-1.53-3.9 5.5 5.5 0 0 0-.15-3.8s-1.3-.41-4.2 1.55a14.8 14.8 0 0 0-8 0c-2.9-1.96-4.2-1.55-4.2-1.55a5.5 5.5 0 0 0-.15 3.8 5.5 5.5 0 0 0-1.53 3.9c0 5.49 3.34 6.75 6.52 7.09a4.8 4.8 0 0 0-1 3.03V22"></path><path d="M9 20c-5 1.5-5-2.5-7-3"></path></svg>
            <span className="font-semibold">Star Us on GitHub</span>
          </Link>
          {!userId ? (
            <div className="flex flex-col gap-2">
              <Link onClick={() => setIsOpen(false)} href="/sign-in" className="text-center text-navy hover:bg-gray-50 border border-gray-200 transition-colors px-4 py-2 rounded-md">Sign In</Link>
              <Link onClick={() => setIsOpen(false)} href="/sign-up" className="text-center bg-navy text-white hover:bg-navy/90 transition-colors px-4 py-2 rounded-md">Sign Up</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link onClick={() => setIsOpen(false)} href="/certificates" className="text-navy hover:bg-gray-50 transition-colors px-4 py-2 rounded-md">
                My Certificates
              </Link>
              <Link onClick={() => setIsOpen(false)} href="/dashboard" className="text-navy hover:bg-gray-50 transition-colors px-4 py-2 rounded-md">
                Dashboard
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface NavbarProps {
  isLoggedIn: boolean;
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const userFullName = user?.user_metadata?.full_name || 'Student';
  const userEmail = user?.email || '';
  const avatarUrl = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userFullName)}&background=FFD700&color=18181b&bold=true`;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();


  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh(); // Force a refresh to clear state
  };

  return (
    <nav className="bg-white border-b border-gray-100 relative z-50">
      <div className="flex items-center justify-between px-4 md:px-8 py-4 max-w-7xl mx-auto w-full">
        {/* Logo Section */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center group">
            <div className="relative h-12 w-48 group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo.png"
                alt="CariSkill Logo"
                fill
                sizes="(max-width: 768px) 192px, 192px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex space-x-8 font-medium absolute left-1/2 -translate-x-1/2">
          {[
            { name: 'My Progress', path: '/progress' },
            { name: 'My Roadmaps', path: '/roadmaps' },
            { name: 'Explore', path: '/explore' },
            { name: 'Chat', path: '/chat' },
            { name: 'Bookmark', path: '/bookmark' },
          ].map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={isLoggedIn ? link.path : "/login"}
                className={`relative group py-1 ${isActive ? "text-yellow-500" : "text-gray-600"}`}
              >
                <span className={`transition-colors duration-300 ${isActive ? "" : "group-hover:text-gray-900"}`}>{link.name}</span>
                <span className={`absolute left-0 bottom-0 w-full h-[2px] bg-yellow-400 origin-left transition-transform duration-300 ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
              </Link>
            )
          })}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-5">
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="relative group py-1 font-medium text-gray-600">
                <span className="group-hover:text-gray-900 transition-colors duration-300">Login</span>
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-yellow-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
              </Link>
              <Link href="/register" className="bg-yellow-400 text-gray-900 px-6 py-2.5 rounded-full font-semibold hover:bg-yellow-500 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(255,215,0,0.4)] transition-all duration-300 active:scale-95">
                Register
              </Link>
            </>
          ) : (
            <>
              <button className="text-gray-400 hover:text-yellow-500 transition-colors duration-300 hover:rotate-12">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="focus:outline-none block"
                >
                  <div className="w-9 h-9 rounded-full border-2 border-white shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 overflow-hidden bg-gray-100 flex items-center justify-center">
                    {authLoading && isLoggedIn ? (
                      <div className="w-full h-full bg-gray-200 animate-pulse" />
                    ) : (
                      <img
                        src={avatarUrl}
                        alt="User Profile"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-100 mb-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{userFullName}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{userEmail}</p>
                    </div>

                    <div className="flex flex-col">
                      <Link href="/profile" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 hover:text-gray-900 transition-colors group">
                        <User className="w-4 h-4 mr-3 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                        Profile
                      </Link>
                      <Link href="/settings" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 hover:text-gray-900 transition-colors group">
                        <Settings className="w-4 h-4 mr-3 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                        Setting
                      </Link>
                      <Link href="/help" className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 hover:text-gray-900 transition-colors group">
                        <HelpCircle className="w-4 h-4 mr-3 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                        Help Center
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors group text-left"
                      >
                        <LogOut className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-600 transition-colors" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
'use client';

import { LogOut } from 'lucide-react';
import { sidebarNav } from '@/lib/profile-data';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="lg:col-span-1 flex flex-col gap-6">
      {/* User Profile Card */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-[#FFD700] to-yellow-200">
            <img 
              src="https://i.pravatar.cc/150?img=5" 
              alt="User Avatar" 
              className="w-full h-full rounded-full border-4 border-white object-cover"
            />
          </div>
          {/* Online Status Dot */}
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-white rounded-full"></div>
        </div>
        {/* We can make this dynamic later when you connect to a database! */}
        <h2 className="font-display text-2xl font-bold text-gray-900">Alex Morgan</h2>
      </div>

      {/* Navigation Menu */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 py-4">
        <nav className="flex flex-col">
          {sidebarNav.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <button 
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-4 px-8 py-4 text-left font-medium transition-colors ${
                  isActive 
                    ? 'border-l-4 border-[#FFD700] text-gray-900 bg-yellow-50/50' 
                    : 'border-l-4 border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </button>
            );
          })}
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="flex items-center gap-4 px-8 py-4 w-full text-left font-medium text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}
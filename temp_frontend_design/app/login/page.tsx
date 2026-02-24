'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF6] relative overflow-hidden font-sans text-gray-900">
      {/* Background Pattern and Glows */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#E5E5E5 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />
      <div className="fixed top-1/4 left-10 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-10 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo - Moved to top left */}
      <header className="absolute top-0 left-0 w-full p-6 z-20">
        <Link href="/" className="flex items-center space-x-2 w-max">
          <div className="w-8 h-8 bg-yellow-400 rounded-md flex items-center justify-center font-bold">C</div>
          <span className="text-xl font-bold">CariSkill</span>
        </Link>
      </header>

      {/* Main Content Centered */}
      <main className="flex-grow flex items-center justify-center px-4 py-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-white w-full max-w-md p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
            <p className="text-gray-500 text-sm">Login to continue your learning journey.</p>
          </div>

          <form className="space-y-4" onSubmit={(e) => {
             e.preventDefault();
             // Redirect to dashboard (add routing logic here later)
          }}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 outline-none transition-all"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 rounded-lg mt-4 transition-colors"
            >
              Continue
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="px-3 text-xs text-gray-400">or</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          {/* Social Logins */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-lg transition-colors text-sm font-medium">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Continue with Facebook
            </button>

            <button className="w-full flex items-center justify-center gap-2 py-3 bg-black hover:bg-gray-900 text-white rounded-lg transition-colors text-sm font-medium">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M16.365 1.403c1.01-.89 1.705-2.128 1.51-3.403-1.12.045-2.48.74-3.325 1.64-.75.79-1.52 2.07-1.31 3.32 1.25.09 2.51-.66 3.125-1.557zm.83 3.637c-1.28-.04-2.52.74-3.15.74-.64 0-1.68-.69-2.72-.67-1.35.02-2.61.78-3.3 2.01-1.41 2.45-.36 6.07 1.01 8.08.67.98 1.45 2.07 2.51 2.03 1.01-.04 1.41-.65 2.63-.65 1.21 0 1.63.65 2.66.63 1.06-.02 1.74-1 2.4-1.98.76-1.11 1.08-2.19 1.1-2.24-.03-.01-2.1-.81-2.13-3.2-.03-2 1.63-2.95 1.7-3.01-1.02-1.48-2.58-1.68-3.11-1.74z" transform="translate(2, 2)"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Don&apos;t have an account? <Link href="/register" className="text-yellow-600 font-semibold hover:underline">Sign up</Link>
          </p>
        </motion.div>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-100 z-10 bg-[#FFFDF6]">
        © 2023 CariSkill Inc. All rights reserved.
      </footer>
    </div>
  );
}
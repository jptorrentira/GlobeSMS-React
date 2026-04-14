import React, { useState } from 'react';
import { 
  GlobeAltIcon, 
  UserIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon 
} from '@heroicons/react/24/outline';

const LoginPage = () => {
  const [domain, setDomain] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mimic API Call
    setTimeout(() => {
      console.log('Logging in with:', { username, password });
      setIsLoading(false);
      // Logic for redirect or error goes here
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 md:p-10 font-sans">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT SIDE - VISUAL/HERO (Hidden on Mobile) */}
        <div className="w-full md:w-1/2 bg-emerald-600 p-12 text-white flex flex-col justify-between items-center hidden md:flex">
          <div className="w-full">
            <h1 className="text-4xl font-extrabold tracking-tight">SMPC SMS</h1>
            <p className="mt-2 text-emerald-100"></p>
          </div>
          
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-4 bg-white/10 rounded-full">
              {/* Substitute with your own vector/logo/SVG */}
              <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-5xl font-extrabold tracking-tight leading-tight">Welcome Back.</h2>
            <p className="text-lg text-emerald-100 max-w-sm"></p>
          </div>
          
          <div className="w-full text-sm text-emerald-200 text-center">
            © 2026 SMPC SMS.
          </div>
        </div>

        {/* RIGHT SIDE - LOGIN FORM */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            
            {/* Logo/Header (Visible on Mobile Only) */}
            <div className="md:hidden mb-8 text-center">
              <span className="text-3xl font-black text-emerald-600">SMPC SMS</span>
            </div>

            <h2 className="text-4xl font-extrabold text-gray-950 tracking-tight">Login</h2>
            <p className="mt-3 text-gray-600">Enter your credentials to access your account dashboard.</p>

            <form className="mt-10 space-y-6" onSubmit={handleLogin}>
              
                {/* --- DOMAIN --- */}
                <div>
                <label className="block text-sm font-medium text-gray-700">Domain</label>
                <div className="mt-1.5 relative group">
                    <GlobeAltIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    required
                    placeholder="Domain"
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white text-gray-900 text-lg placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition duration-150 outline-none"
                    />
                </div>
                </div>

                {/* --- USERNAME --- */}
                <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <div className="mt-1.5 relative group">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Username"
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white text-gray-900 text-lg placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition duration-150 outline-none"
                    />
                </div>
                </div>

                {/* --- PASSWORD --- */}
                <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1.5 relative group">
                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                    <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••"
                    className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl bg-white text-gray-900 text-lg placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition duration-150 outline-none"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                    >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                </div>
                </div>

                {/* Submit Button with Loading State */}
                <div>
                    <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-emerald-600 text-white font-semibold py-4 px-6 rounded-xl hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-200 transition duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                    {isLoading ? (
                        <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing In...
                        </>
                    ) : (
                        "Sign In"
                    )}
                    </button>
                </div> 
            </form>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default LoginPage;
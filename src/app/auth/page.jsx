'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [apiError, setApiError] = useState('');
  const { login, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      const urlParams = new URLSearchParams(window.location.search);
      const nextPath = urlParams.get('next') || '/';
      router.push(nextPath);
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    if (!username.trim()) {
      setApiError('Username is required');
      return false;
    }
    if (!password.trim()) {
      setApiError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) return;
    
    const result = await login(username, password, keepSignedIn);
    
    if (result.success) {
      const urlParams = new URLSearchParams(window.location.search);
      const nextPath = urlParams.get('next') || '/';
      router.push(nextPath);
    } else {
      setApiError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#E3F3FF] flex flex-col">
       <header className="mt-[40px] ml-[40px] mr-[40px]">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl lg:text-3xl font-bold">
          <span className="text-[#103358]">TAKE</span>
          <span className="text-[#398AC8]">SPACE</span>
        </div>
      </div>
    </header>
      <main className="flex items-center justify-center pt-[10%] px-4 sm:px-6 lg:px-8 pb-0 mb-[30px]">
        <div className="w-full max-w-[480px]">
          <div className="bg-white rounded-2xl shadow-[0px_20px_24px_-4px_rgba(16,24,40,0.08),0px_8px_8px_-4px_rgba(16,24,40,0.03)] p-[48px] pl-[80px] pr-[80px] flex flex-col items-start">
            <div className="w-full max-w-[320px] mx-auto">
              <div className="mb-6">
                <h1 className="text-[30px] font-extrabold text-[#0F172A] leading-10 mb-1">Sign in</h1>
                <p className="text-[16px] text-base font-medium text-[#475569] leading-6">Use your email and password</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-[320px]">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#0F172A] leading-5">Username</label>
                  <Input type="text" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full h-12 px-4 py-3 border-[1.5px] border-[#CBD5E1] rounded-xl focus:border-[#398AC8] text-[#0F172A] placeholder-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[#0F172A] leading-5">Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" showPasswordToggle className="w-full h-12 px-4 py-3 border-[1.5px] border-[#398AC8] rounded-xl focus:border-[#398AC8] text-[#475569] placeholder-gray-400" />
                </div>
                <div className="flex items-start gap-[6px]">
                  <div className="w-6 h-6 mt-0">
                    <input type="checkbox" checked={keepSignedIn} onChange={(e) => setKeepSignedIn(e.target.checked)} className="w-4 h-4 mt-1 ml-1 text-[#103358] bg-white border border-gray-300 rounded focus:ring-[#103358] focus:ring-2" style={{ accentColor: '#103358' }} />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-semibold text-[#0F172A] leading-6">Keep me signed in</label>
                    <p className="text-sm font-medium text-[#475569] leading-5">Recommended</p>
                  </div>
                </div>
                {apiError && <ErrorMessage message={apiError} onClose={() => setApiError('')} />}
                <Button type="submit" className="w-full h-11 bg-[#103358] text-white text-sm font-semibold leading-5 rounded-xl hover:bg-[#0a2544] transition-colors" disabled={loading}>
                  {loading ? <LoadingSpinner size="small" color="white" /> : 'Sign in'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
